import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, guestSession } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/`);

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        addToast('Order not found', 'error');
      }
    } catch (error) {
      addToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🍽️';
      case 'out_for_delivery': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Being Prepared';
      case 'ready': return 'Ready for Pickup/Delivery';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown Status';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'preparing': return '#9C27B0';
      case 'ready': return '#4CAF50';
      case 'out_for_delivery': return '#FF5722';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getEstimatedTime = (status) => {
    switch (status) {
      case 'pending': return '5-10 minutes';
      case 'confirmed': return '15-25 minutes';
      case 'preparing': return '10-20 minutes';
      case 'ready': return 'Ready now';
      case 'out_for_delivery': return '10-15 minutes';
      case 'delivered': return 'Completed';
      case 'cancelled': return 'N/A';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <div className="loading-section">
          <div className="loading-spinner">📦</div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-container">
        <div className="order-content">
          <div className="order-header">
            <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
          </div>

          <div className="not-found">
            <h2>Order Not Found</h2>
            <p>The order #{orderId} could not be found.</p>
            <Link to="/user-history" className="history-link">View Order History</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <div className="order-content">
        <div className="order-header">
          <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
        </div>

        <div className="tracking-main">
          <div className="order-info-header">
            <h1>📦 Order Tracking</h1>
            <div className="order-id">Order #{order.id}</div>
          </div>

          <div className="status-section">
            <div className="current-status" style={{ borderColor: getStatusColor(order.status) }}>
              <div className="status-icon" style={{ color: getStatusColor(order.status) }}>
                {getStatusIcon(order.status)}
              </div>
              <div className="status-info">
                <h2 style={{ color: getStatusColor(order.status) }}>
                  {getStatusText(order.status)}
                </h2>
                <p>Estimated time: {getEstimatedTime(order.status)}</p>
              </div>
            </div>
          </div>

          <div className="progress-timeline">
            <div className="timeline-item completed">
              <div className="timeline-icon">📋</div>
              <div className="timeline-content">
                <h3>Order Placed</h3>
                <p>{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className={`timeline-item ${['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">✅</div>
              <div className="timeline-content">
                <h3>Order Confirmed</h3>
                <p>Restaurant accepted your order</p>
              </div>
            </div>

            <div className={`timeline-item ${['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">👨‍🍳</div>
              <div className="timeline-content">
                <h3>Preparing</h3>
                <p>Your food is being prepared</p>
              </div>
            </div>

            <div className={`timeline-item ${['ready', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">🍽️</div>
              <div className="timeline-content">
                <h3>Ready</h3>
                <p>Food is ready for delivery</p>
              </div>
            </div>

            <div className={`timeline-item ${['out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
              <div className="timeline-icon">🚚</div>
              <div className="timeline-content">
                <h3>Out for Delivery</h3>
                <p>On the way to you</p>
              </div>
            </div>

            <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
              <div className="timeline-icon">📦</div>
              <div className="timeline-content">
                <h3>Delivered</h3>
                <p>Enjoy your meal!</p>
              </div>
            </div>
          </div>

          <div className="order-details">
            <div className="details-section">
              <h3>🏪 Restaurant</h3>
              <div className="restaurant-info">
                <h4>{order.restaurant_name}</h4>
                <p>{order.restaurant_address}</p>
              </div>
            </div>

            <div className="details-section">
              <h3>🍽️ Order Items</h3>
              <div className="order-items">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">৳{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Total: ৳{order.total_amount}</strong>
              </div>
            </div>

            <div className="details-section">
              <h3>📞 Contact Information</h3>
              <div className="contact-info">
                <p><strong>Phone:</strong> {order.phone}</p>
                {order.email && <p><strong>Email:</strong> {order.email}</p>}
                <p><strong>Address:</strong> {order.address}</p>
              </div>
            </div>

            <div className="details-section">
              <h3>💳 Payment</h3>
              <div className="payment-info">
                <p><strong>Method:</strong> {order.payment_method}</p>
                <p><strong>Status:</strong>
                  <span className={`payment-status ${order.payment_status}`}>
                    {order.payment_status}
                  </span>
                </p>
              </div>
            </div>

            {order.special_instructions && (
              <div className="details-section">
                <h3>📝 Special Instructions</h3>
                <p>{order.special_instructions}</p>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <Link to="/user-history" className="history-btn">
              📋 View Order History
            </Link>
            {order.status === 'delivered' && (
              <Link to={`/restaurants/${order.restaurant_id}`} className="review-btn">
                ⭐ Leave a Review
              </Link>
            )}
            <Link to="/restaurants" className="order-again-btn">
              🍽️ Order Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
