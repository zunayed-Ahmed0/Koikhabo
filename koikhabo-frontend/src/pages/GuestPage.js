import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './GuestPage.css';

const GuestPage = () => {
  const [loading, setLoading] = useState(false);
  const { startGuestSession } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleStartGuestSession = async () => {
    setLoading(true);

    try {
      const result = await startGuestSession();

      if (result.success) {
        addToast('Guest session started! You can now browse and order.', 'success');
        navigate('/restaurants');
      } else {
        addToast(result.error || 'Failed to start guest session', 'error');
      }
    } catch (error) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-container">
      <div className="guest-card">
        <div className="guest-header">
          <Link to="/" className="back-btn">← Back to Home</Link>
          <h1>🎭 Guest Access</h1>
          <p>Browse and order without creating an account</p>
        </div>

        <div className="guest-features">
          <h3>What you can do as a guest:</h3>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🏪</span>
              <div>
                <strong>Browse Restaurants</strong>
                <p>Explore all 35+ restaurants in Dhaka</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <div>
                <strong>Search & Filter</strong>
                <p>Find restaurants by name, cuisine, or location</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <div>
                <strong>View Menus</strong>
                <p>See detailed menus with prices and descriptions</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <div>
                <strong>Add to Cart</strong>
                <p>Build your order with multiple items</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <div>
                <strong>Place Orders</strong>
                <p>Complete checkout with phone verification</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🪑</span>
              <div>
                <strong>Book Seats</strong>
                <p>Reserve tables at restaurants</p>
              </div>
            </div>
          </div>
        </div>

        <div className="guest-checkout-info">
          <h3>At checkout, you'll need:</h3>
          <div className="checkout-requirements">
            <div className="requirement">
              <span className="req-icon">📱</span>
              <div>
                <strong>Valid BD Phone Number</strong>
                <p>Required for order confirmation and delivery</p>
                <small>Format: 01XXXXXXXXX (11 digits)</small>
              </div>
            </div>
            <div className="requirement optional">
              <span className="req-icon">📧</span>
              <div>
                <strong>Email Address (Optional)</strong>
                <p>Provide email to save order history on server</p>
                <small>Without email, history is saved locally only</small>
              </div>
            </div>
          </div>
        </div>

        <div className="guest-limitations">
          <h3>Guest limitations:</h3>
          <div className="limitations-list">
            <div className="limitation">
              <span className="limit-icon">❌</span>
              <span>No reward points earned</span>
            </div>
            <div className="limitation">
              <span className="limit-icon">❌</span>
              <span>No saved preferences</span>
            </div>
            <div className="limitation">
              <span className="limit-icon">❌</span>
              <span>No order history (unless email provided)</span>
            </div>
            <div className="limitation">
              <span className="limit-icon">❌</span>
              <span>Cannot leave reviews</span>
            </div>
          </div>
        </div>

        <div className="guest-actions">
          <button 
            onClick={handleStartGuestSession}
            className="start-guest-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Starting Session...
              </>
            ) : (
              <>
                🎭 Start Guest Session
              </>
            )}
          </button>
          
          <div className="guest-alternatives">
            <p>Want the full experience?</p>
            <Link to="/login" className="create-account-btn">
              👤 Create Account Instead
            </Link>
          </div>
        </div>

        <div className="guest-footer">
          <div className="privacy-note">
            <h4>🔒 Privacy & Data</h4>
            <p>
              As a guest, we only collect the minimum information needed to process your order. 
              Your phone number is used for delivery coordination only. If you provide an email, 
              we'll save your order history to help with future orders.
            </p>
          </div>
          
          <div className="session-info">
            <h4>📱 Session Details</h4>
            <p>
              Your guest session will remain active until you close your browser or clear your data. 
              You can place multiple orders during this session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPage;
