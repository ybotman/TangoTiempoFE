// src/hooks/useRAOrganizers.js
import { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Specialized hook for RegionalAdmin users to fetch organizers 
 * from their allowed administrative cities
 */
export const useRAOrganizers = () => {
  const { user, getIdToken } = useContext(AuthContext);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get RA's allowed cities from their localAdminInfo
  const allowedCityIds = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || [];

  const fetchRAOrganizers = useCallback(async () => {
    // Don't fetch if user is not RA or has no allowed cities
    if (!user || !allowedCityIds.length) {
      setOrganizers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get fresh auth token
      const token = await getIdToken(true);

      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      
      console.log('Fetching RA organizers for allowed cities:', allowedCityIds);

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

          const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`, {
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
          
          console.log(`Found ${cityOrganizers.length} organizers in city ${cityId}`);
        } catch (cityError) {
          console.warn(`Failed to fetch organizers for city ${cityId}:`, cityError.message);
          // Continue with other cities
        }
      }

      console.log(`Total RA organizers found: ${allOrganizers.length}`);

      // Ensure we're setting an array
      const organizersData = allOrganizers;
      setOrganizers(organizersData);

    } catch (fetchError) {
      console.error('Error fetching RA organizers:', fetchError);
      setError(fetchError);
      setOrganizers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user, allowedCityIds, getIdToken]);

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