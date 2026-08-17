import os
import shutil
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from typing import List, Dict, Any, Optional, Callable
from utils.logging import logger
from utils.text_cleaner import clean_extracted_pdf_text

def _configure_tesseract_path():
    if not shutil.which("tesseract"):
        for path in ["/opt/homebrew/bin/tesseract", "/usr/local/bin/tesseract", "/usr/bin/tesseract"]:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break

_configure_tesseract_path()

class PDFProcessor:
    """Extracts text page-by-page from PDF documents, with automatic OCR fallback for scanned PDFs."""

    @staticmethod
    def extract_page_text_from_bytes(
        file_bytes: bytes,
        filename: str,
        status_callback: Optional[Callable[[str], None]] = None
    ) -> List[Dict[str, Any]]:
        """Processes PDF byte stream using PyMuPDF and returns page-level text objects.
        Falls back to Tesseract OCR if little or no extractable text is found."""
        if status_callback:
            status_callback("Extracting text...")

        pages_content = []
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            total_pages = len(doc)
            
            # Step 1: Attempt normal text extraction
            for page_num in range(total_pages):
                page = doc.load_page(page_num)
                raw_text = page.get_text("text", sort=True).strip()
                cleaned_text = clean_extracted_pdf_text(raw_text)
                
                if cleaned_text:
                    pages_content.append({
                        "page_number": page_num + 1,
                        "text": cleaned_text,
                        "total_pages": total_pages
                    })
                else:
                    logger.warning(f"Page {page_num + 1} of '{filename}' contains no raw text.")
            
            total_text_length = sum(len(p["text"]) for p in pages_content)
            
            # Step 2: Check if meaningful text was extracted (threshold: 50 characters across document)
            if total_text_length >= 50:
                doc.close()
                logger.info(f"Extracted and cleaned {len(pages_content)} pages via normal text extraction from PDF '{filename}'.")
                return pages_content

            # Step 3: Trigger OCR fallback for scanned/image-based PDF
            logger.warning(f"Normal text extraction yielded minimal text ({total_text_length} chars) for '{filename}'. Triggering automatic OCR fallback.")
            if status_callback:
                status_callback("Scanned PDF detected — running OCR...")

            ocr_pages_content = []
            for page_num in range(total_pages):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(dpi=150)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
                # Perform OCR on normal orientation
                ocr_text = pytesseract.image_to_string(img).strip()
                
                # Check rotated orientation (270° expand) if standard orientation gives short output
                if len(ocr_text) < 100:
                    try:
                        rotated_img = img.rotate(270, expand=True)
                        ocr_text_270 = pytesseract.image_to_string(rotated_img).strip()
                        if len(ocr_text_270) > len(ocr_text):
                            ocr_text = ocr_text + "\n" + ocr_text_270
                    except Exception as rot_err:
                        logger.warning(f"OCR rotation check failed for page {page_num + 1}: {rot_err}")

                cleaned_ocr = clean_extracted_pdf_text(ocr_text)
                if cleaned_ocr:
                    ocr_pages_content.append({
                        "page_number": page_num + 1,
                        "text": cleaned_ocr,
                        "total_pages": total_pages
                    })
                else:
                    logger.warning(f"OCR on page {page_num + 1} of '{filename}' yielded no text.")
                
                # Free image memory
                pix = None
                img = None

            doc.close()
            
            if ocr_pages_content:
                logger.info(f"Successfully extracted {len(ocr_pages_content)} pages via OCR for scanned PDF '{filename}'.")
                return ocr_pages_content

            logger.error(f"Both normal extraction and OCR failed for '{filename}'.")
            return []

        except Exception as e:
            logger.error(f"Error extracting text from PDF '{filename}': {e}")
            raise ValueError(f"Could not parse PDF '{filename}': {str(e)}")

    @staticmethod
    def extract_page_text_from_filepath(
        filepath: str,
        status_callback: Optional[Callable[[str], None]] = None
    ) -> List[Dict[str, Any]]:
        with open(filepath, "rb") as f:
            return PDFProcessor.extract_page_text_from_bytes(f.read(), filepath, status_callback=status_callback)
