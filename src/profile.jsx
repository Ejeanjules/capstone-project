import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic
    navigate('/login');
  };

  return (
    <div>
      <h1>User Profile</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile; 

