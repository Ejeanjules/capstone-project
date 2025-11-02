"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def api_root(request):
    return JsonResponse({
        'message': 'JobBoard Pro API is running',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'api_info': '/api/',
            'accounts': '/api/accounts/',
            'jobs': '/api/jobs/',
            'notifications': '/api/notifications/',
            'login': '/api/accounts/login/ (POST)',
            'register': '/api/accounts/register/ (POST)',
            'logout': '/api/accounts/logout/ (POST)',
            'current_user': '/api/accounts/user/ (GET)',
            'password_reset': '/api/accounts/password-reset/ (POST)',
            'password_reset_confirm': '/api/accounts/password-reset-confirm/ (POST)',
            'job_applications': '/api/jobs/applications/ (GET - for job posters)',
            'my_applications': '/api/jobs/my-applications/ (GET - for applicants)',
            'apply_to_job': '/api/jobs/{job_id}/apply/ (POST - with resume upload)',
            'download_resume': '/api/jobs/applications/{application_id}/resume/ (GET)',
            'update_application_status': '/api/jobs/applications/{application_id}/status/ (PUT)',
            'notifications_list': '/api/notifications/ (GET)',
            'notifications_count': '/api/notifications/count/ (GET)',
            'mark_notification_read': '/api/notifications/{id}/read/ (PUT)',
            'mark_all_read': '/api/notifications/mark-all-read/ (PUT)'
        }
    })

def home_view(request):
    return JsonResponse({
        'message': 'Welcome to JobBoard Pro Backend API',
        'status': 'running',
        'frontend_url': 'http://localhost:5173/',
        'admin_url': 'http://127.0.0.1:8000/admin/',
        'api_endpoints': {
            'jobs': '/api/jobs/',
            'accounts': '/api/accounts/',
            'documentation': '/api/'
        },
        'note': 'This is the backend API. Visit http://localhost:5173/ for the main application.'
    })

urlpatterns = [
    path('', home_view, name='home'),  # Root URL
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/accounts/', include('accounts.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/notifications/', include('user_notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
