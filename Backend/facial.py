from deepface import DeepFace
import cv2

def analyze_facial_expression(video_path: str):
    """
    Analyzes the facial expression in a video.
    """
    emotions = {}
    vidcap = cv2.VideoCapture(video_path)
    success,image = vidcap.read()
    while success:
        try:
            result = DeepFace.analyze(img_path=image, actions=['emotion'], enforce_detection=False)
            dominant_emotion = result[0]['dominant_emotion']
            if dominant_emotion in emotions:
                emotions[dominant_emotion] += 1
            else:
                emotions[dominant_emotion] = 1
        except Exception as e:
            print(e)
        success,image = vidcap.read()
    return emotions
