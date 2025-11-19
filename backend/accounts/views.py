from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from rest_framework.authtoken.models import Token


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username, 'email': user.email}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username, 'email': user.email})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({'id': user.id, 'username': user.username, 'email': user.email})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    try:
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = serializer.save()
                return Response(result, status=status.HTTP_200_OK)
            except Exception as e:
                import logging
                import traceback
                error_msg = f"Password reset email error: {e}"
                logging.error(error_msg)
                logging.error(traceback.format_exc())
                print(f"ERROR: {error_msg}")  # Print to stdout for Render logs
                print(traceback.format_exc())
                return Response({
                    'message': 'Failed to send reset email. Please try again later.',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import logging
        import traceback
        error_msg = f"Password reset request error: {e}"
        logging.error(error_msg)
        logging.error(traceback.format_exc())
        print(f"ERROR: {error_msg}")  # Print to stdout for Render logs
        print(traceback.format_exc())
        return Response({
            'message': 'An error occurred processing your request.',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Password has been reset successfully.',
            'username': user.username
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def test_email(request):
    """Temporary endpoint to test email configuration"""
    from django.core.mail import send_mail
    from django.conf import settings
    import traceback
    
    try:
        recipient = request.GET.get('email', 'e.jeanjules@outlook.com')
        send_mail(
            subject='Test Email from Genie Job Board',
            message='This is a test email. If you receive this, email configuration is working correctly!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
        return Response({
            'message': 'Email sent successfully!',
            'config': {
                'host': settings.EMAIL_HOST,
                'port': settings.EMAIL_PORT,
                'use_tls': settings.EMAIL_USE_TLS,
                'use_ssl': getattr(settings, 'EMAIL_USE_SSL', False),
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'to_email': recipient,
                'user': settings.EMAIL_HOST_USER[:20] + '...' if len(settings.EMAIL_HOST_USER) > 20 else settings.EMAIL_HOST_USER
            }
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'config': {
                'host': settings.EMAIL_HOST,
                'port': settings.EMAIL_PORT,
                'use_tls': settings.EMAIL_USE_TLS,
                'use_ssl': getattr(settings, 'EMAIL_USE_SSL', False),
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'user': settings.EMAIL_HOST_USER[:20] + '...' if len(settings.EMAIL_HOST_USER) > 20 else settings.EMAIL_HOST_USER
            }
        }, status=500)
