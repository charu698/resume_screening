from flask import Flask, request, jsonify
import os
import traceback
from langchain.output_parsers import StructuredOutputParser, ResponseSchema, OutputFixingParser
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from functions import file_loader

# Set API Key and endpoint
os.environ["OPENAI_API_KEY"] = "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"
groq_api_base = "https://api.groq.com/openai/v1"

# Flask App
App = Flask(__name__)
upload_folder = 'uploads'
os.makedirs(upload_folder, exist_ok=True)

# Memory storage for file metadata
extracted_data_storage = {}

# Upload endpoint
@App.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    try:
        retriever, extracted_text = file_loader(file_path)
        extracted_data_storage[file.filename] = {
            'text': extracted_text,
            'status': 'processed',
            'retriever': 'created'
        }

        return jsonify({
            "message": "File processed successfully",
            "file": file.filename,
            "status": "success"
        }), 200

    except Exception as e:
        print(f"Processing failed for {file.filename}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

# Resume analysis endpoint
@App.route('/resume_analyze', methods=['POST'])
def analyze_resume():
    try:
        data = request.get_json()
        file_name = data.get('file_name', '')
        query = data.get('query', '')
        temperature = data.get('temperature', 0.0)

        if not file_name or not query:
            return jsonify({'error': 'Both file_name and query are required.'}), 400

        retriever, resume_text = file_loader(f'uploads/{file_name}')

        llm = ChatOpenAI(
            model="deepseek-r1-distill-llama-70b",
            openai_api_base=groq_api_base,
            openai_api_key=os.environ["OPENAI_API_KEY"],
            temperature=temperature
        )

        response_schemas = [
            ResponseSchema(name="score", description="Match score out of 10"),
            ResponseSchema(name="matched_keywords", description="List of matched keywords"),
            ResponseSchema(name="missing_keywords", description="List of missing keywords"),
            ResponseSchema(name="status", description="Pass, Review, or Reject"),
            ResponseSchema(name="explanation", description="Brief explanation of the evaluation")
        ]

        parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = parser.get_format_instructions()

        prompt = PromptTemplate(
            input_variables=["context", "question", "format_instructions"],
            template="""
You are an expert HR's CV/Resume analyzer who evaluates the resume data against the HR query.

Context (Extracted Resume Text):
{context}

Query:
{question}

Instructions:
1. Check if the resume matches the query based on skills, experience, and relevant keywords.
2. Provide a match score out of 10.
3. List matched keywords.
4. List missing keywords.
5. Provide a decision label: Pass (score >= 8), Review (score >= 5), Reject (score < 5).
6. Give a brief explanation.

{format_instructions}

Only return the JSON object. Do not include any other text.
"""
        )

        llm_chain = LLMChain(llm=llm, prompt=prompt)
        fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=llm)

        response = llm_chain.invoke({
            "context": resume_text,
            "question": query,
            "format_instructions": format_instructions
        })

        try:
            parsed_response = fixing_parser.parse(response['text'])
        except Exception as e:
            print("Parser failed. Raw output was:", response['text'])
            return jsonify({'error': f'Parsing failed: {str(e)}', 'raw_output': response['text']}), 500

        return jsonify({
            "mode": "llm_chain",
            "temperature": temperature,
            "result": parsed_response
        }), 200

    except Exception as e:
        print(f"Error in resume analyzer: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Resume analyzer failed: {str(e)}'}), 500



# Endpoint to view uploaded files and status
@App.route('/result', methods=['GET'])
def get_processed_files():
    try:
        result = [
            {"file_name": name, "status": meta.get('status', 'unknown')}
            for name, meta in extracted_data_storage.items()
        ]
        return jsonify({"data": result}), 200

    except Exception as e:
        print(f"Error in get_processed_files: {str(e)}")
        return jsonify({'error': f'Failed to fetch results: {str(e)}'}), 500

# Run the app
if __name__ == '__main__':
    App.run(debug=True, port=8000)

