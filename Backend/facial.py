from deepface import DeepFace
import cv2
import logging

logger = logging.getLogger(__name__)

# Sample 1 frame per second at this interval to avoid processing thousands of frames.
# For a 60-second video at 30fps, this goes from ~1800 analyses to ~60.
FRAME_SAMPLE_INTERVAL = 30


def analyze_facial_expression(video_path: str) -> dict:
    """
    Analyzes the dominant facial expression across sampled frames in a video.
    Returns a dict of emotion → frame count tallies.
    Samples every FRAME_SAMPLE_INTERVAL frames to keep processing time reasonable.
    """
    emotions: dict = {}
    vidcap = cv2.VideoCapture(video_path)
    frame_index = 0
    success, image = vidcap.read()

    while success:
        if frame_index % FRAME_SAMPLE_INTERVAL == 0:
            try:
                result = DeepFace.analyze(
                    img_path=image,
                    actions=["emotion"],
                    enforce_detection=False,
                    silent=True,
                )
                dominant_emotion = result[0]["dominant_emotion"]
                emotions[dominant_emotion] = emotions.get(dominant_emotion, 0) + 1
            except Exception as e:
                logger.warning(f"Frame {frame_index} facial analysis failed: {e}")

        frame_index += 1
        success, image = vidcap.read()

    vidcap.release()
    return emotions
