import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false to disable loading
  const [error, setError] = useState('Location disabled for university-based filtering');

  // COMPLETELY DISABLED GEOLOCATION - Using university-based filtering instead
  useEffect(() => {
    console.log('🚫 Geolocation disabled - using university-based filtering');
    setLoading(false);
    setError('Location disabled for university-based filtering');
    setLocation(null);
  }, []);

  return { location: null, loading: false, error };
};