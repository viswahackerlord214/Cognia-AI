import pytest
from database.models import UserProfile, RoleEnum, VisibilityEnum, AccountStatusEnum
from auth.permissions import PermissionsEngine
from rag.crag import crag_pipeline

def test_student_cannot_access_owner_only_or_teacher_documents():
    """
    CRITICAL SECURITY TEST:
    Verifies that students are strictly barred from retrieving teacher-private or confidential documents.
    """
    student_user = UserProfile(
        id="student-uuid-003",
        email="student@univ.edu",
        full_name="Alex Rivera",
        role=RoleEnum.STUDENT,
        status=AccountStatusEnum.APPROVED,
        department="CS",
        semester=5
    )

    # 1. Test In-Memory Permission Check for owner_only
    confidential_doc_meta = {
        "id": "doc-secret-999",
        "title": "CONFIDENTIAL_INTERNAL_QUESTION_PAPER.pdf",
        "visibility": VisibilityEnum.OWNER_ONLY.value,
        "owner_id": "teacher-uuid-002",
        "department": "CS",
        "semester": 5,
        "status": "active"
    }

    assert PermissionsEngine.is_document_accessible(student_user, confidential_doc_meta) is False

    # 2. Test In-Memory Permission Check for teacher-only circular
    teacher_circular_meta = {
        "id": "doc-teacher-circular",
        "title": "Faculty Meeting Circular",
        "visibility": VisibilityEnum.TEACHERS.value,
        "owner_id": "admin-uuid-001",
        "department": "CS",
        "status": "active"
    }

    assert PermissionsEngine.is_document_accessible(student_user, teacher_circular_meta) is False

    # 3. Test Chroma Where Clause Excludes owner_only for Student
    where_clause = PermissionsEngine.build_chroma_where_clause(student_user)
    where_str = str(where_clause)
    assert "owner_only" not in where_str
    assert "teachers" not in where_str

def test_teacher_cannot_access_other_teacher_private_documents():
    teacher_1 = UserProfile(
        id="teacher-uuid-002",
        email="t1@univ.edu",
        full_name="Prof. Turing",
        role=RoleEnum.TEACHER,
        status=AccountStatusEnum.APPROVED,
        department="CS"
    )

    teacher_2_private_doc = {
        "id": "doc-t2-private",
        "visibility": VisibilityEnum.OWNER_ONLY.value,
        "owner_id": "teacher-uuid-099",
        "status": "active"
    }

    assert PermissionsEngine.is_document_accessible(teacher_1, teacher_2_private_doc) is False
