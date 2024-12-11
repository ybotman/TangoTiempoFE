'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// This hook fetches the user's IP-based geolocation via ipapi.
// It returns latitude, longitude, loading, error, and a refetch function.
export function useGeoLocations() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIPLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('https://ipapi.co/json/');
      if (data && data.latitude && data.longitude) {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
      } else {
        throw new Error('Unable to retrieve latitude/longitude from ipapi.');
      }
    } catch (err) {
      console.error('useGeoLocations-> Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIPLocation();
  }, [fetchIPLocation]);

  const refetch = async () => {
    await fetchIPLocation();
  };

  return {
    latitude,
    longitude,
    loading,
    error,
    refetch,
  };
}
