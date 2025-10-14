import React from "react";

const ProfileCard = ({ profile, onAccept, onReject }) => {
  return (
    <div style={styles.card}>
      <h2 style={styles.name}>{profile.name}</h2>
      <div style={styles.skills}>
        {profile.skills.map((skill, i) => (
          <span key={i} style={styles.tag}>
            {skill}
          </span>
        ))}
      </div>
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

const styles = {
  card: {
    border: "1px solid #d0d7de",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  name: {
    fontSize: "24px",
    marginBottom: "12px",
    color: "#24292e",
  },
  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },
  tag: {
    fontSize: "16px",
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#eaeef2",
    color: "#24292e",
    border: "1px solid #d0d7de",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  button: {
    flex: 1,
    margin: "0 5px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default ProfileCard;