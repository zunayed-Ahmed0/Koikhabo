import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStep, setOrderStep] = useState('cart'); // cart, details, payment, confirmation
  const [orderDetails, setOrderDetails] = useState({
    pickupTime: 'asap',
    specialInstructions: '',
    orderType: 'pickup',
    paymentMethod: 'cash',
  });
  const [wantSeatReservation, setWantSeatReservation] = useState(false);
  const [reservationDetails, setReservationDetails] = useState({
    restaurantId: null,
    partySize: 2,
    reservationTime: ''
  });

  const totalPrice = getTotalPrice();

  const canReserveSeats = Array.isArray(cartItems) && cartItems.some(item => item.canReserveSeats || false);
  const restaurantsInCart = Array.isArray(cartItems)
    ? [...new Set(cartItems.map(item => item.restaurantId).filter(Boolean))]
    : [];

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const proceedToDetails = () => {
    setOrderStep('details');
  };

  const proceedToPayment = () => {
    setOrderStep('payment');
  };

  const handleFinalOrder = async () => {
    setIsOrdering(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const order = {
        id: Date.now(),
        items: cartItems,
        total: totalPrice,
        details: orderDetails,
        reservation: wantSeatReservation ? reservationDetails : null,
        status: 'confirmed',
        timestamp: new Date().toLocaleString()
      };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.unshift(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      if (wantSeatReservation && reservationDetails.restaurantId) {
        const reservation = {
          id: Date.now() + 1,
          orderId: order.id,
          restaurantId: reservationDetails.restaurantId,
          partySize: reservationDetails.partySize,
          time: reservationDetails.reservationTime,
          status: 'confirmed'
        };
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));
      }

      setOrderStep('confirmation');
      clearCart();

    } catch (error) {
      alert('Order failed. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  // Render Steps (cart, details, payment, confirmation)...

  const renderCartStep = () => (
    <>
      <div className="cart-items">
        {!Array.isArray(cartItems) || cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty 🛒</p>
            <p>Add some delicious items!</p>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="restaurant-name">{item.restaurant}</p>
                <p className="item-price">৳{item.price}</p>
              </div>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="remove-btn">🗑️</button>
            </div>
          ))
        )}
      </div>
      {Array.isArray(cartItems) && cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="total">
            <strong>Total: ৳{totalPrice.toFixed(2)}</strong>
          </div>
          <button onClick={proceedToDetails} className="order-btn">
            Proceed to Checkout 🚀
          </button>
          <button onClick={clearCart} className="clear-btn">
            Clear Cart 🗑️
          </button>
        </div>
      )}
    </>
  );

  const renderDetailsStep = () => (
    <div className="order-details">
      <h3>Order Details</h3>

      <div className="form-group">
        <label>Order Type</label>
        <select
          value={orderDetails.orderType}
          onChange={(e) => setOrderDetails({ ...orderDetails, orderType: e.target.value })}
        >
          <option value="pickup">🥡 Pickup</option>
          <option value="dine-in">🍽️ Dine In</option>
        </select>
      </div>

      <div className="form-group">
        <label>Pickup Time</label>
        <select
          value={orderDetails.pickupTime}
          onChange={(e) => setOrderDetails({ ...orderDetails, pickupTime: e.target.value })}
        >
          <option value="asap">As soon as possible</option>
          <option value="15min">In 15 minutes</option>
          <option value="30min">In 30 minutes</option>
          <option value="1hour">In 1 hour</option>
        </select>
      </div>

      <div className="form-group">
        <label>Special Instructions</label>
        <textarea
          value={orderDetails.specialInstructions}
          onChange={(e) => setOrderDetails({ ...orderDetails, specialInstructions: e.target.value })}
          placeholder="Any special requests..."
          rows="2"
        />
      </div>

      {canReserveSeats && (
        <div className="reservation-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={wantSeatReservation}
              onChange={(e) => setWantSeatReservation(e.target.checked)}
            />
            Reserve a table (৳100 extra)
          </label>

          {wantSeatReservation && (
            <div className="reservation-details">
              <div className="form-group">
                <label>Restaurant</label>
                <select
                  value={reservationDetails.restaurantId || ''}
                  onChange={(e) => setReservationDetails({ ...reservationDetails, restaurantId: Number(e.target.value) })}
                >
                  <option value="">Select Restaurant</option>
                  {restaurantsInCart.map(id => {
                    const item = cartItems.find(item => item.restaurantId === id);
                    return <option key={id} value={id}>{item?.restaurant}</option>;
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Party Size</label>
                <select
                  value={reservationDetails.partySize}
                  onChange={(e) => setReservationDetails({ ...reservationDetails, partySize: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                    <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Reservation Time</label>
                <input
                  type="datetime-local"
                  value={reservationDetails.reservationTime}
                  onChange={(e) => setReservationDetails({ ...reservationDetails, reservationTime: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="step-actions">
        <button onClick={() => setOrderStep('cart')} className="back-btn">← Back</button>
        <button onClick={proceedToPayment} className="continue-btn">Continue to Payment</button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="payment-step">
      <h3>Payment Method</h3>

      <div className="payment-options">
        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="cash"
            checked={orderDetails.paymentMethod === 'cash'}
            onChange={(e) => setOrderDetails({ ...orderDetails, paymentMethod: e.target.value })}
          />
          <span>💵 Cash on Delivery</span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="bkash"
            checked={orderDetails.paymentMethod === 'bkash'}
            onChange={(e) => setOrderDetails({ ...orderDetails, paymentMethod: e.target.value })}
          />
          <span>📱 bKash</span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="card"
            checked={orderDetails.paymentMethod === 'card'}
            onChange={(e) => setOrderDetails({ ...orderDetails, paymentMethod: e.target.value })}
          />
          <span>💳 Credit/Debit Card</span>
        </label>
      </div>

      <div className="order-summary">
        <h4>Order Summary</h4>
        <div className="summary-line">
          <span>Subtotal:</span>
          <span>৳{totalPrice.toFixed(2)}</span>
        </div>
        <div className="summary-line">
          <span>Service Fee:</span>
          <span>৳20.00</span>
        </div>
        {wantSeatReservation && (
          <div className="summary-line">
            <span>Table Reservation:</span>
            <span>৳100.00</span>
          </div>
        )}
        <div className="summary-line total-line">
          <span><strong>Total:</strong></span>
          <span><strong>৳{(totalPrice + 20 + (wantSeatReservation ? 100 : 0)).toFixed(2)}</strong></span>
        </div>
      </div>

      <div className="step-actions">
        <button onClick={() => setOrderStep('details')} className="back-btn">← Back</button>
        <button
          onClick={handleFinalOrder}
          disabled={isOrdering}
          className="place-order-btn"
        >
          {isOrdering ? 'Processing...' : 'Place Order 🎉'}
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="order-confirmation">
      <div className="success-icon">🎉</div>
      <h3>Order Confirmed!</h3>
      <p>Your order has been placed successfully.</p>
      <p>Order ID: #{Date.now()}</p>
      {wantSeatReservation && (
        <p>✅ Table reservation also confirmed!</p>
      )}
      <button onClick={() => {
        setOrderStep('cart');
        onClose();
      }} className="done-btn">
        Done
      </button>
    </div>
  );

  return (
    <>
      {isOpen && <div className="cart-backdrop" onClick={onClose}></div>}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <button onClick={onClose} className="back-btn">← Back</button>
          <h2>
            {orderStep === 'cart' && '🛒 Your Cart'}
            {orderStep === 'details' && '📝 Order Details'}
            {orderStep === 'payment' && '💳 Payment'}
            {orderStep === 'confirmation' && '✅ Confirmed'}
          </h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {orderStep === 'cart' && renderCartStep()}
        {orderStep === 'details' && renderDetailsStep()}
        {orderStep === 'payment' && renderPaymentStep()}
        {orderStep === 'confirmation' && renderConfirmationStep()}
      </div>
    </>
  );
};

export default CartSidebar;
