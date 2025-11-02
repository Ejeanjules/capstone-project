from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    time_ago = serializers.CharField(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read', 
            'created_at', 'time_ago', 'sender_username', 'job_title', 
            'job_company', 'job', 'job_application'
        ]
        read_only_fields = ['created_at', 'time_ago', 'sender_username', 'job_title', 'job_company']


class NotificationMarkReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']