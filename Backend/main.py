import logging
import os
import uuid
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
import cv2
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
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
from supabase_client import supabase

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
    new_session = models.InterviewSession(user_id=current_user.id, role=request.topic)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    question_text = interview.generate_interview_question(request.topic)
    audio_file_path = f"audio/{uuid.uuid4()}.mp3"
    saved_audio_path = tts.text_to_speech(question_text, audio_file_path)

    new_round = models.InterviewRound(
        session_id=new_session.id,
        question=question_text,
        question_audio_recording=saved_audio_path,
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


@app.post("/interview/end/{session_id}")
def end_interview_session(
    session_id: uuid.UUID,
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

    session.end_date = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    return {"status": "success", "message": "Interview session ended"}


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
    saved_audio_path = tts.text_to_speech(question_text, audio_file_path)

    new_round = models.InterviewRound(
        session_id=str(session.id),
        question=question_text,
        question_audio_recording=saved_audio_path,
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

    try:
        transcript_text = transcription.transcribe_audio(audio_file_path)
        sentiment_scores = sentiment.analyze_sentiment(transcript_text)

        interview_round.transcript = transcript_text
        interview_round.sentiment_analysis = sentiment_scores
        db.commit()

        return {"transcript": transcript_text, "sentiment": sentiment_scores}
    finally:
        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)
            logger.info(f"Deleted temporary audio file: {audio_file_path}")


@app.post("/interview/answer/video/{round_id}")
def answer_question_video(
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
    contents = video_file.file.read()
    with open(video_file_path, "wb") as buffer:
        buffer.write(contents)

    try:
        emotions = facial.analyze_facial_expression(video_file_path)
        interview_round.facial_expression_analysis = emotions
        db.commit()

        return {"emotions": emotions}
    finally:
        if os.path.exists(video_file_path):
            os.remove(video_file_path)
            logger.info(f"Deleted temporary video file: {video_file_path}")


@app.get("/interview/question/audio/{round_id}")
def get_question_audio(
    round_id: uuid.UUID,
    db: Session = Depends(database.get_db),
):
    logger.info(f"Fetching audio for round: {round_id}")
    interview_round = db.query(models.InterviewRound).filter(
        models.InterviewRound.id == str(round_id)
    ).first()
    
    if not interview_round or not interview_round.question_audio_recording:
        logger.error(f"Audio record not found for round: {round_id}")
        raise HTTPException(status_code=404, detail="Audio not found")

    audio_path = interview_round.question_audio_recording
    logger.info(f"Audio path from DB: {audio_path}")

    if audio_path.startswith("http"):
        import io
        from fastapi.responses import StreamingResponse
        
        # If it's a Supabase URL, use the client to download
        if "supabase.co" in audio_path and supabase:
            try:
                file_name = audio_path.split("/")[-1].split("?")[0]
                logger.info(f"Attempting to download from Supabase bucket 'Audio files': {file_name}")
                data = supabase.storage.from_("Audio files").download(file_name)
                logger.info(f"Successfully downloaded {len(data)} bytes from Supabase")
                from fastapi.responses import Response
                return Response(
                    content=data, 
                    media_type="audio/mpeg",
                    headers={
                        "Content-Length": str(len(data)),
                        "Accept-Ranges": "bytes"
                    }
                )
            except Exception as e:
                logger.error(f"Failed to download audio from Supabase: {e}")
                # Fallback to generic proxy below

        import requests
        
        def stream_url():
            try:
                logger.info(f"Proxying audio from URL: {audio_path}")
                with requests.get(audio_path, stream=True) as r:
                    r.raise_for_status()
                    for chunk in r.iter_content(chunk_size=8192):
                        yield chunk
            except Exception as e:
                logger.error(f"Failed to proxy audio from {audio_path}: {e}")
                raise HTTPException(status_code=500, detail="Failed to fetch audio from storage")

        return StreamingResponse(stream_url(), media_type="audio/mpeg")

    if os.path.exists(audio_path):
        logger.info(f"Serving local audio file: {audio_path}")
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename="question.mp3",
        )
    
    logger.error(f"Local audio file not found: {audio_path}")
    raise HTTPException(status_code=404, detail="Audio file not found")


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
    

@app.delete("/interview/{session_id}")
def delete_interview_session(
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
    
    # Delete associated local files before deleting the session record
    for round in session.rounds:
        if round.question_audio_recording and not round.question_audio_recording.startswith("http"):
            if os.path.exists(round.question_audio_recording):
                os.remove(round.question_audio_recording)
                logger.info(f"Deleted local audio file: {round.question_audio_recording}")
        
        if round.user_video_recording and not round.user_video_recording.startswith("http"):
             if os.path.exists(round.user_video_recording):
                os.remove(round.user_video_recording)
                logger.info(f"Deleted local video file: {round.user_video_recording}")

    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}


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
        topic = session.role or "General"

        score = None
        if session.report:
            try:
                report_data = json.loads(session.report)
                score = report_data.get("overallScore", 8.0)
            except:
                score = 8.0

        # Calculate actual duration in minutes
        duration = 0
        if session.end_date:
            # Ensure both are naive for comparison
            end_date = session.end_date.replace(tzinfo=None) if session.end_date.tzinfo else session.end_date
            start_date = session.session_date.replace(tzinfo=None) if session.session_date.tzinfo else session.session_date
            delta = end_date - start_date
            duration = max(1, round(delta.total_seconds() / 60))
        else:
            # Fallback for sessions without end_date (e.g. legacy or in-progress)
            duration = completed_rounds * 5

        result.append({
            "id": str(session.id),
            "date": session.session_date.isoformat(),
            "status": session_status,
            "role": topic,
            "duration": duration,
            "score": score,
            "type": "mixed",
            "company": "Practice",
            "companyLogo": "🤖",
            "techStack": [],
        })

    return result
