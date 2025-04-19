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
      // Use the backend proxy to avoid CORS issues
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const { data } = await axios.get(`${baseURL}/api/firebase/geo/ip`);
      
      if (data && data.latitude && data.longitude) {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
      } else if (data && data.fallback) {
        // Use fallback coordinates if provided
        setLatitude(data.fallback.latitude);
        setLongitude(data.fallback.longitude);
      } else {
        throw new Error('Unable to retrieve geolocation data.');
      }
    } catch (err) {
      console.error('useGeoLocations-> Error:', err.message);
      setError(err.message);
      // Set fallback US center coordinates
      setLatitude(39.8283);
      setLongitude(-98.5795);
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
