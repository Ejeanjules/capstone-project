from django.db import models
from django.contrib.auth.models import User


class Job(models.Model):
    JOB_TYPES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ]
    
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES, default='full-time')
    salary = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    max_applicants = models.PositiveIntegerField(blank=True, null=True, help_text="Maximum number of applicants allowed")
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} at {self.company}"
    
    @property
    def application_count(self):
        """Return the number of applications for this job"""
        return self.applications.count()
    
    @property
    def is_accepting_applications(self):
        """Check if job is still accepting applications based on max_applicants limit"""
        if not self.max_applicants:
            return True  # No limit set
        return self.application_count < self.max_applicants
    
    @property
    def application_status_display(self):
        """Return a formatted string showing current applications vs max"""
        if not self.max_applicants:
            return f"{self.application_count} applications"
        return f"{self.application_count}/{self.max_applicants} applications"
    
    @property
    def posted_at_display(self):
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        now = timezone.now()
        diff = now - self.created_at
        
        if diff.days == 0:
            if diff.seconds < 3600:  # Less than 1 hour
                minutes = diff.seconds // 60
                return f"{minutes} minutes ago" if minutes > 1 else "Just now"
            else:  # Less than 24 hours
                hours = diff.seconds // 3600
                return f"{hours} hours ago" if hours > 1 else "1 hour ago"
        elif diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} weeks ago" if weeks > 1 else "1 week ago"
        else:
            months = diff.days // 30
            return f"{months} months ago" if months > 1 else "1 month ago"


def resume_upload_path(instance, filename):
    """
    Generate upload path for resume files
    Format: resumes/{user_id}/{job_id}_{filename}
    """
    import os
    name, ext = os.path.splitext(filename)
    return f'resumes/{instance.applicant.id}/{instance.job.id}_{name}{ext}'


class JobApplication(models.Model):
    STATUSES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    status = models.CharField(max_length=20, choices=STATUSES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True, null=True, help_text="Optional message from applicant")
    resume = models.FileField(
        upload_to=resume_upload_path,
        blank=True,
        null=True,
        help_text="Upload your resume (PDF, DOC, DOCX supported)"
    )
    
    # Resume analysis fields
    resume_analysis_score = models.FloatField(
        default=0.0,
        help_text="Resume match score (0-100)"
    )
    resume_analysis_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Detailed resume analysis results"
    )
    analysis_completed = models.BooleanField(
        default=False,
        help_text="Whether resume analysis has been completed"
    )
    analysis_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the resume analysis was last performed"
    )
    
    class Meta:
        unique_together = ['job', 'applicant']  # Prevent duplicate applications
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.applicant.username} applied to {self.job.title}"
    
    @property
    def resume_name(self):
        """Return just the filename of the resume"""
        if self.resume:
            import os
            return os.path.basename(self.resume.name)
        return None