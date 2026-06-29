import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/authService';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
          <span>Library Management</span>
        </div>
        <div className="dashboard-user">
          <span className="user-greeting">Welcome, <strong>{user.fullName}</strong></span>
          <span className="user-role">{user.role}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      <main className="dashboard-main">
        <h1>Dashboard</h1>
        <p>You are successfully authenticated with JWT!</p>
      </main>
    </div>
  );
}

export default Dashboard;
