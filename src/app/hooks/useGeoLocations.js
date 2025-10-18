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
      // Check if we're already rate limited
      if (sessionStorage.getItem('geo_rate_limited')) {
        console.warn('useGeoLocations: Using cached rate limit status, falling back to default coordinates');
        // Set fallback US center coordinates
        setLatitude(39.8283);
        setLongitude(-98.5795);
        return;
      }
      
      // Use Azure Functions for geo IP lookup
      const afUrl = process.env.NEXT_PUBLIC_AF_URL || '';

      // Add a timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      try {
        const response = await axios.get(`${afUrl}/api/geo/ip`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check for rate limiting
        if (response.status === 429) {
          console.warn('Geo IP service rate limited, using default location');
          sessionStorage.setItem('geo_rate_limited', 'true');
          // Set a timeout to clear the rate limit flag after 5 minutes
          setTimeout(() => {
            sessionStorage.removeItem('geo_rate_limited');
          }, 5 * 60 * 1000);
          throw new Error('Rate limited');
        }
        
        const data = response.data;
        if (data && data.latitude && data.longitude) {
          setLatitude(data.latitude);
          setLongitude(data.longitude);
        } else if (data && data.fallback) {
          // Use fallback coordinates if provided
          setLatitude(data.fallback.latitude);
          setLongitude(data.fallback.longitude);
// TIEMPO-276: Security cleanup - removed logging
        } else {
          throw new Error('Unable to retrieve geolocation data.');
        }
      } catch (axiosError) {
        clearTimeout(timeoutId);
        throw axiosError;
      }
    } catch (err) {
      // Don't log canceled/aborted requests as errors
      if (err.name === 'AbortError' || err.message === 'canceled') {
// TIEMPO-276: Security cleanup - removed logging
      } else {
        console.error('useGeoLocations-> Error:', err.message);
        setError(err.message);
      }
      // Set fallback to center of continental US instead of Boston
      setLatitude(39.8283);
      setLongitude(-98.5795);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // TIEMPO-135: Disable automatic IP geolocation - always use Boston
    // fetchIPLocation();  // Disabled per requirements
    
    // Check if we're embedded in Boston Tango Calendar iframe
    const isBostonCalendar = typeof window !== 'undefined' && 
      (window.location.hostname.toLowerCase().includes('bostontangocalendar') ||
       window.parent !== window && document.referrer.toLowerCase().includes('bostontangocalendar'));
    
    if (isBostonCalendar) {
      // For Boston Tango Calendar, we should trigger Boston city selection
// TIEMPO-276: Security cleanup - removed logging
      // Note: The actual city selection will be handled by the calendar page
      setLatitude(42.3601);
      setLongitude(-71.0589);
    } else {
      // Set center of continental US coordinates for all other cases
      setLatitude(39.8283);
      setLongitude(-98.5795);
    }
    
    setLoading(false);
// TIEMPO-276: Security cleanup - removed logging
  }, [fetchIPLocation]);

  const refetch = async () => {
    // TIEMPO-135: Refetch also disabled - always return Boston
    // await fetchIPLocation();  // Disabled per requirements
    
    // Just set US center coordinates again
    setLatitude(39.8283);
    setLongitude(-98.5795);
    setLoading(false);
// TIEMPO-276: Security cleanup - removed logging
  };

  return {
    latitude,
    longitude,
    loading,
    error,
    refetch,
  };
}
