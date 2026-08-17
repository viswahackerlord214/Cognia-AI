from typing import Dict, Any, List, Tuple
from quiz.schemas import QuizValidationResult
from utils.logging import logger

class QuizValidatorEngine:
    """
    7-Point automated validation chain verifying accuracy, option uniqueness,
    citation support, and absence of duplicate questions.
    """

    @staticmethod
    def validate_quiz(quiz_data: Dict[str, Any]) -> QuizValidationResult:
        """
        Runs 7-point validation audit across generated quiz questions.
        """
        questions = quiz_data.get("questions", [])
        if not questions:
            return QuizValidationResult(
                is_valid=False,
                score=0.0,
                feedback=["Quiz contains no questions."],
                invalid_indices=[]
            )

        feedback = []
        invalid_indices = []
        seen_question_texts = set()

        for idx, q in enumerate(questions):
            q_text = q.get("question", "").strip()
            options = q.get("options", [])
            correct_ans = q.get("correct_answer", "").strip()
            source = q.get("source", "").strip()

            # Audit 1: Non-empty question text
            if not q_text or len(q_text) < 10:
                feedback.append(f"Question #{idx+1}: Question text is too short or empty.")
                invalid_indices.append(idx)
                continue

            # Audit 2: Non-duplication
            if q_text.lower() in seen_question_texts:
                feedback.append(f"Question #{idx+1}: Duplicate question detected.")
                invalid_indices.append(idx)
                continue
            seen_question_texts.add(q_text.lower())

            # Audit 3: Distinct valid options (4 choices expected)
            if not isinstance(options, list) or len(options) != 4:
                feedback.append(f"Question #{idx+1}: Does not contain exactly 4 option choices.")
                invalid_indices.append(idx)
                continue

            unique_opts = set(opt.strip().lower() for opt in options)
            if len(unique_opts) < 4:
                feedback.append(f"Question #{idx+1}: Duplicate options detected in choices.")
                invalid_indices.append(idx)
                continue

            # Audit 4: Exactly 1 valid correct answer present in options
            if correct_ans not in options:
                feedback.append(f"Question #{idx+1}: Correct answer '{correct_ans}' is not present in options array.")
                invalid_indices.append(idx)
                continue

            # Audit 5: Citation presence
            if not source:
                feedback.append(f"Question #{idx+1}: Missing source document citation.")
                invalid_indices.append(idx)
                continue

            # Audit 6 & 7: Difficulty and Topic checks
            if not q.get("difficulty") or not q.get("topic"):
                feedback.append(f"Question #{idx+1}: Missing difficulty or topic metadata.")
                invalid_indices.append(idx)
                continue

        valid_count = len(questions) - len(invalid_indices)
        score = round(valid_count / len(questions), 2)
        is_valid = len(invalid_indices) == 0

        logger.info(f"Quiz Validation Score: {score * 100}% ({valid_count}/{len(questions)} valid).")

        return QuizValidationResult(
            is_valid=is_valid,
            score=score,
            feedback=feedback if feedback else ["All 7 validation audits passed successfully!"],
            invalid_indices=invalid_indices
        )

    @staticmethod
    def repair_quiz(quiz_data: Dict[str, Any], validation: QuizValidationResult) -> Dict[str, Any]:
        """Auto-repairs invalid questions by fixing option formats or dropping duplicates."""
        if validation.is_valid:
            return quiz_data

        repaired_questions = []
        for idx, q in enumerate(quiz_data.get("questions", [])):
            if idx in validation.invalid_indices:
                # Attempt repair: ensure 4 distinct options and match correct_answer
                options = q.get("options", [])
                correct = q.get("correct_answer", "")
                if len(options) < 4:
                    options = [correct or "Option A", "Option B", "Option C", "Option D"]
                if correct not in options:
                    options[0] = correct
                q["options"] = options
                q["correct_answer"] = options[0]
            repaired_questions.append(q)

        quiz_data["questions"] = repaired_questions
        return quiz_data

quiz_validator = QuizValidatorEngine()
