from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils import timezone
import os
from .models import Job, JobApplication
from .serializers import JobSerializer, JobCreateSerializer, JobApplicationSerializer, JobApplicationCreateSerializer
from .resume_analyzer import resume_analyzer
from user_notifications.models import create_new_application_notification, create_application_status_notification


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def jobs_list_create(request):
    if request.method == 'GET':
        # Get all active and non-archived jobs
        jobs = Job.objects.filter(is_active=True, is_archived=False)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new job
        serializer = JobCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            job = serializer.save()
            # Return the full job data using JobSerializer
            response_serializer = JobSerializer(job)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def job_detail(request, job_id):
    try:
        job = Job.objects.get(id=job_id, is_active=True)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = JobSerializer(job)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only allow the job poster to update
        if job.posted_by != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = JobCreateSerializer(job, data=request.data, context={'request': request})
        if serializer.is_valid():
            job = serializer.save()
            response_serializer = JobSerializer(job)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only allow the job poster to delete
        if job.posted_by != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        job.is_active = False  # Soft delete
        job.save()
        return Response({'message': 'Job deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    """Get jobs posted by the current user"""
    jobs = Job.objects.filter(posted_by=request.user, is_active=True, is_archived=False)
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_jobs(request):
    """Get all jobs - public endpoint for non-authenticated users"""
    jobs = Job.objects.filter(is_active=True)
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    """Apply to a specific job"""
    try:
        job = Job.objects.get(id=job_id, is_active=True)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is trying to apply to their own job
    if job.posted_by == request.user:
        return Response({'error': 'You cannot apply to your own job'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already applied
    if JobApplication.objects.filter(job=job, applicant=request.user).exists():
        return Response({'error': 'You have already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if job is still accepting applications (enforce max_applicants limit)
    if not job.is_accepting_applications:
        return Response({
            'error': 'This job has reached its maximum number of applicants',
            'max_applicants': job.max_applicants,
            'current_applications': job.application_count
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create application
    data = request.data.copy()
    data['job'] = job_id
    serializer = JobApplicationCreateSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        application = serializer.save()
        
        # Create notification for job poster
        try:
            create_new_application_notification(application)
        except Exception as e:
            # Log the error but don't fail the application
            print(f"Failed to create notification: {e}")
        
        response_serializer = JobApplicationSerializer(application)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_job_applications(request):
    """Get applications for jobs posted by current user (only for active jobs)"""
    applications = JobApplication.objects.filter(
        job__posted_by=request.user,
        job__is_active=True  # Only show applications for active jobs
    )
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    """Update application status (accept/reject)"""
    try:
        application = JobApplication.objects.get(id=application_id)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow job poster to update application status
    if application.job.posted_by != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    status_value = request.data.get('status')
    if status_value not in ['accepted', 'rejected', 'pending']:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    application.status = status_value
    application.save()
    
    # Create notification for applicant about status change
    try:
        create_application_status_notification(application, status_value)
    except Exception as e:
        # Log the error but don't fail the status update
        print(f"Failed to create status notification: {e}")
    
    serializer = JobApplicationSerializer(application)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_resume(request, application_id):
    """Download resume for a job application"""
    try:
        application = JobApplication.objects.get(id=application_id)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow job poster to download resumes
    if application.job.posted_by != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if resume exists
    if not application.resume:
        return Response({'error': 'No resume uploaded for this application'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if file exists on disk
    resume_path = application.resume.path
    if not os.path.exists(resume_path):
        return Response({'error': 'Resume file not found on server'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get file content and prepare response
    try:
        with open(resume_path, 'rb') as file:
            response = HttpResponse(file.read())
            
        # Set appropriate content type based on file extension
        file_extension = os.path.splitext(resume_path)[1].lower()
        content_types = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        content_type = content_types.get(file_extension, 'application/octet-stream')
        
        response['Content-Type'] = content_type
        response['Content-Disposition'] = f'attachment; filename="{application.resume_name}"'
        
        return response
        
    except Exception as e:
        return Response({'error': f'Error reading file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    """Get applications submitted by the current user"""
    applications = JobApplication.objects.filter(applicant=request.user)
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_resume(request, application_id):
    """
    Analyze a single resume against job requirements
    """
    try:
        application = JobApplication.objects.get(id=application_id)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow job poster to analyze applications
    if application.job.posted_by != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if not application.resume:
        return Response({'error': 'No resume file found'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Perform analysis
        analysis_result = resume_analyzer.analyze_application(application)
        
        if analysis_result['error']:
            error_msg = analysis_result['error']
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the summary is properly encoded
        import json
        analysis_data = analysis_result['analysis']
        
        # Test JSON serialization
        try:
            json.dumps(analysis_data, ensure_ascii=False)
        except Exception as json_error:
            print(f"JSON serialization error: {json_error}")
            # Fallback: remove problematic characters
            if 'summary' in analysis_data:
                analysis_data['summary'] = analysis_data['summary'].encode('utf-8', errors='ignore').decode('utf-8')
        
        # Save analysis results to database
        application.resume_analysis_score = analysis_result['score']
        application.resume_analysis_data = analysis_data
        application.analysis_completed = True
        application.analysis_date = timezone.now()
        application.save()
        
        # Return the full application data using the serializer
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Analysis error: {error_trace}")
        return Response({'error': f'Analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_job_resumes(request, job_id):
    """
    Analyze all resumes for a specific job posting
    """
    try:
        job = Job.objects.get(id=job_id, posted_by=request.user)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)
    
    applications = JobApplication.objects.filter(job=job, resume__isnull=False)
    
    if not applications.exists():
        return Response({'error': 'No applications with resumes found'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        updated_applications = []
        
        for application in applications:
            analysis_result = resume_analyzer.analyze_application(application)
            
            if not analysis_result['error']:
                # Save analysis results
                application.resume_analysis_score = analysis_result['score']
                application.resume_analysis_data = analysis_result['analysis']
                application.analysis_completed = True
                application.analysis_date = timezone.now()
                application.save()
                
                updated_applications.append(application)
        
        # Return serialized application data
        serializer = JobApplicationSerializer(updated_applications, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': f'Batch analysis failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume_for_application(request, application_id):
    """
    Upload or update resume for an existing application (employer can upload on behalf of applicant)
    """
    try:
        application = JobApplication.objects.get(id=application_id)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow job poster to upload resumes for their job applications
    if application.job.posted_by != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if 'resume' not in request.FILES:
        return Response({'error': 'No resume file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    resume_file = request.FILES['resume']
    
    # Validate file size (5MB limit)
    if resume_file.size > 5 * 1024 * 1024:
        return Response({'error': 'File size must be less than 5MB'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file extension
    import os
    ext = os.path.splitext(resume_file.name)[1].lower()
    allowed_extensions = ['.pdf', '.doc', '.docx']
    if ext not in allowed_extensions:
        return Response({
            'error': f'Unsupported file type. Allowed types: {", ".join(allowed_extensions)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Delete old resume file if exists
        if application.resume:
            try:
                application.resume.delete(save=False)
            except:
                pass  # Continue even if old file deletion fails
        
        # Save new resume
        application.resume = resume_file
        
        # Reset analysis data since resume changed
        application.resume_analysis_score = 0.0
        application.resume_analysis_data = {}
        application.analysis_completed = False
        application.analysis_date = None
        
        application.save()
        
        # Return updated application data
        serializer = JobApplicationSerializer(application)
        
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': f'Upload failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resume_analysis(request, application_id):
    """
    Get existing resume analysis results for an application
    """
    try:
        application = JobApplication.objects.get(id=application_id)
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow job poster to view analysis
    if application.job.posted_by != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if not application.analysis_completed:
        return Response({'error': 'Analysis not yet completed'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'application_id': application.id,
        'applicant_name': application.applicant.username,
        'score': application.resume_analysis_score,
        'analysis': application.resume_analysis_data,
        'analysis_date': application.analysis_date
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_analyze_resumes(request):
    """
    Analyze multiple uploaded resumes against a specific job posting without creating applications.
    Accepts: job_id and multiple resume files
    Returns: Analysis results for each resume
    """
    job_id = request.data.get('job_id')
    
    if not job_id:
        return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify job exists and user owns it
    try:
        job = Job.objects.get(id=job_id, posted_by=request.user)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get uploaded files
    files = request.FILES.getlist('resumes')
    
    if not files:
        return Response({'error': 'No resume files provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    results = []
    errors = []
    
    for resume_file in files:
        try:
            # Analyze resume directly without creating an application
            analysis_result = resume_analyzer.analyze_resume_file(resume_file, job)
            
            if analysis_result['error']:
                errors.append({
                    'filename': resume_file.name,
                    'error': analysis_result['error']
                })
            else:
                results.append({
                    'filename': resume_file.name,
                    'score': analysis_result['score'],
                    'analysis': analysis_result['analysis'],
                    'job_title': job.title,
                    'job_company': job.company
                })
        except Exception as e:
            errors.append({
                'filename': resume_file.name,
                'error': str(e)
            })
    
    return Response({
        'success_count': len(results),
        'error_count': len(errors),
        'results': results,
        'errors': errors,
        'job': {
            'id': job.id,
            'title': job.title,
            'company': job.company
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_job(request, job_id):
    """Archive or unarchive a job posting"""
    try:
        job = Job.objects.get(id=job_id, posted_by=request.user, is_active=True)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)
    
    # Toggle archive status
    job.is_archived = not job.is_archived
    job.save()
    
    serializer = JobSerializer(job)
    return Response({
        'message': f'Job {"archived" if job.is_archived else "unarchived"} successfully',
        'job': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def archived_jobs(request):
    """Get archived jobs posted by the current user"""
    jobs = Job.objects.filter(posted_by=request.user, is_active=True, is_archived=True)
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)