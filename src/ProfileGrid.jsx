import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ProfileCard from "./ProfileCard.jsx";
import TopNavigation from './BottomNavigation';

// A pool of sample skills to randomly assign
const skillPool = [
  "Java", "Python", "MySQL", "React", "Node.js", "Backend", "Express",
  "MongoDB", "TypeScript", "GraphQL", "Communication", "Leadership",
  "Agile", "Scrum", "Project Management", "C++", "Algorithms",
  "Data Structures", "System Design", "Linux", "UI/UX", "Figma", "CSS",
  "Accessibility", "Responsive Design", "Prototyping", "Design Systems",
  "AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Cloud Security",
  "Linux Admin", "Networking", "Machine Learning", "Pandas", "TensorFlow",
  "Data Visualization", "Statistics", "NLP", "SQL", "PostgreSQL", "Django",
  "REST Framework", "Authentication", "Testing"
];

// Custom ApplicationCard component for job applications
const ApplicationCard = ({ profile, onAccept, onReject }) => {
  return (
    <div style={styles.card}>
      <div style={styles.applicationHeader}>
        <h2 style={styles.name}>{profile.name}</h2>
        <div style={styles.applicationMeta}>
          <span style={styles.email}>{profile.email}</span>
          <span style={styles.appliedDate}>Applied {profile.appliedAt}</span>
        </div>
      </div>
      
      <div style={styles.jobInfo}>
        <strong>Applied for:</strong> {profile.jobTitle} at {profile.company}
      </div>
      
      {profile.message && (
        <div style={styles.message}>
          <strong>Message:</strong>
          <p>{profile.message}</p>
        </div>
      )}
      
      <div style={styles.actions}>
        <button
          style={{ ...styles.button, backgroundColor: "#2ea44f" }}
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          style={{ ...styles.button, backgroundColor: "#d73a49" }}
          onClick={onReject}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

const ProfileGrid = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [myJobs, setMyJobs] = useState([]);

  // Fetch applications for user's job postings
  useEffect(() => {
    fetchApplications();
    fetchMyJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const response = await fetch('http://127.0.0.1:8000/api/jobs/applications/', {
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
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

  const fetchMyJobs = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const response = await fetch('http://127.0.0.1:8000/api/jobs/my-jobs/', {
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyJobs(data);
      }
    } catch (error) {
      console.error('Error fetching my jobs:', error);
    }
  };

  const handleAccept = async (application) => {
    await updateApplicationStatus(application.id, 'accepted');
    setApplications(applications.filter(app => app.id !== application.id));
  };

  const handleReject = async (application) => {
    await updateApplicationStatus(application.id, 'rejected');
    setApplications(applications.filter(app => app.id !== application.id));
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/applications/${applicationId}/status/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        alert(`Application ${status}!`);
      } else {
        console.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  // Filter applications by selected job
  const filteredApplications = selectedJob === 'all' 
    ? applications 
    : applications.filter(app => app.job === parseInt(selectedJob));

  // Convert application data to profile format for ProfileCard
  const profiles = filteredApplications.map(application => ({
    id: application.id,
    name: application.applicant_username,
    email: application.applicant_email,
    skills: ['Applied to', application.job_title, 'at', application.job_company], // Mock skills for now
    jobTitle: application.job_title,
    company: application.job_company,
    appliedAt: new Date(application.applied_at).toLocaleDateString(),
    message: application.message,
    application: application
  }));

  return (
    <div style={{...styles.page, paddingTop: '80px'}}>
      {/* Top Navigation */}
      <TopNavigation user={user} onLogout={onLogout} />

      {/* Job Filter */}
      <div style={styles.filterPanel}>
        <label style={styles.filterLabel}>
          Filter by Job: 
          <select 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Jobs</option>
            {myJobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} at {job.company}
              </option>
            ))}
          </select>
        </label>
        <div style={styles.statsInfo}>
          {filteredApplications.length} applicant{filteredApplications.length !== 1 ? 's' : ''} 
          {selectedJob !== 'all' && myJobs.length > 0 && (
            <span> for {myJobs.find(job => job.id === parseInt(selectedJob))?.title}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading applications...</div>
      ) : profiles.length === 0 ? (
        <div style={styles.noApplications}>
          <h3>No Applications Yet</h3>
          <p>
            {selectedJob === 'all' 
              ? "You haven't received any job applications yet. Post some jobs to start receiving applications!"
              : "No applications for this specific job yet."
            }
          </p>
          <button 
            style={styles.devButton} 
            onClick={() => navigate('/')}
          >
            Post a Job
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {profiles.map((profile) => (
            <ApplicationCard
              key={profile.id}
              profile={profile}
              onAccept={() => handleAccept(profile.application)}
              onReject={() => handleReject(profile.application)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f6f8fa",
    minHeight: "100vh",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: "16px 24px",
    marginBottom: "20px",
    borderBottom: "1px solid #e1e4e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#24292e",
    margin: 0,
    fontSize: "28px",
    fontWeight: "600",
  },
  nav: {
    display: "flex",
    gap: "12px",
  },
  navBtn: {
    padding: "8px 16px",
    border: "1px solid #d0d7de",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#24292e",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  navActive: {
    backgroundColor: "#0969da",
    color: "#ffffff",
    borderColor: "#0969da",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    color: "#656d76",
    fontSize: "14px",
  },
  logoutBtn: {
    padding: "6px 12px",
    border: "1px solid #d0d7de",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#24292e",
    cursor: "pointer",
    fontSize: "14px",
  },
  filterPanel: {
    backgroundColor: "#fff",
    padding: "15px 20px",
    margin: "0 20px 20px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #e1e4e8",
  },
  filterLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  filterSelect: {
    padding: "6px 10px",
    border: "1px solid #d0d7de",
    borderRadius: "6px",
    fontSize: "14px",
  },
  analyzeAllButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#0969da",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease-in-out",
  },
  statsInfo: {
    fontSize: "14px",
    color: "#656d76",
    fontWeight: "500",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "16px",
    color: "#656d76",
  },
  noApplications: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#fff",
    margin: "20px",
    borderRadius: "8px",
    border: "1px solid #e1e4e8",
  },
  applicationHeader: {
    marginBottom: "12px",
  },
  name: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0969da",
    margin: "0 0 8px 0",
    textTransform: "capitalize",
    letterSpacing: "0.3px",
  },
  applicationMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginTop: "8px",
  },
  email: {
    fontSize: "14px",
    color: "#656d76",
  },
  appliedDate: {
    fontSize: "12px",
    color: "#8b949e",
  },
  jobInfo: {
    fontSize: "14px",
    padding: "10px",
    backgroundColor: "#f6f8fa",
    borderRadius: "6px",
    marginBottom: "12px",
    color: "#24292e",
  },
  message: {
    fontSize: "14px",
    marginBottom: "15px",
  },
  devButton: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#0366d6",
    color: "#fff",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    border: "1px solid #e1e4e8",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.2s ease-in-out",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },
  button: {
    flex: 1,
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "opacity 0.2s ease-in-out",
  },
};

export default ProfileGrid;