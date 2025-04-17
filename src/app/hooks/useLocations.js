import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// Renamed from useLocations to useVenues to be more accurate
// while maintaining the old name for backward compatibility
export const useLocations = () => {
  const { selectedLocation } = useGeoLocation();
  
  // Get location IDs for filtering
  const masteredRegionId = selectedLocation?.region?.id || null;
  const masteredDivisionId = selectedLocation?.division?.id || null;
  const masteredCityId = selectedLocation?.city?.id || null;
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch venues by location hierarchy
  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;

      const params = { 
        appId,
        isActive: true // Only fetch active venues by default
      };
      
      // Add location filters from the GeoLocationContext
      if (masteredRegionId) {
        params.masteredRegionId = masteredRegionId;
      }
      
      if (masteredDivisionId) {
        params.masteredDivisionId = masteredDivisionId;
      }
      
      if (masteredCityId) {
        params.masteredCityId = masteredCityId;
      }

      console.log('Fetching venues with params:', params);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues`, { params });
      console.log('Venues fetched successfully:', response.data);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [masteredRegionId, masteredDivisionId, masteredCityId]);

  // Function to fetch a single venue by its ID
  const getLocationById = useCallback(async (locationID) => {
    try {
      setLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${locationID}`, {
        params: { appId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching venue by ID:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always fetch venues regardless of whether a location is selected
    // The API will handle appropriate filtering
    fetchLocations();
  }, [fetchLocations]);

  // Keep the original API for backward compatibility
  return { locations, getLocationById, loading, error };
};

// New hook with better naming
export const useVenues = useLocations;
