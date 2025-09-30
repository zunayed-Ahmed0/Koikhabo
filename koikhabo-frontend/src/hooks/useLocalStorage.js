import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    favoriteRestaurants: [],
    dietaryRestrictions: [],
    preferredCuisines: [],
    maxBudget: 1000,
    lastLocation: null
  });

  const addFavorite = (restaurantId) => {
    setPreferences(prev => ({
      ...prev,
      favoriteRestaurants: [...new Set([...prev.favoriteRestaurants, restaurantId])]
    }));
  };

  const removeFavorite = (restaurantId) => {
    setPreferences(prev => ({
      ...prev,
      favoriteRestaurants: prev.favoriteRestaurants.filter(id => id !== restaurantId)
    }));
  };

  const isFavorite = (restaurantId) => {
    return preferences.favoriteRestaurants.includes(restaurantId);
  };

  return {
    preferences,
    setPreferences,
    addFavorite,
    removeFavorite,
    isFavorite
  };
};