import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import './OrderTracker.css';

const OrderTracker = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const { showSuccess, showInfo } = useToast();
  const intervalRef = useRef(null);

  // Memoized order update function to prevent unnecessary re-renders
  const updateOrderStatus = useCallback(() => {
    setOrders(prev => {
      let hasChanges = false;
      const updated = prev.map(order => {
        if (order.status === 'pending') {
          hasChanges = true;
          showInfo(`Order #${order.id} is being prepared 👨‍🍳`);
          return { ...order, status: 'preparing' };
        }
        if (order.status === 'preparing' && Math.random() > 0.8) { // Reduced frequency
          hasChanges = true;
          showSuccess(`Order #${order.id} is ready for delivery! 🚚`);
          return { ...order, status: 'ready' };
        }
        return order;
      });
      
      // Only update if there are actual changes
      return hasChanges ? updated : prev;
    });
  }, [showSuccess, showInfo]);

  // Optimized useEffect with proper cleanup
  useEffect(() => {
    if (isOpen && orders.length > 0) {
      intervalRef.current = setInterval(updateOrderStatus, 8000); // Increased interval
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, orders.length, updateOrderStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const addOrder = useCallback((orderData) => {
    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };
    setOrders(prev => [newOrder, ...prev]);
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'delivered': return '🎉';
      default: return '📦';
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'preparing': return '#17a2b8';
      case 'ready': return '#28a745';
      case 'delivered': return '#6f42c1';
      default: return '#6c757d';
    }
  }, []);

  const getProgressWidth = useCallback((status) => {
    switch (status) {
      case 'pending': return '25%';
      case 'preparing': return '60%';
      case 'ready': return '90%';
      case 'delivered': return '100%';
      default: return '0%';
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className={`order-tracker ${isOpen ? 'open' : ''}`}>
      <div className="order-header">
        <h2>📋 Order Tracker</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders">No orders yet 🍽️</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header-info">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-time">{order.timestamp}</span>
              </div>
              <div className="order-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status.toUpperCase()}
                </span>
              </div>
              <div className="order-details">
                <p>Restaurant: {order.restaurant || 'Demo Restaurant'}</p>
                <p>Total: ৳{order.total || '299'}</p>
                <p>Items: {order.itemCount || '3'}</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: getProgressWidth(order.status) }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderTracker;
