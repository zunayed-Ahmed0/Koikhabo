import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user, guestSession, getCurrentUserId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'cash',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bkashPin: '',
    nagadPin: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);

  // Payment validation functions
  const validateBDPhone = (phone) => {
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    return bdPhoneRegex.test(phone);
  };

  const validateCreditCard = (cardNumber) => {
    // Luhn algorithm for credit card validation
    const num = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(num)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const validateCardExpiry = (expiry) => {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;

    return true;
  };

  const validatePayment = () => {
    if (!validateBDPhone(checkoutData.phone)) {
      addToast('Please enter a valid Bangladesh phone number (01XXXXXXXXX)', 'error');
      return false;
    }

    if (checkoutData.paymentMethod === 'card') {
      if (!validateCreditCard(checkoutData.cardNumber)) {
        addToast('Please enter a valid credit card number', 'error');
        return false;
      }
      if (!validateCardExpiry(checkoutData.cardExpiry)) {
        addToast('Please enter a valid card expiry date (MM/YY)', 'error');
        return false;
      }
      if (!/^\d{3,4}$/.test(checkoutData.cardCvv)) {
        addToast('Please enter a valid CVV', 'error');
        return false;
      }
    }

    if (checkoutData.paymentMethod === 'bkash' && !/^\d{4}$/.test(checkoutData.bkashPin)) {
      addToast('Please enter a valid 4-digit bKash PIN', 'error');
      return false;
    }

    if (checkoutData.paymentMethod === 'nagad' && !/^\d{4}$/.test(checkoutData.nagadPin)) {
      addToast('Please enter a valid 4-digit Nagad PIN', 'error');
      return false;
    }

    return true;
  };

  const handleInputChange = (field, value) => {
    setCheckoutData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckout = async () => {
    if (!validatePayment()) return;

    setLoading(true);

    try {
      // Group items by restaurant
      const ordersByRestaurant = cartItems.reduce((acc, item) => {
        if (!acc[item.restaurant_id]) {
          acc[item.restaurant_id] = {
            restaurant_id: item.restaurant_id,
            restaurant_name: item.restaurant_name,
            items: []
          };
        }
        acc[item.restaurant_id].items.push(item);
        return acc;
      }, {});

      const orders = [];

      // Create separate orders for each restaurant
      for (const restaurantOrder of Object.values(ordersByRestaurant)) {
        const orderData = {
          restaurant_id: restaurantOrder.restaurant_id,
          items: restaurantOrder.items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          phone: checkoutData.phone,
          email: checkoutData.email || null,
          address: checkoutData.address,
          payment_method: checkoutData.paymentMethod,
          special_instructions: checkoutData.specialInstructions
        };

        if (user) {
          orderData.user_id = user.user_id;
        } else if (guestSession) {
          orderData.guest_id = guestSession.guest_id;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const result = await response.json();
          orders.push(result);
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Order failed');
        }
      }

      // Clear cart and show success
      clearCart();
      addToast(`${orders.length} order(s) placed successfully!`, 'success');

      // Navigate to order tracking if single order, otherwise to history
      if (orders.length === 1) {
        navigate(`/order-tracking/${orders[0].order_id}`);
      } else {
        navigate('/user-history');
      }

    } catch (error) {
      addToast(error.message || 'Order failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-content">
          <div className="cart-header">
            <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
          </div>

          <div className="empty-cart">
            <h1>🛒 Your Cart</h1>
            <div className="empty-cart-icon">🛒</div>
            <p>Your cart is empty.</p>
            <Link to="/restaurants" className="browse-btn">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-header">
          <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
        </div>

        <div className="cart-main">
          <h1>🛒 Your Cart</h1>

          {!showCheckout ? (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.restaurant_id}`} className="cart-item">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p className="restaurant-name">{item.restaurant_name}</p>
                      <p className="item-price">৳{item.price}</p>
                      {item.is_student_set && (
                        <span className="student-set-badge">🎓 Student Set</span>
                      )}
                    </div>
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.restaurant_id, Math.max(1, item.quantity - 1))}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.restaurant_id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.restaurant_id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="total-row">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">৳{getCartTotal()}</span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          ) : (
            <div className="checkout-section">
              <div className="checkout-header">
                <button
                  className="back-to-cart-btn"
                  onClick={() => setShowCheckout(false)}
                >
                  ← Back to Cart
                </button>
                <h2>Checkout</h2>
              </div>

              <div className="checkout-form">
                <div className="form-section">
                  <h3>📞 Contact Information</h3>
                  <div className="form-group">
                    <label>Phone Number (Required)</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={checkoutData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={!validateBDPhone(checkoutData.phone) && checkoutData.phone ? 'error' : ''}
                    />
                    <small>Required for delivery coordination</small>
                  </div>
                  <div className="form-group">
                    <label>Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={checkoutData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    <small>For order confirmations and history</small>
                  </div>
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <textarea
                      placeholder="Enter your delivery address"
                      value={checkoutData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>💳 Payment Method</h3>
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={checkoutData.paymentMethod === 'cash'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <span className="payment-label">💵 Cash on Delivery</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={checkoutData.paymentMethod === 'card'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <span className="payment-label">💳 Credit/Debit Card</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={checkoutData.paymentMethod === 'bkash'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <span className="payment-label">📱 bKash</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={checkoutData.paymentMethod === 'nagad'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      />
                      <span className="payment-label">📱 Nagad</span>
                    </label>
                  </div>

                  {checkoutData.paymentMethod === 'card' && (
                    <div className="card-details">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={checkoutData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          maxLength="19"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={checkoutData.cardExpiry}
                            onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                            maxLength="5"
                          />
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={checkoutData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                            maxLength="4"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutData.paymentMethod === 'bkash' && (
                    <div className="mobile-payment">
                      <div className="form-group">
                        <label>bKash PIN</label>
                        <input
                          type="password"
                          placeholder="Enter 4-digit PIN"
                          value={checkoutData.bkashPin}
                          onChange={(e) => handleInputChange('bkashPin', e.target.value)}
                          maxLength="4"
                        />
                      </div>
                    </div>
                  )}

                  {checkoutData.paymentMethod === 'nagad' && (
                    <div className="mobile-payment">
                      <div className="form-group">
                        <label>Nagad PIN</label>
                        <input
                          type="password"
                          placeholder="Enter 4-digit PIN"
                          value={checkoutData.nagadPin}
                          onChange={(e) => handleInputChange('nagadPin', e.target.value)}
                          maxLength="4"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h3>📝 Special Instructions</h3>
                  <div className="form-group">
                    <textarea
                      placeholder="Any special instructions for your order..."
                      value={checkoutData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="checkout-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.restaurant_id}`} className="summary-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <span>Total: ৳{getCartTotal()}</span>
                </div>

                <button
                  className="place-order-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
