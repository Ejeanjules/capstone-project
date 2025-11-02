from django.contrib import admin
from .models import Job, JobApplication


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'job_type', 'posted_by', 'created_at', 'is_active', 'application_count']
    list_filter = ['job_type', 'is_active', 'created_at']
    search_fields = ['title', 'company', 'location']
    readonly_fields = ['created_at', 'updated_at', 'application_count']
    
    def application_count(self, obj):
        return obj.application_count
    application_count.short_description = 'Applications'


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'job', 'status', 'applied_at', 'has_resume']
    list_filter = ['status', 'applied_at']
    search_fields = ['applicant__username', 'applicant__email', 'job__title', 'job__company']
    readonly_fields = ['applied_at', 'resume_name']
    
    def has_resume(self, obj):
        return bool(obj.resume)
    has_resume.boolean = True
    has_resume.short_description = 'Resume Uploaded'
    
    def resume_name(self, obj):
        return obj.resume_name if obj.resume else 'No resume uploaded'
    resume_name.short_description = 'Resume File'

    fieldsets = (
        ('Application Info', {
            'fields': ('job', 'applicant', 'status', 'applied_at')
        }),
        ('Content', {
            'fields': ('message', 'resume', 'resume_name')
        }),
    )