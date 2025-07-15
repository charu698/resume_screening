from flask import Flask, request, jsonify
import os
import pandas as pd
import traceback
import json
import re
from dotenv import load_dotenv
from flask_cors import CORS
from functions import file_loader
from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain_openai import ChatOpenAI
import mysql.connector

# Load environment variables
load_dotenv()
print("resume_screening.py started")

# MySQL connection
try:
    print("Attempting MySQL connection...")
    db = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="0987",
        database="resume_1",
        use_pure=True,
        connection_timeout=10,
        port=3306
    )

    cursor = db.cursor()
    print(" Connected to MySQL successfully!")
except mysql.connector.Error as err:
    print(" MySQL Connection Error:", err)
    db = None
    cursor = None

# Flask app setup
App = Flask(__name__)
CORS(App)

# Load API Key
openai_api_key = os.getenv("TOGETHER_API_KEY")
print("Loaded API key:", openai_api_key)

# Upload folders
upload_folder1 = 'uploads_resume'
upload_folder2 = 'uploads_query'
os.makedirs(upload_folder1, exist_ok=True)
os.makedirs(upload_folder2, exist_ok=True)

uploaded_file = None
uploaded_query_file = None
extracted_data_storage = {}

# Upload resume endpoint
@App.route('/upload_resume', methods=['POST'])
def upload_file():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    resume_file = request.files['resume']
    if resume_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    file_path = os.path.join(upload_folder1, resume_file.filename)
    resume_file.save(file_path)

    try:
        global uploaded_file
        retriever, extracted_text = file_loader(file_path)
        extracted_data_storage[resume_file.filename] = {
            'text': extracted_text,
            'status': 'processed',
            'retriever': 'created'
        }
        uploaded_file = resume_file.filename
        return jsonify({
            "message": "File processed successfully",
            "file": resume_file.filename,
            "status": "success"
        }), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

# Upload query endpoint
@App.route('/upload_query', methods=['POST'])
def upload_query_file():
    if 'query' not in request.files:
        return jsonify({'error': 'No query file provided'}), 400

    query_file = request.files['query']
    if not query_file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are allowed'}), 400

    file_path = os.path.join(upload_folder2, query_file.filename)
    query_file.save(file_path)

    global uploaded_query_file
    uploaded_query_file = query_file.filename

    return jsonify({
        "message": "Query file uploaded successfully",
        "file": query_file.filename,
        "status": "success"
    }), 200

# Extract JSON from LLM response
def extract_json_from_response(response_text):
    try:
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"JSON parse error: {e}")
    return None

# Resume evaluation
@App.route('/check_result', methods=['POST'])
def analyze_resume_bulk():
    try:
        global uploaded_file, uploaded_query_file

        if not uploaded_file:
            return jsonify({'error': 'No resume has been uploaded yet.'}), 400
        if not uploaded_query_file:
            return jsonify({'error': 'No query file has been uploaded yet.'}), 400

        query_path = os.path.join(upload_folder2, uploaded_query_file)
        df = pd.read_csv(query_path)

        # Check for question column
        question_columns = ['question', 'Question', 'questions', 'Questions']
        question_column = next((col for col in question_columns if col in df.columns), None)
        if not question_column:
            return jsonify({'error': 'CSV must contain a column named "question".'}), 400

        questions = df[question_column].dropna().tolist()
        if not questions:
            return jsonify({'error': 'No questions found in CSV.'}), 400

        file_path = os.path.join(upload_folder1, uploaded_file)
        retriever, resume_text = file_loader(file_path)

        # Setup LLM
        llm = ChatOpenAI(
            api_key=os.environ["TOGETHER_API_KEY"],
            base_url="https://api.together.xyz/v1",
            model="mistralai/Mistral-7B-Instruct-v0.1",
            temperature=0.2
        )

        # Response schema
        response_schemas = [
            ResponseSchema(name="score", description="Match score out of 10"),
            ResponseSchema(name="matched_keywords", description="List of matched keywords"),
            ResponseSchema(name="missing_keywords", description="List of missing keywords"),
            ResponseSchema(name="status", description="Pass, Review, or Reject"),
            ResponseSchema(name="explanation", description="Brief explanation of the evaluation")
        ]
        parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = parser.get_format_instructions()

        # Prompt
        prompt = PromptTemplate(
            input_variables=["context", "question", "format_instructions"],
            template="""
You are an expert HR's CV/Resume analyzer who evaluates the resume data against the user query.

Context (Extracted Resume Text):
{context}

Query:
{question}

Instructions:
1. Check if the resume matches the query based on skills, experience, and relevant keywords.
2. List matched keywords.
3. List missing keywords.
4. Provide a score and categorize as : Approve (score >= 8), Review (score >= 5), Reject (score < 5).
5. Give a brief explanation.
{format_instructions}

Only return the JSON object. Do not include any other text.
"""
        )

        chain = prompt | llm
        formatted_inputs = [{
            "context": resume_text,
            "question": q,
            "format_instructions": format_instructions
        } for q in questions]

        print("Sending queries to LLM...")
        responses = [chain.invoke(inp).content.strip() for inp in formatted_inputs]

        all_results = []
        all_scores = []

        for q, raw_output in zip(questions, responses):
            parsed = extract_json_from_response(raw_output)
            if not parsed:
                parsed = {
                    "score": "N/A",
                    "matched_keywords": [],
                    "missing_keywords": [],
                    "status": "N/A",
                    "explanation": f"LLM returned unparsable format. Raw: {raw_output}"
                }

            all_results.append({
                "question": q,
                "result": parsed
            })

            score_str = str(parsed.get("score", "")).strip()
            if score_str not in ["", "N/A"]:
                try:
                    score = float(score_str.split('/')[0]) if '/' in score_str else float(score_str)
                    all_scores.append(score)
                except ValueError:
                    print(f"Could not convert score to float: '{score_str}'")

        overall = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0

        for idx, result in enumerate(all_results, start=1):
             res = result["result"]
        
             cursor.execute("""
                INSERT INTO evaluations (
                    resume_id, resume_filename,
                    questionnaire_id, query_filename,
                    overall_score,
                    question_id, question,
                    score, matched_keywords, missing_keywords, explanation, status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                "res_" + str(abs(hash(uploaded_file)) % (10**6)),
                uploaded_file,

                "query_" + str(abs(hash(uploaded_query_file)) % (10**6)),
                uploaded_query_file,

                overall,
                idx,
                result["question"],
                res.get("score"),
                ', '.join(res.get("matched_keywords", [])),
                ', '.join(res.get("missing_keywords", [])),
                res.get("explanation"),
                res.get("status")
            ))

    # Commit after all rows inserted
        db.commit()

        print(f"RAW RESPONSE for last query:\n{raw_output}\n")

        return jsonify({
                "overall_score": overall,
                "evaluations": all_results
            }), 200

    except Exception as e:
        print("Error during /check_result")
        print(traceback.format_exc())
        return jsonify({'error': f'Something went wrong: {str(e)}'}), 500

# Get uploaded file names
@App.route('/get_filenames', methods=['GET'])
def get_filenames():
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                resume_filename AS resume,
                query_filename AS query,
                ROUND(AVG(score), 2) AS score
            FROM evaluations
            GROUP BY resume_filename, query_filename
            ORDER BY MAX(created_at) DESC
        """)
        evaluations = cursor.fetchall()

        return jsonify({
            "resume_file": uploaded_file,
            "query_file": uploaded_query_file,
            "evaluated_resumes": evaluations
        }), 200

    except mysql.connector.Error as err:
        print("MySQL Error in /get_filenames:", err)
        return jsonify({"error": "Failed to fetch evaluations"}), 500

# Run Flask app
if __name__ == '__main__':
    print(" Starting Flask app on http://127.0.0.1:5000")
    App.run(debug=True, port=5000)
