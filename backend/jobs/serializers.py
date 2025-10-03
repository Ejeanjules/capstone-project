from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    posted_by_username = serializers.CharField(source='posted_by.username', read_only=True)
    posted_at_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'job_type', 'salary',
            'description', 'requirements', 'posted_by', 'posted_by_username',
            'created_at', 'updated_at', 'is_active', 'posted_at_display'
        ]
        read_only_fields = ['posted_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the posted_by field to the current user
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'title', 'company', 'location', 'job_type', 'salary',
            'description', 'requirements'
        ]
    
    def create(self, validated_data):
        # Set the posted_by field to the current user
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)