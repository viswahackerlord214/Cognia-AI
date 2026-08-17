from utils.logging import logger

class QueryRewriter:
    """Reformulates ambiguous or unsuccessful queries to improve vector search accuracy."""

    def __init__(self, llm=None):
        self.llm = llm

    def rewrite(self, query: str) -> str:
        """Generates an expanded, vector-search optimized query."""
        # Heuristic fallback expansion
        replacements = {
            "pyq": "previous year question exam paper",
            "dbms": "database management systems SQL normalization",
            "os": "operating systems scheduling process",
            "exam": "examination schedule mid-sem end-sem",
            "holiday": "academic calendar circular non-working day"
        }
        words = query.lower().split()
        expanded = [replacements.get(w, w) for w in words]
        return " ".join(expanded)
