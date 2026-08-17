from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from database.models import UserProfile, RoleEnum
from database.supabase_client import supabase_db
from ingestion.indexer import document_indexer
from auth.dependencies import require_approved_user, require_teacher_or_admin
from utils.logging import logger

router = APIRouter(prefix="/api/documents", tags=["Document Management & Ingestion"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    doc_type: str = Form("circular"),
    department: str = Form("ALL"),
    course: str = Form("ALL"),
    semester: int = Form(0),
    audience: str = Form("everyone"),
    visibility: str = Form("everyone"),
    effective_date: str = Form(""),
    existing_doc_id: Optional[str] = Form(None),
    current_user: UserProfile = Depends(require_teacher_or_admin)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    
    if current_user.role == RoleEnum.TEACHER and visibility == "everyone":
        visibility = "course_students"

    from starlette.concurrency import run_in_threadpool

    success, message, metadata = await run_in_threadpool(
        document_indexer.process_and_index_pdf,
        file_bytes=file_bytes,
        filename=file.filename,
        title=title,
        doc_type=doc_type,
        department=department,
        course=course,
        semester=semester,
        audience=audience,
        visibility=visibility,
        effective_date=effective_date,
        uploader_name=current_user.full_name,
        uploader_id=current_user.id,
        existing_doc_id=existing_doc_id,
        status_callback=None
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"message": message, "document": metadata}

@router.get("")
def list_documents(current_user: UserProfile = Depends(require_approved_user)):
    if current_user.role == RoleEnum.ADMIN:
        docs = supabase_db.get_documents()
    elif current_user.role == RoleEnum.TEACHER:
        docs = supabase_db.get_documents()
        docs = [
            d for d in docs
            if d.get("visibility") in ["everyone", "teachers", "students"]
            or d.get("owner_id") == current_user.id
            or d.get("department") in [current_user.department, "ALL"]
        ]
    else:
        docs = supabase_db.get_documents()
        docs = [
            d for d in docs
            if d.get("visibility") in ["everyone", "students"]
            or (d.get("visibility") == "department" and d.get("department") in [current_user.department, "ALL"])
            or (d.get("visibility") == "course_students" and d.get("semester") in [current_user.semester, 0])
        ]
    return {"documents": docs, "count": len(docs)}

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: UserProfile = Depends(require_teacher_or_admin)
):
    existing = supabase_db.get_documents({"id": doc_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = existing[0]
    if current_user.role != RoleEnum.ADMIN and doc.get("owner_id") != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this document.")

    success, msg = document_indexer.delete_document(doc_id)
    if success:
        return {"message": msg}
    raise HTTPException(status_code=500, detail=msg)
