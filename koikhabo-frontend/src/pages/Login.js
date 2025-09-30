import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UniversitySelector from '../components/UniversitySelector';
import './Login.css';

const Login = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser, selectUniversity } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }

    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    if (!selectedUniversity) {
      addToast('Please select your institution', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', { email, fullName, university: selectedUniversity });
      const result = await loginUser(email, fullName);
      console.log('Login result:', result);

      if (result.success) {
        // Save university selection
        selectUniversity(selectedUniversity);
        addToast(`Welcome to Koikhabo, ${fullName}! Logged in as student of ${selectedUniversity.short_name}`, 'success');
        console.log('Navigating to restaurants...');
        navigate('/restaurants');
      } else {
        console.error('Login failed:', result.error);
        addToast(result.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Link to="/" className="back-btn">← Back to Home</Link>
          <h1>👤 User Login</h1>
          <p>Sign in with your email to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={loading}
            />
            <small className="form-help">
              No password required - we'll create an account if you're new!
            </small>
          </div>

          <UniversitySelector
            onSelect={setSelectedUniversity}
            selectedUniversity={selectedUniversity}
          />

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-benefits">
          <h3>Why create an account?</h3>
          <div className="benefits-grid">
            <div className="benefit">
              <span className="benefit-icon">📋</span>
              <div>
                <strong>Order History</strong>
                <p>Track all your past orders and reorder favorites</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🏆</span>
              <div>
                <strong>Reward Points</strong>
                <p>Earn 1 point per ৳100 spent, redeem for 20% off</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🎓</span>
              <div>
                <strong>Institution Link</strong>
                <p>Connect to your university for nearby restaurants</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">📍</span>
              <div>
                <strong>Area Preferences</strong>
                <p>Save your preferred delivery areas</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">⭐</span>
              <div>
                <strong>Reviews & Ratings</strong>
                <p>Rate restaurants and help others decide</p>
              </div>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🎯</span>
              <div>
                <strong>Personalized Experience</strong>
                <p>Get recommendations based on your preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-alternatives">
          <div className="divider">
            <span>Or</span>
          </div>
          
          <div className="alternative-options">
            <Link to="/guest" className="alt-option guest-option">
              <span className="alt-icon">🎭</span>
              <div>
                <strong>Continue as Guest</strong>
                <p>Quick ordering without account creation</p>
              </div>
            </Link>
            
            <Link to="/admin-login" className="alt-option admin-option">
              <span className="alt-icon">⚙️</span>
              <div>
                <strong>Admin Access</strong>
                <p>Administrative login for staff</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="login-footer">
          <p>
            By signing in, you agree to our terms of service and privacy policy.
            Your email is only used for account management and order notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
