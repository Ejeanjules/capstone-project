import React, { useState, useEffect } from 'react';
import TopNavigation from './BottomNavigation';
import './NotificationsPage.css';

const NotificationsPage = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total_notifications: 0,
    unread_notifications: 0,
    new_applications: 0,
    status_updates: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch('/api/notifications/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch('/api/notifications/stats/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch(`/api/notifications/${notificationId}/read/`, {
        method: 'PUT',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch('/api/notifications/mark-all-read/', {
        method: 'PUT',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch(`/api/notifications/${notificationId}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) {
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch('/api/notifications/clear-all/', {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        setNotifications([]);
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_application':
        return '💼';
      case 'application_status':
        return '📄';
      case 'job_posted':
        return '🆕';
      default:
        return '🔔';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'new_application') return notification.notification_type === 'new_application';
    if (filter === 'application_status') return notification.notification_type === 'application_status';
    return true;
  });

  if (loading) {
    return (
      <div className="notifications-page page-with-top-nav">
        <TopNavigation user={user} onLogout={onLogout} />
        <main className="main-content">
          <div className="loading">Loading notifications...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="notifications-page page-with-top-nav">
      <TopNavigation user={user} onLogout={onLogout} />

      <main className="notifications-main-content">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <div className="notifications-stats">
            <span className="stat-item">
              <strong>{stats.unread_notifications}</strong> unread
            </span>
            <span className="stat-item">
              <strong>{stats.new_applications}</strong> new applications
            </span>
            <span className="stat-item">
              <strong>{stats.status_updates}</strong> status updates
            </span>
          </div>
        </div>

        <div className="notifications-controls">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={filter === 'unread' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('unread')}
            >
              Unread ({stats.unread_notifications})
            </button>
            <button 
              className={filter === 'new_application' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('new_application')}
            >
              Applications ({stats.new_applications})
            </button>
            <button 
              className={filter === 'application_status' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('application_status')}
            >
              Status Updates ({stats.status_updates})
            </button>
          </div>

          <div className="action-buttons">
            {stats.unread_notifications > 0 && (
              <button className="action-btn mark-all-read-btn" onClick={markAllAsRead}>
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="action-btn clear-all-btn" onClick={clearAllNotifications}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>
              {filter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No ${filter.replace('_', ' ')} notifications found.`
              }
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.is_read ? 'unread' : 'read'}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">{notification.time_ago}</span>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.job_title && (
                    <div className="notification-meta">
                      <span className="job-reference">
                        📋 {notification.job_title} at {notification.job_company}
                      </span>
                    </div>
                  )}
                </div>

                <div className="notification-actions">
                  {!notification.is_read && (
                    <button 
                      className="action-btn mark-read-btn"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;