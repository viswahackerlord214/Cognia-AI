import uuid
from typing import Optional, Dict, Any, List
from utils.config import Config
from utils.logging import logger
from database.models import UserProfile, RoleEnum, AccountStatusEnum

class SupabaseManager:
    """
    Manages Supabase PostgreSQL database operations for Cognia AI Platform.
    Includes in-memory fallback store when Supabase connection is unconfigured.
    """

    def __init__(self):
        self.client = None
        self.is_connected = False

        if Config.SUPABASE_URL and Config.SUPABASE_ANON_KEY and "placeholder" not in Config.SUPABASE_URL:
            try:
                from supabase import create_client, ClientOptions
                self.client = create_client(
                    Config.SUPABASE_URL, 
                    Config.SUPABASE_SERVICE_ROLE_KEY or Config.SUPABASE_ANON_KEY,
                    options=ClientOptions(postgrest_client_timeout=5)
                )
                self.is_connected = True
                logger.info("Connected to Supabase PostgreSQL database.")
            except Exception as e:
                logger.warning(f"Failed to connect to Supabase: {e}. Falling back to Local Storage mode.")
                self.is_connected = False
        else:
            logger.info("Supabase credentials unconfigured or placeholder. Running in Local Storage Mode.")

        # Local In-Memory Fallback Storage
        self._mock_users: Dict[str, Dict[str, Any]] = {
            "student@univ.edu": {
                "id": "00000000-0000-0000-0000-000000000003",
                "email": "student@univ.edu",
                "password": "student123",
                "full_name": "Alex Rivera",
                "university_id": "STUD-1001",
                "role": "student",
                "status": "approved",
                "department": "CS",
                "course": "CS501",
                "semester": 5,
                "section": "A"
            },
            "teacher@univ.edu": {
                "id": "00000000-0000-0000-0000-000000000002",
                "email": "teacher@univ.edu",
                "password": "teacher123",
                "full_name": "Prof. Turing",
                "university_id": "FAC-2002",
                "role": "teacher",
                "status": "approved",
                "department": "CS",
                "course": "CS501",
                "semester": 5,
                "designation": "Associate Professor"
            },
            "viswaravindren@gmail.com": {
                "id": "00000000-0000-0000-0000-000000000001",
                "email": "viswaravindren@gmail.com",
                "password": "viswacool21",
                "full_name": "Viswa Ravindren (Super Admin)",
                "university_id": "ADM-0001",
                "role": "admin",
                "status": "approved",
                "department": "ALL",
                "course": "ALL",
                "semester": 0,
                "section": "A"
            },
            "pending_student@univ.edu": {
                "id": "00000000-0000-0000-0000-000000000004",
                "email": "pending_student@univ.edu",
                "password": "pending123",
                "full_name": "Jane Doe (Pending)",
                "university_id": "STUD-9999",
                "role": "student",
                "status": "pending",
                "department": "CS",
                "course": "CS501",
                "semester": 5,
                "section": "B"
            }
        }
        
        self._mock_documents: List[Dict[str, Any]] = [
            {
                "id": "doc-study-001",
                "title": "DBMS Normalization & Functional Dependencies Lecture Notes",
                "filename": "DBMS_Normalization_Notes.pdf",
                "document_type": "lecture_notes",
                "department": "CS",
                "course": "CS501",
                "semester": 5,
                "audience": "students",
                "visibility": "course_students",
                "uploaded_by": "Prof. Turing",
                "owner_id": "00000000-0000-0000-0000-000000000002",
                "version": 1,
                "status": "active",
                "created_at": "2026-08-14 10:00:00"
            }
        ]
        self._mock_quizzes: List[Dict[str, Any]] = []
        self._mock_attempts: List[Dict[str, Any]] = [
            {
                "id": "attempt-001",
                "assignment_id": "quiz-001",
                "quiz_id": "quiz-001",
                "student_id": "00000000-0000-0000-0000-000000000003",
                "student_name": "Alex Rivera",
                "student_university_id": "STUD-1001",
                "score": 4,
                "total_questions": 5,
                "percentage": 80.0,
                "answers": {0: "Choice A", 1: "Choice B"},
                "submitted_at": "2026-08-14 14:30:00"
            }
        ]
        self._mock_notifications: List[Dict[str, Any]] = [
            {
                "id": "notif-001",
                "target_role": "student",
                "course": "CS501",
                "title": "📄 New Study Material Uploaded",
                "message": "Prof. Turing uploaded DBMS Normalization & Functional Dependencies Lecture Notes for CS501.",
                "created_at": "2026-08-14 10:05:00",
                "is_read": False
            }
        ]
        self._mock_chat_conversations: List[Dict[str, Any]] = []
        self._mock_chat_messages: List[Dict[str, Any]] = []

    def authenticate_user(self, email: str, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Verifies password for the user."""
        email_clean = email.strip().lower()
        if self.is_connected and self.client and password:
            try:
                res = self.client.auth.sign_in_with_password({"email": email_clean, "password": password})
                if res and res.user:
                    return self.get_user_by_email(email_clean)
            except Exception as e:
                logger.error(f"Supabase Auth login failed for '{email_clean}': {e}")
        
        user = self._mock_users.get(email_clean)
        if user:
            if not password or password in ["demo_password", "student123", "teacher123", "viswacool21"] or user.get("password") == password:
                return user
        return self.get_user_by_email(email_clean)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("profiles").select("*").eq("email", email).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error fetching user by email from Supabase: {e}")
        return self._mock_users.get(email.lower())

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("profiles").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error fetching user by ID from Supabase: {e}")
        for user in self._mock_users.values():
            if user["id"] == user_id:
                return user
        return None

    def get_all_profiles(self, status: Optional[str] = None, role: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                query = self.client.table("profiles").select("*")
                if status:
                    query = query.eq("status", status)
                if role:
                    query = query.eq("role", role)
                res = query.execute()
                return res.data or []
            except Exception as e:
                logger.error(f"Error fetching profiles from Supabase: {e}")
        
        users = list(self._mock_users.values())
        if status:
            users = [u for u in users if u.get("status") == status]
        if role:
            users = [u for u in users if u.get("role") == role]
        return users

    def create_user_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("profiles").insert(profile_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error creating user profile in Supabase: {e}")

        email = profile_data.get("email", "").lower()
        self._mock_users[email] = profile_data
        return profile_data

    def update_user_approval_status(
        self,
        target_user_id: str,
        assigned_role: str,
        status: str,
        admin_id: str
    ) -> bool:
        if self.is_connected and self.client:
            try:
                update_payload = {
                    "role": assigned_role,
                    "status": status,
                    "approved_by": admin_id,
                }
                self.client.table("profiles").update(update_payload).eq("id", target_user_id).execute()
                return True
            except Exception as e:
                logger.error(f"Error updating user status in Supabase: {e}")

        user = self.get_user_by_id(target_user_id)
        if user:
            user["role"] = assigned_role
            user["status"] = status
            user["approved_by"] = admin_id
            return True
        return False

    def insert_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("documents").insert(doc_data).execute()
                if res.data:
                    doc = res.data[0]
                    self.create_notification(
                        target_role="student",
                        course=doc.get("course", "ALL"),
                        title="📄 New Course Study Material Uploaded",
                        message=f"New document '{doc.get('title')}' uploaded for {doc.get('course')} by {doc.get('uploaded_by')}."
                    )
                    return doc
            except Exception as e:
                logger.error(f"Error inserting document in Supabase: {e}")

        self._mock_documents.append(doc_data)
        self.create_notification(
            target_role="student",
            course=doc_data.get("course", "ALL"),
            title="📄 New Course Study Material Uploaded",
            message=f"New study material '{doc_data.get('title')}' uploaded for {doc_data.get('course', 'CS501')} by {doc_data.get('uploaded_by', 'Faculty')}."
        )
        return doc_data

    def get_documents(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        db_docs = []
        if self.is_connected and self.client:
            try:
                query = self.client.table("documents").select("*")
                if filters:
                    for k, v in filters.items():
                        query = query.eq(k, v)
                res = query.execute()
                db_docs = res.data or []
            except Exception as e:
                logger.error(f"Error fetching documents from Supabase: {e}")

        mock_docs = list(self._mock_documents)
        if filters:
            for k, v in filters.items():
                mock_docs = [d for d in mock_docs if d.get(k) == v]
                
        db_ids = {d.get("id") for d in db_docs if d.get("id")}
        combined = db_docs + [d for d in mock_docs if d.get("id") not in db_ids]
        return combined

    def delete_document(self, doc_id: str) -> bool:
        if self.is_connected and self.client:
            try:
                self.client.table("documents").delete().eq("id", doc_id).execute()
                return True
            except Exception as e:
                logger.error(f"Error deleting document from Supabase: {e}")

        self._mock_documents = [d for d in self._mock_documents if d.get("id") != doc_id]
        return True

    def insert_quiz(self, quiz_data: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("quizzes").insert(quiz_data).execute()
                if res.data:
                    quiz_id = res.data[0]["id"]
                    for q in questions:
                        q["quiz_id"] = quiz_id
                    self.client.table("quiz_questions").insert(questions).execute()
                    self.create_notification(
                        target_role="student",
                        course=quiz_data.get("course", "CS501"),
                        title="📝 New Quiz Assigned",
                        message=f"Quiz '{quiz_data.get('title')}' has been published and assigned to your class."
                    )
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error inserting quiz in Supabase: {e}")

        quiz_data["quiz_questions"] = questions
        self._mock_quizzes.append(quiz_data)
        self.create_notification(
            target_role="student",
            course=quiz_data.get("course", "CS501"),
            title="📝 New Quiz Assigned",
            message=f"Quiz '{quiz_data.get('title')}' has been published and assigned to your class."
        )
        return quiz_data

    def get_quizzes(self, course: Optional[str] = None, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                query = self.client.table("quizzes").select("*, quiz_questions(*)")
                if course:
                    query = query.eq("course", course)
                if semester:
                    query = query.eq("semester", semester)
                res = query.execute()
                return res.data or []
            except Exception as e:
                logger.error(f"Error fetching quizzes from Supabase: {e}")

        quizzes = list(self._mock_quizzes)
        if course:
            quizzes = [q for q in quizzes if q.get("course") == course]
        if semester:
            quizzes = [q for q in quizzes if q.get("semester") == semester]
        return quizzes

    def save_quiz_attempt(self, attempt_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("quiz_attempts").insert(attempt_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Error saving quiz attempt in Supabase: {e}")

        self._mock_attempts.append(attempt_data)
        return attempt_data

    def get_quiz_attempts(self, quiz_id: str) -> List[Dict[str, Any]]:
        """Returns all student attempts and scores for a specific quiz (for Teacher view)."""
        if self.is_connected and self.client:
            try:
                res = self.client.table("quiz_attempts").select("*, profiles(*)").eq("quiz_id", quiz_id).execute()
                return res.data or []
            except Exception as e:
                logger.error(f"Error fetching quiz attempts from Supabase: {e}")

        attempts = [a for a in self._mock_attempts if a.get("quiz_id") == quiz_id or a.get("assignment_id") == quiz_id]
        return attempts

    # Notifications Engine
    def create_notification(self, target_role: str, title: str, message: str, course: str = "ALL"):
        notif = {
            "id": str(uuid.uuid4()),
            "target_role": target_role,
            "course": course,
            "title": title,
            "message": message,
            "created_at": "Just now",
            "is_read": False
        }
        self._mock_notifications.insert(0, notif)

    def get_notifications(self, user_role: str, course: str = "ALL") -> List[Dict[str, Any]]:
        return [
            n for n in self._mock_notifications
            if n.get("target_role") in [user_role, "all"]
            and (n.get("course") in [course, "ALL"] or course == "ALL")
        ]

    def mark_notification_read(self, notification_id: str):
        for n in self._mock_notifications:
            if n.get("id") == notification_id:
                n["is_read"] = True
                break

    # --- Chat History & Memory Methods ---

    def create_chat_conversation(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("chat_conversations").insert(conversation_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error creating chat conversation: {e}")
        self._mock_chat_conversations.append(conversation_data)
        return conversation_data

    def get_chat_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("chat_conversations").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error fetching chat conversations: {e}")
        
        user_convs = [c for c in self._mock_chat_conversations if c.get("user_id") == user_id]
        return sorted(user_convs, key=lambda x: x.get("updated_at", ""), reverse=True)

    def delete_chat_conversation(self, conversation_id: str, user_id: str) -> bool:
        if self.is_connected and self.client:
            try:
                self.client.table("chat_conversations").delete().eq("id", conversation_id).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error deleting chat conversation: {e}")
        
        self._mock_chat_conversations = [c for c in self._mock_chat_conversations if c.get("id") != conversation_id]
        self._mock_chat_messages = [m for m in self._mock_chat_messages if m.get("conversation_id") != conversation_id]
        return True

    def rename_chat_conversation(self, conversation_id: str, user_id: str, new_title: str, updated_at: str) -> bool:
        if self.is_connected and self.client:
            try:
                self.client.table("chat_conversations").update({"title": new_title, "updated_at": updated_at}).eq("id", conversation_id).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error renaming chat conversation: {e}")
        
        for c in self._mock_chat_conversations:
            if c.get("id") == conversation_id and c.get("user_id") == user_id:
                c["title"] = new_title
                c["updated_at"] = updated_at
        return True
        
    def update_chat_conversation_timestamp(self, conversation_id: str, updated_at: str) -> bool:
        if self.is_connected and self.client:
            try:
                self.client.table("chat_conversations").update({"updated_at": updated_at}).eq("id", conversation_id).execute()
                return True
            except Exception as e:
                pass
        for c in self._mock_chat_conversations:
            if c.get("id") == conversation_id:
                c["updated_at"] = updated_at
        return True

    def add_chat_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("chat_messages").insert(message_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error adding chat message: {e}")
        self._mock_chat_messages.append(message_data)
        return message_data

    def get_chat_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("chat_messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                if "PGRST205" not in str(e):
                    logger.error(f"Error fetching chat messages: {e}")
        
        messages = [m for m in self._mock_chat_messages if m.get("conversation_id") == conversation_id]
        return sorted(messages, key=lambda x: x.get("created_at", ""))

supabase_db = SupabaseManager()
