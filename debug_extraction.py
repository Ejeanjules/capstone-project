"""
Debug script to see what text is actually being extracted
"""
import sys
import os
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from jobs.resume_analyzer import resume_analyzer

# Test with the uploaded resume
pdf_path = r"C:\Users\Eben-Eser jean-jules\OneDrive\Desktop\capstone project(main)\backend\media\resumes\8\2_1_resume_excellent_90pct.pdf"

print("Extracting text from:", pdf_path)
print("="*60)

resume_text = resume_analyzer.extract_text_from_file(pdf_path)

print(f"Text length: {len(resume_text)} characters")
print("\nFirst 1000 characters:")
print("="*60)
print(resume_text[:1000])
print("="*60)

# Check for keywords
keywords = ['python', 'django', 'react', 'postgresql', 'javascript']
print("\nSearching for keywords in extracted text:")
for keyword in keywords:
    found = keyword.lower() in resume_text.lower()
    print(f"  {keyword}: {'✓ FOUND' if found else '✗ NOT FOUND'}")
    if not found:
        # Try to find what might be similar
        print(f"    Looking for partial matches...")
        if keyword[:3].lower() in resume_text.lower():
            print(f"    Found partial: {keyword[:3]}")
