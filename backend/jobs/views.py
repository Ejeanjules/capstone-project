from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Job
from .serializers import JobSerializer, JobCreateSerializer


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