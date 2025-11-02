"""Test the detailed summary with a below-average resume"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from jobs.resume_analyzer import ResumeAnalyzer

# Initialize analyzer
analyzer = ResumeAnalyzer()

# Test with the good resume (86% match)
resume_path = r"test_resumes\2_resume_good_70pct.pdf"
resume_text = analyzer.extract_text_from_file(resume_path)

# Job description
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

# Parse and analyze
resume_json = analyzer.parse_resume_to_json(resume_text)
job_json = analyzer.parse_job_to_json(job_description, "")
match_results = analyzer.calculate_structured_match(resume_json, job_json)
summary = analyzer.generate_structured_summary(match_results)

print("="*80)
print("GOOD RESUME (86%) - DETAILED ANALYSIS")
print("="*80)
print(summary)
