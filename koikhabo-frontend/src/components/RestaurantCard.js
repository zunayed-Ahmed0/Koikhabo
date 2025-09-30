import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import SeatBookingModal from './SeatBookingModal';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const [availability, setAvailability] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchAvailability();
  }, [restaurant.id, fetchAvailability]);

  const fetchAvailability = async () => {
    try {
      // Mock availability data for development
      const mockAvailability = {
        available_seats: Math.floor(Math.random() * 20) + 5,
        total_seats: 50,
        meal_availability: {
          breakfast: Math.floor(Math.random() * 15) + 5,
          lunch: Math.floor(Math.random() * 20) + 10,
          dinner: Math.floor(Math.random() * 15) + 5
        }
      };
      setAvailability(mockAvailability);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      addToast('Failed to load availability data', 'error');
      // Set default availability on error
      setAvailability({
        available_seats: 10,
        total_seats: 50,
        meal_availability: {
          breakfast: 5,
          lunch: 10,
          dinner: 5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    fetchAvailability(); // Refresh availability after booking
    addToast('Booking confirmed! 🎉', 'success');
  };

  const getRestaurantIcon = (cuisines) => {
    if (cuisines.includes('japanese')) return '🍱';
    if (cuisines.includes('chinese')) return '🥢';
    if (cuisines.includes('bengali')) return '🍛';
    if (cuisines.includes('western')) return '🍔';
    if (cuisines.includes('middle_eastern')) return '🥙';
    if (cuisines.includes('indian')) return '🍛';
    if (cuisines.includes('thai')) return '🍜';
    if (cuisines.includes('italian')) return '🍝';
    return '🍽️';
  };

  const getThemeColor = (name) => {
    // Generate consistent color based on restaurant name
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
      '#AED6F1', '#D7BDE2', '#F9E79F', '#A9DFBF', '#FAD7A0', '#D5A6BD'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">⭐</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">⭐</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  if (loading) {
    return <div className="restaurant-card loading">Loading...</div>;
  }

  return (
    // <div
    //   className="restaurant-card"
    //   style={{
    //     borderLeft: `4px solid ${getThemeColor(restaurant.name)}`,
    //     background: `linear-gradient(135deg, ${getThemeColor(restaurant.name)}15, white)`
    //   }}
    // >
    <div
  key={restaurant.id}
  className="restaurant-card"
  onClick={() => navigate(`/restaurants/${restaurant.id}`)}
  style={{
    backgroundImage: `url(${restaurant.backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>

      <div className="restaurant-header">
        <div className="restaurant-icon" style={{ color: getThemeColor(restaurant.name) }}>
          {getRestaurantIcon(restaurant.cuisines || [])}
        </div>
        <div className="restaurant-title">
          <h3>{restaurant.name}</h3>
          <div className="restaurant-rating">
            <div className="stars">
              {renderStars(restaurant.average_rating || 4.2)}
            </div>
            <span className="rating-text">
              {restaurant.average_rating || 4.2} ({restaurant.total_reviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <p className="restaurant-description">{restaurant.description}</p>
      <p className="restaurant-address">📍 {restaurant.address}</p>

      {/* Availability Stats */}
      <div className="availability-stats">
        <div className="stat-item">
          <span className="stat-label">Available Seats</span>
          <span className="stat-value">
            {availability?.available_seats || 0}/{availability?.total_seats || 50}
          </span>
        </div>
        
        <div className="meal-availability">
          <div className="meal-stat">
            <span>🌅 Breakfast: {availability?.meal_availability?.breakfast || 0}</span>
          </div>
          <div className="meal-stat">
            <span>🌞 Lunch: {availability?.meal_availability?.lunch || 0}</span>
          </div>
          <div className="meal-stat">
            <span>🌙 Dinner: {availability?.meal_availability?.dinner || 0}</span>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="menu-section">
        <h4>Menu</h4>
        {restaurant.menu && restaurant.menu.length > 0 ? (
          <ul className="menu-list">
            {restaurant.menu.map(item => (
              <li key={item.id} className="menu-item">
                <span>{item.name} - ৳{item.price}</span>
                <button
                  className="add-to-cart-btn"
                  onClick={() => {
                    addToCart({ ...item, restaurantId: restaurant.id, restaurant: restaurant.name });
                    addToast(`${item.name} added to cart`, 'success');
                  }}
                >
                  Add to Cart
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No menu items available</p>
        )}
      </div>

      {/* Booking Button */}
      <button 
        className={`book-seat-btn ${availability?.available_seats === 0 ? 'fully-booked' : ''}`}
        onClick={() => setShowBookingModal(true)}
        disabled={availability?.available_seats === 0}
      >
        {availability?.available_seats === 0 
          ? '🚫 Fully Booked' 
          : `🪑 Book Seats (৳100)`
        }
      </button>

      {/* Restaurant Status */}
      <div className="restaurant-status">
        <span className={`status-indicator ${restaurant.is_open ? 'open' : 'closed'}`}>
          {restaurant.is_open ? '🟢 Open' : '🔴 Closed'}
        </span>
        <span className="hours">
          {restaurant.opening_time} - {restaurant.closing_time}
        </span>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <SeatBookingModal
          restaurant={restaurant}
          availability={availability}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default RestaurantCard;
