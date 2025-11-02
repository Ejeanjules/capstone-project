import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

const TopNavigation = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      if (!token) return;
      
      const response = await fetch('http://127.0.0.1:8000/api/notifications/count/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      path: '/',
      isActive: location.pathname === '/'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/notifications',
      isActive: location.pathname === '/notifications',
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: '💼',
      path: '/applications',
      isActive: location.pathname === '/applications'
    },
    {
      id: 'bulk-analysis',
      label: 'Bulk Analysis',
      icon: '📊',
      path: '/bulk-analysis',
      isActive: location.pathname === '/bulk-analysis'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: '👤',
      path: '/profile',
      isActive: location.pathname === '/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Refresh notification count when navigating away from notifications
    if (path !== '/notifications') {
      setTimeout(fetchUnreadCount, 1000);
    }
  };

  return (
    <div className="top-navigation">
      <div className="top-nav-container">
        {/* Logo Section */}
        <div className="top-nav-logo">
          <img src="/genieoffical.jpg" alt="Genie" className="genie-logo-img" />
        </div>

        {/* Navigation Items */}
        <div className="top-nav-items">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`top-nav-item ${item.isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.label}
            >
              <div className="nav-icon-wrapper">
                <div className="nav-icon">{item.icon}</div>
                {item.badge && (
                  <span className="notification-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Section */}
        <div className="top-nav-user">
          <span className="user-info">Welcome, {user?.username}</span>
          <button className="logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;