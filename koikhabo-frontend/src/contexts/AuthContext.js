import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, handleAPIError } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guestSession, setGuestSession] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved auth state from localStorage
    const savedUser = localStorage.getItem('koikhabo_user');
    const savedGuest = localStorage.getItem('koikhabo_guest');
    const savedAdmin = localStorage.getItem('koikhabo_admin');
    const savedUniversity = localStorage.getItem('koikhabo_university');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedGuest) {
      setGuestSession(JSON.parse(savedGuest));
    }
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    if (savedUniversity) {
      setSelectedUniversity(JSON.parse(savedUniversity));
    }

    setLoading(false);
  }, []);

  const loginUser = async (email, fullName = '') => {
    try {
      console.log('AuthContext: Starting login request for:', email, fullName);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, full_name: fullName }),
      });

      console.log('AuthContext: Response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext: User data received:', userData);
        setUser(userData);
        localStorage.setItem('koikhabo_user', JSON.stringify(userData));
        return { success: true, data: userData };
      } else {
        const errorData = await response.json();
        console.error('AuthContext: Login failed with error:', errorData);
        return { success: false, error: errorData.error || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: Network error during login:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const startGuestSession = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/guest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const guestData = await response.json();
        setGuestSession(guestData);
        localStorage.setItem('koikhabo_guest', JSON.stringify(guestData));
        return { success: true, data: guestData };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const loginAdmin = async (name, password) => {
    try {
      const adminData = await apiPost('/auth/admin/', { name, password });
      // Ensure admin flag is set
      adminData.is_admin = true;
      setAdmin(adminData);
      localStorage.setItem('koikhabo_admin', JSON.stringify(adminData));
      return { success: true, data: adminData };
    } catch (error) {
      return { success: false, error: error.message || 'Admin login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setGuestSession(null);
    setAdmin(null);
    setSelectedUniversity(null);
    localStorage.removeItem('koikhabo_user');
    localStorage.removeItem('koikhabo_guest');
    localStorage.removeItem('koikhabo_admin');
    localStorage.removeItem('koikhabo_university');
  };

  const selectUniversity = (university) => {
    setSelectedUniversity(university);
    localStorage.setItem('koikhabo_university', JSON.stringify(university));
  };

  const updateUserAreas = async (areas) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/areas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          areas: areas
        }),
      });

      if (response.ok) {
        const updatedUser = { ...user, preferred_areas: areas };
        setUser(updatedUser);
        localStorage.setItem('koikhabo_user', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const getCurrentUserId = () => {
    if (user) return user.user_id;
    if (guestSession) return guestSession.guest_id;
    return null;
  };

  const isLoggedIn = () => {
    return !!(user || guestSession);
  };

  const isAdmin = () => {
    return !!admin;
  };

  const isGuest = () => {
    return !!guestSession && !user;
  };

  const getWelcomeMessage = () => {
    const messages = [
      "🍽️ Welcome to Koikhabo! Ready to discover amazing food?",
      "🌟 Hungry? Let's find your perfect meal!",
      "🍛 Craving something delicious? You're in the right place!",
      "🥘 Time to explore the best food in Dhaka!",
      "🍜 Your next favorite dish is just a click away!",
      "🍕 Welcome back, foodie! What's on your mind today?",
      "🍔 Ready for a culinary adventure?",
      "🥗 Fresh flavors await you at Koikhabo!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const value = {
    user,
    guestSession,
    admin,
    selectedUniversity,
    loading,
    loginUser,
    startGuestSession,
    loginAdmin,
    logout,
    selectUniversity,
    updateUserAreas,
    getCurrentUserId,
    isLoggedIn,
    isAdmin,
    isGuest,
    getWelcomeMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
