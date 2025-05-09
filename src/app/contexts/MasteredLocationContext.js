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
    if (!latitude || !longitude) {
      console.error('MasteredLocationContext: fetchNearestCity - Latitude and longitude are required');
      setError('Latitude and longitude are required.');
      return null;
    }

    console.log('MasteredLocationContext: fetchNearestCity - Fetching nearest city', { latitude, longitude });
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const url = `${baseURL}/api/masteredLocations/nearestMastered?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}&isActive=true&appId=${appId}`;

      const response = await fetch(url);
      if (!response.ok) {
        // Default to Northeast region if no city is found
        if (response.status === 404) {
          console.log('MasteredLocationContext: No nearby city found, defaulting to Northeast region');
          const defaultCity = {
            cityID: '6751f58a5db435dd8005e479',  // Boston city ID
            cityName: 'Boston',
            regionID: '6751f58a5db435dd8005e45b', // Northeast region ID
            regionName: 'Northeast',
            divisionID: '6751f58a5db435dd8005e461', // New England division ID
            divisionName: 'New England',
            countryID: '6751f57e2e74d97609e7dca0', // US country ID
            countryName: 'United States',
            latitude: 42.3601,
            longitude: -71.0589,
            isFallback: true // Mark as fallback data
          };
          setNearestCity(defaultCity);
          return defaultCity;
        }

        const message = `Error fetching nearest city: ${response.statusText}`;
        setError(message);
        throw new Error(message);
      }

      const data = await response.json();

      // Ensure we have valid coordinates - using API data or adding defaults
      // Handle potential missing coordinate data in the response
      const latitude = data.latitude ||
                      (data.location?.coordinates ? data.location.coordinates[1] : null);
      const longitude = data.longitude ||
                       (data.location?.coordinates ? data.location.coordinates[0] : null);

      const cityData = {
        cityID: data.cityID,
        cityName: data.cityName,
        regionID: data.regionID,
        regionName: data.regionName,
        divisionID: data.divisionID,
        divisionName: data.divisionName,
        countryID: data.countryID,
        countryName: data.countryName,
        // Ensure we always have coordinates in a consistent format
        latitude: latitude !== null && latitude !== undefined ? latitude : 42.3601, // Boston as fallback
        longitude: longitude !== null && longitude !== undefined ? longitude : -71.0589
      };

      console.log('MasteredLocationContext: fetchNearestCity - Success', {
        cityName: cityData.cityName,
        coords: [cityData.latitude, cityData.longitude]
      });

      setNearestCity(cityData);
      return cityData;
    } catch (err) {
      console.error('MasteredLocationContext: Error fetching nearest city:', err.message);
      setError(err.message);

      // Create a fallback city with valid data
      const fallbackCity = {
        cityID: '6751f58a5db435dd8005e479',  // Boston city ID
        cityName: 'Boston',
        regionID: '6751f58a5db435dd8005e45b', // Northeast region ID
        regionName: 'Northeast',
        divisionID: '6751f58a5db435dd8005e461', // New England division ID
        divisionName: 'New England',
        countryID: '6751f57e2e74d97609e7dca0', // US country ID
        countryName: 'United States',
        latitude: 42.3601,
        longitude: -71.0589,
        isFallback: true // Mark as fallback data
      };
      setNearestCity(fallbackCity);
      return fallbackCity;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cities for a specific division or all cities if divisionId is not provided
  const fetchCities = useCallback(async (divisionId, isActive = true) => {
    console.log('MasteredLocationContext: fetchCities', { divisionId, isActive });
    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      // Construct URL with query parameters
      let url = `${baseURL}/api/masteredLocations/cities?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (divisionId) {
        url += `&divisionId=${divisionId}`;
      }

      console.log('MasteredLocationContext: Fetching cities from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching cities: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different API response formats
      let citiesArray = data;
      if (!Array.isArray(data) && data.cities && Array.isArray(data.cities)) {
        console.log('MasteredLocationContext: API returned cities in data.cities format');
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

      console.log(`MasteredLocationContext: Cities fetched: ${citiesArray.length}, With coordinates: ${citiesWithCoordinates.length}`);

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
    console.log('MasteredLocationContext: fetchRegions', { countryId, isActive });
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
    console.log('MasteredLocationContext: fetchDivisions', { regionId, isActive });
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
      let latitude, longitude;
      let useDefaultLocation = false;

      try {
        // Only attempt to fetch geolocation if we haven't been rate limited
        if (!sessionStorage.getItem('geo_rate_limited')) {
          const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const ipapiResponse = await fetch(`${baseURL}/api/firebase/geo/ip`, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          // Handle rate limiting explicitly
          if (ipapiResponse.status === 429) {
            console.warn('Geo IP service rate limited, using default location');
            sessionStorage.setItem('geo_rate_limited', 'true');
            // Set a timeout to clear the rate limit flag after 5 minutes
            setTimeout(() => {
              sessionStorage.removeItem('geo_rate_limited');
            }, 5 * 60 * 1000);
            throw new Error('Rate limited');
          }

          if (!ipapiResponse.ok) {
            throw new Error(`Geolocation Error: ${ipapiResponse.statusText}`);
          }

          const data = await ipapiResponse.json();

          if (data.latitude && data.longitude) {
            latitude = data.latitude;
            longitude = data.longitude;
          } else if (data.fallback) {
            // Use fallback coordinates if provided by proxy
            latitude = data.fallback.latitude;
            longitude = data.fallback.longitude;
            console.log('Using fallback coordinates from proxy');
          } else {
            throw new Error('Invalid geolocation data.');
          }
        } else {
          throw new Error('Using cached rate limit status');
        }
      } catch (geoError) {
        console.warn('Geolocation failed, using default location:', geoError.message);
        useDefaultLocation = true;
      }

      if (!useDefaultLocation) {
        await fetchNearestCity(latitude, longitude);
      } else {
        // Default to Boston if geolocation fails
        console.log('Defaulting to Boston as fallback city');
        setNearestCity({
          cityID: '6751f58a5db435dd8005e479',
          cityName: 'Boston',
          regionID: '6751f58a5db435dd8005e45b',
          regionName: 'Northeast',
          divisionID: '6751f58a5db435dd8005e461',
          divisionName: 'New England',
          countryID: '6751f57e2e74d97609e7dca0',
          countryName: 'United States',
          latitude: 42.3601,
          longitude: -71.0589,
          isFallback: true // Mark as fallback data
        });
      }

      // Preload cities data for the UI
      fetchCities();
      fetchRegions();
    } catch (err) {
      console.error('MLC-> Error initializing MasteredLocationContext:', err.message);
      setError(err.message);

      // Default to Boston if any other error occurs
      console.log('Defaulting to Boston as fallback city due to error');
      setNearestCity({
        cityID: '6751f58a5db435dd8005e479',
        cityName: 'Boston',
        regionID: '6751f58a5db435dd8005e45b',
        regionName: 'Northeast',
        divisionID: '6751f58a5db435dd8005e461',
        divisionName: 'New England',
        countryID: '6751f57e2e74d97609e7dca0',
        countryName: 'United States',
        latitude: 42.3601,
        longitude: -71.0589,
        isFallback: true // Mark as fallback data for error case
      });
    }
  };

  useEffect(() => {
    initializeContext();
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
