# Resume Upload Feature Guide

## Overview
The job application system now supports resume uploads. Users can attach their resume when applying for jobs, and job posters can download resumes from applicants.

## Features Added

### 1. Resume Upload on Job Application
- Users can now upload resumes when applying for jobs
- Supported file formats: PDF, DOC, DOCX
- Maximum file size: 5MB
- Files are stored in organized directories: `media/resumes/{user_id}/{job_id}_{filename}`

### 2. Resume Download for Job Posters
- Job posters can download resumes from applicants
- Secure access: Only job posters can access resumes for their posted jobs
- Original filename is preserved

### 3. Enhanced API Endpoints

#### Apply to Job (Enhanced)
**Endpoint:** `POST /api/jobs/{job_id}/apply/`

**Request Format:**
```javascript
// Using FormData for file upload
const formData = new FormData();
formData.append('message', 'I am interested in this position...');
formData.append('resume', fileInput.files[0]); // File input

fetch(`/api/jobs/${jobId}/apply/`, {
    method: 'POST',
    headers: {
        'Authorization': `Token ${userToken}`
    },
    body: formData
});
```

**Response:**
```json
{
    "id": 1,
    "job": 1,
    "applicant": 2,
    "applicant_username": "john_doe",
    "applicant_email": "john@example.com",
    "job_title": "Software Developer",
    "job_company": "Tech Corp",
    "status": "pending",
    "applied_at": "2025-10-21T17:30:00Z",
    "message": "I am interested in this position...",
    "resume": "/media/resumes/2/1_john_resume.pdf",
    "resume_name": "1_john_resume.pdf"
}
```

#### Download Resume
**Endpoint:** `GET /api/jobs/applications/{application_id}/resume/`

**Headers:**
```
Authorization: Token {userToken}
```

**Response:** File download with appropriate content-type

#### View Applications (Enhanced)
**Endpoint:** `GET /api/jobs/applications/`

**Response includes resume information:**
```json
[
    {
        "id": 1,
        "job": 1,
        "applicant": 2,
        "applicant_username": "john_doe",
        "applicant_email": "john@example.com",
        "job_title": "Software Developer",
        "job_company": "Tech Corp",
        "status": "pending",
        "applied_at": "2025-10-21T17:30:00Z",
        "message": "I am interested in this position...",
        "resume": "/media/resumes/2/1_john_resume.pdf",
        "resume_name": "1_john_resume.pdf"
    }
]
```

#### My Applications
**Endpoint:** `GET /api/jobs/my-applications/`

Returns applications submitted by the current user, including resume information.

## Frontend Integration Examples

### 1. Job Application Form with Resume Upload
```jsx
import React, { useState } from 'react';

const JobApplicationForm = ({ jobId, onSubmit }) => {
    const [message, setMessage] = useState('');
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('message', message);
        if (resume) {
            formData.append('resume', resume);
        }

        try {
            const response = await fetch(`/api/jobs/${jobId}/apply/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                onSubmit(data);
            } else {
                const error = await response.json();
                console.error('Application failed:', error);
            }
        } catch (error) {
            console.error('Error submitting application:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Cover Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us why you're interested in this position..."
                />
            </div>
            
            <div>
                <label>Resume (PDF, DOC, DOCX - Max 5MB):</label>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files[0])}
                />
            </div>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Apply Now'}
            </button>
        </form>
    );
};
```

### 2. Resume Download Component
```jsx
const ResumeDownloadButton = ({ applicationId, resumeName }) => {
    const downloadResume = async () => {
        try {
            const response = await fetch(`/api/jobs/applications/${applicationId}/resume/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = resumeName || 'resume';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.error('Failed to download resume');
            }
        } catch (error) {
            console.error('Error downloading resume:', error);
        }
    };

    return (
        <button onClick={downloadResume}>
            📄 Download Resume
        </button>
    );
};
```

## Security Features

1. **File Type Validation:** Only PDF, DOC, and DOCX files are allowed
2. **File Size Limit:** Maximum 5MB per file
3. **Access Control:** Only job posters can download resumes for their jobs
4. **Organized Storage:** Files are stored in user-specific directories
5. **Unique Naming:** Files are renamed to prevent conflicts

## Database Changes

### JobApplication Model Updates
- Added `resume` field: `FileField` with custom upload path
- Added `resume_name` property: Returns just the filename
- Files stored in: `media/resumes/{user_id}/{job_id}_{original_filename}`

## File Management

### Storage Structure
```
media/
└── resumes/
    ├── 1/  (user_id: 1)
    │   ├── 1_resume.pdf  (job_id: 1)
    │   └── 2_cv.docx     (job_id: 2)
    └── 2/  (user_id: 2)
        └── 1_john_resume.pdf
```

### Cleanup Considerations
- Consider implementing a cleanup job for old applications
- Monitor disk space usage as resumes accumulate
- Implement resume replacement if users reapply (currently prevented by unique constraint)

## Testing the Feature

1. Start the Django server: `python manage.py runserver`
2. Create a user account and login
3. Create a job posting
4. Apply to the job with a resume file
5. View applications as the job poster
6. Download the resume file

The feature is now ready for integration with your frontend application!