from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewRoundBase(BaseModel):
    question: str
    user_audio_recording: str
    user_video_recording: str
    transcript: str
    sentiment_analysis: dict
    facial_expression_analysis: dict

class InterviewRoundCreate(InterviewRoundBase):
    pass

class InterviewRound(InterviewRoundBase):
    id: uuid.UUID
    session_id: uuid.UUID

    class Config:
        from_attributes = True

class InterviewSessionBase(BaseModel):
    report: Optional[str] = None

class InterviewSessionCreate(InterviewSessionBase):
    pass

class InterviewSession(InterviewSessionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    session_date: datetime
    rounds: List[InterviewRound] = []

    class Config:
        from_attributes = True
