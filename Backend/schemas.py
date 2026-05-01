from pydantic import BaseModel
from typing import List, Optional, Dict, Any
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
    question_audio_recording: Optional[str] = None
    user_video_recording: Optional[str] = None
    transcript: Optional[str] = ""
    expected_answer: Optional[str] = ""
    sentiment_analysis: Optional[Dict[str, Any]] = {}
    facial_expression_analysis: Optional[Dict[str, Any]] = {}


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRound(InterviewRoundBase):
    id: uuid.UUID
    session_id: uuid.UUID

    class Config:
        from_attributes = True


class InterviewSessionBase(BaseModel):
    role: Optional[str] = "General"
    report: Optional[str] = None


class InterviewSessionCreate(InterviewSessionBase):
    pass


class InterviewSession(InterviewSessionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    session_date: datetime
    end_date: Optional[datetime] = None
    rounds: List[InterviewRound] = []

    class Config:
        from_attributes = True
