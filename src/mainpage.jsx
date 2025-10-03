import { useState, useEffect } from 'react'

export default function MainPage({ user, onLogout }) {
  const [jobs, setJobs] = useState([])
  const [showPostForm, setShowPostForm] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    requirements: ''
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
          requirements: ''
        })
        setShowPostForm(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to post job:', errorData)
      }
    } catch (error) {
      console.error('Error posting job:', error)
    }
  }

  return (
    <div className="main-page">
      <header className="app-header">
        <h1>JobBoard Pro</h1>
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
              <h3>Post a New Job</h3>
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
                  <button type="submit" className="btn-primary">Post Job</button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowPostForm(false)}
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
                      <button className="btn-apply">Apply Now</button>
                      <button className="btn-save">Save</button>
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