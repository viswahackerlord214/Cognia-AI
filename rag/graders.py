from typing import List, Optional
from langchain_core.documents import Document
from utils.logging import logger
from utils.query_normalizer import normalize_query, extract_subject_keywords, expand_academic_query

class RetrievalGrader:
    def __init__(self, llm=None):
        pass

    def grade_context(self, query: str, documents: List[Document]) -> str:
        if not documents:
            logger.info("No documents provided to grader. Grade: IRRELEVANT")
            return "IRRELEVANT"

        clean_query = normalize_query(query)
        context_text = "\n\n".join([f"[{d.metadata.get('filename')}] {d.page_content}" for d in documents])

        # Concept-Aware Heuristic Grader
        expanded_keywords = expand_academic_query(query)
        context_lower = context_text.lower()

        # Check if the query asks for specific concepts
        if expanded_keywords:
            matched_count = sum(1 for kw in expanded_keywords if kw in context_lower)
            match_ratio = matched_count / max(len(expanded_keywords), 1)

            if match_ratio >= 0.4 or matched_count >= 2:
                return "RELEVANT"
            elif matched_count == 1:
                return "PARTIALLY_RELEVANT"
            else:
                return "IRRELEVANT"

        subject_keywords = extract_subject_keywords(query)
        if subject_keywords:
            matched_subjects = sum(1 for kw in subject_keywords if kw in context_lower)
            if matched_subjects > 0:
                return "RELEVANT"
            return "IRRELEVANT"

        return "PARTIALLY_RELEVANT"
