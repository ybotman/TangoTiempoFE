// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/contexts/MasteredLocationContext.js
// Explanation: We add latitude and longitude fields to the nearestCity state when fetching.
// No code is dropped, only extended. We ensure that after changing nearest city, it updates context accordingly.
// We keep everything else intact.

'use client';

// Refactored to remove circular dependency with GeoLocationContext
// This context now acts as a pure data provider without reaching up to GeoLocationContext
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const MasteredLocationContext = createContext();

export const MasteredLocationProvider = ({ children }) => {
  const [nearestCity, setNearestCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [divisions, setDivisions] = useState([]);

  // Fetch nearest city with improved error handling and rate limiting management
  // This function is now independently available for any component to use
  const fetchNearestCity = useCallback(async (latitude, longitude, maxDistance = 500000) => {
    // Enhanced error handling for latitude/longitude parameters
    // This fixes the "Cannot access 'latitude' before initialization" error
    if (latitude === undefined || latitude === null || 
        longitude === undefined || longitude === null || 
        isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      console.error('MasteredLocationContext: fetchNearestCity - Invalid coordinates', { latitude, longitude });
      
      // Set a descriptive error that doesn't depend on the parameters
      const errorMessage = 'Invalid or missing coordinates for nearest city lookup';
      setError(errorMessage);
      
      // Generate a fallback city without hardcoded MongoDB IDs
      // Following SuccessCriteria #11: Never use hardcoded MongoDB IDs
      // const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const bostonFallback = {
        cityID: null,  // No hardcoded ID
        cityName: 'Boston',
        regionID: null, // No hardcoded ID
        regionName: 'Northeast',
        divisionID: null, // No hardcoded ID
        divisionName: 'New England',
        countryID: null, // No hardcoded ID
        countryName: 'United States',
        latitude: 42.3601,
        longitude: -71.0589,
        isFallback: true, // Mark as fallback data
        reason: 'invalid_coordinates' // Add reason for diagnostics
      };
      
      setNearestCity(bostonFallback);
      // Using Boston fallback due to invalid coordinates
      return bostonFallback;
    }

    // Ensure latitude/longitude are parsed as floats for consistency
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    // Fetching nearest city with coordinates
    
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const url = `${baseURL}/api/masteredLocations/nearestMastered?latitude=${parsedLatitude}&longitude=${parsedLongitude}&maxDistance=${maxDistance}&isActive=true&appId=${appId}`;

      const response = await fetch(url);
      if (!response.ok) {
        // Default to Boston without hardcoded IDs
        if (response.status === 404) {
          // No nearby city found, defaulting to Boston
          
          // Following SuccessCriteria #11: Never use hardcoded MongoDB IDs
          const defaultCity = {
            cityID: null, // No hardcoded ID
            cityName: 'Boston',
            regionID: null, // No hardcoded ID
            regionName: 'Northeast',
            divisionID: null, // No hardcoded ID
            divisionName: 'New England',
            countryID: null, // No hardcoded ID
            countryName: 'United States',
            latitude: 42.3601,
            longitude: -71.0589,
            isFallback: true, // Mark as fallback data
            reason: 'not_found' // Add reason for diagnostics
          };
          setNearestCity(defaultCity);
          return defaultCity;
        }

        const message = `Error fetching nearest city: ${response.statusText || 'Unknown error'}`;
        setError(message);
        
        // Create a fallback city without hardcoded IDs
        // Following SuccessCriteria #11: Never use hardcoded MongoDB IDs
        const errorFallbackCity = {
          cityID: null, // No hardcoded ID
          cityName: 'Boston',
          regionID: null, // No hardcoded ID
          regionName: 'Northeast',
          divisionID: null, // No hardcoded ID
          divisionName: 'New England',
          countryID: null, // No hardcoded ID
          countryName: 'United States',
          latitude: 42.3601,
          longitude: -71.0589,
          isFallback: true, // Mark as fallback data
          reason: 'api_error' // Add reason for diagnostics
        };
        
        setNearestCity(errorFallbackCity);
        return errorFallbackCity;
      }

      const data = await response.json();

      // Enhanced coordinate extraction with better fallbacks
      // Handle potential missing coordinate data in the response
      let cityLatitude = null;
      let cityLongitude = null;
      
      // Try multiple possible locations for coordinates with more robust checking
      if (data.latitude !== undefined && data.latitude !== null && !isNaN(parseFloat(data.latitude))) {
        cityLatitude = parseFloat(data.latitude);
      } else if (data.location?.coordinates && 
                Array.isArray(data.location.coordinates) && 
                data.location.coordinates.length >= 2 &&
                !isNaN(parseFloat(data.location.coordinates[1]))) {
        cityLatitude = parseFloat(data.location.coordinates[1]);
      } else {
        // Default to Boston's latitude as fallback
        cityLatitude = 42.3601;
        // Using fallback latitude for city data
      }
      
      if (data.longitude !== undefined && data.longitude !== null && !isNaN(parseFloat(data.longitude))) {
        cityLongitude = parseFloat(data.longitude);
      } else if (data.location?.coordinates && 
                Array.isArray(data.location.coordinates) && 
                data.location.coordinates.length >= 2 &&
                !isNaN(parseFloat(data.location.coordinates[0]))) {
        cityLongitude = parseFloat(data.location.coordinates[0]);
      } else {
        // Default to Boston's longitude as fallback
        cityLongitude = -71.0589;
        // Using fallback longitude for city data
      }

      const cityData = {
        cityID: data.cityID || data._id, // Use _id as fallback but don't hardcode
        cityName: data.cityName || data.name || 'Boston', // Use name as fallback
        regionID: data.regionID || data.masteredRegionId,
        regionName: data.regionName || 'Northeast',
        divisionID: data.divisionID || data.masteredDivisionId,
        divisionName: data.divisionName || 'New England',
        countryID: data.countryID || data.masteredCountryId,
        countryName: data.countryName || 'United States',
        // Use the safely extracted coordinates
        latitude: cityLatitude,
        longitude: cityLongitude,
        // Mark if we had to use any fallbacks
        isFallback: (cityLatitude === 42.3601 && cityLongitude === -71.0589) || 
                    !data.cityID || !data.regionID || !data.divisionID || !data.countryID
      };

      // Successfully fetched nearest city

      setNearestCity(cityData);
      return cityData;
    } catch (err) {
      // Enhanced error handling to avoid accessing undefined properties
      // This is the critical fix for the error in Issue #1027
      const errorMessage = err && typeof err.message === 'string' ? err.message : 'Unknown error fetching nearest city';
      console.error('MasteredLocationContext: Error fetching nearest city:', errorMessage);
      setError(errorMessage);

      // Create a fallback city without hardcoded IDs
      // Following SuccessCriteria #11: Never use hardcoded MongoDB IDs
      const fallbackCity = {
        cityID: null, // No hardcoded ID
        cityName: 'Boston',
        regionID: null, // No hardcoded ID
        regionName: 'Northeast',
        divisionID: null, // No hardcoded ID
        divisionName: 'New England',
        countryID: null, // No hardcoded ID
        countryName: 'United States',
        latitude: 42.3601,
        longitude: -71.0589,
        isFallback: true, // Mark as fallback data
        reason: 'exception' // Add reason for diagnostics
      };
      
      setNearestCity(fallbackCity);
      return fallbackCity;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cities for a specific division or all cities if divisionId is not provided
  const fetchCities = useCallback(async (divisionId, isActive = true) => {
    // Fetching cities
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      // Construct URL with query parameters
      let url = `${baseURL}/api/masteredLocations/cities?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (divisionId) {
        url += `&divisionId=${divisionId}`;
      }

      // Fetching cities from API
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching cities: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different API response formats
      let citiesArray = data;
      if (!Array.isArray(data) && data.cities && Array.isArray(data.cities)) {
        // API returned cities in nested format
        citiesArray = data.cities;
      } else if (!Array.isArray(data)) {
        console.error('MasteredLocationContext: Invalid cities data format:', data);
        setCities([]);
        setError('City data is in an invalid format');
        return [];
      }

      // Process cities to ensure consistent coordinate format
      const processedCities = citiesArray.map(city => {
        // Extract coordinates - handle both direct props and GeoJSON format
        let latitude = city.latitude;
        let longitude = city.longitude;

        // If we don't have direct coordinates, try to extract from location object
        if ((latitude === undefined || longitude === undefined) &&
            city.location && city.location.type === 'Point' &&
            Array.isArray(city.location.coordinates) &&
            city.location.coordinates.length === 2) {
          longitude = city.location.coordinates[0];
          latitude = city.location.coordinates[1];
        }

        return {
          ...city,
          latitude,
          longitude,
          // Ensure we always have these props even if they're null
          cityID: city.cityID || city._id,
          cityName: city.cityName || city.name || 'Unknown City'
        };
      });

      // Filter cities to only include those with valid coordinates
      const citiesWithCoordinates = processedCities.filter(
        city => city.latitude !== undefined &&
               city.longitude !== undefined &&
               city.latitude !== null &&
               city.longitude !== null &&
               !isNaN(parseFloat(city.latitude)) &&
               !isNaN(parseFloat(city.longitude))
      );

      // Cities fetched successfully

      setCities(citiesWithCoordinates);
      return citiesWithCoordinates;
    } catch (err) {
      console.error('MasteredLocationContext: Error fetching cities:', err.message);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch regions
  const fetchRegions = useCallback(async (countryId, isActive = true) => {
    // Fetching regions
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      let url = `${baseURL}/api/masteredLocations/regions?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (countryId) {
        url += `&countryId=${countryId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching regions: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different API response formats
      let regionsArray = data;
      if (!Array.isArray(data) && data.regions && Array.isArray(data.regions)) {
        regionsArray = data.regions;
      }

      setRegions(regionsArray);
      return regionsArray;
    } catch (err) {
      console.error('MasteredLocationContext: Error fetching regions:', err.message);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch divisions
  const fetchDivisions = useCallback(async (regionId, isActive = true) => {
    // Fetching divisions
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      let url = `${baseURL}/api/masteredLocations/divisions?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (regionId) {
        url += `&regionId=${regionId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching divisions: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different API response formats
      let divisionsArray = data;
      if (!Array.isArray(data) && data.divisions && Array.isArray(data.divisions)) {
        divisionsArray = data.divisions;
      }

      setDivisions(divisionsArray);
      return divisionsArray;
    } catch (err) {
      console.error('MasteredLocationContext: Error fetching divisions:', err.message);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeContext = async () => {
    try {
      // Set initial loading state
      setLoading(true);
      console.log('MasteredLocationContext: Initializing with Boston as default');
      
      // Set Boston as the immediate default location
      // This ensures users see content immediately without waiting for geolocation
      const bostonDefault = {
        cityID: null, // No hardcoded ID
        cityName: 'Boston',
        regionID: null, // No hardcoded ID
        regionName: 'Northeast',
        divisionID: null, // No hardcoded ID
        divisionName: 'New England',
        countryID: null, // No hardcoded ID
        countryName: 'United States',
        latitude: 42.3601,
        longitude: -71.0589,
        isDefault: true, // Mark as default (not fallback)
        isFallback: false // This is intentional default, not a fallback
      };
      
      setNearestCity(bostonDefault);
      console.log('MasteredLocationContext: Boston set as default location');

      // Preload cities data for the UI - do this regardless of how we got location
      // Preloading cities and regions data
      try {
        // Use Promise.allSettled to load data in parallel without failing if one fails
        await Promise.allSettled([
          fetchCities(),
          fetchRegions()
        ]);
      } catch (dataError) {
        console.warn('MasteredLocationContext: Error preloading data:', dataError);
        // Non-fatal, continue with initialization
      }
      
      // Context initialization complete
      
    } catch (err) {
      // Handle any errors that happened during the overall initialization process
      // Use safe error access to avoid "Cannot access property" errors
      const errorMessage = err && typeof err.message === 'string' ? 
                          err.message : 'Unknown error initializing MasteredLocationContext';
                          
      console.error('MasteredLocationContext: Error initializing context:', errorMessage);
      setError(errorMessage);

      // Default to Boston if any other error occurs - without hardcoded IDs
      // Defaulting to Boston as emergency fallback
      
      // Following SuccessCriteria #11: Never use hardcoded MongoDB IDs
      const emergencyFallback = {
        cityID: null, // No hardcoded ID
        cityName: 'Boston',
        regionID: null, // No hardcoded ID  
        regionName: 'Northeast',
        divisionID: null, // No hardcoded ID
        divisionName: 'New England',
        countryID: null, // No hardcoded ID
        countryName: 'United States',
        latitude: 42.3601,
        longitude: -71.0589,
        isFallback: true, // Mark as fallback data
        reason: 'emergency_fallback' // Add reason for diagnostics
      };
      
      setNearestCity(emergencyFallback);
    } finally {
      // Always make sure to reset loading state
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay before initialization to ensure parent contexts are ready
    const initTimer = setTimeout(() => {
      initializeContext();
    }, 100); // Small delay to ensure proper initialization order

    return () => clearTimeout(initTimer);
  }, []);

  // Enhanced context value with more data services
  const contextValue = {
    nearestCity,
    loading,
    error,
    cities,
    regions,
    divisions,
    fetchNearestCity,
    fetchCities,
    fetchRegions,
    fetchDivisions
  };

  return (
    <MasteredLocationContext.Provider value={contextValue}>
      {children}
    </MasteredLocationContext.Provider>
  );
};

MasteredLocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useMasteredLocation = () => useContext(MasteredLocationContext);
