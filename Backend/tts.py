from gtts import gTTS
import logging

logger = logging.getLogger(__name__)


def text_to_speech(text: str, file_path: str) -> None:
    """
    Converts text to speech using Google TTS and saves it as an MP3.
    gTTS produces a standard MP3 that is directly playable in browsers,
    unlike pyttsx3 which outputs platform-dependent formats (e.g. .aiff on macOS).
    """
    try:
        tts = gTTS(text=text, lang="en", slow=False)
        tts.save(file_path)
        logger.info(f"TTS audio saved to {file_path}")
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise
