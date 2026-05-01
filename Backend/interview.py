import os
import json
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

MODEL_NAME = os.environ.get("LLM_MODEL", "gemini-2.0-flash-lite")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(MODEL_NAME)
else:
    logger.warning("GEMINI_API_KEY could not be found. LLM client is disabled for fallback.")
    model = None

_DIFFICULTY_MAP = {
    "entry": "entry-level (0-2 years experience)",
    "mid": "mid-level (3-7 years experience)",
    "senior": "senior-level (8+ years experience)",
}

_TYPE_MAP = {
    "technical": "technical (system design, coding approach, architecture, or debugging scenarios)",
    "behavioral": "behavioral/situational using STAR format (Situation, Task, Action, Result)",
    "mixed": "either technical or behavioral — choose whichever fits best for variety",
}


def generate_interview_question(
    topic: str,
    difficulty: str = "medium",
    interview_type: str = "mixed",
    technologies: list = None,
    previous_questions: list = None,
) -> dict:
    """
    Generates an interview question with an expected model answer.
    Returns dict: {question: str, expected_answer: str}
    Falls back gracefully if the API fails or is missing.
    """
    fallback = {
        "question": f"Tell me about a challenging project related to {topic}.",
        "expected_answer": "",
    }

    if not model:
        return fallback

    level = _DIFFICULTY_MAP.get(difficulty, f"{difficulty}-level")
    q_type = _TYPE_MAP.get(interview_type, _TYPE_MAP["mixed"])

    # Tech stack context only for technical/mixed — behavioral questions are about
    # experiences and soft skills, not specific technologies.
    tech_context = ""
    if technologies and interview_type != "behavioral":
        tech_context = (
            f"\nThe candidate's tech stack: {', '.join(technologies)}. "
            "Prioritise questions relevant to these technologies."
        )

    prev_context = ""
    if previous_questions:
        formatted = "\n".join(f"- {q}" for q in previous_questions)
        prev_context = (
            f"\nAlready asked (DO NOT repeat or cover the same topic):\n{formatted}"
        )

    behavioral_note = ""
    if interview_type == "behavioral":
        behavioral_note = (
            "\nIMPORTANT: This is a BEHAVIORAL interview. Ask about real past experiences "
            f"relevant to a {topic} role (teamwork, communication, conflict, delivery, leadership). "
            "Do NOT ask about specific technologies or technical implementations. "
            "The question must invite a STAR-format answer."
        )

    prompt = f"""You are an expert interviewer conducting a {level} {interview_type} interview for a {topic} role.{tech_context}{behavioral_note}

Task: generate ONE {q_type} question.{prev_context}

Return ONLY a valid JSON object — no markdown, no extra text:
{{
    "question": "the interview question",
    "expected_answer": "model answer (3-5 sentences) covering key points an ideal candidate should mention"
}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        if "question" not in data or "expected_answer" not in data:
            raise ValueError("Missing required keys in LLM response")
        return {"question": str(data["question"]).strip(), "expected_answer": str(data["expected_answer"]).strip()}
    except Exception as e:
        logger.warning(f"LLM question generation failed, using fallback: {e}")
        return {"question": f"Could you describe your experience and approach to {topic}?", "expected_answer": ""}
