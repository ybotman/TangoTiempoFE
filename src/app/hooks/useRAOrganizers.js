// src/hooks/useRAOrganizers.js
// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
import { useCallback, useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

/**
 * Specialized hook for RegionalAdmin users to fetch organizers 
 * from their allowed administrative cities
 */
export const useRAOrganizers = () => {
  const { user, getIdToken } = useContext(AuthContext);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchKey, setLastFetchKey] = useState(null);

  // Extract stable primitive value to prevent infinite loops
  const userId = user?.uid;
  
  // Extract the array to create a stable reference
  const cityIdsArray = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds;
  const cityIdsString = cityIdsArray ? cityIdsArray.join(',') : '';

  // Get RA's allowed cities from their localAdminInfo
  // Use useMemo to create a stable array reference and prevent infinite loops
  const allowedCityIds = useMemo(
    () => cityIdsArray || [],
    [cityIdsString] // Use string representation for stable comparison
  );

  const fetchRAOrganizers = useCallback(async () => {
    // Don't fetch if user is not RA or has no allowed cities
    if (!userId || !allowedCityIds.length) {
      setOrganizers([]);
      setLoading(false);
      return;
    }
    
    // Additional check: don't fetch if user is not a RegionalAdmin
    const userRoles = user?.roles || [];
    const isRegionalAdmin = userRoles.includes('RegionalAdmin') || user?.backendInfo?.selectedRole === 'RegionalAdmin';
    if (!isRegionalAdmin) {
      setOrganizers([]);
      setLoading(false);
      return;
    }
    
    // Create a unique key for this fetch configuration
    const fetchKey = `${userId}-${cityIdsString}`;
    
    // Skip fetch if we already fetched with the same configuration
    if (lastFetchKey === fetchKey && organizers.length > 0) {
// TIEMPO-276: Security cleanup - removed logging
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get fresh auth token
      const token = await getIdToken(true);

      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      
// TIEMPO-276: Security cleanup - removed logging

      // Since backend doesn't support multiple city filtering yet,
      // fetch organizers from all cities the RA manages by making separate requests
      const allOrganizers = [];
      
      for (const cityId of allowedCityIds) {
        try {
          const params = {
            appId,
            isActive: true,
            masteredCityId: cityId // Use the correct parameter name from backend
          };

          const response = await axios.get(`${getApiBaseUrl()}/api/organizers`, {
            params,
            headers: {
              Authorization: `Bearer ${token}`
            },
            timeout: 10000
          });

          // Add organizers from this city, avoiding duplicates
          // Backend returns {organizers: [], pagination: {}} structure
          const cityOrganizers = Array.isArray(response.data?.organizers) ? response.data.organizers : 
                                Array.isArray(response.data) ? response.data : [];
          for (const organizer of cityOrganizers) {
            if (!allOrganizers.find(existing => existing._id === organizer._id)) {
              allOrganizers.push(organizer);
            }
          }
          
// TIEMPO-276: Security cleanup - removed logging
        } catch (cityError) {
          console.warn(`Failed to fetch organizers for city ${cityId}:`, cityError.message);
          // Continue with other cities
        }
      }

// TIEMPO-276: Security cleanup - removed logging

      // Ensure we're setting an array
      const organizersData = allOrganizers;
      setOrganizers(organizersData);
      
      // Update the last fetch key
      setLastFetchKey(fetchKey);

    } catch (fetchError) {
      console.error('Error fetching RA organizers:', fetchError);
      setError(fetchError);
      setOrganizers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userId, allowedCityIds, getIdToken, user?.roles, user?.backendInfo?.selectedRole, cityIdsString, lastFetchKey, organizers.length]);

  // Fetch organizers when user or allowed cities change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRAOrganizers();
    }, 100); // Small delay to allow context initialization

    return () => clearTimeout(timeoutId);
  }, [fetchRAOrganizers]);

  return {
    organizers: Array.isArray(organizers) ? organizers : [],
    loading,
    error,
    refetch: fetchRAOrganizers,
    allowedCityIds
  };
};