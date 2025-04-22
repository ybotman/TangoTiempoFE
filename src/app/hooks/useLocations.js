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
      
      // Handle the API response which returns {venues: Array, pagination: Object}
      if (response.data && response.data.venues && Array.isArray(response.data.venues)) {
        console.log(`useLocations: Received ${response.data.venues.length} venues from API with pagination`);
        setLocations(response.data.venues);
      } else if (Array.isArray(response.data)) {
        // Handle direct array response (legacy format)
        console.log(`useLocations: Received ${response.data.length} venues from API (direct array)`);
        setLocations(response.data);
      } else {
        console.error('useLocations: API returned unknown venues data format:', response.data);
        setLocations([]);
      }
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
      
      // First check if the venue is already in our local state
      const existingVenue = locations.find(loc => loc._id === locationID);
      if (existingVenue) {
        console.log('Found venue in local cache:', existingVenue.name || existingVenue.shortName);
        return existingVenue;
      }
      
      // Otherwise fetch from the API
      console.log(`Fetching venue with ID: ${locationID}`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${locationID}`, {
        params: { appId },
      });
      
      // Handle various response formats
      if (response.data && response.data.venue) {
        // Handle {venue: Object} format
        console.log(`Venue fetched with ID ${locationID}:`, response.data.venue.name || 'Unknown name');
        return response.data.venue;
      } else if (response.data && typeof response.data === 'object' && response.data._id) {
        // Handle direct venue object format
        console.log(`Venue fetched with ID ${locationID}:`, response.data.name || 'Unknown name');
        return response.data;
      } else {
        console.error(`Unexpected venue data format for ID ${locationID}:`, response.data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching venue by ID:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [locations]);

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
