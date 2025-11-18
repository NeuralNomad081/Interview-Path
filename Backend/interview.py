import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel('gemini-pro')

def generate_interview_question(topic: str):
    """
    Generates an interview question based on the given topic.
    """
    prompt = f"Generate a behavioral interview question about {topic}."
    response = model.generate_content(prompt)
    return response.text
