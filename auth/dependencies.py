from typing import List, Optional
from fastapi import Header, HTTPException, Depends, status
from database.models import UserProfile, RoleEnum, AccountStatusEnum
from database.supabase_client import supabase_db
from utils.logging import logger

def get_current_user(authorization: Optional[str] = Header(None)) -> UserProfile:
    """
    FastAPI dependency that extracts authorization token/email and verifies profile in DB.
    """
    if not authorization:
        # Fallback to default student header for quick local API testing
        authorization = "Bearer student@univ.edu"

    token = authorization.replace("Bearer ", "").strip()
    
    # Lookup profile in Supabase/DB by email or ID
    user_dict = supabase_db.get_user_by_email(token) or supabase_db.get_user_by_id(token)
    
    if not user_dict:
        # Default fallback for demo user header strings e.g. "admin", "teacher", "student"
        if token.lower() in ["admin", "admin@univ.edu"]:
            user_dict = supabase_db.get_user_by_email("admin@univ.edu")
        elif token.lower() in ["teacher", "teacher@univ.edu"]:
            user_dict = supabase_db.get_user_by_email("teacher@univ.edu")
        elif token.lower() in ["student", "student@univ.edu"]:
            user_dict = supabase_db.get_user_by_email("student@univ.edu")

    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials or user not found."
        )

    return UserProfile(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        university_id=user_dict.get("university_id"),
        role=RoleEnum(user_dict["role"]),
        status=AccountStatusEnum(user_dict.get("status", "approved")),
        department=user_dict.get("department", "CS"),
        course=user_dict.get("course", "CS501"),
        semester=int(user_dict.get("semester", 1)),
        section=user_dict.get("section", "A"),
        designation=user_dict.get("designation")
    )

def require_approved_user(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """
    CRITICAL SECURITY DEPENDENCY:
    Enforces that user account status MUST be 'approved'.
    Blocks 'pending', 'rejected', and 'suspended' users from accessing APIs.
    """
    if current_user.status != AccountStatusEnum.APPROVED:
        if current_user.status == AccountStatusEnum.PENDING:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Cognia AI account is awaiting administrator approval."
            )
        elif current_user.status == AccountStatusEnum.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Cognia AI registration request was rejected by the administrator."
            )
        elif current_user.status == AccountStatusEnum.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your Cognia AI account has been suspended."
            )
    return current_user

def require_admin(current_user: UserProfile = Depends(require_approved_user)) -> UserProfile:
    """Guards endpoint to allow Admin users ONLY."""
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied. Administrative privileges required."
        )
    return current_user

def require_teacher_or_admin(current_user: UserProfile = Depends(require_approved_user)) -> UserProfile:
    """Guards endpoint to allow Teacher or Admin users ONLY."""
    if current_user.role not in [RoleEnum.TEACHER, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied. Faculty or Administrative privileges required."
        )
    return current_user
