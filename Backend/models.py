from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, TypeDecorator, CHAR
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime, timezone


class UUIDType(TypeDecorator):
    """
    A platform-independent UUID type.
    Uses PostgreSQL's native UUID type when available, otherwise stores
    as a 36-character CHAR string. Works with SQLite, PostgreSQL, MySQL, etc.
    """
    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(str(value))


class User(Base):
    __tablename__ = "users"

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    sessions = relationship("InterviewSession", back_populates="user")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey("users.id"))
    session_date = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    end_date = Column(DateTime, nullable=True)
    role = Column(String, default="General")
    report = Column(String)

    user = relationship("User", back_populates="sessions")
    rounds = relationship("InterviewRound", back_populates="session", cascade="all, delete-orphan")


class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    session_id = Column(UUIDType, ForeignKey("interview_sessions.id"))
    question = Column(String)
    question_audio_recording = Column(String)
    user_video_recording = Column(String)
    transcript = Column(String, default="")
    sentiment_analysis = Column(JSON, default=dict)
    facial_expression_analysis = Column(JSON, default=dict)

    session = relationship("InterviewSession", back_populates="rounds")
