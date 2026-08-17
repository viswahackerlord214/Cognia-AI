# 🎓 Cognia AI — University Knowledge & Learning Portal MVP

A complete, working, production-grade **University AI Portal** built with **FastAPI**, **React (TypeScript & Vite)**, **LangChain**, **Google Gemini API**, **ChromaDB**, **Supabase (PostgreSQL & Storage)**, **PyMuPDF + Tesseract OCR**, **CrossEncoder Reranking**, and **Corrective RAG (CRAG)**.

Designed as an **AI/RAG portfolio project** with clean modular architecture, strict Role-Based Access Control (RBAC), multi-turn conversation memory, and production-ready APIs.

---

## 🌟 Key Features

### 🛠️ Admin Portal
- Upload official university circulars, academic calendars, regulations, syllabus, and PYQs.
- Automatic PyMuPDF page-by-page text extraction with Tesseract OCR fallback for scanned PDFs.
- Select rich metadata: Document type, Department, Course, Semester, Audience, Effective date, Visibility.
- Automatic Gemini/HF embedding and ChromaDB vector indexing.
- Complete document deletion purging both relational metadata and Chroma vector chunks.

### 🎓 Student Portal
- **AI University Assistant**: Source-aware CRAG chat with exact document name and page citations.
- **Web & AI Mode**: General AI Tutor & Software Engineer with conversation history context memory.
- **PYQ Search**: Filter Previous Year Questions by Department, Semester, Course, and Year.
- **Historical PYQ Frequency Analysis**: Extract topic occurrence counts across past exam papers with disclaimers.
- **Teach Me Mode**: Structured 6-section lesson plans grounded in university syllabus and notes.
- **Instant MCQ Practice Generator**: Generate self-practice MCQs on demand.
- **Course Quizzes**: Take quizzes assigned by teachers, view immediate scoring, and read step-by-step explanations.

### 👨‍🏫 Teacher Portal
- **Course Material Upload**: Upload lecture notes and assignments with granular visibility (`owner_only`, `course_students`, `department`, `everyone`).
- **AI Quiz Generator**: Build multi-choice quizzes using **LangChain** parallel analysis chains.
- **7-Point Quiz Validation**: Automated audit verifying context support, option uniqueness, exact 1 correct answer, difficulty match, and citation validity.
- **Quiz Publishing & Assignment**: Assign quizzes to courses/semesters and review student attempt scores.

### 🛡️ Security & Access Control
- **Pre-Retrieval RBAC Metadata Pre-Filtering**: Students can NEVER retrieve `owner_only` or `teachers` private documents. Document chunks are filtered before entering the LLM context.

---

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Tesseract OCR** (`brew install tesseract`)
- **Google Gemini API Key** ([Get free key here](https://aistudio.google.com/app/apikey))
- **Supabase Account** ([Sign up free](https://supabase.com)) *(Optional: System runs in local fallback mode if Supabase keys are not set)*

---

## 🚀 Setup & Installation Guide

### Step 1: Clone Repository & Create Virtual Environment

```bash
git clone https://github.com/your-username/CogniaAI.git
cd CogniaAI

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 2: Install Backend & Frontend Dependencies

```bash
pip install -r requirements.txt

cd frontend
npm install
cd ..
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=models/text-embedding-004

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=university_documents

CHROMA_PERSIST_DIRECTORY=./chroma_db
RERANKER_MODEL=cross-encoder/ms-marco-MiniLM-L-6-v2
```

### Step 4: Run Tests

Run pytest to verify RBAC security and CRAG pipeline:

```bash
pytest tests/ -v
```

---

## 🖥️ Running the Application

### 1. Launch FastAPI Backend Server

```bash
PYTHONPATH=. ./venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The API server will run at `http://localhost:8000`.

### 2. Launch React Frontend Application

```bash
cd frontend
npm run dev
```
The web application will open at `http://localhost:5173`.

---

## 📄 License & Contact

Built for university knowledge automation and portfolio demonstration.
