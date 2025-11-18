# Backend

This directory contains the Python backend for the Interview-Path application.

## API Summary

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

1.  Make sure you have activated the virtual environment: `source venv/bin/activate`
2.  Run the server from the `Backend` directory: `uvicorn main:app --host 0.0.0.0 --port 8000`

If you continue to have issues, you may need to experiment with the project structure and import statements.
