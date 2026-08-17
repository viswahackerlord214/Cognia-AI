import re
from typing import Set, List

# Common academic & technical typo mapping
TYPO_CORRECTIONS = {
    "netwroks": "networks",
    "netwrks": "networks",
    "netwrok": "network",
    "netwrk": "network",
    "architectur": "architecture",
    "archtecture": "architecture",
    "databse": "database",
    "operatng": "operating",
    "sylabus": "syllabus",
    "syllbus": "syllabus",
    "circulr": "circular",
    "schedul": "schedule",
    "skedule": "schedule",
    "midsem": "mid-sem",
    "midterm": "mid-sem",
    "endsem": "end-sem",
    "pyq": "previous year question",
    "dbms": "database management systems"
}

# Stop words and generic filler terms (excluding domain words like 'semester', 'exam')
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "do", "does", "did", "what",
    "when", "where", "which", "who", "how", "give", "show", "tell", "details",
    "about", "for", "in", "of", "to", "with", "from", "by", "on", "at", "it",
    "this", "that", "these", "those", "pdf", "official", "university"
}

# Domain concept expansion mappings for academic schedules & circulars
ACADEMIC_EXPANSIONS = {
    "first year": ["first year classes", "first year", "commencement", "july", "august"],
    "classes start": ["classes start", "first year classes", "commencement", "july", "august", "instructional days"],
    "odd semester start": ["odd semester", "classes start", "first year classes", "commencement", "july", "august"],
    "odd semester end": ["odd semester", "end semester", "theory exam", "december"],
    "odd semester": ["odd semester", "july", "august", "september", "october", "november", "december"],
    "even semester": ["even semester", "january", "february", "march", "april", "may", "june", "july"],
    "mid sem": ["mid semester", "mid-sem", "examination", "mid sem exam", "september", "october", "march"],
    "mid-semester": ["mid semester", "mid-sem", "examination", "mid sem exam", "september", "october", "march"],
    "end sem": ["end semester", "end-sem", "theory exam", "practical exam", "december", "may"],
    "holidays": ["holiday", "independence day", "gandhi jayanti", "diwali", "christmas", "eid", "republic day", "janmashtami", "holidays"],
    "holiday": ["holiday", "independence day", "gandhi jayanti", "diwali", "christmas", "eid", "republic day", "janmashtami", "holidays"],
    "august holidays": ["independence day", "janmashtami", "august", "holiday"],
    "break": ["vacation", "break", "holidays", "recess"]
}

def normalize_query(query: str) -> str:
    """Normalizes query text by fixing common typos and expanding technical terms."""
    words = re.findall(r'\b\w+\b', query.lower())
    corrected = [TYPO_CORRECTIONS.get(w, w) for w in words]
    return " ".join(corrected)

def extract_subject_keywords(query: str) -> Set[str]:
    """
    Extracts high-priority subject and event keywords from query.
    """
    normalized = normalize_query(query)
    words = re.findall(r'\b\w+\b', normalized.lower())
    subject_words = {w for w in words if len(w) > 1 and w not in STOP_WORDS}
    return subject_words

def expand_academic_query(query: str) -> List[str]:
    """
    Expands user queries with domain-specific concepts for academic calendars and circulars.
    """
    clean_q = normalize_query(query).lower()
    expanded_terms = set(re.findall(r'\b\w+\b', clean_q))

    for key, terms in ACADEMIC_EXPANSIONS.items():
        if key in clean_q:
            expanded_terms.update(terms)

    return list(expanded_terms)
