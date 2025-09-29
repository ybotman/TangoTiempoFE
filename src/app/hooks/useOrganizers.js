// src/hooks/useOrganizers.js
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

export const useOrganizers = (options = {}) => {
  const { selectedLocation } = useGeoLocation();
  const { skipLocationFilter = false } = options; // Allow skipping location filter for dropdowns

  // Get location IDs for filtering with proper null checks
  const masteredRegionId = selectedLocation?.region?.id || null;
  const masteredDivisionId = selectedLocation?.division?.id || null;
  const masteredCityId = selectedLocation?.city?.id || null;

  const [organizers, setOrganizers] = useState([]);
  const [organizer, setOrganizer] = useState(null); // Single organizer data
  const [fetchLoading, setFetchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [organizerCache, setOrganizerCache] = useState({}); // Cache for individual organizers

  // Check and use cached organizers data to reduce API dependency
  const getCachedOrganizers = useCallback(() => {
    try {
      const cachedData = localStorage.getItem('organizers_data');
      const cacheTimestamp = localStorage.getItem('organizers_timestamp');

      if (cachedData && cacheTimestamp) {
        const parsedData = JSON.parse(cachedData);
        const timestamp = parseInt(cacheTimestamp, 10);
        const now = Date.now();
        const cacheExpiry = 60 * 60 * 1000; // 1 hour cache expiry

        // Check if the cache is valid and not expired
        if (Array.isArray(parsedData) && now - timestamp < cacheExpiry) {
// TIEMPO-276: Security cleanup - removed logging
          setOrganizers(parsedData);
          setFetchLoading(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('Error reading organizers from cache:', error);
      return false;
    }
  }, []);

  // Cache organizers data to localStorage
  const cacheOrganizers = useCallback((data) => {
    try {
      localStorage.setItem('organizers_data', JSON.stringify(data));
      localStorage.setItem('organizers_timestamp', Date.now().toString());
// TIEMPO-276: Security cleanup - removed logging
    } catch (cacheError) {
      console.warn('Error caching organizers data:', cacheError);
    }
  }, []);

  // Fetch organizers based on selected location hierarchy from GeoLocationContext
  const fetchOrganizers = useCallback(async () => {
    // Try to use cached data first
    if (getCachedOrganizers()) {
      return;
    }

    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
    const params = {
      appId,
      isActive: true // Only fetch active organizers by default
    };

    // Add location filters from the GeoLocationContext with null checks
    // Skip location filtering when used for dropdowns (need ALL organizers)
    if (!skipLocationFilter) {
      if (masteredRegionId) {
        params.organizerRegion = masteredRegionId;
      }

      if (masteredDivisionId) {
        params.organizerDivision = masteredDivisionId;
      }

      if (masteredCityId) {
        params.organizerCity = masteredCityId;
      }
    }

    try {
      setFetchLoading(true);
// TIEMPO-276: Security cleanup - removed logging

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`, {
        params,
        timeout: 10000 // 10 second timeout to prevent hanging requests
      });

// TIEMPO-276: Security cleanup - removed logging

      // Ensure we're setting an array
      const organizersData = Array.isArray(response.data) ? response.data : [];
      setOrganizers(organizersData);
      setError(null);
      setRetryCount(0); // Reset retry count on success

      // Cache the successful response
      cacheOrganizers(organizersData);

    } catch (error) {
      console.error('Error fetching organizers:', error);
      setError(error);

      // Try to use cached data on error, even if expired
      if (!getCachedOrganizers()) {
        // Set to empty array if no cache available
        setOrganizers([]);
      }

    } finally {
      setFetchLoading(false);
    }
  }, [masteredRegionId, masteredDivisionId, masteredCityId, getCachedOrganizers, cacheOrganizers]);

  // Implement retry with exponential backoff
  const fetchWithRetry = useCallback(() => {
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
// TIEMPO-276: Security cleanup - removed logging
      return;
    }

    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
// TIEMPO-276: Security cleanup - removed logging

    setTimeout(() => {
      setRetryCount(prevCount => prevCount + 1);
      fetchOrganizers();
    }, delay);
  }, [retryCount, fetchOrganizers]);

  // Fetch a single organizer by ID
  const fetchOrganizerById = useCallback(async (organizerId) => {
    if (!organizerId) {
      console.warn('fetchOrganizerById called with invalid organizerId');
      return;
    }

    // Check cache first
    if (organizerCache[organizerId]) {
// TIEMPO-276: Security cleanup - removed logging
      setOrganizer(organizerCache[organizerId]);
      return;
    }

// TIEMPO-276: Security cleanup - removed logging

    try {
      setFetchLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`, {
        params: { appId },
        timeout: 10000 // 10 second timeout
      });

// TIEMPO-276: Security cleanup - removed logging
      setOrganizer(response.data);
      setError(null);
      
      // Update cache
      setOrganizerCache(prev => ({
        ...prev,
        [organizerId]: response.data
      }));

    } catch (fetchError) {
      console.error('Error fetching organizer:', fetchError);
      setError(fetchError);

    } finally {
      setFetchLoading(false);
    }
  }, [organizerCache]);

  // Fetch an organizer by firebaseUserId
  const fetchOrganizerByFirebaseUserId = useCallback(async (firebaseUserId) => {
    if (!firebaseUserId) {
      console.warn('fetchOrganizerByFirebaseUserId called with invalid firebaseUserId');
      return null;
    }

    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/firebase/${firebaseUserId}`, {
        params: { appId },
        timeout: 10000 // 10 second timeout
      });

// TIEMPO-276: Security cleanup - removed logging
      return response.data;

    } catch (error) {
      // Handle 404 gracefully
      if (error.response && error.response.status === 404) {
        return null; // Organizer not found is a valid result
      }
      // Handle rate limiting with retry
      else if (error.response && error.response.status === 429) {
        console.warn('Rate limited when fetching organizer. Will retry...');
        // Could implement retry logic here if needed
        return null;
      }
      else {
        console.error('Error fetching organizer by firebaseUserId:', error);
        return null; // Return null instead of throwing to make the API more resilient
      }
    }
  }, []);

  // Update an existing organizer
  const updateOrganizer = useCallback(async (organizerId, updateData) => {
    if (!organizerId || !updateData) {
      console.warn('updateOrganizer called with invalid parameters');
      return null;
    }

    try {
// TIEMPO-276: Security cleanup - removed logging
      setUpdateLoading(true);

      // Add appId to the update data
      const dataWithAppId = {
        ...updateData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`,
        dataWithAppId,
        { timeout: 10000 } // 10 second timeout
      );

// TIEMPO-276: Security cleanup - removed logging
      setOrganizer(response.data); // Update organizer state with response data
      setError(null);

      return response.data;

    } catch (updateError) {
      console.error('Error updating organizer:', updateError);
      setError(updateError);
      return null;

    } finally {
      setUpdateLoading(false);
    }
  }, []);

  // Create a new organizer
  const createOrganizer = useCallback(async (organizerData) => {
    if (!organizerData) {
      console.warn('createOrganizer called with invalid organizerData');
      return null;
    }

    try {
      setCreateLoading(true);
      const dataWithAppId = {
        ...organizerData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`,
        dataWithAppId,
        { timeout: 10000 } // 10 second timeout
      );

// TIEMPO-276: Security cleanup - removed logging
      setError(null);

      return response.data;

    } catch (error) {
      console.error('Error creating organizer:', error);
      setError(error);
      return null;

    } finally {
      setCreateLoading(false);
    }
  }, []);

  // Effect to fetch organizers when the selected location hierarchy changes
  useEffect(() => {
    // Stagger the API call to prevent API call cascade
    const timeoutId = setTimeout(() => {
      fetchOrganizers();
    }, 100); // Small delay to allow other components to initialize

    return () => clearTimeout(timeoutId);
  }, [fetchOrganizers]);

  // Effect to retry on error and rate limiting
  useEffect(() => {
    // If we have an error and it's a 429 rate limit error, retry with backoff
    if (error && error.response && error.response.status === 429) {
      fetchWithRetry();
    }
  }, [error, fetchWithRetry]);

  return {
    // Always ensure organizers is an array
    organizers: Array.isArray(organizers) ? organizers : [],
    organizer,
    setOrganizer,
    fetchLoading,
    createLoading,
    updateLoading,
    error,
    fetchOrganizerById,
    fetchOrganizerByFirebaseUserId,
    updateOrganizer,
    createOrganizer,
    // Add manual refetch method for components to trigger refresh
    refetch: fetchOrganizers
  };
};
