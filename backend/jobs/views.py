from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Job, JobApplication
from .serializers import JobSerializer, JobCreateSerializer, JobApplicationSerializer, JobApplicationCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def jobs_list_create(request):
    if request.method == 'GET':
        # Get all active jobs
        jobs = Job.objects.filter(is_active=True)
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
    jobs = Job.objects.filter(posted_by=request.user, is_active=True)
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
    
    # Create application
    data = request.data.copy()
    data['job'] = job_id
    serializer = JobApplicationCreateSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        application = serializer.save()
        response_serializer = JobApplicationSerializer(application)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_job_applications(request):
    """Get applications for jobs posted by current user"""
    applications = JobApplication.objects.filter(job__posted_by=request.user)
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
    
    serializer = JobApplicationSerializer(application)
    return Response(serializer.data)