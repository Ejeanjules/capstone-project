"""Test all 5 resumes to see the scoring differences"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from jobs.resume_analyzer import ResumeAnalyzer
import json

# Initialize analyzer
analyzer = ResumeAnalyzer()

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

# Test all 5 resumes
resumes = [
    ("1_resume_excellent_90pct.pdf", "Excellent"),
    ("2_resume_good_70pct.pdf", "Good"),
    ("3_resume_average_50pct.pdf", "Average"),
    ("4_resume_below_avg_30pct.pdf", "Below Average"),
    ("5_resume_poor_10pct.pdf", "Poor")
]

print("="*80)
print("TESTING ALL 5 RESUMES WITH JSON-BASED STRUCTURED MATCHING")
print("="*80)

job_json = analyzer.parse_job_to_json(job_description, "")

for filename, label in resumes:
    resume_path = f"test_resumes\\{filename}"
    resume_text = analyzer.extract_text_from_file(resume_path)
    resume_json = analyzer.parse_resume_to_json(resume_text)
    match_results = analyzer.calculate_structured_match(resume_json, job_json)
    
    print(f"\n{'='*80}")
    print(f"{label} Resume: {filename}")
    print(f"{'='*80}")
    print(f"Overall Score: {match_results['overall_score']}%")
    print(f"\nCategory Scores:")
    print(f"  - Technical Skills: {match_results['category_scores']['technical_skills']}%")
    print(f"  - Education: {match_results['category_scores']['education']}%")
    print(f"  - Soft Skills: {match_results['category_scores']['soft_skills']}%")
    print(f"  - Experience: {match_results['category_scores']['experience']}%")
    
    print(f"\nMatched Tech Skills ({len(match_results['matched']['technical_skills'])}):")
    if match_results['matched']['technical_skills']:
        print(f"  {', '.join(match_results['matched']['technical_skills'])}")
    else:
        print("  None")
    
    print(f"\nMissing Tech Skills ({len(match_results['missing']['technical_skills'])}):")
    if match_results['missing']['technical_skills']:
        missing = match_results['missing']['technical_skills']
        if len(missing) <= 5:
            print(f"  {', '.join(missing)}")
        else:
            print(f"  {', '.join(missing[:5])} and {len(missing) - 5} more")
    else:
        print("  None")
    
    print(f"\nExperience: {resume_json['experience_years']} years (Required: {job_json['required_experience_years']}+)")

print(f"\n{'='*80}")
print("TEST COMPLETE!")
print(f"{'='*80}")
