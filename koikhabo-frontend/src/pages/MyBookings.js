import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const { user, guestSession, getCurrentUserId } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();

      if (!userId) {
        setBookings([]);
        return;
      }

      let url = `${process.env.REACT_APP_API_URL}/bookings/`;
      if (user) {
        url += `?user_id=${user.user_id}`;
      } else if (guestSession) {
        url += `?guest_id=${guestSession.guest_id}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        addToast('Failed to load bookings', 'error');
      }
    } catch (error) {
      addToast('Network error loading bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        addToast('Booking cancelled successfully', 'success');
        fetchBookings(); // Refresh bookings
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to cancel booking', 'error');
      }
    } catch (error) {
      addToast('Network error cancelling booking', 'error');
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (booking.status === 'cancelled') return 'cancelled';
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return '⏰';
      case 'active': return '✅';
      case 'completed': return '✔️';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#2196F3';
      case 'active': return '#4CAF50';
      case 'completed': return '#666';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return getBookingStatus(booking) === filter;
  });

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelBooking = (booking) => {
    const status = getBookingStatus(booking);
    const startTime = new Date(booking.start_time);
    const now = new Date();
    const timeDiff = startTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return status === 'upcoming' && hoursDiff > 1; // Can cancel if more than 1 hour before start
  };

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading-section">
          <div className="loading-spinner">🪑</div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-content">
        <div className="bookings-header">
          <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
        </div>

        <div className="bookings-main">
          <div className="page-header">
            <h1>📅 My Bookings</h1>
            <p>Manage your restaurant seat reservations</p>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Bookings
            </button>
            <button
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">🪑</div>
              <h3>No bookings found</h3>
              <p>
                {filter === 'all'
                  ? "You haven't made any seat reservations yet."
                  : `No ${filter} bookings found.`
                }
              </p>
              <Link to="/restaurants" className="browse-btn">
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map(booking => {
                const status = getBookingStatus(booking);
                return (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div className="restaurant-info">
                        <h3>{booking.restaurant_name}</h3>
                        <p>{booking.restaurant_address}</p>
                      </div>
                      <div className="booking-status" style={{ color: getStatusColor(status) }}>
                        <span className="status-icon">{getStatusIcon(status)}</span>
                        <span className="status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-label">📅 Date & Time:</span>
                        <span className="detail-value">
                          {formatDateTime(booking.start_time)} - {new Date(booking.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">🪑 Seats:</span>
                        <span className="detail-value">
                          {booking.seats && booking.seats.length > 0 ? (
                            <div className="seat-list">
                              {booking.seats.map(seat => (
                                <span key={seat.id} className="seat-tag">
                                  {seat.code}
                                  {seat.is_private_room && ' (Private)'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            `${booking.seat_count || 1} seat(s)`
                          )}
                        </span>
                      </div>

                      {booking.special_requests && (
                        <div className="detail-item">
                          <span className="detail-label">📝 Special Requests:</span>
                          <span className="detail-value">{booking.special_requests}</span>
                        </div>
                      )}

                      <div className="detail-item">
                        <span className="detail-label">🆔 Booking ID:</span>
                        <span className="detail-value">#{booking.id}</span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      <Link
                        to={`/restaurants/${booking.restaurant_id}`}
                        className="view-restaurant-btn"
                      >
                        View Restaurant
                      </Link>

                      {status === 'completed' && (
                        <Link
                          to={`/restaurants/${booking.restaurant_id}`}
                          className="review-btn"
                        >
                          Leave Review
                        </Link>
                      )}

                      {canCancelBooking(booking) && (
                        <button
                          className="cancel-btn"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
