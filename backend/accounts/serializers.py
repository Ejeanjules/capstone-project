from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework import serializers
import uuid

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError('Unable to log in with provided credentials.')
        data['user'] = user
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found with this email address.')
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Prepare email content
        context = {
            'user': user,
            'token': token,
            'uid': uid,
        }
        
        # Render email content from template
        email_content = render_to_string('accounts/password_reset_email.txt', context)
        
        # Extract subject from the first line of the template
        lines = email_content.strip().split('\n')
        subject = lines[0].replace('Subject: ', '') if lines[0].startswith('Subject: ') else 'Password Reset Request'
        message = '\n'.join(lines[2:])  # Skip subject line and empty line
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            email_sent = True
            email_error = None
        except Exception as e:
            email_sent = False
            email_error = str(e)
        
        return {
            'message': 'Password reset email has been sent successfully' if email_sent else 'Failed to send email',
            'email_sent': email_sent,
            'email_error': email_error,
            # Include token details for development/debugging (remove in production)
            'debug_info': {
                'token': token,
                'uid': uid,
                'recipient': email
            } if settings.DEBUG else None
        }


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        
        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError('Invalid reset link.')
        
        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError('Invalid or expired reset token.')
        
        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        return user
