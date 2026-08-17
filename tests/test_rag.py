import pytest
from database.models import UserProfile, RoleEnum
from ingestion.pdf_processor import PDFProcessor
from ingestion.chunker import DocumentChunker
from rag.reranker import reranker
from rag.crag import crag_pipeline, EXPLICIT_MISSING_DOC_REFUSAL

def test_document_chunking_preserves_metadata():
    pages = [
        {"page_number": 1, "text": "Spring semester mid-sem exams begin September 22, 2026 for CS501 DBMS.", "total_pages": 1}
    ]
    meta = {
        "id": "test-doc-01",
        "title": "Test Circular",
        "filename": "test.pdf",
        "document_type": "circular",
        "department": "CS",
        "semester": 5,
        "visibility": "everyone",
        "effective_date": "2026-08-14",
        "version": 1,
        "status": "active",
        "uploaded_by": "Dr. Sarah",
        "owner_id": "admin-01"
    }

    chunker = DocumentChunker(chunk_size=200, chunk_overlap=20)
    chunks = chunker.chunk_pdf_pages(pages, meta)

    assert len(chunks) > 0
    first_chunk = chunks[0]
    assert first_chunk.metadata["document_id"] == "test-doc-01"
    assert first_chunk.metadata["filename"] == "test.pdf"
    assert first_chunk.metadata["page_number"] == 1
    assert first_chunk.metadata["visibility"] == "everyone"

def test_crag_pipeline_strict_document_refusal_on_missing_subject():
    student_user = UserProfile(
        id="student-uuid-003",
        email="student@univ.edu",
        full_name="Alex Rivera",
        role=RoleEnum.STUDENT,
        department="CS",
        semester=5
    )

    res = crag_pipeline.execute_crag("Nonexistent random quantum space thermodynamics 9999", student_user)
    assert "answer" in res
    assert res["answer"] == EXPLICIT_MISSING_DOC_REFUSAL

def test_web_ai_mode_general_tutoring():
    student_user = UserProfile(
        id="student-uuid-003",
        email="student@univ.edu",
        full_name="Alex Rivera",
        role=RoleEnum.STUDENT,
        department="CS",
        semester=5
    )

    res = crag_pipeline.execute_web_ai("Write a Python binary search implementation.", student_user)
    assert "answer" in res
    assert "def binary_search" in res["answer"]

def test_pdf_ocr_fallback_for_scanned_pdf():
    import os
    rotated_pdf_path = "/Users/viswaravindren/Desktop/academic_calendar_rotated.pdf"
    if os.path.exists(rotated_pdf_path):
        with open(rotated_pdf_path, "rb") as f:
            file_bytes = f.read()

        status_logs = []
        def capture_status(msg):
            status_logs.append(msg)

        pages = PDFProcessor.extract_page_text_from_bytes(
            file_bytes,
            "academic_calendar_rotated.pdf",
            status_callback=capture_status
        )

        assert len(pages) > 0
        assert "Scanned PDF detected — running OCR..." in status_logs
        full_text = " ".join([p["text"] for p in pages]).lower()
        assert "academic calendar" in full_text

