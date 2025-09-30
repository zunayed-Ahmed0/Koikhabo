import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './UserHistory.css';

const UserHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, delivered, cancelled
  const [rewardPoints, setRewardPoints] = useState(0);
  const { user, guestSession, getCurrentUserId } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrderHistory();
    if (user) {
      fetchRewardPoints();
    }
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();

      if (!userId) {
        setOrders([]);
        return;
      }

      let url = `${process.env.REACT_APP_API_URL}/orders/history/`;
      if (user) {
        url += `?user_id=${user.user_id}`;
      } else if (guestSession) {
        url += `?guest_id=${guestSession.guest_id}`;
      }

      console.log('🔍 Fetching order history from:', url);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Order history API response:', data);
        console.log('📋 First order details:', data[0]);

        // The API returns data wrapped in an "orders" key
        setOrders(data.orders || []);

        // Also fetch user data for reward points if user is logged in
        if (user) {
          setRewardPoints(user.reward_points || 0);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to load order history:', errorData);
        addToast('Failed to load order history', 'error');
      }
    } catch (error) {
      console.error('❌ Network error loading order history:', error);
      addToast('Network error loading order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardPoints = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.user_id}/rewards/`);

      if (response.ok) {
        const data = await response.json();
        setRewardPoints(data.total_points || 0);
      }
    } catch (error) {
      console.error('Failed to fetch reward points:', error);
    }
  };

  const reorderItems = async (orderId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/reorder/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        addToast('Items added to cart successfully!', 'success');
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to reorder items', 'error');
      }
    } catch (error) {
      addToast('Network error during reorder', 'error');
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalSpent = () => {
    console.log('🧮 Calculating total spent from orders:', orders);

    // Calculate total from ALL orders (not just delivered) for comprehensive tracking
    const total = orders.reduce((total, order) => {
      const amount = parseFloat(order.total_amount || 0);
      console.log(`💰 Order ${order.id}: total_amount=${order.total_amount}, parsed=${amount}, status=${order.status}`);
      return total + amount;
    }, 0);

    console.log('💵 Final total spent (all orders):', total);
    return total;
  };

  const calculateDeliveredTotal = () => {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    return deliveredOrders.reduce((total, order) => {
      return total + parseFloat(order.total_amount || 0);
    }, 0);
  };

  const calculatePendingTotal = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'confirmed');
    return pendingOrders.reduce((total, order) => {
      return total + parseFloat(order.total_amount || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-section">
          <div className="loading-spinner">📦</div>
          <p>Loading your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-content">
        <div className="history-header">
          <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
        </div>

        <div className="history-main">
          <div className="page-header">
            <h1>📋 Order History</h1>
            <p>Track your past orders and reorder your favorites</p>
          </div>

          {user && (
            <div className="user-stats">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>৳{calculateTotalSpent().toFixed(2)}</h3>
                  <p>Total Spent</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>৳{calculateDeliveredTotal().toFixed(2)}</h3>
                  <p>Delivered Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>৳{calculatePendingTotal().toFixed(2)}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>{rewardPoints}</h3>
                  <p>Reward Points</p>
                </div>
              </div>
            </div>
          )}

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
            <button
              className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>No orders found</h3>
              <p>
                {filter === 'all'
                  ? "You haven't placed any orders yet."
                  : `No ${filter} orders found.`
                }
              </p>
              <Link to="/restaurants" className="browse-btn">
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">{formatDate(order.created_at)}</p>
                      <p className="restaurant-name">{order.restaurant_name}</p>
                    </div>
                    <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      <span className="status-text">{order.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items && order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-details">x{item.quantity} - ৳{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="more-items">+{order.items.length - 3} more items</p>
                    )}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total: ৳{order.total_amount}</strong>
                    </div>
                    <div className="order-actions">
                      <Link
                        to={`/order-tracking/${order.id}`}
                        className="track-btn"
                      >
                        Track Order
                      </Link>
                      {order.status === 'delivered' && (
                        <>
                          <button
                            className="reorder-btn"
                            onClick={() => reorderItems(order.id)}
                          >
                            Reorder
                          </button>
                          <Link
                            to={`/restaurants/${order.restaurant_id}`}
                            className="review-btn"
                          >
                            Review
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
