from gtts import gTTS
import logging
import io
from supabase_client import supabase

logger = logging.getLogger(__name__)

def text_to_speech(text: str, file_path: str) -> str:
    """
    Converts text to speech using Google TTS and saves it as an MP3.
    gTTS produces a standard MP3 that is directly playable in browsers,
    unlike pyttsx3 which outputs platform-dependent formats (e.g. .aiff on macOS).
    """
    try:
        tts = gTTS(text=text, lang="en", slow=False)
        
        if supabase:
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            
            # Use only the filename without the 'audio/' prefix for Supabase path
            file_name = file_path.split("/")[-1]
            
            supabase.storage.from_("Audio files").upload(
                file=fp.read(),
                path=file_name,
                file_options={"content-type": "audio/mpeg"}
            )
            public_url = supabase.storage.from_("Audio files").get_public_url(file_name)
            logger.info(f"TTS audio saved to Supabase at {public_url}")
            return public_url
        else:
            tts.save(file_path)
            logger.info(f"TTS audio saved locally to {file_path}")
            return file_path
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise
