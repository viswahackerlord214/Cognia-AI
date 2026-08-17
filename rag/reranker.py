from typing import List, Tuple, Optional, Any
from datetime import datetime
from langchain_core.documents import Document
from utils.config import Config
from utils.logging import logger
from utils.query_normalizer import normalize_query, extract_subject_keywords, expand_academic_query

try:
    from sentence_transformers import CrossEncoder
    CROSS_ENCODER_AVAILABLE = True
except ImportError:
    CROSS_ENCODER_AVAILABLE = False
    CrossEncoder = Any

class CrossEncoderReranker:
    """Reranks initial vector retrieval results using CrossEncoder model, Academic Expansion, and Recency Boosting."""

    _instance: Optional['CrossEncoderReranker'] = None
    model: Optional[Any] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CrossEncoderReranker, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        model_name = Config.RERANKER_MODEL
        if CROSS_ENCODER_AVAILABLE:
            try:
                self.model = CrossEncoder(model_name)
                logger.info(f"Loaded CrossEncoder model '{model_name}'.")
            except Exception as e:
                logger.warning(f"Could not load CrossEncoder model '{model_name}': {e}. Using fallback heuristic reranker.")
                self.model = None
        else:
            logger.info("SentenceTransformers not available. Running fallback term-matching reranker.")
            self.model = None

    def _calculate_recency_boost(self, doc: Document) -> float:
        """Returns a score boost for recently uploaded/indexed documents."""
        created_at_str = doc.metadata.get("created_at")
        if not created_at_str:
            return 0.0

        try:
            doc_dt = datetime.fromisoformat(created_at_str)
            age_seconds = (datetime.now() - doc_dt).total_seconds()
            
            # Recency tier boosting
            if age_seconds < 86400: # Uploaded in last 24 hours
                return 4.0
            elif age_seconds < 604800: # Uploaded in last 7 days
                return 2.0
            elif age_seconds < 2592000: # Uploaded in last 30 days
                return 1.0
        except Exception:
            pass

        return 0.0

    def rerank(self, query: str, documents: List[Document], top_k: int = 4) -> List[Document]:
        if not documents:
            return []

        clean_query = normalize_query(query)
        expanded_keywords = expand_academic_query(query)
        subject_keywords = extract_subject_keywords(query)

        scored_docs = []

        if self.model is not None:
            try:
                pairs = [[clean_query, doc.page_content] for doc in documents]
                model_scores = self.model.predict(pairs)

                for doc, score in zip(documents, model_scores):
                    text_lower = doc.page_content.lower()
                    boost = 0.0
                    
                    # 1. Expanded Academic Concept Keyword Boost
                    if expanded_keywords:
                        matched = sum(1.5 for kw in expanded_keywords if kw in text_lower)
                        boost += matched

                    # 2. Subject Keyword Boost
                    if subject_keywords:
                        matched_subj = sum(2.0 for kw in subject_keywords if kw in text_lower)
                        boost += matched_subj

                    # 3. Recency Boost for Newly Uploaded Documents
                    recency_boost = self._calculate_recency_boost(doc)
                    boost += recency_boost

                    final_score = float(score) + boost
                    scored_docs.append((doc, final_score))

                scored_docs.sort(key=lambda x: x[1], reverse=True)
                reranked = [doc for doc, _ in scored_docs[:top_k]]
                logger.info(f"Reranked {len(documents)} documents down to top-{len(reranked)} with Academic CrossEncoder + Recency Boosting.")
                return reranked
            except Exception as e:
                logger.error(f"CrossEncoder reranking error: {e}. Falling back to heuristic reranker.")

        # Fallback Heuristic Reranker with Recency Boosting
        for doc in documents:
            text_lower = doc.page_content.lower()
            score = 0.0
            
            if expanded_keywords:
                matched_exp = sum(2.5 for kw in expanded_keywords if kw in text_lower)
                score += matched_exp

            if subject_keywords:
                matched_subject = sum(3.0 for kw in subject_keywords if kw in text_lower)
                score += matched_subject

            words = clean_query.split()
            score += sum(0.5 for w in words if w in text_lower)

            if doc.metadata.get("status") == "active":
                score += 0.5

            recency_boost = self._calculate_recency_boost(doc)
            score += recency_boost

            scored_docs.append((doc, score))

        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in scored_docs[:top_k]]

reranker = CrossEncoderReranker()
