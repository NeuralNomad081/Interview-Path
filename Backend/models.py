from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("InterviewSession", back_populates="user")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    session_date = Column(DateTime, default=datetime.utcnow)
    report = Column(String)

    user = relationship("User", back_populates="sessions")
    rounds = relationship("InterviewRound", back_populates="session")

class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("interview_sessions.id"))
    question = Column(String)
    question_audio_recording = Column(String)
    user_video_recording = Column(String)
    transcript = Column(String)
    sentiment_analysis = Column(JSON)
    facial_expression_analysis = Column(JSON)

    session = relationship("InterviewSession", back_populates="rounds")
