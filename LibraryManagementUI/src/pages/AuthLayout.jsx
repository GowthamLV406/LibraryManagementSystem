import { Outlet, Link, useLocation } from 'react-router-dom';
import './AuthLayout.css';

function AuthLayout() {
  const location = useLocation();
  const isSignIn = location.pathname === '/' || location.pathname === '/signin';

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6" />
              <path d="M8 11h8" />
            </svg>
          </div>
          <h1>Library Management</h1>
          <p className="auth-tagline">
            Your gateway to a world of knowledge. Manage, discover, and explore
            thousands of books at your fingertips.
          </p>
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">📚</span>
              <span>Browse & search books</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔖</span>
              <span>Track your reading</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⭐</span>
              <span>Rate & review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-tabs">
            <Link
              to="/signin"
              className={`auth-tab ${isSignIn ? 'active' : ''}`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={`auth-tab ${!isSignIn ? 'active' : ''}`}
            >
              Sign Up
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
