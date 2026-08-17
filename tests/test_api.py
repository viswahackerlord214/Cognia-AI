import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from main import app

client = TestClient(app)

def test_pending_user_blocked_from_protected_apis():
    headers = {"Authorization": "Bearer pending_student@univ.edu"}
    response = client.post("/api/chat", json={"query": "When are mid sem exams?"}, headers=headers)
    assert response.status_code == 403
    assert "awaiting administrator approval" in response.json()["detail"]

def test_admin_user_approvals_endpoint():
    admin_headers = {"Authorization": "Bearer viswaravindren@gmail.com"}
    
    # Fetch pending users
    res = client.get("/api/admin/users?status=pending", headers=admin_headers)
    assert res.status_code == 200
    users = res.json()["users"]
    assert len(users) > 0

    # Student attempt should be DENIED (403)
    student_headers = {"Authorization": "Bearer student@univ.edu"}
    denied_res = client.get("/api/admin/users", headers=student_headers)
    assert denied_res.status_code == 403

def test_crag_chat_endpoint_approved_user():
    headers = {"Authorization": "Bearer student@univ.edu"}
    res = client.post("/api/chat", json={"query": "When is registration deadline?"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "citations" in data
