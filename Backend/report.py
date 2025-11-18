from sqlalchemy.orm import Session
import models
import database

def generate_report(session_id: str, db: Session):
    """
    Generates a report for an interview session.
    """
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        return "Interview session not found"

    report = f"Interview Report for session {session.id}\n\n"
    report += f"Date: {session.session_date}\n\n"

    for i, round in enumerate(session.rounds):
        report += f"--- Round {i+1} ---\n"
        report += f"Question: {round.question}\n"
        report += f"Transcript: {round.transcript}\n"
        report += f"Sentiment Analysis: {round.sentiment_analysis}\n"
        report += f"Facial Expression Analysis: {round.facial_expression_analysis}\n\n"

    session.report = report
    db.commit()

    return report
