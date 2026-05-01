# Interview-Path 🚀

**Interview-Path** is a multimodal AI-powered mock interview platform designed to provide a realistic, comprehensive, and scalable technical interviewing experience. It supports real-time audio and video capture, dynamic question generation, voice-driven conversations with AI, sentiment tracking, facial expression analysis, and intelligent scoring.

## ✨ Features

- **Live AI Interviewer**: Engage in unscripted, dynamic conversational technical or behavioral interviews.
- **Audio-First Interaction**: Answer naturally via microphone—your voice is auto-transcribed using local Speech-to-Text models (OpenAI Whisper).
- **Text-to-Speech (TTS)**: The AI speaks its questions aloud (using `pyttsx3`) for a genuine conversational flow.
- **Visual & Sentiment Intelligence**:
  - Live video streams process facial expressions in the background using `DeepFace`.
  - Transcripts undergo NLP evaluation using `VADER` sentiment analysis.
- **In-depth AI Feedback**: Returns detailed scorecards mapping out your Communication, Problem Solving, Confidence, and Technical Knowledge strengths/improvements using the **Gemini 2.0 Flash Lite** LLM.
- **Modern Full-stack Architecture**:
  - **Backend**: Python, FastAPI, SQLAlchemy, securely managing real user sessions and JWT auth.
  - **Frontend**: React, TypeScript, Vite, Tailwind CSS, `react-router-dom`.

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, react-router-dom |
| **Backend** | Python, FastAPI, Uvicorn, SQLAlchemy (PostgreSQL/Supabase), Passlib (bcrypt), JWT |
| **AI Models (Local)**| OpenAI Whisper (Speech-to-Text), DeepFace (Facial Expressions), VADER (Sentiment) |
| **AI Models (Cloud)**| Google Gemini (`gemini-2.0-flash-lite`) for Interview Generation & Reporting |
| **Audio Processing** | WebRTC MediaRecorder API (Frontend), pyttsx3 (Backend) |

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python](https://www.python.org/) 3.9+
- A Google Gemini API Key. Get one from [Google AI Studio](https://aistudio.google.com/).

---

### 1. Backend Setup

Open a terminal and navigate to the `Backend` folder:
```bash
cd Backend
```

Create and activate a Python virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Set the Google Gemini API key:
```bash
# macOS / Linux
export GEMINI_API_KEY="your_actual_api_key_here"

# Windows (Command Prompt)
set GEMINI_API_KEY="your_actual_api_key_here"

# Windows (PowerShell)
$env:GEMINI_API_KEY="your_actual_api_key_here"
```

Start the FastAPI development server:
```bash
uvicorn main:app --reload
```
The backend API will run seamlessly at `http://localhost:8000`.

---

### 2. Frontend Setup

Open a **new** terminal window and navigate to the `Frontend` folder:
```bash
cd Frontend
```

Install the NPM dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
Navigate to your local frontend view (usually `http://localhost:5173` or as indicated in your terminal console).

## 📄 License & Usage

This project is built for demonstration, practice, and research purposes, highlighting an integration of local multimodal AI models (Whisper, deepface) communicating alongside cloud-based LLM logic (Google Gemini).
