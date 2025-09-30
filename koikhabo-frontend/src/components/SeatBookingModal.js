import React, { useState } from 'react';
import ReactDOM from 'react-dom';  // <-- import ReactDOM for portal
import { useToast } from '../contexts/ToastContext';
import './SeatBookingModal.css';

const SeatBookingModal = ({ restaurant, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    mealType: 'lunch',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
  });

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const seatLayout = [
    [1, 2, 3, null, null, null, 4, 5, 6],
    [7, 8, 9, null, null, null, 10, 11, 12],
    [13, 14, 15, null, null, null, 16, 17, 18],
    [null, null, null, 19, 20, null, null, null],
  ];

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      addToast('Please select at least one seat.', 'error');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate API

      addToast('Seat booked successfully! 🎉', 'success');
      onSuccess();
      onClose();
    } catch {
      addToast('Failed to book seat. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // The modal JSX
  const modalContent = (
    <div
      className="seat-booking-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="seat-booking-content"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3>🪑 Book Seats at {restaurant.name}</h3>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close seat booking modal"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Meal Type + Date */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mealType">Meal Type *</label>
              <select
                id="mealType"
                name="mealType"
                value={formData.mealType}
                onChange={handleChange}
                required
              >
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">🌞 Lunch</option>
                <option value="dinner">🌙 Dinner</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Time */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Seat selection */}
          <div className="form-group">
            <label>Select Seats *</label>
            <div className="seat-map" role="list" aria-label="Seat selection">
              {seatLayout.map((row, i) => (
                <div key={i} className="seat-row" role="listitem">
                  {row.map((seatNumber, j) =>
                    seatNumber === null ? (
                      <div
                        key={`aisle-${i}-${j}`}
                        className="seat-aisle"
                        aria-hidden="true"
                      />
                    ) : (
                      <button
                        key={seatNumber}
                        type="button"
                        className={`seat ${
                          selectedSeats.includes(seatNumber) ? 'selected' : ''
                        }`}
                        onClick={() => toggleSeat(seatNumber)}
                        aria-pressed={selectedSeats.includes(seatNumber)}
                        aria-label={`Seat ${seatNumber} ${
                          selectedSeats.includes(seatNumber)
                            ? 'selected'
                            : 'not selected'
                        }`}
                      >
                        {seatNumber}
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary" aria-live="polite" aria-atomic="true">
            <h4>Booking Summary</h4>
            <p>Restaurant: {restaurant.name}</p>
            <p>Seats Selected: {selectedSeats.length}</p>
            <p>Total Cost: ৳{selectedSeats.length * 100}</p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="confirm-btn">
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal using React Portal to avoid CSS stacking issues
  return ReactDOM.createPortal(modalContent, document.body);
};

export default SeatBookingModal;
