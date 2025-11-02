import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './BottomNavigation';
import './ProfilePage.css';

const ProfilePage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    phone: '###-###-####',
    location: 'Enter location',
    bio: 'Add a professional bio to showcase your experience and goals.',
    skills: [],
    experience: 'Add your work experience',
    education: 'Add your education background'
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserData();
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem(`userProfile_${user?.id}`);
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  };

  const saveUserProfile = (newProfile) => {
    localStorage.setItem(`userProfile_${user?.id}`, JSON.stringify(newProfile));
    setUserProfile(newProfile);
  };

  const fetchUserData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      
      // Fetch user's applications
      const applicationsResponse = await fetch('http://127.0.0.1:8000/api/jobs/my-applications/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      // Fetch user's posted jobs
      const jobsResponse = await fetch('http://127.0.0.1:8000/api/jobs/my-jobs/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      }

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setMyJobs(jobsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (field, value) => {
    const newProfile = { ...userProfile, [field]: value };
    saveUserProfile(newProfile);
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    return { total, pending, accepted, rejected };
  };

  const getJobStats = () => {
    const total = myJobs.length;
    const totalApplicants = myJobs.reduce((sum, job) => sum + (job.application_count || 0), 0);
    const activeJobs = myJobs.filter(job => job.is_active !== false).length;
    return { total, totalApplicants, activeJobs };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page page-with-top-nav">
      {/* Top Navigation */}
      <TopNavigation user={user} onLogout={onLogout} />

      <main className="profile-main-content">
        <div className="profile-container">
          {/* Left Side - Enhanced User Profile */}
          <div className="profile-left">
            <aside className="account-profile">
              <div className="profile-header">
                <div className="profile-images">
                  <div className="profile-avatar-container">
                    <img 
                      src="/api/placeholder/150/150" 
                      alt="Profile" 
                      className="profile-icon"
                    />
                    <div className="avatar-overlay">
                      <button className="change-photo-btn">
                        📷
                      </button>
                    </div>
                  </div>
                  <button 
                    className="settings-btn"
                    onClick={() => setEditMode(!editMode)}
                    title={editMode ? "Save Changes" : "Edit Profile"}
                  >
                    {editMode ? '💾' : '⚙️'}
                  </button>
                </div>
              </div>
              
              <div className="profile-info">
                <h2>{user?.username || 'User'}</h2>
                
                {editMode ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={userProfile.location}
                      onChange={(e) => handleProfileUpdate('location', e.target.value)}
                      className="edit-input"
                      placeholder="Enter your location"
                    />
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                      className="edit-input"
                      placeholder="Enter phone number"
                    />
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                      className="edit-textarea"
                      placeholder="Tell us about yourself..."
                      rows="3"
                    />
                  </div>
                ) : (
                  <div className="profile-details">
                    <p className="role">
                      <span className="icon">👤</span>
                      Job Seeker & Employer
                    </p>
                    <p className="location">
                      <span className="icon">📍</span>
                      {userProfile.location}
                    </p>
                    <p className="phone">
                      <span className="icon">📞</span>
                      {userProfile.phone}
                    </p>
                    <p className="email">
                      <span className="icon">📧</span>
                      {user?.email || 'Enter email'}
                    </p>
                    <div className="bio-section">
                      <h4>About</h4>
                      <p className="bio">{userProfile.bio}</p>
                    </div>
                  </div>
                )}

                {/* Profile Statistics */}
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-number">{applications.length}</span>
                    <span className="stat-label">Applications</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{myJobs.length}</span>
                    <span className="stat-label">Jobs Posted</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {myJobs.reduce((sum, job) => sum + (job.application_count || 0), 0)}
                    </span>
                    <span className="stat-label">Total Applicants</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Right Side - Enhanced Content with Tabs */}
          <div className="profile-right">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                💼 My Jobs
              </button>
              <button 
                className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                📋 Applications
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  {/* Activity Summary */}
                  <div className="activity-summary">
                    <h3>Activity Summary</h3>
                    <div className="summary-grid">
                      <div className="summary-card applications-card">
                        <div className="card-header">
                          <h4>📋 Applications</h4>
                          <span className="card-total">{getApplicationStats().total}</span>
                        </div>
                        <div className="card-stats">
                          <div className="stat pending">
                            <span>{getApplicationStats().pending}</span>
                            <label>Pending</label>
                          </div>
                          <div className="stat accepted">
                            <span>{getApplicationStats().accepted}</span>
                            <label>Accepted</label>
                          </div>
                          <div className="stat rejected">
                            <span>{getApplicationStats().rejected}</span>
                            <label>Rejected</label>
                          </div>
                        </div>
                      </div>

                      <div className="summary-card jobs-card">
                        <div className="card-header">
                          <h4>💼 Job Posts</h4>
                          <span className="card-total">{getJobStats().total}</span>
                        </div>
                        <div className="card-stats">
                          <div className="stat active">
                            <span>{getJobStats().activeJobs}</span>
                            <label>Active</label>
                          </div>
                          <div className="stat applicants">
                            <span>{getJobStats().totalApplicants}</span>
                            <label>Total Applicants</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      {applications.slice(0, 3).map(app => (
                        <div key={app.id} className="activity-item">
                          <div className="activity-icon">📋</div>
                          <div className="activity-content">
                            <p>Applied to <strong>{app.job_title}</strong> at {app.job_company}</p>
                            <span className="activity-time">{formatDate(app.applied_at)}</span>
                          </div>
                          <span className={`activity-status status-${app.status}`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                      
                      {myJobs.slice(0, 2).map(job => (
                        <div key={job.id} className="activity-item">
                          <div className="activity-icon">💼</div>
                          <div className="activity-content">
                            <p>Posted job <strong>{job.title}</strong></p>
                            <span className="activity-time">{formatDate(job.created_at)}</span>
                          </div>
                          <span className="activity-status applicants">
                            {job.application_count || 0} applicants
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'jobs' && (
                <aside className="my-applicants-section">
                  <div className="section-header">
                    <h2>My Job Posts & Applicants</h2>
                  </div>
                  
                  {loading ? (
                    <div className="loading">
                      <div className="loading-spinner"></div>
                      <p>Loading your jobs...</p>
                    </div>
                  ) : myJobs.length > 0 ? (
                    <div className="job-list">
                      {myJobs.map(job => (
                        <div key={job.id} className="job-item enhanced">
                          <div className="job-header">
                            <h4>{job.title}</h4>
                            <span className={`job-status ${job.is_active ? 'active' : 'inactive'}`}>
                              {job.is_active ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                          </div>
                          <p className="job-company">
                            <span className="icon">🏢</span>
                            {job.company}
                          </p>
                          <p className="job-location">
                            <span className="icon">📍</span>
                            {job.location}
                          </p>
                          <div className="job-footer">
                            <span className="applicant-count">
                              <span className="icon">👥</span>
                              {job.application_count || 0} applicants
                            </span>
                            <span className="job-date">
                              Posted {formatDate(job.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state enhanced">
                      <div className="empty-icon">💼</div>
                      <h3>No Jobs Posted Yet</h3>
                      <p>Start building your employer presence by posting your first job.</p>
                      <button 
                        onClick={() => navigate('/')}
                        className="post-job-btn enhanced"
                      >
                        <span className="btn-icon">➕</span>
                        Post Your First Job
                      </button>
                    </div>
                  )}
                </aside>
              )}

              {activeTab === 'applications' && (
                <aside className="resume-review-section">
                  <div className="section-header">
                    <h2>My Applications</h2>
                    <div className="filter-buttons">
                      <button className="filter-btn active">All</button>
                      <button className="filter-btn">Pending</button>
                      <button className="filter-btn">Accepted</button>
                      <button className="filter-btn">Rejected</button>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="loading">
                      <div className="loading-spinner"></div>
                      <p>Loading your applications...</p>
                    </div>
                  ) : applications.length > 0 ? (
                    <div className="application-list">
                      {applications.map(app => (
                        <div key={app.id} className="application-item enhanced">
                          <div className="application-header">
                            <h4>{app.job_title}</h4>
                            <span className={`status status-${app.status}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <p className="application-company">
                            <span className="icon">🏢</span>
                            {app.job_company}
                          </p>
                          <div className="application-footer">
                            {app.resume_name && (
                              <span className="has-resume">
                                <span className="icon">📄</span>
                                Resume attached
                              </span>
                            )}
                            <span className="application-date">
                              Applied {formatDate(app.applied_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state enhanced">
                      <div className="empty-icon">📋</div>
                      <h3>No Applications Yet</h3>
                      <p>Ready to take the next step in your career? Browse available jobs and submit your first application.</p>
                      <button 
                        onClick={() => navigate('/')}
                        className="browse-jobs-btn enhanced"
                      >
                        <span className="btn-icon">🔍</span>
                        Browse Jobs
                      </button>
                    </div>
                  )}
                </aside>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;