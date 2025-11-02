#!/usr/bin/env python
"""
Test script for resume upload functionality
Run this after starting the Django server to test the API endpoints
"""

import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/api"

def test_resume_upload():
    """Test the resume upload functionality"""
    print("🧪 Testing Resume Upload Functionality")
    print("=" * 50)
    
    # Test 1: Check API endpoints are accessible
    print("\n1. Testing API Root...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ API is running")
            data = response.json()
            print(f"   Endpoints available: {len(data.get('endpoints', {}))}")
        else:
            print("❌ API not accessible")
            return False
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")
        return False
    
    # Test 2: Check jobs endpoint
    print("\n2. Testing Jobs Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/jobs/public/")
        if response.status_code == 200:
            print("✅ Jobs endpoint accessible")
            jobs = response.json()
            print(f"   Found {len(jobs)} public jobs")
        else:
            print("❌ Jobs endpoint not accessible")
    except Exception as e:
        print(f"❌ Error accessing jobs endpoint: {e}")
    
    # Test 3: Check media directory structure
    print("\n3. Testing Media Directory Structure...")
    media_dir = os.path.join(os.path.dirname(__file__), 'backend', 'media')
    resumes_dir = os.path.join(media_dir, 'resumes')
    
    if os.path.exists(media_dir):
        print("✅ Media directory exists")
        if os.path.exists(resumes_dir):
            print("✅ Resumes directory exists")
        else:
            print("⚠️  Resumes directory not found - will be created on first upload")
    else:
        print("❌ Media directory not found")
    
    print("\n📝 Next Steps:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Create user accounts via admin or API")
    print("3. Create job postings")
    print("4. Test job applications with resume uploads")
    print("\n📄 Resume Upload Requirements:")
    print("- Supported formats: PDF, DOC, DOCX")
    print("- Maximum size: 5MB")
    print("- Use FormData for file uploads in frontend")
    
    return True

if __name__ == "__main__":
    test_resume_upload()