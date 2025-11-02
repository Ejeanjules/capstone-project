"""Test the new JSON-based resume analyzer"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from jobs.resume_analyzer import ResumeAnalyzer

# Initialize analyzer
analyzer = ResumeAnalyzer()

# Test with the excellent resume
resume_path = r"test_resumes\1_resume_excellent_90pct.pdf"
resume_text = analyzer.extract_text_from_file(resume_path)

print(f"Extracted {len(resume_text)} characters from resume")
print(f"\nFirst 300 chars:\n{resume_text[:300]}\n")

# Parse resume to JSON
resume_json = analyzer.parse_resume_to_json(resume_text)
print("="*60)
print("RESUME JSON STRUCTURE:")
print("="*60)
import json
print(json.dumps(resume_json, indent=2))

# Parse job to JSON
job_description = """
Senior Full-Stack Developer
We are seeking a Senior Full-Stack Developer to join our team.

Requirements:
- 5+ years of experience in full-stack development
- Strong proficiency in JavaScript, React, Node.js
- Experience with Python and Django
- Database experience with MySQL, PostgreSQL, MongoDB
- Cloud experience with AWS
- Familiarity with Docker and Git
- Experience with Agile/Scrum methodologies
- Strong problem-solving and communication skills
- Bachelor's degree in Computer Science or related field
"""

job_json = analyzer.parse_job_to_json(job_description, "")
print("\n" + "="*60)
print("JOB REQUIREMENTS JSON STRUCTURE:")
print("="*60)
print(json.dumps(job_json, indent=2))

# Calculate match
match_results = analyzer.calculate_structured_match(resume_json, job_json)
print("\n" + "="*60)
print("MATCH RESULTS:")
print("="*60)
print(json.dumps(match_results, indent=2))

print("\n" + "="*60)
print("SUMMARY:")
print("="*60)
summary = analyzer.generate_structured_summary(match_results)
print(summary)
