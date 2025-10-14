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
]