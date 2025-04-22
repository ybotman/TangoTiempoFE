// @/hooks/useVenues.js
'use client';

import { useState, useCallback, useContext, useEffect } from 'react';
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
      
      // Handle the API response which returns {venues: Array, pagination: Object}
      if (response.data && response.data.venues && Array.isArray(response.data.venues)) {
        console.log(`Received ${response.data.venues.length} venues from API with pagination:`, response.data.pagination);
        setVenues(response.data.venues);
      } else if (Array.isArray(response.data)) {
        // Handle direct array response (legacy format)
        console.log(`Received ${response.data.length} venues from API (direct array)`);
        setVenues(response.data);
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

  return {
    venues,
    error,
    loading,
    fetchVenues,
    addVenue,
    updateVenue,
    deactivateVenue,
  };
}
