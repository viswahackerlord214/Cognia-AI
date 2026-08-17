import sys
from pathlib import Path

# Ensure backend root is at head of sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth_routes import router as auth_router
from api.user_routes import router as user_router
from api.document_routes import router as doc_router
from api.rag_routes import router as rag_router
from api.quiz_routes import router as quiz_router
from utils.config import Config
from utils.logging import logger

app = FastAPI(
    title="COGNIA AI — University Knowledge & Assessment Intelligence API",
    description="Production REST API backend for Cognia AI platform.",
    version="2.0.0"
)

allowed_origins = [
    Config.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(doc_router)
app.include_router(rag_router)
app.include_router(quiz_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "COGNIA AI Platform API",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def healthcheck():
    return {"status": "healthy"}
