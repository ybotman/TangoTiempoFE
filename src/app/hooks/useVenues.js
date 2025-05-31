// @/hooks/useVenues.js
'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

export function useVenues() {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Use GeoLocationContext for location-based filtering
  const { selectedLocation } = useGeoLocation();
  
  // Get location IDs for filtering
  const masteredRegionId = selectedLocation?.region?.id || null;
  const masteredDivisionId = selectedLocation?.division?.id || null;
  const masteredCityId = selectedLocation?.city?.id || null;

  // Fetch venues based on selected location
  const fetchVenues = useCallback(async (isActive = true) => {
    // Debug selected location
    console.log('Selected location in useVenues:', JSON.stringify(selectedLocation));
    setLoading(true);
    setError(null);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const params = { appId, isActive };
      
      // Add location filters from GeoLocationContext
      // Don't filter by location - the backend's query parameter handling is different
      // We'll just fetch all venues and filter them on the client side if needed
      // This ensures we always have venues to display
      
      // Log all params for debugging
      console.log('Looking for venues with region:', masteredRegionId, 'division:', masteredDivisionId, 'city:', masteredCityId);
      
      console.log('Fetching venues with params:', params);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues`, { params });
      
      // Handle the API response which can come in different formats
      if (response.data && response.data.venues && Array.isArray(response.data.venues)) {
        // Format: {venues: Array, pagination: Object}
        //console.log(`Received ${response.data.venues.length} venues from API with pagination:`, response.data.pagination);
        setVenues(response.data.venues);
      } else if (Array.isArray(response.data)) {
        // Handle direct array response (legacy format)
        console.log(`Received ${response.data.length} venues from API (direct array)`);
        setVenues(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Format: {data: Array, pagination: Object}
        console.log(`Received ${response.data.data.length} venues from API with pagination:`, response.data.pagination);
        setVenues(response.data.data);
      } else {
        console.error('API returned unknown venues data format:', response.data);
        setVenues([]);
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [masteredCityId, masteredDivisionId, masteredRegionId]);

  // Add effect to fetch venues on component mount or when location changes
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const addVenue = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const dataWithAppId = {
        ...data,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues`, dataWithAppId);
      // Refresh venues list after adding a new one
      fetchVenues();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchVenues]);

  const updateVenue = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const dataWithAppId = {
        ...data,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${id}`, dataWithAppId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateVenue = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${id}`, {
        params: { appId },
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch a venue by ID - mimics getLocationById for compatibility
  const getVenueById = useCallback(async (venueId) => {
    try {
      setLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      
      // First check if the venue is already in our local state
      const existingVenue = venues.find(venue => venue._id === venueId);
      if (existingVenue) {
        console.log('Found venue in local cache:', existingVenue.name || existingVenue.shortName);
        return existingVenue;
      }
      
      // Otherwise fetch from the API
      console.log(`Fetching venue with ID: ${venueId}`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${venueId}`, {
        params: { appId },
      });
      
      // Handle various response formats
      if (response.data && response.data.venue) {
        // Handle {venue: Object} format
        console.log(`Venue fetched with ID ${venueId}:`, response.data.venue.name || 'Unknown name');
        return response.data.venue;
      } else if (response.data && typeof response.data === 'object' && response.data._id) {
        // Handle direct venue object format
        console.log(`Venue fetched with ID ${venueId}:`, response.data.name || 'Unknown name');
        return response.data;
      } else {
        console.error(`Unexpected venue data format for ID ${venueId}:`, response.data);
        return null;
      }
    } catch (err) {
      console.error('Error fetching venue by ID:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [venues]);

  // Backward compatibility alias for getLocationById
  const getLocationById = getVenueById;

  return {
    venues,
    error,
    loading,
    fetchVenues,
    addVenue,
    updateVenue,
    deactivateVenue,
    getVenueById,
    getLocationById, // Include for backward compatibility
    // Additional properties for compatibility with useLocations
    locations: venues, // Alias venues as locations for backward compatibility
  };
}
