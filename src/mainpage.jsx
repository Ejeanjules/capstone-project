import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MainPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
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
    requirements: '',
    maxApplicants: ''
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
  }, [])

  const fetchJobs = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch('http://127.0.0.1:8000/api/jobs/', {
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
      const response = await fetch('http://127.0.0.1:8000/api/jobs/', {
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
          requirements: newJob.requirements,
          max_applicants: newJob.maxApplicants || null,
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
          requirements: '',
          maxApplicants: ''
        })
        setShowPostForm(false)
        alert('Job posted successfully!')
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
      let resumeInfo = ''
      if (applicationData.resume) {
        resumeInfo = `\n\nResume: ${applicationData.resume.name} (${(applicationData.resume.size / 1024).toFixed(1)}KB)`
      }
      
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${applyingToJob.id}/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Cover Letter: ${applicationData.coverLetter}\n\nExperience: ${applicationData.experience}\n\nAvailability: ${applicationData.availability}\n\nSalary Expectation: ${applicationData.salaryExpectation}\n\nPortfolio: ${applicationData.portfolio}\n\nAdditional Message: ${applicationData.additionalMessage}${resumeInfo}`
        }),
      })

      if (response.ok) {
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
      requirements: job.requirements || '',
      maxApplicants: job.max_applicants || ''
    })
    setShowPostForm(true)
  }

  const handleUpdateJob = async (e) => {
    e.preventDefault()
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${editingJob.id}/`, {
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
          requirements: newJob.requirements,
          max_applicants: newJob.maxApplicants || null,
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
          requirements: '',
          maxApplicants: ''
        })
        setShowPostForm(false)
        setEditingJob(null)
        alert('Job updated successfully!')
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

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return
    }
    
    try {
      const auth = JSON.parse(localStorage.getItem('auth'))
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}/`, {
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
      requirements: '',
      maxApplicants: ''
    })
  }

  return (
    <div className="main-page">
      <header className="app-header">
        <h1>Genie JobBoard</h1>
        <nav className="main-nav">
          <button 
            className="nav-btn active" 
            onClick={() => navigate('/')}
          >
            Jobs
          </button>
          <button 
            className="nav-btn" 
            onClick={() => navigate('/profiles')}
          >
            your applicants
          </button>
        </nav>
        <div className="user-area">
          <span className="user-info">Welcome, {user.username}</span>
          <button onClick={onLogout} className="btn-logout">Log out</button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="job-board-header">
          <div className="board-stats">
            <h2>Job Board</h2>
            <p>{jobs.length} active job postings</p>
          </div>
          <button 
            className="btn-post-job" 
            onClick={() => setShowPostForm(!showPostForm)}
          >
            {showPostForm ? 'Cancel' : '+ Post Job'}
          </button>
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

                <div className="form-group">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    value={newJob.requirements}
                    onChange={handleInputChange}
                    placeholder="List required skills, experience, qualifications..."
                    rows="3"
                  />
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

        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="no-jobs">
              <p>No job postings yet. Be the first to post a job!</p>
            </div>
          ) : (
            jobs.map(job => (
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
                        // Show Edit/Delete buttons for own jobs
                        <>
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditJob(job)}
                          >
                            Edit
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
          )}
        </div>
      </main>
    </div>
  )
}