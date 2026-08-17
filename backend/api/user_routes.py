from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from database.models import UserProfile, AdminUserApprovalRequest, RoleEnum, AccountStatusEnum
from database.supabase_client import supabase_db
from auth.dependencies import require_admin
from utils.logging import logger

router = APIRouter(prefix="/api/admin", tags=["Admin User Approvals & Management"])

@router.get("/users")
def list_users_for_approval(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, suspended"),
    role: Optional[str] = Query(None, description="Filter by role: student, teacher, admin"),
    admin: UserProfile = Depends(require_admin)
):
    profiles = supabase_db.get_all_profiles(status=status, role=role)
    return {"users": profiles, "count": len(profiles)}

@router.post("/users/{target_id}/approve")
def approve_user(
    target_id: str,
    req: AdminUserApprovalRequest,
    admin: UserProfile = Depends(require_admin)
):
    user = supabase_db.get_user_by_id(target_id)
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    success = supabase_db.update_user_approval_status(
        target_user_id=target_id,
        assigned_role=req.assigned_role.value,
        status=AccountStatusEnum.APPROVED.value,
        admin_id=admin.id
    )

    if success:
        logger.info(f"Admin '{admin.email}' APPROVED user '{user['email']}' as '{req.assigned_role.value}'.")
        return {"message": f"User '{user['email']}' has been approved successfully as {req.assigned_role.value}."}
    raise HTTPException(status_code=500, detail="Failed to update approval status.")

@router.post("/users/{target_id}/reject")
def reject_user(
    target_id: str,
    admin: UserProfile = Depends(require_admin)
):
    user = supabase_db.get_user_by_id(target_id)
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    success = supabase_db.update_user_approval_status(
        target_user_id=target_id,
        assigned_role=user.get("role", "student"),
        status=AccountStatusEnum.REJECTED.value,
        admin_id=admin.id
    )

    if success:
        logger.info(f"Admin '{admin.email}' REJECTED user '{user['email']}'.")
        return {"message": f"User '{user['email']}' has been rejected."}
    raise HTTPException(status_code=500, detail="Failed to update status.")

@router.post("/users/{target_id}/suspend")
def suspend_user(
    target_id: str,
    admin: UserProfile = Depends(require_admin)
):
    user = supabase_db.get_user_by_id(target_id)
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    success = supabase_db.update_user_approval_status(
        target_user_id=target_id,
        assigned_role=user.get("role", "student"),
        status=AccountStatusEnum.SUSPENDED.value,
        admin_id=admin.id
    )

    if success:
        logger.info(f"Admin '{admin.email}' SUSPENDED user '{user['email']}'.")
        return {"message": f"User '{user['email']}' has been suspended."}
    raise HTTPException(status_code=500, detail="Failed to update status.")

@router.post("/users/{target_id}/reactivate")
def reactivate_user(
    target_id: str,
    admin: UserProfile = Depends(require_admin)
):
    user = supabase_db.get_user_by_id(target_id)
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    success = supabase_db.update_user_approval_status(
        target_user_id=target_id,
        assigned_role=user.get("role", "student"),
        status=AccountStatusEnum.APPROVED.value,
        admin_id=admin.id
    )

    if success:
        logger.info(f"Admin '{admin.email}' REACTIVATED user '{user['email']}'.")
        return {"message": f"User '{user['email']}' has been reactivated."}
    raise HTTPException(status_code=500, detail="Failed to update status.")
