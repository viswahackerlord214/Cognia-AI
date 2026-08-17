from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from utils.logging import logger

class DocumentChunker:
    """Splits PDF pages into semantic chunks while preserving document metadata."""

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def chunk_pdf_pages(
        self,
        pages_content: List[Dict[str, Any]],
        doc_metadata: Dict[str, Any]
    ) -> List[Document]:
        """
        Takes extracted page items and metadata, producing LangChain Document chunks.
        """
        all_chunks: List[Document] = []
        doc_id = doc_metadata.get("id", "")
        title = doc_metadata.get("title", "")
        filename = doc_metadata.get("filename", "")
        doc_type = doc_metadata.get("document_type", "circular")
        dept = doc_metadata.get("department", "ALL")
        course = doc_metadata.get("course", "ALL")
        sem = int(doc_metadata.get("semester", 0))
        audience = doc_metadata.get("audience", "everyone")
        visibility = doc_metadata.get("visibility", "everyone")
        effective_date = str(doc_metadata.get("effective_date", ""))
        version = int(doc_metadata.get("version", 1))
        status = doc_metadata.get("status", "active")
        uploaded_by = doc_metadata.get("uploaded_by", "")
        owner_id = doc_metadata.get("owner_id", "")

        for page_data in pages_content:
            page_num = page_data["page_number"]
            page_text = page_data["text"]
            
            # Split text within the page
            page_chunks = self.text_splitter.split_text(page_text)
            
            for idx, chunk_text in enumerate(page_chunks):
                chunk_metadata = {
                    "document_id": doc_id,
                    "title": title,
                    "filename": filename,
                    "page_number": page_num,
                    "chunk_index": idx,
                    "document_type": str(doc_type),
                    "department": str(dept),
                    "course": str(course),
                    "semester": int(sem),
                    "audience": str(audience),
                    "visibility": str(visibility),
                    "effective_date": str(effective_date),
                    "version": int(version),
                    "status": str(status),
                    "uploaded_by": str(uploaded_by),
                    "owner_id": str(owner_id)
                }
                
                doc_obj = Document(
                    page_content=chunk_text,
                    metadata=chunk_metadata
                )
                all_chunks.append(doc_obj)

        logger.info(f"Generated {len(all_chunks)} chunks for document '{filename}' (ID: {doc_id}).")
        return all_chunks
