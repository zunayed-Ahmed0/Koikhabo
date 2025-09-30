import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import RestaurantListing from './pages/RestaurantListing';
import RestaurantDetail from './pages/RestaurantDetail';
import MyBookings from './pages/MyBookings';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import UserHistory from './pages/UserHistory';
import AdminDashboard from './pages/AdminDashboard';
import GuestPage from './pages/GuestPage';

// Contexts
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Home page with role selection */}
                  <Route path="/" element={<Home />} />

                  {/* Authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/guest" element={<GuestPage />} />

                  {/* Main application routes */}
                  <Route path="/restaurants" element={<RestaurantListing />} />
                  <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                  <Route path="/user-history" element={<UserHistory />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />

                  {/* Redirect unknown routes to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;