from sqlalchemy.orm import Session
import models
import database
import json
import os
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

MODEL_NAME = os.environ.get("LLM_MODEL", "gemini-2.0-flash-lite")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(MODEL_NAME)
else:
    model = None

def generate_report(session_id: str, db: Session):
    """
    Generates a structured report for an interview session with per-question
    expected answers, right/wrong breakdown, and aggregate scores.
    """
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        return {"error": "Interview session not found"}

    # Build per-round context for the prompt
    rounds_context = ""
    for i, round in enumerate(session.rounds):
        rounds_context += f"Question {i+1}: {round.question}\n"
        if round.expected_answer:
            rounds_context += f"Model Answer: {round.expected_answer}\n"
        rounds_context += f"Candidate Answer: {round.transcript or '(no answer provided)'}\n\n"

    if not model:
        logger.warning("No LLM client configured, skipping AI report generation.")
        return _fallback_report(session)

    prompt = f"""You are an expert technical interviewer evaluating a candidate's performance.

Role being interviewed for: {session.role or 'General'}

Interview transcript with model answers for reference:
{rounds_context}

Evaluate the candidate and return ONLY a valid JSON object matching this exact schema. No markdown, no explanation.

{{
    "overallScore": <number 0-10, one decimal>,
    "communication": <number 0-10>,
    "problemSolving": <number 0-10>,
    "confidence": <number 0-10>,
    "technicalKnowledge": <number 0-10>,
    "areasForImprovement": [<string>, <string>, <string>],
    "strengths": [<string>, <string>, <string>],
    "detailedAnalysis": {{
        "communication": "<string>",
        "technical": "<string>",
        "confidence": "<string>",
        "overall": "<string>"
    }},
    "questionBreakdown": [
        {{
            "questionNumber": <integer starting at 1>,
            "question": "<the question text>",
            "expectedAnswer": "<the model answer, or empty string if none>",
            "userAnswer": "<the candidate's answer, or 'No answer provided'>",
            "score": <number 0-10>,
            "whatWasRight": [<up to 3 strings describing what the candidate did well>],
            "whatWasWrong": [<up to 3 strings describing gaps or mistakes>],
            "feedback": "<one concise coaching sentence>"
        }}
    ]
}}

Rules:
- questionBreakdown must have one entry per question in order
- Compare each candidate answer against the model answer when provided
- whatWasRight and whatWasWrong arrays should be empty if not applicable
- Be specific and actionable in feedback"""

    try:
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)

        session.report = json.dumps(data)
        if not session.end_date:
            from datetime import datetime, timezone
            session.end_date = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        return data

    except Exception as e:
        logger.error(f"Failed to generate structured report: {e}")
        return _fallback_report(session)


def _fallback_report(session):
    breakdown = []
    for i, round in enumerate(session.rounds):
        breakdown.append({
            "questionNumber": i + 1,
            "question": round.question or "",
            "expectedAnswer": round.expected_answer or "",
            "userAnswer": round.transcript or "No answer provided",
            "score": 5,
            "whatWasRight": [],
            "whatWasWrong": [],
            "feedback": "AI scoring unavailable. Review your answer against the expected answer above.",
        })
    return {
        "overallScore": 5.0,
        "communication": 5,
        "problemSolving": 5,
        "confidence": 5,
        "technicalKnowledge": 5,
        "areasForImprovement": ["AI scoring failed. Try again later."],
        "strengths": ["Completed the interview."],
        "detailedAnalysis": {
            "communication": "N/A",
            "technical": "N/A",
            "confidence": "N/A",
            "overall": "N/A",
        },
        "questionBreakdown": breakdown,
    }
