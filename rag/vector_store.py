import os
from typing import List, Dict, Any, Optional
from pathlib import Path

from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_core.embeddings import Embeddings

from utils.config import Config
from utils.logging import logger

class VectorStoreManager:
    """Manages persistent ChromaDB vector store operations and Gemini embedding integration."""

    _instance: Optional['VectorStoreManager'] = None
    vector_store: Optional[Chroma] = None
    embeddings: Optional[Embeddings] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        persist_dir = Path(Config.CHROMA_PERSIST_DIRECTORY).resolve()
        persist_dir.mkdir(parents=True, exist_ok=True)

        # Initialize Embeddings Engine (Forced Local HuggingFace to avoid Gemini Quota Limits)
        logger.info("Using HuggingFace sentence-transformers embeddings for local chunking.")
        self.embeddings = self._get_fallback_embeddings()

        # Initialize Chroma Store
        self.vector_store = Chroma(
            collection_name="university_knowledge_base",
            embedding_function=self.embeddings,
            persist_directory=str(persist_dir)
        )
        logger.info(f"ChromaDB persistent store initialized at '{persist_dir}'.")

    def _get_fallback_embeddings(self) -> Embeddings:
        """Loads lightweight HuggingFace sentence-transformers embeddings as fallback."""
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        except Exception as e:
            logger.error(f"Fallback embedding error: {e}")
            from langchain_core.embeddings import FakeEmbeddings
            return FakeEmbeddings(size=384)

    def add_documents(self, documents: List[Document]) -> List[str]:
        """Adds LangChain document chunks to ChromaDB persistent storage."""
        if not documents:
            return []
        ids = self.vector_store.add_documents(documents)
        logger.info(f"Successfully added {len(ids)} document chunks to ChromaDB.")
        return ids

    def delete_documents_by_id(self, document_id: str) -> bool:
        """Removes all chunks associated with a specific document_id from ChromaDB."""
        try:
            # Query vector store for matching document_id
            collection = self.vector_store._collection
            results = collection.get(where={"document_id": document_id})
            ids_to_delete = results.get("ids", [])
            if ids_to_delete:
                collection.delete(ids=ids_to_delete)
                logger.info(f"Deleted {len(ids_to_delete)} vector chunks for document_id '{document_id}'.")
                return True
            logger.info(f"No vector chunks found to delete for document_id '{document_id}'.")
            return True
        except Exception as e:
            logger.error(f"Error deleting vectors for document_id '{document_id}': {e}")
            return False

    def similarity_search_with_filter(
        self,
        query: str,
        k: int = 10,
        where_clause: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """
        Executes vector search with strict metadata filtering (RBAC).
        """
        try:
            docs = self.vector_store.similarity_search(
                query=query,
                k=k,
                filter=where_clause
            )
            logger.info(f"Similarity search for '{query}' returned {len(docs)} filtered chunks.")
            return docs
        except Exception as e:
            logger.error(f"Error during vector similarity search: {e}")
            return []

vector_store_manager = VectorStoreManager()
