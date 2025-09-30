import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !password.trim()) {
      addToast('Please enter both name and password', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginAdmin(name, password);
      
      if (result.success) {
        addToast(`Welcome, ${result.data.admin_name}!`, 'success');
        navigate('/admin-dashboard');
      } else {
        addToast(result.error || 'Invalid credentials', 'error');
      }
    } catch (error) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <Link to="/" className="back-btn">← Back to Home</Link>
          <h1>⚙️ Admin Access</h1>
          <p>Administrative login for authorized personnel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Admin Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter admin name"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Admin Sign In'
            )}
          </button>
        </form>

        <div className="admin-capabilities">
          <h3>Admin Dashboard Features</h3>
          <div className="capabilities-grid">
            <div className="capability">
              <span className="capability-icon">👥</span>
              <div>
                <strong>User Management</strong>
                <p>View all registered users and their profiles</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability-icon">📋</span>
              <div>
                <strong>Order History</strong>
                <p>Access complete order history for all users</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability-icon">🪑</span>
              <div>
                <strong>Booking Management</strong>
                <p>View and manage all seat reservations</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability-icon">💳</span>
              <div>
                <strong>Payment Analytics</strong>
                <p>Monitor payment methods and transaction status</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability-icon">⭐</span>
              <div>
                <strong>Review System</strong>
                <p>Oversee customer reviews and ratings</p>
              </div>
            </div>
            <div className="capability">
              <span className="capability-icon">📊</span>
              <div>
                <strong>System Statistics</strong>
                <p>View platform usage and performance metrics</p>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-security">
          <h3>🔒 Security Notice</h3>
          <div className="security-info">
            <div className="security-item">
              <span className="security-icon">🔐</span>
              <div>
                <strong>Authorized Access Only</strong>
                <p>This area is restricted to authorized administrators</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">👁️</span>
              <div>
                <strong>Activity Monitoring</strong>
                <p>All admin actions are logged and monitored</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">⏰</span>
              <div>
                <strong>Session Management</strong>
                <p>Admin sessions expire automatically for security</p>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-alternatives">
          <div className="divider">
            <span>Not an admin?</span>
          </div>
          
          <div className="alternative-options">
            <Link to="/login" className="alt-option user-option">
              <span className="alt-icon">👤</span>
              <div>
                <strong>User Login</strong>
                <p>Sign in as a regular user</p>
              </div>
            </Link>
            
            <Link to="/guest" className="alt-option guest-option">
              <span className="alt-icon">🎭</span>
              <div>
                <strong>Guest Access</strong>
                <p>Browse without an account</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="admin-footer">
          <div className="contact-info">
            <h4>Need Help?</h4>
            <p>
              If you're an authorized administrator having trouble accessing your account, 
              please contact the system administrator or IT support.
            </p>
          </div>
          
          <div className="compliance-note">
            <p>
              <strong>Data Privacy:</strong> Admin access includes viewing personal user data. 
              Please ensure compliance with privacy policies and data protection regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
