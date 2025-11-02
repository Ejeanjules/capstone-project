from django.db import models
from django.contrib.auth.models import User
from jobs.models import Job, JobApplication


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_application', 'New Job Application'),
        ('application_status', 'Application Status Update'),
        ('job_posted', 'New Job Posted'),
        ('application_withdrawn', 'Application Withdrawn'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related objects
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    job_application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    @property
    def time_ago(self):
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


def create_notification(recipient, notification_type, title, message, sender=None, job=None, job_application=None):
    """
    Helper function to create notifications
    """
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        job=job,
        job_application=job_application
    )
    return notification


def create_new_application_notification(job_application):
    """
    Create notification when someone applies to a job
    """
    job = job_application.job
    job_poster = job.posted_by
    applicant = job_application.applicant
    
    title = f"New application for {job.title}"
    message = f"{applicant.username} has applied to your job posting '{job.title}' at {job.company}."
    
    return create_notification(
        recipient=job_poster,
        sender=applicant,
        notification_type='new_application',
        title=title,
        message=message,
        job=job,
        job_application=job_application
    )


def create_application_status_notification(job_application, status):
    """
    Create notification when application status changes
    """
    job = job_application.job
    applicant = job_application.applicant
    job_poster = job.posted_by
    
    status_messages = {
        'accepted': f"Congratulations! Your application for '{job.title}' at {job.company} has been accepted.",
        'rejected': f"Thank you for your interest. Your application for '{job.title}' at {job.company} was not selected at this time.",
        'pending': f"Your application for '{job.title}' at {job.company} is now under review."
    }
    
    title = f"Application {status.title()}: {job.title}"
    message = status_messages.get(status, f"Your application status for '{job.title}' has been updated to {status}.")
    
    return create_notification(
        recipient=applicant,
        sender=job_poster,
        notification_type='application_status',
        title=title,
        message=message,
        job=job,
        job_application=job_application
    )
