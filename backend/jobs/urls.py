from django.urls import path
from . import views

urlpatterns = [
    path('', views.jobs_list_create, name='jobs_list_create'),
    path('<int:job_id>/', views.job_detail, name='job_detail'),
    path('my-jobs/', views.my_jobs, name='my_jobs'),
    path('public/', views.public_jobs, name='public_jobs'),
    path('<int:job_id>/apply/', views.apply_to_job, name='apply_to_job'),
    path('applications/', views.my_job_applications, name='my_job_applications'),
    path('applications/<int:application_id>/status/', views.update_application_status, name='update_application_status'),
    path('applications/<int:application_id>/resume/', views.download_resume, name='download_resume'),
    path('my-applications/', views.my_applications, name='my_applications'),
    
    # Resume analysis endpoints
    path('applications/<int:application_id>/analyze-resume/', views.analyze_resume, name='analyze_resume'),
    path('<int:job_id>/analyze-resumes/', views.analyze_job_resumes, name='analyze_job_resumes'),
    path('applications/<int:application_id>/analysis/', views.get_resume_analysis, name='get_resume_analysis'),
    path('applications/<int:application_id>/upload-resume/', views.upload_resume_for_application, name='upload_resume_for_application'),
    path('bulk-analyze/', views.bulk_analyze_resumes, name='bulk_analyze_resumes'),
]