import uuid
from typing import Dict, Any, Tuple, Optional, Callable
from datetime import datetime

from database.models import DocumentMetadata, DocumentTypeEnum, VisibilityEnum
from database.supabase_client import supabase_db
from ingestion.pdf_processor import PDFProcessor
from ingestion.chunker import DocumentChunker
from rag.vector_store import vector_store_manager
from utils.logging import logger

class DocumentIndexer:
    """Orchestrates PDF text extraction, metadata attachment, ChromaDB indexing, and versioning."""

    def __init__(self):
        self.chunker = DocumentChunker()

    def process_and_index_pdf(
        self,
        file_bytes: bytes,
        filename: str,
        title: str,
        doc_type: str,
        department: str,
        course: str,
        semester: int,
        audience: str,
        visibility: str,
        effective_date: str,
        uploader_name: str,
        uploader_id: str,
        existing_doc_id: Optional[str] = None,
        status_callback: Optional[Callable[[str], None]] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Processes uploaded PDF byte array, attaches metadata, updates document versions if superseding,
        indexes chunks into ChromaDB, and stores metadata in Supabase.
        Supports optional status_callback for UI progress updates.
        """
        try:
            # 1. Extract pages via PyMuPDF / OCR Fallback
            pages = PDFProcessor.extract_page_text_from_bytes(
                file_bytes,
                filename,
                status_callback=status_callback
            )
            if not pages:
                return False, "PDF contains no extractable text or is scanned/empty.", {}

            if status_callback:
                status_callback("Processing document...")

            # 2. Check for versioning / superseding existing document
            version = 1
            doc_id = str(uuid.uuid4())
            
            if existing_doc_id:
                # Find old document
                existing_docs = supabase_db.get_documents({"id": existing_doc_id})
                if existing_docs:
                    old_doc = existing_docs[0]
                    version = old_doc.get("version", 1) + 1
                    # Archive old version
                    supabase_db.update_document(existing_doc_id, {"status": "archived"})
                    logger.info(f"Archived previous version ({old_doc.get('version')}) of document '{title}'.")

            doc_metadata_dict = {
                "id": doc_id,
                "title": title,
                "filename": filename,
                "document_type": doc_type,
                "department": department,
                "course": course,
                "semester": semester,
                "audience": audience,
                "uploaded_by": uploader_name,
                "owner_id": uploader_id,
                "visibility": visibility,
                "effective_date": effective_date or datetime.now().strftime("%Y-%m-%d"),
                "version": version,
                "status": "active",
                "storage_path": f"documents/{doc_id}_{filename}",
                "created_at": datetime.now().isoformat()
            }

            # 3. Create LangChain Document chunks
            chunks = self.chunker.chunk_pdf_pages(pages, doc_metadata_dict)
            if not chunks:
                return False, "Failed to generate document chunks.", {}

            # 4. Index Chunks into ChromaDB
            vector_store_manager.add_documents(chunks)

            # 5. Insert Document Metadata into Supabase
            supabase_db.insert_document(doc_metadata_dict)

            if status_callback:
                status_callback("Document successfully indexed.")

            logger.info(f"Successfully processed & indexed '{filename}' (Version {version}, {len(chunks)} chunks).")
            return True, f"Document indexed successfully with {len(chunks)} chunks (Version {version}).", doc_metadata_dict

        except Exception as e:
            logger.error(f"Error indexing document '{filename}': {e}")
            err_str = str(e).lower()
            if "429" in err_str or "quota" in err_str or "resource_exhausted" in err_str:
                return False, "⚠️ API Rate Limit Exceeded: Your Gemini API key has run out of free-tier embedding quota. Please wait about a minute and try uploading again.", {}
            return False, f"Indexing failed: {str(e)}", {}

    def delete_document(self, doc_id: str) -> Tuple[bool, str]:
        """
        Deletes document metadata from Supabase and purges all vector chunks from ChromaDB.
        """
        try:
            # 1. Purge from ChromaDB
            vector_store_manager.delete_documents_by_id(doc_id)
            
            # 2. Purge metadata from Supabase
            supabase_db.delete_document(doc_id)
            
            logger.info(f"Purged document '{doc_id}' from vector DB and relational metadata store.")
            return True, "Document and associated vector chunks deleted successfully."
        except Exception as e:
            logger.error(f"Failed to delete document '{doc_id}': {e}")
            return False, f"Delete failed: {str(e)}"

document_indexer = DocumentIndexer()
