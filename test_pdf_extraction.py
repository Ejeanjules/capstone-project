"""
Test script to verify PDF text extraction is working
"""
import sys
import os

# Test reading the excellent resume PDF
pdf_path = "test_resumes/1_resume_excellent_90pct.pdf"

print(f"Testing PDF extraction from: {pdf_path}")
print(f"File exists: {os.path.exists(pdf_path)}")
print(f"File size: {os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 'N/A'} bytes")
print("\n" + "="*60 + "\n")

try:
    import PyPDF2
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        print(f"Number of pages: {len(pdf_reader.pages)}")
        print("\n" + "="*60 + "\n")
        
        full_text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            print(f"Page {page_num + 1}:")
            print(f"  Characters extracted: {len(page_text)}")
            print(f"  First 200 chars: {page_text[:200]}")
            print()
            full_text += page_text + "\n"
        
        print("="*60)
        print(f"\nTotal text length: {len(full_text)} characters")
        print(f"\nFull text preview (first 500 chars):\n")
        print(full_text[:500])
        
        # Test for key terms
        print("\n" + "="*60)
        print("\nSearching for key technical terms:")
        terms = ['Python', 'Django', 'React', 'PostgreSQL', 'AWS', 'Docker', 'JavaScript']
        for term in terms:
            found = term.lower() in full_text.lower()
            print(f"  {term}: {'✓ FOUND' if found else '✗ NOT FOUND'}")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
