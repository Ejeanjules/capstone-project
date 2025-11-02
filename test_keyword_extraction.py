"""
Test script to check keyword extraction from the job requirements
"""
import sys
import os
import re

# Add backend to path
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from jobs.resume_analyzer import resume_analyzer

# Your actual job requirements
job_requirements = """
3+ years of experience in full-stack development
Proficiency in JavaScript, React, Node.js
Experience with Python and Django
Knowledge of databases (MySQL, PostgreSQL, MongoDB)
Familiarity with AWS, Docker, Git
Experience with Agile/Scrum methodologies
Strong problem-solving and communication skills
Bachelor's degree in Computer Science or related field
"""

job_description = ""  # Add your job description here if you have one

print("Testing keyword extraction...")
print("="*60)
print("\nJob Requirements:")
print(job_requirements)
print("\n" + "="*60)

# Extract keywords
keywords = resume_analyzer.extract_keywords_from_job(job_description, job_requirements)

print(f"\nExtracted {len(keywords)} keywords:")
print(keywords)
print("\n" + "="*60)

# Now test matching against the resume
print("\nTesting resume matching...")
pdf_path = "test_resumes/1_resume_excellent_90pct.pdf"
resume_text = resume_analyzer.extract_text_from_file(pdf_path)

print(f"Resume text length: {len(resume_text)} characters")

# Calculate match
match_results = resume_analyzer.calculate_match_score(resume_text, keywords)

print("\nMatch Results:")
print(f"  Score: {match_results['score']}%")
print(f"  Total keywords: {match_results['total_keywords']}")
print(f"  Matched: {len(match_results['matched_keywords'])}")
print(f"  Missing: {len(match_results['missing_keywords'])}")
print(f"\nMatched keywords: {match_results['matched_keywords']}")
print(f"\nMissing keywords: {match_results['missing_keywords']}")
