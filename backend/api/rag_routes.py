from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from database.models import UserProfile
from auth.dependencies import require_approved_user
from rag.crag import crag_pipeline
from rag.vector_store import vector_store_manager
from auth.permissions import PermissionsEngine
from database.supabase_client import supabase_db
from utils.logging import logger
import uuid
from datetime import datetime

router = APIRouter(prefix="/api", tags=["AI & RAG Services"])

from typing import Optional, List, Dict, Any

class ChatQueryRequest(BaseModel):
    query: str
    mode: Optional[str] = "docs"  # "docs" | "web"
    history: Optional[List[Dict[str, str]]] = []
    conversation_id: Optional[str] = None

class RenameChatRequest(BaseModel):
    title: str

class TeachMeRequest(BaseModel):
    course: str
    topic: str

class PYQSearchRequest(BaseModel):
    course: str
    query: str
    semester: Optional[int] = 5

class PYQAnalyzeRequest(BaseModel):
    course: str

@router.post("/chat")
def execute_chat_query(
    req: ChatQueryRequest,
    current_user: UserProfile = Depends(require_approved_user)
):
    try:
        if not req.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty.")

        conversation_id = req.conversation_id
        now_str = datetime.utcnow().isoformat()
        
        if not conversation_id:
            # Create new conversation
            conversation_id = f"conv-{uuid.uuid4()}"
            title_words = req.query.split()[:5]
            title = " ".join(title_words) + ("..." if len(title_words) == 5 else "")
            supabase_db.create_chat_conversation({
                "id": conversation_id,
                "user_id": current_user.id,
                "title": title,
                "mode": req.mode or "docs",
                "created_at": now_str,
                "updated_at": now_str
            })
            history = req.history or []
        else:
            # Load history from DB
            db_messages = supabase_db.get_chat_messages(conversation_id)
            history = [{"role": m["role"], "content": m["content"]} for m in db_messages[-10:]]

        # Save User Message
        supabase_db.add_chat_message({
            "id": f"msg-{uuid.uuid4()}",
            "conversation_id": conversation_id,
            "role": "user",
            "content": req.query,
            "created_at": now_str
        })

        if req.mode == "web":
            result = crag_pipeline.execute_web_ai(query=req.query, user=current_user, history=history)
        else:
            result = crag_pipeline.execute_crag(query=req.query, user=current_user, history=history)
            
        # Save Assistant Message
        supabase_db.add_chat_message({
            "id": f"msg-{uuid.uuid4()}",
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": result.get("answer", ""),
            "citations": result.get("citations", []),
            "created_at": datetime.utcnow().isoformat()
        })
        
        # Update conversation timestamp
        supabase_db.update_chat_conversation_timestamp(conversation_id, datetime.utcnow().isoformat())

        result["conversation_id"] = conversation_id
        return result
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=err_msg)

@router.get("/chat/conversations")
def get_user_conversations(current_user: UserProfile = Depends(require_approved_user)):
    return {"conversations": supabase_db.get_chat_conversations(current_user.id)}

@router.get("/chat/conversations/{conversation_id}/messages")
def get_conversation_messages(conversation_id: str, current_user: UserProfile = Depends(require_approved_user)):
    # Basic authorization check: Ensure conversation belongs to user
    convs = supabase_db.get_chat_conversations(current_user.id)
    if not any(c["id"] == conversation_id for c in convs):
        raise HTTPException(status_code=403, detail="Not authorized to view this conversation.")
    return {"messages": supabase_db.get_chat_messages(conversation_id)}

@router.patch("/chat/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: str, 
    req: RenameChatRequest,
    current_user: UserProfile = Depends(require_approved_user)
):
    supabase_db.rename_chat_conversation(conversation_id, current_user.id, req.title, datetime.utcnow().isoformat())
    return {"status": "success"}

@router.delete("/chat/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str, 
    current_user: UserProfile = Depends(require_approved_user)
):
    supabase_db.delete_chat_conversation(conversation_id, current_user.id)
    return {"status": "success"}

@router.post("/teach")
def execute_teach_me(
    req: TeachMeRequest,
    current_user: UserProfile = Depends(require_approved_user)
):
    result = crag_pipeline.execute_teach_me(topic=req.topic, course=req.course, user=current_user)
    return result

@router.post("/pyq/search")
def search_pyqs(
    req: PYQSearchRequest,
    current_user: UserProfile = Depends(require_approved_user)
):
    where_clause = PermissionsEngine.build_chroma_where_clause(current_user)
    query_str = f"{req.course} {req.query} PYQ question paper exam"
    docs = vector_store_manager.similarity_search_with_filter(query_str, k=6, where_clause=where_clause)
    
    results = []
    for d in docs:
        results.append({
            "filename": d.metadata.get("filename", "Exam_Paper.pdf"),
            "page_number": d.metadata.get("page_number", 1),
            "semester": d.metadata.get("semester", req.semester),
            "content": d.page_content
        })
    return {"results": results, "count": len(results)}

@router.post("/pyq/analyze")
def analyze_pyq_frequency(
    req: PYQAnalyzeRequest,
    current_user: UserProfile = Depends(require_approved_user)
):
    result = crag_pipeline.execute_pyq_analysis(course=req.course, user=current_user)
    return result
