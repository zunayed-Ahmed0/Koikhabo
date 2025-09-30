import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './SeatBooking.css';

const SeatBooking = ({ restaurant }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bookingCode, setBookingCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { user, guestSession, getCurrentUserId } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (restaurant) {
      // Use generated seat grid instead of fetching from API
      setSeats(generateSeatGrid());
      setLoading(false);

      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setBookingDate(today);
      // Set default times
      const now = new Date();
      const currentHour = now.getHours();
      setStartTime(`${String(currentHour + 1).padStart(2, '0')}:00`);
      setEndTime(`${String(currentHour + 3).padStart(2, '0')}:00`);
    }
  }, [restaurant]);

  // Removed fetchSeats function as we're using generated seat grid

  const handleSeatClick = (seat) => {
    if (seat.is_occupied || seat.is_booked) {
      addToast('This seat is not available', 'error');
      return;
    }

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const calculateBookingCost = () => {
    if (!startTime || !endTime || selectedSeats.length === 0) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));

    return selectedSeats.length * hours * 80; // 80 TK per seat per hour
  };

  const validateBookingForm = () => {
    if (selectedSeats.length === 0) {
      addToast('Please select at least one seat', 'error');
      return false;
    }

    if (!bookingDate || !startTime || !endTime) {
      addToast('Please fill in all booking details', 'error');
      return false;
    }

    if (!customerName.trim()) {
      addToast('Please enter your name', 'error');
      return false;
    }

    if (!customerPhone.trim() || !/^01[3-9]\d{8}$/.test(customerPhone)) {
      addToast('Please enter a valid Bangladesh phone number (01XXXXXXXXX)', 'error');
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateBookingForm()) return;

    const userId = getCurrentUserId();
    if (!userId) {
      addToast('Please log in to make a booking', 'error');
      return;
    }

    // Show payment form
    setShowPayment(true);
  };

  const processPayment = async () => {
    setBooking(true);

    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${bookingDate}T${endTime}`).toISOString();
      const totalCost = calculateBookingCost();

      const bookingData = {
        seat_ids: selectedSeats.map(seat => seat.id),
        start_time: startDateTime,
        end_time: endDateTime,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        total_amount: totalCost
      };

      if (user) {
        bookingData.user_id = user.user_id;
      } else if (guestSession) {
        bookingData.guest_id = guestSession.guest_id;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/${restaurant.id}/book/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        await response.json(); // Process response but don't store unused result
        const generatedCode = `KB${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        setBookingCode(generatedCode);
        setShowConfirmation(true);
        setShowPayment(false);
        addToast('Booking confirmed successfully! 🎉', 'success');
        setSelectedSeats([]);
        // Refresh seat availability by regenerating grid
        setSeats(generateSeatGrid());
      } else {
        const error = await response.json();
        addToast(error.error || 'Booking failed', 'error');
      }
    } catch (error) {
      addToast('Network error during booking', 'error');
    } finally {
      setBooking(false);
    }
  };

  const getSeatClass = (seat) => {
    let className = 'seat';

    if (seat.is_occupied) {
      className += ' occupied';
    } else if (seat.is_booked) {
      className += ' booked';
    } else if (selectedSeats.find(s => s.id === seat.id)) {
      className += ' selected';
    } else {
      className += ' available';
    }

    if (seat.is_private_room) {
      className += ' private-room';
    }

    if (seat.is_women_only) {
      className += ' women-only';
    }

    return className;
  };

  const getSeatIcon = (seat) => {
    if (seat.is_women_only) return '👩';
    if (seat.is_private_room) return '🏠';
    if (seat.is_occupied) return '❌';
    if (seat.is_booked) return '📅';
    if (selectedSeats.find(s => s.id === seat.id)) return '✅';

    // Use table-specific icons for more realistic appearance
    if (seat.table_icon) return seat.table_icon;

    // Fallback icons based on table type
    switch (seat.table_shape) {
      case 'booth': return '🛋️';
      case 'counter': return '🥤';
      case 'round': return '☕';
      case 'large': return '🍽️';
      default: return '🪑';
    }
  };

  const generateSeatGrid = () => {
    // Generate realistic restaurant table arrangements with randomized layouts
    const seatGrid = [];
    const restaurantId = restaurant?.id || 1;

    // Use restaurant ID as seed for consistent but different layouts per restaurant
    const seed = restaurantId * 12345;
    let seedCounter = 0;
    const random = (min, max) => {
      seedCounter++;
      const x = Math.sin(seed + seedCounter) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    // Define different table types for realistic restaurant layout
    const tableTypes = [
      { name: 'Table', seats: 4, shape: 'square', icon: '🍽️' },      // 4-person square tables
      { name: 'Table', seats: 2, shape: 'round', icon: '☕' },       // 2-person round tables
      { name: 'Table', seats: 6, shape: 'rectangle', icon: '🍽️' },   // 6-person rectangular tables
      { name: 'Booth', seats: 4, shape: 'booth', icon: '🛋️' },       // Booth seating
      { name: 'Counter', seats: 1, shape: 'counter', icon: '🥤' },   // Counter/bar seating
      { name: 'Table', seats: 8, shape: 'large', icon: '🍽️' },       // Large family tables
    ];

    let tableNumber = 1;
    let totalSeats = 0;
    const maxSeats = 32; // Reasonable number of seats for a restaurant

    // Generate tables with realistic distribution
    while (totalSeats < maxSeats) {
      const tableType = tableTypes[random(0, tableTypes.length - 1)];
      const remainingSeats = maxSeats - totalSeats;

      // Don't add table if it would exceed max seats
      if (tableType.seats > remainingSeats && remainingSeats > 0) {
        // Add smaller table to fill remaining space
        const smallTable = tableTypes.find(t => t.seats <= remainingSeats) || tableTypes[1];
        tableType.seats = smallTable.seats;
        tableType.shape = smallTable.shape;
        tableType.name = smallTable.name;
        tableType.icon = smallTable.icon;
      }

      // Create seats for this table
      for (let seatNum = 1; seatNum <= tableType.seats; seatNum++) {
        const seatCode = `${tableType.name.charAt(0)}${tableNumber}-${seatNum}`;
        const isPrivateRoom = tableType.shape === 'booth' || (tableType.seats >= 6 && random(1, 3) === 1);
        const isWomenOnly = tableNumber <= 2 && random(1, 4) === 1; // Some tables designated women-only

        seatGrid.push({
          id: `${tableType.name.toLowerCase()}_${tableNumber}_seat_${seatNum}`,
          code: seatCode,
          table_number: tableNumber,
          table_type: tableType.name,
          table_shape: tableType.shape,
          table_icon: tableType.icon,
          seat_position: seatNum,
          total_table_seats: tableType.seats,
          is_occupied: random(1, 10) <= 2, // 20% chance occupied
          is_booked: random(1, 10) <= 1,   // 10% chance booked
          is_women_only: isWomenOnly,
          is_private_room: isPrivateRoom,
          // Add position for CSS grid layout - more natural spacing
          row: Math.floor(totalSeats / 6),
          col: totalSeats % 6,
          x_position: (totalSeats % 6) * 120 + random(10, 30),
          y_position: Math.floor(totalSeats / 6) * 100 + random(10, 30)
        });

        totalSeats++;
        if (totalSeats >= maxSeats) break;
      }

      tableNumber++;
      if (totalSeats >= maxSeats) break;
    }

    return seatGrid;
  };

  if (loading) {
    return (
      <div className="seat-booking-loading">
        <div className="loading-spinner">🪑</div>
        <p>Loading seat layout...</p>
      </div>
    );
  }

  return (
    <div className="seat-booking">
      <div className="booking-header">
        <h2>🪑 Reserve Your Seats</h2>
        <p>Select your preferred seats and booking time</p>
      </div>

      <div className="booking-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-icon available">🪑</span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon selected">✅</span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon booked">📅</span>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon occupied">❌</span>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon private">🏠</span>
          <span>Private Room</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon women-only">👩</span>
          <span>Women Only</span>
        </div>
      </div>

      <div className="seat-layout-grid">
        <div className="seat-grid">
          {seats.map(seat => (
            <div
              key={seat.id}
              className={getSeatClass(seat)}
              onClick={() => handleSeatClick(seat)}
              title={`${seat.table_type} ${seat.table_number} - Seat ${seat.seat_position}/${seat.total_table_seats}${seat.is_women_only ? ' - Women Only' : ''}${seat.is_private_room ? ' - Private Room' : ''}`}
            >
              <span className="seat-icon">{getSeatIcon(seat)}</span>
              <span className="seat-code">{seat.code}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedSeats.length > 0 && !showPayment && !showConfirmation && (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="selected-seats">
            {selectedSeats.map(seat => (
              <span key={seat.id} className="selected-seat-tag">
                {seat.code}
                {seat.is_women_only && ' 👩'}
                {seat.is_private_room && ' 🏠'}
              </span>
            ))}
          </div>

          <div className="customer-form">
            <h4>📝 Customer Information</h4>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
          </div>

          <div className="cost-breakdown">
            <div className="cost-item">
              <span>Seats: {selectedSeats.length}</span>
              <span>৳{selectedSeats.length * 80}/hour</span>
            </div>
            {startTime && endTime && (
              <div className="cost-item">
                <span>Duration: {Math.ceil((new Date(`2000-01-01T${endTime}`) - new Date(`2000-01-01T${startTime}`)) / (1000 * 60 * 60))} hour(s)</span>
                <span></span>
              </div>
            )}
            <div className="cost-total">
              <span><strong>Total Cost:</strong></span>
              <span><strong>৳{calculateBookingCost()}</strong></span>
            </div>
          </div>

          <button
            className="book-button"
            onClick={handleBooking}
            disabled={booking || !customerName.trim() || !customerPhone.trim()}
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {showPayment && (
        <div className="payment-section">
          <h3>💳 Payment</h3>
          <div className="payment-summary">
            <p><strong>Booking for:</strong> {customerName}</p>
            <p><strong>Seats:</strong> {selectedSeats.map(s => s.code).join(', ')}</p>
            <p><strong>Total Amount:</strong> ৳{calculateBookingCost()}</p>
          </div>

          <div className="payment-methods">
            <h4>Select Payment Method</h4>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💵 Cash at Counter</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="bkash"
                checked={paymentMethod === 'bkash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>📱 bKash</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="nagad"
                checked={paymentMethod === 'nagad'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>📱 Nagad</span>
            </label>
          </div>

          <div className="payment-actions">
            <button
              className="cancel-btn"
              onClick={() => setShowPayment(false)}
            >
              ← Back
            </button>
            <button
              className="confirm-payment-btn"
              onClick={processPayment}
              disabled={booking}
            >
              {booking ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="booking-confirmation">
          <div className="confirmation-icon">🎉</div>
          <h3>Booking Confirmed!</h3>
          <div className="booking-details">
            <p><strong>Booking Code:</strong> <span className="booking-code">{bookingCode}</span></p>
            <p><strong>Customer:</strong> {customerName}</p>
            <p><strong>Phone:</strong> {customerPhone}</p>
            <p><strong>Seats:</strong> {selectedSeats.map(s => s.code).join(', ')}</p>
            <p><strong>Date:</strong> {new Date(bookingDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {startTime} - {endTime}</p>
            <p><strong>Total Paid:</strong> ৳{calculateBookingCost()}</p>
          </div>
          <div className="confirmation-instructions">
            <h4>📋 Instructions:</h4>
            <ul>
              <li>Show this booking code at the restaurant counter</li>
              <li>Arrive 10 minutes before your booking time</li>
              <li>Bring a valid ID for verification</li>
              <li>Contact the restaurant if you need to cancel</li>
            </ul>
          </div>
          <button
            className="new-booking-btn"
            onClick={() => {
              setShowConfirmation(false);
              setCustomerName('');
              setCustomerPhone('');
              setBookingCode('');
            }}
          >
            Make Another Booking
          </button>
        </div>
      )}

      <div className="restaurant-info">
        <h3>Restaurant Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Total Capacity:</span>
            <span className="info-value">{restaurant.capacity} seats</span>
          </div>
          <div className="info-item">
            <span className="info-label">Opening Hours:</span>
            <span className="info-value">{restaurant.opening_time} - {restaurant.closing_time}</span>
          </div>
          {restaurant.has_private_room && (
            <div className="info-item">
              <span className="info-label">Private Rooms:</span>
              <span className="info-value">✅ Available</span>
            </div>
          )}
          {restaurant.has_smoking_zone && (
            <div className="info-item">
              <span className="info-label">Smoking Zone:</span>
              <span className="info-value">✅ Available</span>
            </div>
          )}
          {restaurant.has_prayer_zone && (
            <div className="info-item">
              <span className="info-label">Prayer Zone:</span>
              <span className="info-value">✅ Available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
