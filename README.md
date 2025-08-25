📄 Resume Screening Web Application

An AI-powered Resume Screening Web Application built with Flask (backend), React.js (frontend), MySQL (database), and LLMs.
This project automates resume evaluation against job-specific queries and generates structured results with scores, keyword analysis, and explanations.

🚀 Features

Upload Resumes (PDF) and Query File (CSV)

Evaluate resumes using LLMs (Together AI / OpenAI)

Get query-wise results:

Score (0–10)

Explanation

Matched / Missing keywords

Pass/Fail status

Calculate Overall Resume Score

Store results in MySQL Database

React.js frontend for uploading files & viewing results

🛠️ Tech Stack

Frontend: React.js (inside /client)

Backend: Flask (Python), LangChain, HuggingFaceEmbeddings, Together API LLM

Database: MySQL

Other Tools: Axios, REST API, dotenv

📂 Repository Structure
resume_screening/
│
├── client/               # React frontend
│   ├── public/           
│   └── src/              # React components/pages
│
├── functions.py          # Resume + Query processing logic
├── mysql_test.py         # MySQL connection test
├── resume_screening.py   # Flask backend entry point
├── requirements.txt      # Backend dependencies
├── package.json          # Frontend dependencies
├── package-lock.json
└── .gitignore

⚙️ Setup Instructions
1️⃣ Backend Setup (Flask)
cd resume_screening
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt


Create a .env file in root:

TOGETHER_API_KEY=your_api_key
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=resume_screening


Run backend:

python resume_screening.py


Backend runs at: http://127.0.0.1:5000

2️⃣ Frontend Setup (React.js)
cd client
npm install
npm start


Frontend runs at: http://localhost:3000

🗄️ Database Schema
evaluations

| id | resume_name | query | score | matched_keywords | missing_keywords | explanation | status |

results_summary

| id | resume_name | query_file | overall_score | created_at |

📊 Workflow

Upload Resume (PDF) + Query File (CSV) via frontend

Backend processes resume, chunks text, creates embeddings

LLM evaluates queries → returns structured results

MySQL stores results (query-wise + summary)

Frontend displays results in a clean UI

📈 Future Enhancements

Bulk resume evaluation

Export results (PDF/Excel)

Recruiter dashboard

ATS integration

HR jobs 

👨‍💻 Author

CHARU ARORA 

Internship Project @ Incture Technologies

Full Stack Developer | AI Enthusiast

📜 License

This project is for educational & internship purposes.
