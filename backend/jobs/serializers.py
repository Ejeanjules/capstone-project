from rest_framework import serializers
from .models import Job, JobApplication


class JobSerializer(serializers.ModelSerializer):
    posted_by_username = serializers.CharField(source='posted_by.username', read_only=True)
    posted_at_display = serializers.CharField(read_only=True)
    application_count = serializers.IntegerField(read_only=True)
    is_accepting_applications = serializers.BooleanField(read_only=True)
    application_status_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'job_type', 'salary',
            'description', 'requirements', 'max_applicants', 'posted_by', 'posted_by_username',
            'created_at', 'updated_at', 'is_active', 'posted_at_display',
            'application_count', 'is_accepting_applications', 'application_status_display',
            'required_skills', 'required_education', 'required_soft_skills', 'min_experience_years'
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
            'description', 'requirements', 'max_applicants',
            'required_skills', 'required_education', 'required_soft_skills', 'min_experience_years'
        ]
    
    def create(self, validated_data):
        # Set the posted_by field to the current user
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)


class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.CharField(source='applicant.username', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    resume_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'applicant', 'applicant_username', 'applicant_email',
            'job_title', 'job_company', 'status', 'applied_at', 'message', 
            'resume', 'resume_name', 'resume_analysis_score', 'resume_analysis_data',
            'analysis_completed', 'analysis_date'
        ]
        read_only_fields = ['applicant', 'applied_at', 'resume_analysis_score', 
                           'resume_analysis_data', 'analysis_completed', 'analysis_date']
    
    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['job', 'message', 'resume']
    
    def validate_resume(self, value):
        """Validate resume file"""
        if value:
            # Check file size (5MB limit)
            if value.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("Resume file size must be less than 5MB")
            
            # Check file extension
            import os
            ext = os.path.splitext(value.name)[1].lower()
            allowed_extensions = ['.pdf', '.doc', '.docx']
            if ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
                )
        return value
    
    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)