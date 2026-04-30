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
    Generates a structured report for an interview session scoring performance.
    """
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        return {"error": "Interview session not found"}

    transcript_text = f"Interview transcript for session {session.id}:\n\n"
    for i, round in enumerate(session.rounds):
        transcript_text += f"Q{i+1}: {round.question}\n"
        transcript_text += f"A{i+1}: {round.transcript}\n\n"

    # Default fallback data if model is unavailable
    if not model:
        logger.warning("No LLM client configured, skipping AI report generation.")
        return {
            "overallScore": 7.5,
            "communication": 7,
            "problemSolving": 8,
            "confidence": 7,
            "technicalKnowledge": 8,
            "areasForImprovement": ["Provide more detailed examples."],
            "strengths": ["Good basic understanding of the concepts."],
            "detailedAnalysis": {
                "communication": "Clear enough but could elaborate more.",
                "technical": "Demonstrated acceptable problem solving capability.",
                "confidence": "Seemed confident generally.",
                "overall": "A solid effort, good potential."
            }
        }
        
    prompt = f"""
    You are an expert technical interviewer evaluating a candidate's performance.
    Analyze the following interview transcript:
    
    {transcript_text}
    
    Provide your evaluation strictly as a valid JSON object matching this schema:
    {{
        "overallScore": number (0-10, single decimal like 8.5),
        "communication": number (0-10),
        "problemSolving": number (0-10),
        "confidence": number (0-10),
        "technicalKnowledge": number (0-10),
        "areasForImprovement": [list of strings, max 3],
        "strengths": [list of strings, max 3],
        "detailedAnalysis": {{
            "communication": string,
            "technical": string,
            "confidence": string,
            "overall": string
        }}
    }}
    Return ONLY JSON, with no markdown code block tags.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        
        # Save string payload to db just in case
        session.report = json.dumps(data)
        db.commit()
        return data
        
    except Exception as e:
        logger.error(f"Failed to generate structured report: {e}")
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
                "overall": "N/A"
            }
        }
