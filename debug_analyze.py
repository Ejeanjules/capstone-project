"""Debug the analyze_application error"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from jobs.models import JobApplication
from jobs.resume_analyzer import ResumeAnalyzer

# Get the application that's failing (ID 3)
try:
    application = JobApplication.objects.get(id=3)
    print(f"Found application: {application.id}")
    print(f"Job: {application.job.title}")
    print(f"Resume: {application.resume}")
    
    # Try to analyze it
    analyzer = ResumeAnalyzer()
    print("\nStarting analysis...")
    result = analyzer.analyze_application(application)
    
    print("\n=== ANALYSIS RESULT ===")
    import json
    print(json.dumps(result, indent=2, default=str))
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
