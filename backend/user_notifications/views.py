from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer, NotificationMarkReadSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    """Get all notifications for the current user"""
    notifications = Notification.objects.filter(recipient=request.user)
    
    # Optional filtering
    unread_only = request.GET.get('unread_only', False)
    if unread_only and unread_only.lower() == 'true':
        notifications = notifications.filter(is_read=False)
    
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_count(request):
    """Get count of unread notifications"""
    unread_count = Notification.objects.filter(
        recipient=request.user, 
        is_read=False
    ).count()
    
    return Response({'unread_count': unread_count})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id, 
            recipient=request.user
        )
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    notification.is_read = True
    notification.save()
    
    serializer = NotificationSerializer(notification)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    updated_count = Notification.objects.filter(
        recipient=request.user, 
        is_read=False
    ).update(is_read=True)
    
    return Response({'message': f'Marked {updated_count} notifications as read'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a specific notification"""
    try:
        notification = Notification.objects.get(
            id=notification_id, 
            recipient=request.user
        )
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    notification.delete()
    return Response({'message': 'Notification deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_notifications(request):
    """Delete all notifications for the current user"""
    deleted_count, _ = Notification.objects.filter(recipient=request.user).delete()
    return Response({'message': f'Cleared {deleted_count} notifications'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_stats(request):
    """Get notification statistics for the current user"""
    total_notifications = Notification.objects.filter(recipient=request.user).count()
    unread_notifications = Notification.objects.filter(recipient=request.user, is_read=False).count()
    
    # Count by type
    new_applications = Notification.objects.filter(
        recipient=request.user, 
        notification_type='new_application'
    ).count()
    
    status_updates = Notification.objects.filter(
        recipient=request.user, 
        notification_type='application_status'
    ).count()
    
    return Response({
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'new_applications': new_applications,
        'status_updates': status_updates
    })
