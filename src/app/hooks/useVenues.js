// @/hooks/useVenues.js
// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { dedupeFetch } from '@/utils/dedupeFetch';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

export function useVenues(options = {}) {
  const { skipLocationFilter = false } = options;
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use GeoLocationContext for location-based filtering
  // TIEMPO-276: Get savedLocation/currentLocation for coordinate-based filtering
  const { savedLocation, currentLocation } = useGeoLocation();

  // Fetch venues based on current location (or all if skipLocationFilter)
  const fetchVenues = useCallback(async (isActive = null, location = null) => {
    setLoading(true);
    setError(null);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const params = { appId };

      // Skip location filtering if requested (fetch ALL venues)
      if (!skipLocationFilter) {
        // TIEMPO-276: Always use user's location and range from context
        // Use passed location first, then currentLocation or savedLocation for coordinates
        const coordLocation = location || currentLocation || savedLocation;

        // Add distance-based parameters if location available
        if (coordLocation) {
          // Handle both coordinate formats (lat/lng and latitude/longitude)
          const lat = coordLocation.lat || coordLocation.latitude;
          const lng = coordLocation.lng || coordLocation.longitude;

          if (lat && lng) {
            params.lat = lat;
            params.lng = lng;
            // Use zoomRange from context (user's saved preference) or radius from location
            // Defensive fallback to 50 miles if undefined (prevents "undefinedmi" bug)
            const radiusValue = coordLocation.radius || coordLocation.zoomRange || 50;
            params.radius = `${radiusValue}mi`; // TIEMPO-276: Explicitly specify miles unit
            params.sortByDistance = true; // Sort by closest first
          }
        }
      }
      
      // Only add isActive parameter if explicitly set
      if (isActive !== null) {
        params.isActive = isActive;
      }
      
      // TIEMPO-276: Remove 'all=true' as it bypasses distance filtering in backend
      // params.all = true;
      
      // TIEMPO-276: Use dedupeFetch with location-aware params for proper caching
      // The cache key includes lat/lng/radius, so location changes will fetch fresh data
      const response = await dedupeFetch(`${getApiBaseUrl()}/api/venues`, { params });
      
      // Handle the API response which can come in different formats
      if (response.data && response.data.venues && Array.isArray(response.data.venues)) {
        // Format: {venues: Array, pagination: Object}
        setVenues(response.data.venues);
      } else if (Array.isArray(response.data)) {
        // Handle direct array response (legacy format)
        setVenues(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Format: {data: Array, pagination: Object}
        setVenues(response.data.data);
      } else {
        // TIEMPO-275: Keep console.error for important errors
        console.error('API returned unknown venues data format:', response.data);
        setVenues([]);
      }
    } catch (err) {
      // TIEMPO-275: Keep console.error for important errors
      console.error('Error fetching venues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, savedLocation, skipLocationFilter]);

  // Add effect to fetch venues on component mount or when location changes
  useEffect(() => {
    // TIEMPO-276: Only fetch when we have location data
    // Use currentLocation or savedLocation for actual coordinates
    const coordLocation = currentLocation || savedLocation;
    
    if (coordLocation?.lat || coordLocation?.latitude) {
      fetchVenues();
    } else {
      // TIEMPO-276: Fallback - fetch all venues if no location available
      // This ensures venues are always available even without location
      fetchVenues();
    }
  }, [fetchVenues, currentLocation, savedLocation]);

  const addVenue = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const dataWithAppId = {
        ...data,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };
      const response = await axios.post(`${getApiBaseUrl()}/api/venues`, dataWithAppId);
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
      const response = await axios.put(`${getApiBaseUrl()}/api/venues/${id}`, dataWithAppId);
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
      const response = await axios.delete(`${getApiBaseUrl()}/api/venues/${id}`, {
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
  const getVenueById = useCallback(async (venueId, populate = false) => {
    try {
      setLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      
      // First check if the venue is already in our local state (only if not populating)
      if (!populate) {
        const existingVenue = venues.find(venue => venue._id === venueId);
        if (existingVenue) {
// TIEMPO-276: Security cleanup - removed logging
          return existingVenue;
        }
      }
      
// TIEMPO-276: Security cleanup - removed logging
      const response = await axios.get(`${getApiBaseUrl()}/api/venues/${venueId}`, {
        params: { appId, populate: populate.toString() },
      });
      
      // Handle various response formats
      if (response.data && response.data.venue) {
        // Handle {venue: Object} format
// TIEMPO-276: Security cleanup - removed logging
        return response.data.venue;
      } else if (response.data && typeof response.data === 'object' && response.data._id) {
        // Handle direct venue object format
// TIEMPO-276: Security cleanup - removed logging
        return response.data;
      } else {
        // TIEMPO-275: Keep console.error for important errors
        console.error(`Unexpected venue data format for ID ${venueId}:`, response.data);
        return null;
      }
    } catch (err) {
      // TIEMPO-275: Keep console.error for important errors
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
