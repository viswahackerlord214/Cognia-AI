from typing import Dict, Any, List
from database.models import UserProfile, RoleEnum, VisibilityEnum
from utils.logging import logger

class PermissionsEngine:
    """Strict Role-Based Access Control (RBAC) & Metadata Pre-Filtering Engine."""

    @staticmethod
    def build_chroma_where_clause(user: UserProfile) -> Dict[str, Any]:
        """
        Constructs a ChromaDB 'where' filter expression to enforce RBAC BEFORE vector retrieval.
        Ensures students NEVER retrieve teacher-private or confidential documents.
        """
        if user.role == RoleEnum.ADMIN:
            # Admins have access to active official documents
            return {"status": "active"}

        if user.role == RoleEnum.STUDENT:
            # Students can ONLY see:
            # 1. visibility == 'everyone'
            # 2. visibility == 'students'
            # 3. (visibility == 'department' AND department == user.department)
            # 4. (visibility == 'course_students' AND semester == user.semester)
            # EXCLUDES: 'teachers', 'owner_only'
            return {
                "$and": [
                    {"status": "active"},
                    {
                        "$or": [
                            {"visibility": VisibilityEnum.EVERYONE.value},
                            {"visibility": VisibilityEnum.STUDENTS.value},
                            {
                                "$and": [
                                    {"visibility": VisibilityEnum.DEPARTMENT.value},
                                    {"department": user.department}
                                ]
                            },
                            {
                                "$and": [
                                    {"visibility": VisibilityEnum.COURSE_STUDENTS.value},
                                    {"semester": user.semester}
                                ]
                            }
                        ]
                    }
                ]
            }

        if user.role == RoleEnum.TEACHER:
            # Teachers can see:
            # 1. visibility == 'everyone'
            # 2. visibility == 'teachers'
            # 3. visibility == 'students'
            # 4. (visibility == 'department' AND department == user.department)
            # 5. (visibility == 'owner_only' AND owner_id == user.id)
            # EXCLUDES: other teachers' 'owner_only' private notes
            return {
                "$and": [
                    {"status": "active"},
                    {
                        "$or": [
                            {"visibility": VisibilityEnum.EVERYONE.value},
                            {"visibility": VisibilityEnum.TEACHERS.value},
                            {"visibility": VisibilityEnum.STUDENTS.value},
                            {
                                "$and": [
                                    {"visibility": VisibilityEnum.DEPARTMENT.value},
                                    {"department": user.department}
                                ]
                            },
                            {
                                "$and": [
                                    {"visibility": VisibilityEnum.OWNER_ONLY.value},
                                    {"owner_id": user.id}
                                ]
                            }
                        ]
                    }
                ]
            }

        # Fallback default (safe deny)
        return {"visibility": VisibilityEnum.EVERYONE.value}

    @staticmethod
    def is_document_accessible(user: UserProfile, doc_metadata: Dict[str, Any]) -> bool:
        """
        In-memory safety check to verify if a user has permission to access a document chunk.
        """
        if user.role == RoleEnum.ADMIN:
            return True

        visibility = doc_metadata.get("visibility", VisibilityEnum.EVERYONE.value)
        owner_id = doc_metadata.get("owner_id", "")
        dept = doc_metadata.get("department", "ALL")
        sem = int(doc_metadata.get("semester", 0))
        status = doc_metadata.get("status", "active")

        if status != "active" and user.role != RoleEnum.ADMIN:
            return False

        if visibility == VisibilityEnum.EVERYONE.value:
            return True

        if visibility == VisibilityEnum.OWNER_ONLY.value:
            # Only the owner can view owner_only documents
            return owner_id == user.id

        if visibility == VisibilityEnum.TEACHERS.value:
            # Teachers and Admins only
            return user.role in [RoleEnum.TEACHER, RoleEnum.ADMIN]

        if visibility == VisibilityEnum.STUDENTS.value:
            return True

        if visibility == VisibilityEnum.DEPARTMENT.value:
            return dept in [user.department, "ALL"]

        if visibility == VisibilityEnum.COURSE_STUDENTS.value:
            return (dept in [user.department, "ALL"]) and (sem in [user.semester, 0])

        return False
