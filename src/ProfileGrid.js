import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import ProfileCard from "./ProfileCard";

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

// Helper to generate a random profile
const generateProfile = (id) => {
  const numSkills = Math.floor(Math.random() * 7) + 3; // 3–9 skills
  const shuffled = [...skillPool].sort(() => 0.5 - Math.random());
  return {
    name: `Profile ${id}`,
    skills: shuffled.slice(0, numSkills),
  };
};

const ProfileGrid = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [devMode, setDevMode] = useState(false); // toggle off by default
  const [profileCount, setProfileCount] = useState(8); // default 8
  const [profiles, setProfiles] = useState(
    Array.from({ length: 8 }, (_, i) => generateProfile(i + 1))
  );

  const handleReject = (index) => {
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const handleAccept = (profile, index) => {
    alert(`${profile.name} accepted!`);
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const handleRefresh = () => {
    setProfiles(Array.from({ length: profileCount }, (_, i) => generateProfile(i + 1)));
  };

  const handleAddMore = () => {
    const currentLength = profiles.length;
    if (currentLength < 50) {
      const newProfiles = Array.from(
        { length: Math.min(5, 50 - currentLength) }, // add up to 5 at a time
        (_, i) => generateProfile(currentLength + i + 1)
      );
      setProfiles([...profiles, ...newProfiles]);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>JobBoard Pro - Find Candidates</h1>
        <nav style={styles.nav}>
          <button 
            style={styles.navBtn} 
            onClick={() => navigate('/')}
          >
            Jobs
          </button>
          <button 
            style={{...styles.navBtn, ...styles.navActive}} 
          >
            Find Candidates
          </button>
        </nav>
        <div style={styles.userArea}>
          <span style={styles.userInfo}>Welcome, {user?.username}</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Log out</button>
        </div>
      </header>

      {/* Toggle for DEV MODE */}
      <div style={styles.devToggle}>
        <label>
          <input
            type="checkbox"
            checked={devMode}
            onChange={() => setDevMode(!devMode)}
          />{" "}
          DEV MODE
        </label>
      </div>

      {devMode && (
        <div style={styles.devPanel}>
          <label>
            Number of Profiles (max 50):{" "}
            <input
              type="number"
              min="1"
              max="50"
              value={profileCount}
              onChange={(e) =>
                setProfileCount(Math.min(50, Math.max(1, Number(e.target.value))))
              }
            />
          </label>
          <button style={styles.devButton} onClick={handleRefresh}>
            Refresh Profiles
          </button>
          <button style={styles.devButton} onClick={handleAddMore}>
            Add More Profiles
          </button>
        </div>
      )}

      <div style={styles.grid}>
        {profiles.map((profile, index) => (
          <ProfileCard
            key={index}
            profile={profile}
            onAccept={() => handleAccept(profile, index)}
            onReject={() => handleReject(index)}
          />
        ))}
      </div>
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
  devToggle: {
    backgroundColor: "#fff",
    padding: "10px 20px",
    margin: "0 20px 10px",
    borderRadius: "8px",
  },
  devPanel: {
    backgroundColor: "#fff",
    padding: "10px 20px",
    margin: "0 20px 20px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
};

export default ProfileGrid;