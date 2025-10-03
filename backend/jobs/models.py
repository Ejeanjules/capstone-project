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
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} at {self.company}"
    
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