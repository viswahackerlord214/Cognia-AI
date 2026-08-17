import pytest
from database.models import UserProfile, RoleEnum
from quiz.schemas import QuizGenerationRequest
from quiz.generator import quiz_generator
from quiz.validator import quiz_validator

def test_quiz_generator_and_validator():
    user = UserProfile(
        id="teacher-uuid-002",
        email="teacher@univ.edu",
        full_name="Prof. Turing",
        role=RoleEnum.TEACHER,
        department="CS"
    )

    req = QuizGenerationRequest(
        course="CS501",
        topic="Normalization",
        num_questions=3,
        difficulty="medium"
    )

    quiz_data = quiz_generator.generate_quiz(req, user, semester=5)
    assert "questions" in quiz_data
    assert len(quiz_data["questions"]) == 3

    val = quiz_validator.validate_quiz(quiz_data)
    assert val.is_valid is True
    assert val.score == 1.0
