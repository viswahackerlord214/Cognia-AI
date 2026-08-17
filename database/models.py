from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class RoleEnum(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class AccountStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class VisibilityEnum(str, Enum):
    EVERYONE = "everyone"
    STUDENTS = "students"
    TEACHERS = "teachers"
    DEPARTMENT = "department"
    COURSE_STUDENTS = "course_students"
    OWNER_ONLY = "owner_only"

class DocumentTypeEnum(str, Enum):
    CIRCULAR = "circular"
    CURRICULUM = "curriculum"
    PYQ = "pyq"
    ACADEMIC_CALENDAR = "academic_calendar"
    REGULATION = "regulation"
    EXAM_NOTICE = "exam_notice"
    LECTURE_NOTES = "lecture_notes"
    ASSIGNMENT = "assignment"
    OTHER = "other"

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    university_id: Optional[str] = None
    role: RoleEnum
    status: AccountStatusEnum = AccountStatusEnum.APPROVED
    department: str = "CS"
    course: str = "CS501"
    semester: int = 1
    section: str = "A"
    designation: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    created_at: Optional[str] = None

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    university_id: str
    requested_role: RoleEnum
    department: str = "CS"
    course: str = "CS501"
    semester: int = 1
    section: str = "A"
    designation: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: Optional[str] = "demo_password"
    role: Optional[str] = None

class AdminUserApprovalRequest(BaseModel):
    target_user_id: str
    assigned_role: RoleEnum
    action: str

class DocumentMetadata(BaseModel):
    id: str
    title: str
    filename: str
    document_type: DocumentTypeEnum
    department: str = "ALL"
    course: str = "ALL"
    semester: int = 0
    audience: str = "everyone"
    uploaded_by: str
    owner_id: str
    visibility: VisibilityEnum
    effective_date: str
    version: int = 1
    status: str = "active"
    storage_path: Optional[str] = None
    created_at: Optional[str] = None

class RAGSourceCitation(BaseModel):
    document_name: str
    page_number: int
    chunk_text: str
    similarity_score: float = 0.0
    document_type: str = "official"
    visibility: str = "everyone"

class QuizQuestionSchema(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: str = "medium"
    topic: str
    source: str
    page: int = 1

class QuizSchema(BaseModel):
    title: str
    course: str
    semester: int
    topic: str
    questions: List[QuizQuestionSchema]

class QuizAttemptSchema(BaseModel):
    id: Optional[str] = None
    assignment_id: str
    quiz_id: str
    student_id: str
    score: int
    total_questions: int
    answers: Dict[int, str]
    submitted_at: Optional[str] = None

class ChatConversation(BaseModel):
    id: str
    user_id: str
    title: str
    mode: str = "docs"
    created_at: str
    updated_at: str

class ChatMessage(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    citations: Optional[List[Dict[str, Any]]] = None
    created_at: str
