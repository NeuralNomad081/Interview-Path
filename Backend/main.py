from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import database
import schemas
import models
import auth
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import os
import uuid
import interview
import tts
from fastapi.responses import FileResponse
import transcription
import sentiment
import facial
import cv2
import report
from pydantic import BaseModel

models.Base.metadata.create_all(bind=database.engine)

os.makedirs("audio", exist_ok=True)
os.makedirs("video", exist_ok=True)
os.makedirs("frames", exist_ok=True)

app = FastAPI(
    title="Interview-Path API",
    description="The backend for the Interview-Path application.",
    version="0.1.0",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.SessionLocal)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.SessionLocal)):
    user = db.query(models.User).filter(models.User.email == request.username).first()
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

class InterviewRequest(BaseModel):
    topic: str

@app.post("/interview/start", response_model=schemas.InterviewSession)
def start_interview_session(
    request: InterviewRequest,
    db: Session = Depends(database.SessionLocal),
    token: str = Depends(oauth2_scheme)
):
    current_user = auth.decode_access_token(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(models.User).filter(models.User.email == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_session = models.InterviewSession(user_id=user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Generate the first question
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

    new_session.rounds.append(new_round)

    return new_session

@app.post("/interview/answer/audio/{round_id}")
async def answer_question_audio(
    round_id: uuid.UUID,
    audio_file: UploadFile = File(...),
    db: Session = Depends(database.SessionLocal)
):
    interview_round = db.query(models.InterviewRound).filter(models.InterviewRound.id == round_id).first()
    if not interview_round:
        raise HTTPException(status_code=404, detail="Interview round not found")

    # Save the audio file
    audio_file_path = f"audio/{uuid.uuid4()}.mp3"
    with open(audio_file_path, "wb") as buffer:
        buffer.write(await audio_file.read())

    # Transcribe the audio
    transcript_text = transcription.transcribe_audio(audio_file_path)

    # Analyze the sentiment
    sentiment_scores = sentiment.analyze_sentiment(transcript_text)

    # Save the transcript and sentiment to the database
    interview_round.transcript = transcript_text
    interview_round.sentiment_analysis = sentiment_scores
    db.commit()

    return {"transcript": transcript_text, "sentiment": sentiment_scores}

@app.post("/interview/answer/video/{round_id}")
async def answer_question_video(
    round_id: uuid.UUID,
    video_file: UploadFile = File(...),
    db: Session = Depends(database.SessionLocal)
):
    interview_round = db.query(models.InterviewRound).filter(models.InterviewRound.id == round_id).first()
    if not interview_round:
        raise HTTPException(status_code=404, detail="Interview round not found")

    # Save the video file
    video_file_path = f"video/{uuid.uuid4()}.mp4"
    with open(video_file_path, "wb") as buffer:
        buffer.write(await video_file.read())

    # Analyze the facial expression
    emotions = facial.analyze_facial_expression(video_file_path)

    # Save the facial expression analysis to the database
    interview_round.facial_expression_analysis = emotions
    db.commit()

    return {"emotions": emotions}

@app.get("/interview/question/audio/{round_id}")
def get_question_audio(round_id: uuid.UUID, db: Session = Depends(database.SessionLocal)):
    interview_round = db.query(models.InterviewRound).filter(models.InterviewRound.id == round_id).first()
    if not interview_round:
        raise HTTPException(status_code=404, detail="Interview round not found")

    return FileResponse(interview_round.question_audio_recording)

@app.get("/interview/report/{session_id}")
def get_report(session_id: uuid.UUID, db: Session = Depends(database.SessionLocal)):
    return report.generate_report(session_id, db)

@app.get("/")
def read_root():
    return {"Hello": "World"}
