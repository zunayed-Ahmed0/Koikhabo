import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

const OrderManagement = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    // Load reservations from localStorage
    const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    setReservations(savedReservations);
  }, []);

  return (
    <div className="order-management">
      <h2>📋 Reservation Management</h2>

      {reservations.length === 0 ? (
        <p>No reservations yet</p>
      ) : (
        <div className="reservations-list">
          {reservations.map(reservation => (
            <div key={reservation.id} className="reservation-item">
              <div className="reservation-header">
                <span className="reservation-id">Reservation #{reservation.id}</span>
                <span className={`reservation-status ${reservation.status}`}>
                  {reservation.status}
                </span>
              </div>
              <div className="reservation-details">
                <p>👥 Party Size: {reservation.partySize}</p>
                <p>🕒 Time: {reservation.time}</p>
                <p>📍 Restaurant: {reservation.restaurantName || reservation.restaurantId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
