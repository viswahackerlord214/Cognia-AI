from typing import List, Optional
from pydantic import BaseModel, Field
from database.models import QuizQuestionSchema, QuizSchema

class QuizGenerationRequest(BaseModel):
    course: str
    topic: str
    num_questions: int = 5
    difficulty: str = "medium"
    question_type: str = "MCQ" # MCQ prioritized for MVP

class QuizValidationResult(BaseModel):
    is_valid: bool
    score: float # 0.0 to 1.0
    feedback: List[str]
    invalid_indices: List[int]
