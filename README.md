# Interview-Path

Interview-Path is a multimodal framework for intelligent interview analysis, designed to help you practice for interviews and receive valuable feedback on your performance. This application leverages AI to create a realistic interview experience, analyzing your verbal and non-verbal cues to provide comprehensive insights.

## How it Works

1.  **AI-Powered Questions**: The application uses the Gemini API to generate relevant and challenging interview questions.
2.  **Text-to-Speech**: The AI interviewer speaks the questions to you using a text-to-speech model.
3.  **Voice and Video Recording**: Your answers are recorded, capturing both your voice and facial expressions.
4.  **Post-Interview Analysis**: After the interview, the application analyzes your responses:
    *   **Voice Transcription**: Your spoken words are converted into text.
    *   **Sentiment Analysis**: The sentiment of your transcribed answers is analyzed.
    *   **Facial Analysis**: Your facial expressions are analyzed to detect emotions.
5.  **Comprehensive Report**: You receive a detailed report summarizing your performance, including the transcription, sentiment analysis, and facial expression analysis.

## Features

*   **AI Interviewer**: Generates interview questions using the Gemini API.
*   **Text-to-Speech**: Converts the AI-generated questions into spoken audio.
*   **Voice Transcription**: Transcribes your spoken answers into text.
*   **Sentiment Analysis**: Analyzes the sentiment of your transcribed answers.
*   **Facial Analysis**: Detects emotions from your facial expressions.
*   **User Authentication**: Secure user registration and login.
*   **Comprehensive Reports**: Provides detailed feedback on your interview performance.

## Tech Stack

### Frontend

*   **Vite**: A modern frontend build tool that provides a faster and leaner development experience.
*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.

### Backend

*   **Python**: A versatile programming language used for the backend logic.
*   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python.
*   **SQLAlchemy**: A SQL toolkit and Object-Relational Mapper (ORM) for Python.
*   **PostgreSQL**: A powerful, open-source object-relational database system.
*   **pyttsx3**: A text-to-speech conversion library in Python.
*   **OpenAI Whisper**: A neural net that approaches human-level robustness and accuracy on English speech recognition.
*   **DeepFace**: A lightweight face recognition and facial attribute analysis framework for Python.
*   **VADER Sentiment Analysis**: A lexicon and rule-based sentiment analysis tool that is specifically attuned to sentiments expressed in social media.
*   **Gemini API**: Used for generating AI-powered interview questions.

## Installation and Setup

### Prerequisites

*   Node.js and npm
*   Python 3.8+ and pip
*   PostgreSQL

### Frontend

1.  Navigate to the `Frontend` directory:
    ```bash
    cd Frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

### Backend

1.  Navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    *   **macOS/Linux**: `source venv/bin/activate`
    *   **Windows**: `venv\\Scripts\\activate`
4.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Set up your PostgreSQL database and add the connection URL to a `.env` file in the `Backend` directory:
    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    ```
6.  Run the development server:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

## API Documentation

*   **POST /register**: Register a new user.
*   **POST /login**: Log in as an existing user.
*   **POST /interview/start**: Start a new interview session.
*   **GET /interview/question/audio/{round_id}**: Get the audio for a question.
*   **POST /interview/answer/audio/{round_id}**: Submit an audio answer for a question.
*   **POST /interview/answer/video/{round_id}**: Submit a video answer for a question.
*   **GET /interview/report/{session_id}**: Get the report for an interview session.

## Known Issues

### Running the server

There are known issues with running the `uvicorn` server due to Python import errors. The application is built with a flat structure to minimize these issues, but you may still encounter a `ModuleNotFoundError`.

If you encounter this issue, please try the following:

1.  Make sure you have activated the virtual environment: `source v-env/bin/activate`
2.  Run the server from the `Backend` directory: `uvicorn main:app --host 0.0.0.0 --port 8000`

If you continue to have issues, you may need to experiment with the project structure and import statements.
