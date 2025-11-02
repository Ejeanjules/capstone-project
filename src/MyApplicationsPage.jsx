import React, { useState, useEffect } from 'react';
import TopNavigation from './BottomNavigation';
import './MyApplicationsPage.css';

// ApplicationCard component with resume analysis
const ApplicationCard = ({ application, onStatusUpdate, onDownloadResume, onAnalyzeResume, onUploadResume, isAnalyzing, isUploading }) => {
  const hasResume = application.resume && application.resume !== null && application.resume !== '';
  const hasAnalysis = application.analysis_completed;
  
  const getMatchScoreColor = (score) => {
    if (score >= 75) return "#2ea44f"; // Green
    if (score >= 50) return "#fb8500"; // Orange
    return "#d73a49"; // Red
  };

  const formatAnalysisData = (data) => {
    if (!data) return null;
    
    // Handle new JSON-based structured format
    if (data.matched && data.category_scores) {
      return (
        <div className="analysis-details">
          <div className="analysis-section">
            <strong>Category Scores:</strong>
            <div className="category-scores">
              <div className="score-item">
                <span className="score-label">Technical Skills:</span>
                <span className="score-value" style={{ color: data.category_scores.technical_skills >= 70 ? '#2ea44f' : data.category_scores.technical_skills >= 50 ? '#fb8500' : '#d73a49' }}>
                  {data.category_scores.technical_skills}%
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Education:</span>
                <span className="score-value" style={{ color: data.category_scores.education >= 70 ? '#2ea44f' : '#fb8500' }}>
                  {data.category_scores.education}%
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Soft Skills:</span>
                <span className="score-value" style={{ color: data.category_scores.soft_skills >= 70 ? '#2ea44f' : '#fb8500' }}>
                  {data.category_scores.soft_skills}%
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Experience:</span>
                <span className="score-value" style={{ color: data.category_scores.experience >= 70 ? '#2ea44f' : '#fb8500' }}>
                  {data.category_scores.experience}%
                </span>
              </div>
            </div>
          </div>

          {data.matched.technical_skills?.length > 0 && (
            <div className="analysis-section">
              <strong>✅ Matched Technical Skills ({data.matched.technical_skills.length}):</strong>
              <div className="keyword-list">
                {data.matched.technical_skills.map((keyword, index) => (
                  <span key={`matched-tech-${index}`} className="matched-keyword">{keyword}</span>
                ))}
              </div>
            </div>
          )}
          
          {data.missing.technical_skills?.length > 0 && (
            <div className="analysis-section">
              <strong>❌ Missing Technical Skills ({data.missing.technical_skills.length}):</strong>
              <div className="keyword-list">
                {data.missing.technical_skills.map((keyword, index) => (
                  <span key={`missing-tech-${index}`} className="missing-keyword">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {data.matched.education?.length > 0 && (
            <div className="analysis-section">
              <strong>✅ Education Match:</strong>
              <div className="keyword-list">
                {data.matched.education.map((keyword, index) => (
                  <span key={`matched-edu-${index}`} className="matched-keyword">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {data.matched.soft_skills?.length > 0 && (
            <div className="analysis-section">
              <strong>✅ Matched Soft Skills:</strong>
              <div className="keyword-list">
                {data.matched.soft_skills.map((keyword, index) => (
                  <span key={`matched-soft-${index}`} className="matched-keyword">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {data.experience && (
            <div className="analysis-section">
              <strong>Experience:</strong>
              <p className="experience-info">
                {data.experience.resume_years} years 
                {data.experience.required_years > 0 && (
                  <span> (Required: {data.experience.required_years}+ years - {data.experience.meets_requirement ? '✅ Meets requirement' : '⚠️ Below requirement'})</span>
                )}
              </p>
            </div>
          )}
          
          <div className="analysis-section">
            <strong>Analysis Summary:</strong>
            <p className="analysis-summary">{data.summary}</p>
          </div>
        </div>
      );
    }
    
    // Fallback to old format if present
    return (
      <div className="analysis-details">
        <div className="analysis-section">
          <strong>Keywords Found ({data.matched_keywords?.length || 0}):</strong>
          <div className="keyword-list">
            {data.matched_keywords?.map((keyword, index) => (
              <span key={`matched-${keyword}-${index}`} className="matched-keyword">{keyword}</span>
            ))}
          </div>
        </div>
        
        {data.missing_keywords?.length > 0 && (
          <div className="analysis-section">
            <strong>Missing Keywords ({data.missing_keywords.length}):</strong>
            <div className="keyword-list">
              {data.missing_keywords.map((keyword, index) => (
                <span key={`missing-${keyword}-${index}`} className="missing-keyword">{keyword}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="analysis-section">
          <strong>Analysis Summary:</strong>
          <p className="analysis-summary">{data.summary}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="application-card">
      <div className="application-header">
        <div className="applicant-info">
          <h3>{application.applicant_username}</h3>
          <p className="applicant-email">{application.applicant_email}</p>
        </div>
        <span className={`status-badge status-${application.status || 'pending'}`}>
          {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
        </span>
      </div>

      <div className="application-details">
        <p className="applied-date">
          Applied: {new Date(application.applied_at).toLocaleDateString()}
        </p>
        
        {application.message && (
          <div className="application-message">
            <h4>Cover Letter & Details:</h4>
            <p>{application.message}</p>
          </div>
        )}

        <div className="resume-section">
          {hasResume ? (
            <div className="resume-header">
              <button 
                className="download-resume-btn"
                onClick={() => onDownloadResume(application.id, application.resume_name)}
              >
                📄 Download Resume ({application.resume_name})
              </button>
              <button 
                className="upload-resume-btn"
                onClick={() => onUploadResume(application)}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : '🔄 Update Resume'}
              </button>
            </div>
          ) : (
            <div className="no-resume-section">
              <p className="no-resume-text">No resume uploaded</p>
              <button 
                className="upload-resume-btn"
                onClick={() => onUploadResume(application)}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : '📄 Upload Resume'}
              </button>
            </div>
          )}
          
          {hasResume && hasAnalysis ? (
            <div className="analysis-results">
              <div className="score-display">
                <span className="score-label">Match Score:</span>
                <span 
                  className="score-value"
                  style={{ color: getMatchScoreColor(application.resume_analysis_score) }}
                >
                  {application.resume_analysis_score}%
                </span>
              </div>
              {formatAnalysisData(application.resume_analysis_data)}
              <div className="analysis-date">
                Analyzed: {new Date(application.analysis_date).toLocaleDateString()}
              </div>
            </div>
          ) : hasResume ? (
            <div className="analysis-prompt">
              <button
                className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
                onClick={() => onAnalyzeResume(application)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </button>
              <span className="analysis-hint">
                Click to analyze resume against job requirements
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="application-actions">
        {application.status === 'pending' && (
          <>
            <button 
              className="action-btn accept-btn"
              onClick={() => onStatusUpdate(application.id, 'accepted')}
            >
              Accept
            </button>
            <button 
              className="action-btn reject-btn"
              onClick={() => onStatusUpdate(application.id, 'rejected')}
            >
              Reject
            </button>
          </>
        )}
        {application.status === 'accepted' && (
          <button 
            className="action-btn reject-btn"
            onClick={() => onStatusUpdate(application.id, 'rejected')}
          >
            Reject
          </button>
        )}
        {application.status === 'rejected' && (
          <button 
            className="action-btn accept-btn"
            onClick={() => onStatusUpdate(application.id, 'accepted')}
          >
            Accept
          </button>
        )}
      </div>
    </div>
  );
};

const MyApplicationsPage = ({ user, onLogout }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [analyzingApplications, setAnalyzingApplications] = useState(new Set());
  const [uploadingApplications, setUploadingApplications] = useState(new Set());

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch('http://127.0.0.1:8000/api/jobs/applications/', {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/applications/${applicationId}/status/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        ));
        alert(`Application ${status} successfully!`);
      } else {
        console.error('Failed to update status');
        alert('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating application status');
    }
  };

  const downloadResume = async (applicationId, resumeName) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth'))?.token;
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/applications/${applicationId}/resume/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resumeName || 'resume';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  const handleAnalyzeResume = async (application) => {
    setAnalyzingApplications(prev => new Set(prev).add(application.id));
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/applications/${application.id}/analyze-resume/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const updatedApplication = await response.json();
        
        // Update the applications list with the analyzed application
        setApplications(prevApplications => 
          prevApplications.map(app => 
            app.id === application.id ? updatedApplication : app
          )
        );
        
        alert('Resume analysis completed!');
      } else {
        const errorData = await response.json();
        alert(`Analysis failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzingApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(application.id);
        return newSet;
      });
    }
  };

  const handleAnalyzeJobResumes = async (jobTitle) => {
    const jobApplications = groupedApplications[jobTitle] || [];
    const applicationsWithResumes = jobApplications.filter(app => app.resume);
    
    if (applicationsWithResumes.length === 0) {
      alert('No resumes to analyze for this job');
      return;
    }

    // Get the job ID from the first application
    const jobId = applicationsWithResumes[0].job;

    setAnalyzingApplications(prev => {
      const newSet = new Set(prev);
      applicationsWithResumes.forEach(app => newSet.add(app.id));
      return newSet;
    });

    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}/analyze-resumes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const results = await response.json();
        
        // Update applications with analysis results
        setApplications(prevApplications => {
          const updatedApps = [...prevApplications];
          results.forEach(result => {
            const index = updatedApps.findIndex(app => app.id === result.id);
            if (index !== -1) {
              updatedApps[index] = result;
            }
          });
          return updatedApps;
        });
        
        alert(`Analyzed ${results.length} resume(s) successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Bulk analysis failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error analyzing resumes:', error);
      alert('Failed to analyze resumes. Please try again.');
    } finally {
      setAnalyzingApplications(new Set());
    }
  };

  const handleUploadResume = async (application) => {
    if (!application || !application.id) {
      alert('Invalid application data. Please refresh the page and try again.');
      return;
    }
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.style.display = 'none';
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      setUploadingApplications(prev => new Set(prev).add(application.id));
      
      try {
        const formData = new FormData();
        formData.append('resume', file);
        
        let auth;
        try {
          auth = JSON.parse(localStorage.getItem('auth'));
        } catch (parseError) {
          console.error('Failed to parse auth from localStorage:', parseError);
          alert('Authentication error. Please log in again.');
          return;
        }
        
        if (!auth || !auth.token) {
          alert('You are not logged in. Please log in again.');
          return;
        }
        
        const response = await fetch(`http://127.0.0.1:8000/api/jobs/applications/${application.id}/upload-resume/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${auth.token}`,
          },
          body: formData,
        });
        
        // Check for authentication errors
        if (response.status === 401 || response.status === 403) {
          alert('Your session has expired. Please log in again.');
          return;
        }
        
        if (response.ok) {
          const updatedApplication = await response.json();
          
          // Update the applications list with the updated application
          setApplications(prevApplications => 
            prevApplications.map(app => 
              app.id === application.id ? updatedApplication : app
            )
          );
          
          alert('Resume uploaded successfully!');
        } else {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.detail || 'Unknown error';
          } catch (jsonError) {
            errorMessage = `Server error (${response.status})`;
          }
          alert(`Upload failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Failed to upload resume. Please try again.');
      } finally {
        setUploadingApplications(prev => {
          const newSet = new Set(prev);
          newSet.delete(application.id);
          return newSet;
        });
      }
    };
    
    // Trigger file picker
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const filteredApplications = applications.filter(app => {
    // Safety check - filter out undefined/null applications
    if (!app || !app.id) {
      return false;
    }
    
    // Filter out applications without valid job data (deleted jobs)
    if (!app.job_title || app.job_title === '' || app.job_title === null) {
      return false;
    }
    
    // Apply status filter
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const groupedApplications = filteredApplications.reduce((acc, app) => {
    const jobTitle = app.job_title;
    if (!acc[jobTitle]) {
      acc[jobTitle] = [];
    }
    acc[jobTitle].push(app);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="my-applications-page page-with-top-nav">
        <TopNavigation user={user} onLogout={onLogout} />
        <main className="main-content">
          <div className="loading">Loading applications...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="my-applications-page page-with-top-nav">
      <TopNavigation user={user} onLogout={onLogout} />
      
      <main className="main-content">
        <div className="applications-header">
          <h1>Job Applications</h1>
          <p>{applications.length} total applications received</p>
        </div>

        <div className="applications-filters">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button 
            className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={filter === 'accepted' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({applications.filter(a => a.status === 'accepted').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>

        {Object.keys(groupedApplications).length === 0 ? (
          <div className="no-applications">
            <h3>No applications found</h3>
            <p>
              {filter === 'all' 
                ? 'You haven\'t received any applications yet. Post a job to start receiving applications!'
                : `No ${filter} applications found.`
              }
            </p>
          </div>
        ) : (
          <div className="applications-list">
            {Object.entries(groupedApplications).map(([jobTitle, jobApplications]) => {
              const resumeCount = jobApplications.filter(app => app.resume).length;
              const analyzedCount = jobApplications.filter(app => app.analysis_completed).length;
              const isAnalyzing = jobApplications.some(app => analyzingApplications.has(app.id));
              
              return (
                <div key={`job-${jobTitle}`} className="job-group">
                  <div className="job-group-header">
                    <h2 className="job-group-title">
                      {jobTitle} 
                      <span className="applicant-count">({jobApplications.length} applicants)</span>
                    </h2>
                    
                    <div className="analysis-controls">
                      {resumeCount > 0 && (
                        <div className="analysis-stats">
                          {resumeCount} resumes • {analyzedCount} analyzed
                        </div>
                      )}
                      <div className="analysis-buttons">
                        {resumeCount > analyzedCount && resumeCount > 0 && (
                          <button
                            className={`analyze-all-btn ${isAnalyzing ? 'analyzing' : ''}`}
                            onClick={() => handleAnalyzeJobResumes(jobTitle)}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? 'Analyzing...' : `Analyze All Resumes (${resumeCount - analyzedCount})`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                
                <div className="applications-grid">
                  {jobApplications.filter(app => app && app.id).map(application => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                      onStatusUpdate={updateApplicationStatus}
                      onDownloadResume={downloadResume}
                      onAnalyzeResume={handleAnalyzeResume}
                      onUploadResume={handleUploadResume}
                      isAnalyzing={analyzingApplications.has(application.id)}
                      isUploading={uploadingApplications.has(application.id)}
                    />
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyApplicationsPage;