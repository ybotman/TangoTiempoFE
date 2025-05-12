// src/hooks/useRegions.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRegions() {
  // Initialize with an empty array to ensure it's always an array
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useEffect in useRegions');

    // Check for cached regions data
    const getCachedRegions = () => {
      try {
        const cachedData = localStorage.getItem('regions_data');
        const cacheTimestamp = localStorage.getItem('regions_timestamp');

        if (cachedData && cacheTimestamp) {
          const parsedData = JSON.parse(cachedData);
          const timestamp = parseInt(cacheTimestamp, 10);
          const now = Date.now();
          const cacheExpiry = 60 * 60 * 1000; // 1 hour

          // Use cache if it's valid and not expired
          if (Array.isArray(parsedData) && now - timestamp < cacheExpiry) {
            console.log('Using cached regions data');
            setRegions(parsedData);
            setLoading(false);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.warn('Error reading from cache:', error);
        return false;
      }
    };

    const getRegions = async () => {
      // Try to use cached data first
      if (getCachedRegions()) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`, {
          params: { appId },
          timeout: 10000, // 10 second timeout
        });

        console.log('Regions loaded from API:', response.data);

        // Ensure we're setting an array
        const regionsData = Array.isArray(response.data) ? response.data : [];
        setRegions(regionsData);

        // Cache the data
        try {
          localStorage.setItem('regions_data', JSON.stringify(regionsData));
          localStorage.setItem('regions_timestamp', Date.now().toString());
          console.log('Regions data cached successfully');
        } catch (cacheError) {
          console.warn('Error caching regions data:', cacheError);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setError(error.message || 'Failed to load regions');

        // Try to use cached data if available, even if expired
        if (!getCachedRegions()) {
          // Set to empty array on error if no cache is available
          setRegions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Implement exponential backoff for API calls
    let retryCount = 0;
    const maxRetries = 3;

    const fetchWithRetry = async () => {
      try {
        await getRegions();
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying regions fetch in ${delay}ms (attempt ${retryCount})`);
          setTimeout(fetchWithRetry, delay);
        }
      }
    };

    fetchWithRetry();

    // Cleanup function
    return () => {
      // Cancel any pending requests if needed
    };
  }, []);

  // Always return an object with all necessary properties
  return {
    regions: Array.isArray(regions) ? regions : [],
    loading,
    error
  };
}
