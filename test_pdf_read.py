"""Test if pdfplumber can read the generated PDFs"""
import pdfplumber

pdf_path = r"test_resumes\1_resume_excellent_90pct.pdf"

with pdfplumber.open(pdf_path) as pdf:
    print(f"Number of pages: {len(pdf.pages)}")
    
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"\n=== Page {i+1} ===")
        print(f"Text length: {len(text) if text else 0}")
        if text:
            print(f"First 500 chars:\n{text[:500]}")
