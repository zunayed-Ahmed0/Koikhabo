import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkAPIHealth, getAPIHealthStatus } from '../utils/api';
import './Home.css';

const Home = () => {
  const { getWelcomeMessage, isLoggedIn, user, guestSession, admin } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    setWelcomeMessage(getWelcomeMessage());
    checkHealthStatus();
  }, [getWelcomeMessage]);

  const checkHealthStatus = async () => {
    try {
      const status = await checkAPIHealth();
      setHealthStatus(status);
    } catch (error) {
      setHealthStatus('error');
    }
  };

  const getHealthPill = () => {
    switch (healthStatus) {
      case 'healthy':
        return <span className="health-pill healthy">🟢 API Online</span>;
      case 'error':
        return <span className="health-pill error">🔴 API Offline</span>;
      default:
        return <span className="health-pill checking">🟡 Checking...</span>;
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">🍽️ Koikhabo</h1>
        <p className="home-subtitle">Dhaka's Premier Food Delivery Platform</p>
        <div className="health-status">
          {getHealthPill()}
        </div>
      </div>

      <div className="welcome-section">
        <div className="welcome-message">
          {welcomeMessage}
        </div>
      </div>

      <div className="role-selection">
        <h2>Choose Your Experience</h2>
        <div className="role-cards">
          
          {/* Login Card */}
          <Link to="/login" className="role-card login-card">
            <div className="role-icon">👤</div>
            <h3>Login</h3>
            <p>Sign in with your email to access your account, order history, and rewards</p>
            <div className="role-features">
              <span>✓ Order History</span>
              <span>✓ Reward Points</span>
              <span>✓ Saved Preferences</span>
            </div>
          </Link>

          {/* User Card (if logged in) */}
          {user && (
            <Link to="/restaurants" className="role-card user-card active">
              <div className="role-icon">🌟</div>
              <h3>Welcome, {user.name || user.email}</h3>
              <p>Continue to browse restaurants and place orders</p>
              <div className="role-features">
                <span>🏆 {user.reward_points} Points</span>
                <span>📍 {user.preferred_areas?.length || 0} Areas</span>
                <span>🎓 {user.institution || 'No Institution'}</span>
              </div>
            </Link>
          )}

          {/* Guest Card */}
          <Link to="/guest" className="role-card guest-card">
            <div className="role-icon">🎭</div>
            <h3>Guest</h3>
            <p>Browse and order without creating an account</p>
            <div className="role-features">
              <span>✓ Quick Ordering</span>
              <span>✓ No Registration</span>
              <span>✓ Phone Verification</span>
            </div>
          </Link>

          {/* Admin Card */}
          <Link to="/admin-login" className="role-card admin-card">
            <div className="role-icon">⚙️</div>
            <h3>Admin</h3>
            <p>Administrative access to view user histories and manage the platform</p>
            <div className="role-features">
              <span>✓ User Management</span>
              <span>✓ Order Analytics</span>
              <span>✓ System Overview</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Current Session Info */}
      {isLoggedIn() && (
        <div className="current-session">
          <h3>Current Session</h3>
          {user && (
            <div className="session-info user-session">
              <span className="session-type">👤 User Session</span>
              <span className="session-details">{user.email}</span>
              <Link to="/restaurants" className="continue-btn">Continue Shopping</Link>
            </div>
          )}
          {guestSession && (
            <div className="session-info guest-session">
              <span className="session-type">🎭 Guest Session</span>
              <span className="session-details">ID: {guestSession.session_id.slice(0, 8)}...</span>
              <Link to="/restaurants" className="continue-btn">Continue Shopping</Link>
            </div>
          )}
          {admin && (
            <div className="session-info admin-session">
              <span className="session-type">⚙️ Admin Session</span>
              <span className="session-details">{admin.admin_name}</span>
              <Link to="/admin-dashboard" className="continue-btn">Go to Dashboard</Link>
            </div>
          )}
        </div>
      )}

      <div className="home-footer">
        <div className="feature-highlights">
          <div className="feature">
            <span className="feature-icon">🏪</span>
            <span>60+ Restaurants</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🍱</span>
            <span>Student Sets Available</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🚚</span>
            <span>Fast Delivery</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💳</span>
            <span>Multiple Payment Options</span>
          </div>
        </div>
        
        <div className="app-info">
          <p>Koikhabo v1.0.0 - Serving Dhaka with Love</p>
          <p>🌍 Covering all major areas in Dhaka</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
