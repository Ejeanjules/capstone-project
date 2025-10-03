from django.urls import path
from . import views

urlpatterns = [
    path('', views.jobs_list_create, name='jobs_list_create'),
    path('<int:job_id>/', views.job_detail, name='job_detail'),
    path('my-jobs/', views.my_jobs, name='my_jobs'),
    path('public/', views.public_jobs, name='public_jobs'),
]