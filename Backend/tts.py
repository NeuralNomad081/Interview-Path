import pyttsx3
import os

def text_to_speech(text: str, file_path: str):
    """
    Converts text to speech and saves it to a file.
    """
    engine = pyttsx3.init()
    engine.save_to_file(text, file_path)
    engine.runAndWait()
