import logging
import os
import uuid

import cv2
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

import auth
import database
import facial
import interview
import models
import report
import schemas
import sentiment
import transcription
import tts

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# DB bootstrap
# ---------------------------------------------------------------------------
models.Base.metadata.create_all(bind=database.engine)

os.makedirs("audio", exist_ok=True)
os.makedirs("video", exist_ok=True)
os.makedirs("frames", exist_ok=True)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Interview-Path API",
    description="The backend for the Interview-Path application.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """Validates token and returns the clerk user id, raising 401 if invalid."""
    clerk_user_id = auth.decode_access_token(token)
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return clerk_user_id


def get_current_user(
    clerk_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(database.get_db),
) -> models.User:
    user = db.query(models.User).filter(models.User.clerk_id == clerk_user_id).first()
    if not user:
        try:
            clerk_user = auth.clerk.users.get(clerk_user_id)
            email = clerk_user.email_addresses[0].email_address if clerk_user.email_addresses else f"{clerk_user_id}@clerk.com"
        except Exception as e:
            print(f"Failed to fetch clerk user: {e}")
            email = f"{clerk_user_id}@clerk.com"
            
        user = models.User(clerk_id=clerk_user_id, email=email, hashed_password="")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Interview-Path API is running"}





# ---------------------------------------------------------------------------
# Interview endpoints
# ---------------------------------------------------------------------------

class InterviewRequest(BaseModel):
    topic: str


@app.post("/interview/start", response_model=schemas.InterviewSession)
def start_interview_session(
    request: InterviewRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_session = models.InterviewSession(user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    question_text = interview.generate_interview_question(request.topic)
    audio_file_path = f"audio/{uuid.uuid4()}.mp3"
    tts.text_to_speech(question_text, audio_file_path)

    new_round = models.InterviewRound(
        session_id=new_session.id,
        question=question_text,
        question_audio_recording=audio_file_path,
        user_video_recording="",
        transcript="",
        sentiment_analysis={},
        facial_expression_analysis={},
    )
    db.add(new_round)
    db.commit()
    db.refresh(new_round)

    # Reload session so rounds relationship is populated
    db.refresh(new_session)
    return new_session


class NextQuestionRequest(BaseModel):
    topic: str
    difficulty: str = "medium"


@app.post("/interview/next/{session_id}")
def generate_next_question(
    session_id: uuid.UUID,
    request: NextQuestionRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == str(session_id)
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if str(session.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    question_text = interview.generate_interview_question(request.topic, request.difficulty)
    audio_file_path = f"audio/{uuid.uuid4()}.mp3"
    tts.text_to_speech(question_text, audio_file_path)

    new_round = models.InterviewRound(
        session_id=str(session.id),
        question=question_text,
        question_audio_recording=audio_file_path,
        user_video_recording="",
        transcript="",
        sentiment_analysis={},
        facial_expression_analysis={},
    )
    db.add(new_round)
    db.commit()
    db.refresh(new_round)

    return new_round


@app.post("/interview/answer/audio/{round_id}")
async def answer_question_audio(
    round_id: uuid.UUID,
    audio_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
):
    interview_round = db.query(models.InterviewRound).filter(
        models.InterviewRound.id == str(round_id)
    ).first()
    if not interview_round:
        raise HTTPException(status_code=404, detail="Interview round not found")

    # Save audio blob (browser sends webm/ogg which Whisper can handle)
    audio_file_path = f"audio/{uuid.uuid4()}.webm"
    contents = await audio_file.read()
    with open(audio_file_path, "wb") as buffer:
        buffer.write(contents)

    transcript_text = transcription.transcribe_audio(audio_file_path)
    sentiment_scores = sentiment.analyze_sentiment(transcript_text)

    interview_round.transcript = transcript_text
    interview_round.sentiment_analysis = sentiment_scores
    db.commit()

    return {"transcript": transcript_text, "sentiment": sentiment_scores}


@app.post("/interview/answer/video/{round_id}")
async def answer_question_video(
    round_id: uuid.UUID,
    video_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
):
    interview_round = db.query(models.InterviewRound).filter(
        models.InterviewRound.id == str(round_id)
    ).first()
    if not interview_round:
        raise HTTPException(status_code=404, detail="Interview round not found")

    video_file_path = f"video/{uuid.uuid4()}.webm"
    contents = await video_file.read()
    with open(video_file_path, "wb") as buffer:
        buffer.write(contents)

    emotions = facial.analyze_facial_expression(video_file_path)
    interview_round.facial_expression_analysis = emotions
    db.commit()

    return {"emotions": emotions}


@app.get("/interview/question/audio/{round_id}")
def get_question_audio(
    round_id: uuid.UUID,
    db: Session = Depends(database.get_db),
):
    interview_round = db.query(models.InterviewRound).filter(
        models.InterviewRound.id == str(round_id)
    ).first()
    if not interview_round or not interview_round.question_audio_recording:
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        interview_round.question_audio_recording,
        media_type="audio/mpeg",
        filename="question.mp3",
    )


@app.get("/interview/report/{session_id}")
def get_report(
    session_id: uuid.UUID,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == str(session_id)
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if str(session.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    return report.generate_report(session_id, db)


@app.get("/interview/sessions")
def get_user_sessions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == str(current_user.id))
        .order_by(models.InterviewSession.session_date.desc())
        .all()
    )

    result = []
    for session in sessions:
        completed_rounds = len(session.rounds)
        session_status = "completed" if session.report else "in-progress"
        topic = "Custom Interview" if completed_rounds > 0 and session.rounds[0].question else "General"

        result.append({
            "id": str(session.id),
            "date": session.session_date.isoformat(),
            "status": session_status,
            "role": topic,
            "duration": completed_rounds * 5,
            "score": 8.0 if session.report else None,
            "type": "mixed",
            "company": "Practice",
            "companyLogo": "🤖",
            "techStack": [],
        })

    return result
