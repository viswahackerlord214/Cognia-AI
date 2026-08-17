import re
from typing import List

# Key university calendar events and holidays for structured extraction
CALENDAR_EVENTS_MAP = [
    ("First Year Classes Begin", ["First Year Classes Begin", "First Year Classes", "Classes Start", "commencement"]),
    ("Classes for Second Year and Above Begin", ["Classes for Second Year and Above Begin", "Second Year and Above"]),
    ("Orientation Programme", ["Orientation Programme", "Orientation"]),
    ("Registration / Reporting", ["Registration / Reporting", "Registration"]),
    ("Mid-Semester Examination", ["Mid-Semester Examination", "Mid-Sem Exam", "midsem exam"]),
    ("Mid-Semester Break", ["Mid-Semester Break", "mid sem break"]),
    ("Classes Resume", ["Classes Resume"]),
    ("End-Semester Examination", ["End-Semester Examination", "End-Sem Exam"]),
    ("Semester Ends", ["Semester Ends", "Semester End"]),
    ("Independence Day (Holiday)", ["INDEPENDENCE DAY", "15 Aug", "15 August"]),
    ("Gandhi Jayanti (Holiday)", ["GANDHI JAYANTI", "2 Oct", "2 October"]),
    ("Janmashtami (Holiday)", ["Janmashtami"]),
    ("Diwali (Holiday)", ["Diwali"]),
    ("Christmas Day (Holiday)", ["CHRISTMAS DAY", "25 Dec", "25 December"]),
    ("Guru Nanak Jayanti (Holiday)", ["GURU NANAK JAYANTI"]),
    ("Eid-ul-Fitr (Holiday)", ["Eid-ul-fitr", "Eid"]),
    ("Republic Day (Holiday)", ["Republic Day", "26 Jan", "26 January"]),
    ("Good Friday (Holiday)", ["Good Friday"]),
    ("Holi (Holiday)", ["Holi"]),
    ("Total Instructional Days", ["TOTAL INSTRUCTIONAL DAYS", "Instructional Days"])
]

def is_garbage_line(line: str) -> bool:
    clean = line.strip()
    if len(clean) < 3:
        return True
    
    # Noisy brackets/pipe patterns (e.g., 'wit] [s a[ T/4/ 34 th 4 52')
    if re.search(r'\[\s*[a-zA-Z0-9/\s]{1,4}\s*\]', clean):
        return True
    if re.search(r'[A-Za-z0-9]{1,3}\s*[/]\s*\d{1,2}\s*[/]\s*\d{1,2}', clean):
        return True

    # Check ratio of alphabetic characters vs noise symbols
    letters = len(re.findall(r'[a-zA-Z]', clean))
    total = len(clean)
    if total > 0 and (letters / total) < 0.45 and not re.search(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b', clean, re.I):
        return True

    words = clean.split()
    single_char_words = [w for w in words if len(w) <= 2 or w.lower() in ['ot.', '=ct', 'ct', 'pe', 'teas', 'wit', 'ia', 'f/3', 's]2', 'w]']]
    if len(words) >= 3 and (len(single_char_words) / len(words)) >= 0.35:
        return True

    return False

def clean_extracted_pdf_text(text: str) -> str:
    """
    Cleans raw PDF / OCR text, filtering out OCR pipe noise, raw cell coordinates,
    and structuring academic calendar table rows into clear semantic statements.
    """
    if not text:
        return ""

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned_lines: List[str] = []
    
    # 1. Detect headers / document context
    if "ODD Semester" in text or "ODD" in text:
        cleaned_lines.append("Academic Schedule: ODD Semester 2026–27")
    elif "Even Semester" in text or "EVEN" in text:
        cleaned_lines.append("Academic Schedule: EVEN Semester 2026–27")

    for line in lines:
        clean_line = re.sub(r'[@#$\|_]+', ' ', line).strip()
        clean_line = re.sub(r'^\d{1,2}\s*[/]\s*\d{1,2}.*?PE.*$', '', clean_line).strip()
        
        if is_garbage_line(clean_line):
            continue
            
        cleaned_lines.append(clean_line)

    result = "\n".join(cleaned_lines)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()

def format_structured_rag_response(raw_content: str, filename: str, page: int, query: str) -> str:
    """
    Formats raw retrieved PDF chunk content into a clean, student-friendly Markdown response.
    Never exposes raw OCR noise or pipe fragments.
    """
    cleaned = clean_extracted_pdf_text(raw_content)
    lines = [line for line in cleaned.splitlines() if line.strip()]
    
    if not lines:
        return "I couldn't find a clear answer to that in the uploaded university documents."

    header = lines[0] if lines else "Document Content"
    body_lines = lines[1:12] if len(lines) > 1 else lines
    
    formatted_bullets = []
    for line in body_lines:
        clean_l = line.lstrip("-* ").strip()
        if not clean_l or clean_l.startswith("Key Academic") or clean_l.startswith("Document Content"):
            continue
        if ":" in clean_l and not clean_l.startswith("**"):
            parts = clean_l.split(":", 1)
            formatted_bullets.append(f"- **{parts[0].strip()}**: {parts[1].strip()}")
        else:
            formatted_bullets.append(f"- {clean_l}")

    formatted_body = "\n".join(formatted_bullets)

    response = (
        f"### 📄 Information from **{filename}** (Page {page})\n\n"
        f"#### **{header}**\n\n"
        f"{formatted_body}\n\n"
        f"---\n"
        f"*Source: {filename}, Page {page}*"
    )
    return response
