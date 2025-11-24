import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavigation from './BottomNavigation'

export default function MainPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [archivedJobs, setArchivedJobs] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applyingToJob, setApplyingToJob] = useState(null)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    maxApplicants: '',
    requiredSkills: '',
    requiredEducation: '',
    requiredSoftSkills: '',
    minExperienceYears: '',
    archiveAt: ''
  })
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    experience: '',
    availability: 'immediate',
    salaryExpectation: '',
    portfolio: '',
    additionalMessage: '',
    resume: null
  })

  // Fetch jobs from backend
  useEffect(() => {
    fetchJobs()
    fetchArchivedJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch('/api/jobs/', {
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      } else {
        console.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const fetchArchivedJobs = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch('/api/jobs/archived/', {
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Only show archived jobs posted by current user
        setArchivedJobs(data.filter(job => job.posted_by_username === user.username))
      } else {
        console.error('Failed to fetch archived jobs')
      }
    } catch (error) {
      console.error('Error fetching archived jobs:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitJob = async (e) => {
    e.preventDefault()
    
    // If editing, use the update function instead
    if (editingJob) {
      return handleUpdateJob(e)
    }
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch('/api/jobs/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          job_type: newJob.type,
          salary: newJob.salary,
          description: newJob.description,
          max_applicants: newJob.maxApplicants || null,
          required_skills: newJob.requiredSkills ? newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s) : [],
          required_education: newJob.requiredEducation ? newJob.requiredEducation.split(',').map(s => s.trim()).filter(s => s) : [],
          required_soft_skills: newJob.requiredSoftSkills ? newJob.requiredSoftSkills.split(',').map(s => s.trim()).filter(s => s) : [],
          min_experience_years: newJob.minExperienceYears ? parseInt(newJob.minExperienceYears) : 0,
          archive_at: newJob.archiveAt || null,
        }),
      })

      if (response.ok) {
        // Refresh the jobs list
        fetchJobs()
        // Reset form
        setNewJob({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          salary: '',
          description: '',
          maxApplicants: '',
          requiredSkills: '',
          requiredEducation: '',
          requiredSoftSkills: '',
          minExperienceYears: '',
          archiveAt: ''
        })
        setShowPostForm(false)
        alert('Job posted successfully!')
        // Redirect to home page
        navigate('/')
      } else {
        const errorData = await response.json()
        console.error('Failed to post job:', errorData)
        alert('Failed to post job')
      }
    } catch (error) {
      console.error('Error posting job:', error)
      alert('Error posting job')
    }
  }

  const handleApplyToJob = (jobId) => {
    // Find the job to check if it's accepting applications
    const job = jobs.find(j => j.id === jobId)
    if (job && !job.is_accepting_applications) {
      alert(`This position is full! It has reached its maximum of ${job.max_applicants} applicants.`)
      return
    }

    // Set the job we're applying to and show the application form
    setApplyingToJob(job)
    setShowApplicationForm(true)
  }

  const handleApplicationInputChange = (e) => {
    const { name, value } = e.target
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document (.pdf, .doc, .docx)')
        e.target.value = ''
        return
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB')
        e.target.value = ''
        return
      }
      
      setApplicationData(prev => ({
        ...prev,
        resume: file
      }))
    }
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      
      // Create FormData for file upload
      const formData = new FormData()
      
      // Prepare the message content
      const messageContent = [
        `Cover Letter: ${applicationData.coverLetter}`,
        `Experience: ${applicationData.experience}`,
        `Availability: ${applicationData.availability}`,
        `Salary Expectation: ${applicationData.salaryExpectation}`,
        `Portfolio: ${applicationData.portfolio}`,
        `Additional Message: ${applicationData.additionalMessage}`
      ].filter(item => item.split(': ')[1].trim()).join('\n\n')
      
      formData.append('message', messageContent)
      
      // Add resume file if uploaded
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume)
      }
      
      const response = await fetch(`/api/jobs/${applyingToJob.id}/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          // Don't set Content-Type header - let browser set it with boundary for FormData
        },
        body: formData
      })

      if (response.ok) {
        const responseData = await response.json()
        alert('Application submitted successfully!')
        // Reset form and close
        setApplicationData({
          coverLetter: '',
          experience: '',
          availability: 'immediate',
          salaryExpectation: '',
          portfolio: '',
          additionalMessage: '',
          resume: null
        })
        // Reset file input
        document.querySelector('.file-input').value = ''
        setShowApplicationForm(false)
        setApplyingToJob(null)
        // Refresh the jobs list to update application counts
        fetchJobs()
      } else {
        const errorData = await response.json()
        if (errorData.max_applicants && errorData.current_applications) {
          alert(`This position is full! It has ${errorData.current_applications}/${errorData.max_applicants} applicants.`)
        } else {
          alert(`Error: ${errorData.error || 'Failed to submit application'}`)
        }
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Error submitting application')
    }
  }

  const handleCancelApplication = () => {
    setShowApplicationForm(false)
    setApplyingToJob(null)
    setApplicationData({
      coverLetter: '',
      experience: '',
      availability: 'immediate',
      salaryExpectation: '',
      portfolio: '',
      additionalMessage: '',
      resume: null
    })
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setNewJob({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.job_type,
      salary: job.salary || '',
      description: job.description,
      maxApplicants: job.max_applicants || '',
      requiredSkills: job.required_skills ? job.required_skills.join(', ') : '',
      requiredEducation: job.required_education ? job.required_education.join(', ') : '',
      requiredSoftSkills: job.required_soft_skills ? job.required_soft_skills.join(', ') : '',
      minExperienceYears: job.min_experience_years || '',
      archiveAt: job.archive_at ? job.archive_at.slice(0, 16) : ''
    })
    setShowPostForm(true)
  }

  const handleUpdateJob = async (e) => {
    e.preventDefault()
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`/api/jobs/${editingJob.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          job_type: newJob.type,
          salary: newJob.salary,
          description: newJob.description,
          max_applicants: newJob.maxApplicants || null,
          required_skills: newJob.requiredSkills ? newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s) : [],
          required_education: newJob.requiredEducation ? newJob.requiredEducation.split(',').map(s => s.trim()).filter(s => s) : [],
          required_soft_skills: newJob.requiredSoftSkills ? newJob.requiredSoftSkills.split(',').map(s => s.trim()).filter(s => s) : [],
          min_experience_years: newJob.minExperienceYears ? parseInt(newJob.minExperienceYears) : 0,
          archive_at: newJob.archiveAt || null,
        }),
      })

      if (response.ok) {
        // Refresh the jobs list
        fetchJobs()
        // Reset form
        setNewJob({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          salary: '',
          description: '',
          maxApplicants: '',
          requiredSkills: '',
          requiredEducation: '',
          requiredSoftSkills: '',
          minExperienceYears: '',
          archiveAt: ''
        })
        setShowPostForm(false)
        setEditingJob(null)
        alert('Job updated successfully!')
        // Redirect to home page
        navigate('/')
      } else {
        const errorData = await response.json()
        console.error('Failed to update job:', errorData)
        alert('Failed to update job')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      alert('Error updating job')
    }
  }

  const handleArchiveJob = async (jobId) => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`/api/jobs/${jobId}/archive/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        fetchJobs() // Refresh the jobs list
        fetchArchivedJobs() // Refresh archived jobs list
        alert(data.message)
      } else {
        const errorData = await response.json()
        console.error('Failed to archive job:', errorData)
        alert('Failed to archive job')
      }
    } catch (error) {
      console.error('Error archiving job:', error)
      alert('Error archiving job')
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return
    }
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`/api/jobs/${jobId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        fetchJobs() // Refresh the jobs list
        alert('Job deleted successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to delete job:', errorData)
        alert('Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Error deleting job')
    }
  }

  const handleAnalyzeAllApplications = async (jobId, applicationCount) => {
    if (applicationCount === 0) {
      alert('No applications to analyze for this job.')
      return
    }

    if (!confirm(`Analyze all ${applicationCount} application(s) for this job? This may take a moment.`)) {
      return
    }

    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`/api/jobs/${jobId}/analyze-resumes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully analyzed ${data.length} resume(s)! Check your applications to see the results.`)
        fetchJobs() // Refresh to update any counts
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to analyze applications'}`)
      }
    } catch (error) {
      console.error('Error analyzing applications:', error)
      alert('Error analyzing applications')
    }
  }

  const handleCancelEdit = () => {
    setEditingJob(null)
    setShowPostForm(false)
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'full-time',
      salary: '',
      description: '',
      maxApplicants: '',
      requiredSkills: '',
      requiredEducation: '',
      requiredSoftSkills: '',
      minExperienceYears: '',
      archiveAt: ''
    })
  }

  return (
    <div className="main-page page-with-top-nav">
      {/* Top Navigation */}
      <TopNavigation user={user} onLogout={onLogout} />
      
      <main className="main-content">
        <div className="job-board-header">
          <div className="board-stats">
            <h2>Job Board</h2>
            <p>{jobs.length} active job postings</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-bulk-analysis" 
              onClick={() => navigate('/bulk-analysis')}
            >
              📊 Bulk Resume Analysis
            </button>
            <button 
              className="btn-post-job" 
              onClick={() => {
                if (!showPostForm) {
                  // Reset form when opening for new post
                  setNewJob({
                    title: '',
                    company: '',
                    location: '',
                    type: 'full-time',
                    salary: '',
                    description: '',
                    maxApplicants: '',
                    requiredSkills: '',
                    requiredEducation: '',
                    requiredSoftSkills: '',
                    minExperienceYears: '',
                    archiveAt: ''
                  })
                  setEditingJob(null)
                }
                setShowPostForm(!showPostForm)
              }}
            >
              {showPostForm ? 'Cancel' : '+ Post Job'}
            </button>
          </div>
        </div>

        {showPostForm && (
          <div className="job-post-form-container">
            <div className="card">
              <h3>{editingJob ? 'Edit Job' : 'Post a New Job'}</h3>
              <form onSubmit={handleSubmitJob} className="job-post-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newJob.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Frontend Developer"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      type="text"
                      name="company"
                      value={newJob.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Tech Corp"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={newJob.location}
                      onChange={handleInputChange}
                      placeholder="e.g. New York, NY or Remote"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Type *</label>
                    <select
                      name="type"
                      value={newJob.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={newJob.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. $70,000 - $90,000 or $50/hour"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Applicants</label>
                    <select
                      name="maxApplicants"
                      value={newJob.maxApplicants}
                      onChange={handleInputChange}
                    >
                      <option value="">No limit</option>
                      <option value="5">5 applicants</option>
                      <option value="10">10 applicants</option>
                      <option value="15">15 applicants</option>
                      <option value="20">20 applicants</option>
                      <option value="25">25 applicants</option>
                      <option value="50">50 applicants</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Description *</label>
                  <textarea
                    name="description"
                    value={newJob.description}
                    onChange={handleInputChange}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows="4"
                    required
                  />
                </div>

                {/* Resume Analysis Requirements */}
                <div className="form-section">
                  <h4>
                    📊 Resume Analysis Criteria *
                  </h4>
                  <p>
                    Define specific requirements for automated resume screening. This ensures accurate candidate matching.
                  </p>
                  
                  <div className="form-group">
                    <label>Required Skills *</label>
                    <input
                      type="text"
                      name="requiredSkills"
                      value={newJob.requiredSkills}
                      onChange={handleInputChange}
                      placeholder="e.g., Python, React, Marketing, SEO, Excel (comma-separated)"
                      required
                    />
                    <small>
                      Separate skills with commas
                    </small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Required Education *</label>
                      <input
                        type="text"
                        name="requiredEducation"
                        value={newJob.requiredEducation}
                        onChange={handleInputChange}
                        placeholder="e.g., Bachelor, Computer Science, MBA"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Minimum Years of Experience *</label>
                      <input
                        type="number"
                        name="minExperienceYears"
                        value={newJob.minExperienceYears}
                        onChange={handleInputChange}
                        placeholder="e.g., 3"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Required Soft Skills *</label>
                    <input
                      type="text"
                      name="requiredSoftSkills"
                      value={newJob.requiredSoftSkills}
                      onChange={handleInputChange}
                      placeholder="e.g., Communication, Leadership, Teamwork"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Auto-Archive Date & Time (Optional)</label>
                    <input
                      type="datetime-local"
                      name="archiveAt"
                      value={newJob.archiveAt}
                      onChange={handleInputChange}
                      placeholder="Select date and time to archive"
                    />
                    <small style={{color: '#666', fontSize: '0.875rem'}}>
                      Job will be automatically archived at this date and time
                    </small>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={editingJob ? handleCancelEdit : () => setShowPostForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Form */}
        {showApplicationForm && applyingToJob && (
          <div className="form-overlay">
            <div className="card application-form-card">
              <h3>Apply to {applyingToJob.title} at {applyingToJob.company}</h3>
              <form onSubmit={handleSubmitApplication} className="job-post-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Cover Letter *</label>
                    <textarea
                      name="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={handleApplicationInputChange}
                      placeholder="Tell us why you're perfect for this role..."
                      rows="4"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Relevant Experience</label>
                    <textarea
                      name="experience"
                      value={applicationData.experience}
                      onChange={handleApplicationInputChange}
                      placeholder="Describe your relevant work experience, projects, or skills..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Availability *</label>
                    <select
                      name="availability"
                      value={applicationData.availability}
                      onChange={handleApplicationInputChange}
                      required
                    >
                      <option value="immediate">Available Immediately</option>
                      <option value="2-weeks">2 weeks notice</option>
                      <option value="1-month">1 month notice</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Salary Expectation</label>
                    <input
                      type="text"
                      name="salaryExpectation"
                      value={applicationData.salaryExpectation}
                      onChange={handleApplicationInputChange}
                      placeholder="e.g. $70,000 or Negotiable"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Portfolio/LinkedIn URL</label>
                    <input
                      type="url"
                      name="portfolio"
                      value={applicationData.portfolio}
                      onChange={handleApplicationInputChange}
                      placeholder="https://linkedin.com/in/yourprofile or portfolio link"
                    />
                  </div>
                  <div className="form-group">
                    <label>Upload Resume *</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="file-input"
                      required
                    />
                    <small className="file-help">
                      Upload PDF or Word document (max 5MB)
                    </small>
                    <small className="file-help" style={{ display: 'block', marginTop: '5px', color: '#ff9800' }}>
                      ⚠️ <strong>Important:</strong> PDFs must be text-based (not scanned images or photos). If you have a photo/scan of your resume, please convert it to a text-based PDF first.
                    </small>
                    {applicationData.resume && (
                      <div className="file-selected">
                        ✓ {applicationData.resume.name} ({(applicationData.resume.size / 1024).toFixed(1)}KB)
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Additional Message</label>
                  <textarea
                    name="additionalMessage"
                    value={applicationData.additionalMessage}
                    onChange={handleApplicationInputChange}
                    placeholder="Any additional information you'd like to share..."
                    rows="2"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Submit Application
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCancelApplication}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}

        {/* Job Type Tabs */}
        <div className="job-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Jobs
          </button>
          <button 
            className={`tab ${activeTab === 'full-time' ? 'active' : ''}`}
            onClick={() => setActiveTab('full-time')}
          >
            Full-Time
          </button>
          <button 
            className={`tab ${activeTab === 'part-time' ? 'active' : ''}`}
            onClick={() => setActiveTab('part-time')}
          >
            Part-Time
          </button>
          <button 
            className={`tab ${activeTab === 'contract' ? 'active' : ''}`}
            onClick={() => setActiveTab('contract')}
          >
            Contract
          </button>
          <button 
            className={`tab ${activeTab === 'internship' ? 'active' : ''}`}
            onClick={() => setActiveTab('internship')}
          >
            Internship
          </button>
          {/* Only show Archived tab if user has archived jobs */}
          {archivedJobs.length > 0 && (
            <button 
              className={`tab ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              📦 Archived ({archivedJobs.length})
            </button>
          )}
        </div>

        <div className="jobs-list">
          {activeTab === 'archived' ? (
            // Show archived jobs
            archivedJobs.length === 0 ? (
              <div className="no-jobs">
                <p>No archived jobs.</p>
              </div>
            ) : (
              archivedJobs.map(job => (
                <div key={job.id} className="job-card archived-job">
                  <div className="job-header">
                    <div className="job-title-section">
                      <h3 className="job-title">{job.title} <span className="archived-badge">ARCHIVED</span></h3>
                      <p className="job-company">{job.company}</p>
                    </div>
                    <div className="job-meta">
                      <span className={`job-type ${job.job_type}`}>{job.job_type}</span>
                      <span className="job-posted">Posted {job.posted_at_display}</span>
                    </div>
                  </div>
                  
                  <div className="job-details">
                    <div className="job-info">
                      <span className="job-location">📍 {job.location}</span>
                      {job.salary && <span className="job-salary">💰 {job.salary}</span>}
                      <span className="job-applications">
                        👥 {job.application_status_display}
                      </span>
                    </div>
                    
                    <p className="job-description">{job.description}</p>
                    
                    <div className="job-footer">
                      <span className="posted-by">Posted by: {job.posted_by_username}</span>
                      <div className="job-actions">
                        <button 
                          className="btn-unarchive"
                          onClick={() => handleArchiveJob(job.id)}
                        >
                          📤 Unarchive
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            // Show active jobs
            jobs.filter(job => activeTab === 'all' || job.job_type === activeTab).length === 0 ? (
              <div className="no-jobs">
                <p>{activeTab === 'all' ? 'No job postings yet. Be the first to post a job!' : `No ${activeTab} jobs available.`}</p>
              </div>
            ) : (
              jobs.filter(job => activeTab === 'all' || job.job_type === activeTab).map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-title-section">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  <div className="job-meta">
                    <span className={`job-type ${job.job_type}`}>{job.job_type}</span>
                    <span className="job-posted">Posted {job.posted_at_display}</span>
                  </div>
                </div>
                
                <div className="job-details">
                  <div className="job-info">
                    <span className="job-location">📍 {job.location}</span>
                    {job.salary && <span className="job-salary">💰 {job.salary}</span>}
                    <span className="job-applications">
                      👥 {job.application_status_display}
                      {!job.is_accepting_applications && (
                        <span className="job-full-badge">FULL</span>
                      )}
                    </span>
                  </div>
                  
                  <p className="job-description">{job.description}</p>
                  
                  {job.requirements && (
                    <div className="job-requirements">
                      <strong>Requirements:</strong> {job.requirements}
                    </div>
                  )}
                  
                  <div className="job-footer">
                    <span className="posted-by">Posted by: {job.posted_by_username}</span>
                    <div className="job-actions">
                      {job.posted_by_username === user.username ? (
                        // Show Edit/Archive/Delete buttons for own jobs
                        <>
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditJob(job)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-archive"
                            onClick={() => handleArchiveJob(job.id)}
                          >
                            📦 Archive
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        // Show Apply/Save buttons for other jobs
                        <>
                          <button 
                            className={`btn-apply ${!job.is_accepting_applications ? 'btn-disabled' : ''}`}
                            onClick={() => handleApplyToJob(job.id)}
                            disabled={!job.is_accepting_applications}
                            title={!job.is_accepting_applications ? 'This job has reached its maximum number of applicants' : 'Apply to this job'}
                          >
                            {job.is_accepting_applications ? 'Apply Now' : 'Position Full'}
                          </button>
                          <button className="btn-save">Save</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
            )
          )}
        </div>
      </main>
      
    </div>
  )
}