import os
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

# Defaults to a highly cost-effective, fast model suited for free/demo paths
MODEL_NAME = os.environ.get("LLM_MODEL", "gemini-2.0-flash-lite") 
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(MODEL_NAME)
else:
    logger.warning("GEMINI_API_KEY could not be found. LLM client is disabled for fallback.")
    model = None

def generate_interview_question(topic: str, difficulty: str = "medium") -> str:
    """
    Generates an interview question using the Google Gemini API.
    Falls back gracefully if the API fails or is missing.
    """
    if not model:
        return f"Tell me about a challenging project related to {topic}."

    prompt = f"Act as an expert technical interviewer. Generate a {difficulty} behavioral interview question about {topic}. Provide only the question, keep it clear and professional."
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.warning(f"LLM generation failed, using fallback: {e}")
        return f"Could you describe your experience and approach to {topic}?"
