from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'sender', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__username', 'sender__username']
    readonly_fields = ['created_at', 'time_ago']
    
    fieldsets = (
        ('Notification Info', {
            'fields': ('recipient', 'sender', 'notification_type', 'title', 'message')
        }),
        ('Related Objects', {
            'fields': ('job', 'job_application')
        }),
        ('Status & Timing', {
            'fields': ('is_read', 'created_at', 'time_ago')
        }),
    )
    
    def time_ago(self, obj):
        return obj.time_ago
    time_ago.short_description = 'Time Ago'
