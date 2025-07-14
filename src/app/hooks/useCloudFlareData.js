'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to read CloudFlare geolocation data from cookies
 * @returns {Object} { cfData, isLoading, isAvailable }
 */
export function useCloudFlareData() {
  const [cfData, setCfData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      // Get the cookie value
      const cookies = document.cookie.split(';');
      const cfCookie = cookies.find(cookie => cookie.trim().startsWith('cf-geo-data='));
      
      if (cfCookie) {
        const cookieValue = cfCookie.split('=')[1];
        const decodedValue = decodeURIComponent(cookieValue);
        const parsedData = JSON.parse(decodedValue);
        
        // Check if we have any actual data (not just nulls)
        const hasData = Object.values(parsedData).some(value => value !== null && value !== undefined);
        
        if (hasData) {
          setCfData(parsedData);
          setIsAvailable(true);
        } else {
          setCfData(null);
          setIsAvailable(false);
        }
      } else {
        setCfData(null);
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error parsing CloudFlare data:', error);
      setCfData(null);
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format data for display
  const formattedData = cfData ? {
    // IP Information
    ipAddress: cfData.ip,
    rayId: cfData.ray,
    protocol: cfData.visitor ? (() => {
      try {
        const visitor = JSON.parse(cfData.visitor);
        return visitor.scheme || 'unknown';
      } catch {
        return 'unknown';
      }
    })() : 'unknown',
    
    // Location Information
    city: cfData.city,
    region: cfData.region,
    regionCode: cfData.regionCode,
    country: cfData.country,
    continent: cfData.continent,
    timezone: cfData.timezone,
    postalCode: cfData.postalCode,
    
    // Coordinates
    latitude: cfData.latitude ? parseFloat(cfData.latitude) : null,
    longitude: cfData.longitude ? parseFloat(cfData.longitude) : null,
    
    // Metadata
    workerActive: cfData.workerActive === 'true',
    timestamp: cfData.timestamp,
    
    // Raw data
    raw: cfData
  } : null;

  return {
    cfData: formattedData,
    isLoading,
    isAvailable
  };
}