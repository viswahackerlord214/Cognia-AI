import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_sample_pdfs():
    """Generates synthetic university PDF documents for instant testing."""
    sample_dir = Path(__file__).resolve().parent / "docs"
    sample_dir.mkdir(parents=True, exist_ok=True)
    
    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    body_style = styles["BodyText"]

    # 1. Academic Calendar 2026
    pdf1_path = sample_dir / "Academic_Calendar_2026.pdf"
    doc1 = SimpleDocTemplate(str(pdf1_path), pagesize=letter)
    story1 = [
        Paragraph("OFFICIAL UNIVERSITY ACADEMIC CALENDAR 2026", title_style),
        Spacer(1, 12),
        Paragraph("Page 1: Term Commencement and Registration Dates", styles["Heading2"]),
        Paragraph("Spring semester registration commences on January 5, 2026. Classes begin January 12, 2026.", body_style),
        Spacer(1, 10),
        Paragraph("Mid-Semester Examinations: March 16, 2026 to March 23, 2026.", body_style),
        Paragraph("Minimum required attendance for appearing in mid-sem and end-sem examinations is 75%.", body_style),
        Spacer(1, 15),
        Paragraph("Page 2: Holiday Notices and End-Sem Schedule", styles["Heading2"]),
        Paragraph("University Holiday Notice: March 25, 2026 is an official university holiday for Spring Festival.", body_style),
        Paragraph("End-Semester Examinations start May 10, 2026 and end May 25, 2026.", body_style)
    ]
    doc1.build(story1)

    # 2. DBMS Exam Circular
    pdf2_path = sample_dir / "DBMS_Circular_2026.pdf"
    doc2 = SimpleDocTemplate(str(pdf2_path), pagesize=letter)
    story2 = [
        Paragraph("DEPARTMENT OF COMPUTER SCIENCE - EXAMINATION CIRCULAR", title_style),
        Spacer(1, 12),
        Paragraph("Page 1: CS501 Database Management Systems Exam Notice", styles["Heading2"]),
        Paragraph("The CS501 DBMS Mid-Semester Examination will be held on September 22, 2026 in Hall A.", body_style),
        Paragraph("Syllabus covers Units 1 to 3: ER Diagrams, Relational Algebra, and Normalization (1NF to BCNF).", body_style),
        Spacer(1, 10),
        Paragraph("Total Marks: 50. Duration: 2 Hours. Calculators are NOT permitted.", body_style)
    ]
    doc2.build(story2)

    # 3. DBMS Normalization Notes
    pdf3_path = sample_dir / "DBMS_Normalization_Notes.pdf"
    doc3 = SimpleDocTemplate(str(pdf3_path), pagesize=letter)
    story3 = [
        Paragraph("CS501 DBMS LECTURE NOTES - UNIT 3: NORMALIZATION", title_style),
        Spacer(1, 12),
        Paragraph("Page 1: Functional Dependencies & Normal Forms", styles["Heading2"]),
        Paragraph("1NF (First Normal Form): Eliminates repeating groups and ensures atomic values in all attributes.", body_style),
        Paragraph("2NF (Second Normal Form): Requires 1NF and ensures no non-prime attribute is partially dependent on any candidate key.", body_style),
        Paragraph("3NF (Third Normal Form): Requires 2NF and ensures no non-prime attribute is transitively dependent on candidate keys.", body_style),
        Paragraph("BCNF (Boyce-Codd Normal Form): For every non-trivial functional dependency X -> Y, X must be a super key.", body_style)
    ]
    doc3.build(story3)

    # 4. Confidential Internal Question Paper (Owner Only)
    pdf4_path = sample_dir / "CONFIDENTIAL_INTERNAL_QUESTION_PAPER.pdf"
    doc4 = SimpleDocTemplate(str(pdf4_path), pagesize=letter)
    story4 = [
        Paragraph("STRICTLY CONFIDENTIAL - FACULTY INTERNAL DRAFT QUESTION PAPER", title_style),
        Spacer(1, 12),
        Paragraph("Page 1: Confidential Question Bank", styles["Heading2"]),
        Paragraph("Question 1 (Secret Answer Key: Option B): Prove that BCNF decomposition is always dependency preserving or provide counter-example.", body_style),
        Paragraph("Question 2 (Secret Answer Key: Option C): Derive the 3NF canonical cover algorithm steps.", body_style)
    ]
    doc4.build(story4)

    print(f"Generated 4 sample university PDF documents in '{sample_dir}'.")

if __name__ == "__main__":
    generate_sample_pdfs()
