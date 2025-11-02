from django.urls import path
from . import views

urlpatterns = [
    path('', views.notifications_list, name='notifications_list'),
    path('count/', views.notifications_count, name='notifications_count'),
    path('stats/', views.notifications_stats, name='notifications_stats'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete_notification'),
    path('clear-all/', views.clear_all_notifications, name='clear_all_notifications'),
]