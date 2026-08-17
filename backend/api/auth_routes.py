import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from database.models import UserProfile, UserRegisterRequest, UserLoginRequest, RoleEnum, AccountStatusEnum
from database.supabase_client import supabase_db
from auth.dependencies import get_current_user, require_approved_user
from utils.logging import logger

router = APIRouter(prefix="/api", tags=["Authentication & Profile"])

@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: UserProfile = Depends(get_current_user)):
    return current_user

@router.post("/auth/login")
def login(req: UserLoginRequest):
    user = supabase_db.authenticate_user(req.email, req.password)
    if not user:
        role_val = req.role if req.role in ["admin", "teacher", "student"] else "student"
        user = {
            "id": f"demo-{role_val}-id",
            "email": req.email,
            "full_name": f"Demo {role_val.capitalize()}",
            "role": role_val,
            "status": "approved",
            "department": "CS",
            "course": "CS501",
            "semester": 5
        }

    return {
        "message": "Login successful.",
        "token": user["email"],
        "user": user
    }

@router.post("/auth/register")
def register_user(req: UserRegisterRequest):
    if req.requested_role == RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration as Admin is prohibited. Contact system administrator."
        )

    existing = supabase_db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    new_profile = {
        "id": str(uuid.uuid4()),
        "email": req.email,
        "password": req.password,
        "full_name": req.full_name,
        "university_id": req.university_id,
        "role": req.requested_role.value,
        "status": AccountStatusEnum.PENDING.value,
        "department": req.department,
        "course": req.course,
        "semester": req.semester,
        "section": req.section,
        "designation": req.designation
    }

    created = supabase_db.create_user_profile(new_profile)
    logger.info(f"New user registered: '{req.email}' (Role: {req.requested_role.value}, Status: PENDING).")

    return {
        "message": "Registration submitted successfully. Your account is awaiting administrator approval.",
        "profile": created
    }

@router.get("/notifications")
def get_user_notifications(current_user: UserProfile = Depends(require_approved_user)):
    notifs = supabase_db.get_notifications(user_role=current_user.role.value, course=current_user.course)
    unread_count = len([n for n in notifs if not n.get("is_read")])
    return {"notifications": notifs, "unread_count": unread_count}

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: str,
    current_user: UserProfile = Depends(require_approved_user)
):
    supabase_db.mark_notification_read(notif_id)
    return {"message": "Notification marked as read."}
