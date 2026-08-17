import uuid
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from database.models import UserProfile, RoleEnum
from database.supabase_client import supabase_db
from quiz.schemas import QuizGenerationRequest
from quiz.generator import quiz_generator
from quiz.validator import quiz_validator
from auth.dependencies import require_approved_user, require_teacher_or_admin
from utils.logging import logger

router = APIRouter(prefix="/api/quizzes", tags=["AI Quiz Generator & Assignments"])

class PublishQuizRequest(BaseModel):
    title: str
    course: str
    semester: int
    topic: str
    questions: List[Dict[str, Any]]

class SubmitAttemptRequest(BaseModel):
    quiz_id: str
    answers: Dict[int, str]

@router.post("/generate")
def generate_quiz(
    req: QuizGenerationRequest,
    current_user: UserProfile = Depends(require_teacher_or_admin)
):
    quiz_data = quiz_generator.generate_quiz(req, current_user, semester=5)
    val = quiz_validator.validate_quiz(quiz_data)
    
    if not val.is_valid:
        quiz_data = quiz_validator.repair_quiz(quiz_data, val)
        val = quiz_validator.validate_quiz(quiz_data)

    return {
        "quiz": quiz_data,
        "validation": val
    }

@router.get("")
def list_quizzes(
    course: Optional[str] = None,
    semester: Optional[int] = None,
    current_user: UserProfile = Depends(require_approved_user)
):
    target_sem = semester or current_user.semester
    quizzes = supabase_db.get_quizzes(course=course, semester=target_sem)
    return {"quizzes": quizzes, "count": len(quizzes)}

@router.get("/{quiz_id}/results")
def get_quiz_results_for_teacher(
    quiz_id: str,
    current_user: UserProfile = Depends(require_teacher_or_admin)
):
    """Allows teachers to view student marks and detailed score breakdowns."""
    attempts = supabase_db.get_quiz_attempts(quiz_id)
    return {"quiz_id": quiz_id, "attempts": attempts, "count": len(attempts)}

@router.post("/{quiz_id}/publish")
def publish_quiz(
    quiz_id: str,
    req: PublishQuizRequest,
    current_user: UserProfile = Depends(require_teacher_or_admin)
):
    quiz_record = {
        "id": str(uuid.uuid4()),
        "title": req.title,
        "course": req.course,
        "semester": req.semester,
        "topic": req.topic,
        "created_by": current_user.id,
        "status": "published"
    }
    created = supabase_db.insert_quiz(quiz_record, req.questions)
    return {"message": "Quiz published and assigned to students successfully.", "quiz": created}

@router.post("/{quiz_id}/submit")
def submit_quiz_attempt(
    quiz_id: str,
    req: SubmitAttemptRequest,
    current_user: UserProfile = Depends(require_approved_user)
):
    quizzes = supabase_db.get_quizzes()
    quiz = next((q for q in quizzes if q.get("id") == quiz_id), None)
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    questions = quiz.get("quiz_questions", [])
    if not questions:
        raise HTTPException(status_code=400, detail="Quiz contains no questions.")

    score = 0
    feedback = []
    for idx, q in enumerate(questions):
        user_ans = req.answers.get(idx)
        correct_ans = q.get("correct_answer")
        is_correct = user_ans == correct_ans
        if is_correct:
            score += 1

        feedback.append({
            "question_index": idx,
            "question_text": q.get("question_text"),
            "user_answer": user_ans,
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "explanation": q.get("explanation")
        })

    percentage = round((score / len(questions)) * 100, 1)
    attempt_record = {
        "id": str(uuid.uuid4()),
        "assignment_id": quiz_id,
        "quiz_id": quiz_id,
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "student_university_id": current_user.university_id or "STUD-1001",
        "score": score,
        "total_questions": len(questions),
        "percentage": percentage,
        "answers": req.answers,
        "submitted_at": "Just now"
    }
    supabase_db.save_quiz_attempt(attempt_record)

    return {
        "message": "Attempt submitted successfully.",
        "score": score,
        "total": len(questions),
        "percentage": percentage,
        "breakdown": feedback
    }
