// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/contexts/MasteredLocationContext.js
// Explanation: We add latitude and longitude fields to the nearestCity state when fetching.
// No code is dropped, only extended. We ensure that after changing nearest city, it updates context accordingly.
// We keep everything else intact.

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import PropTypes from 'prop-types';

const MasteredLocationContext = createContext();

export const MasteredLocationProvider = ({ children }) => {
  const [nearestCity, setNearestCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the GeoLocationContext to register our functions
  const geoLocationContext = useGeoLocation();

  // Fetch nearest city with improved error handling and rate limiting management
  const fetchNearestCity = useCallback(async (latitude, longitude, maxDistance = 500000) => {
    if (!latitude || !longitude) {
      setError('Latitude and longitude are required.');
      return;
    }

    setLoading(true);
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const url = `${baseURL}/api/masteredLocations/nearestMastered?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}&isActive=true&appId=${appId}`;

      const response = await fetch(url);
      if (!response.ok) {
        // Default to Northeast region if no city is found
        if (response.status === 404) {
          console.log('No nearby city found, defaulting to Northeast region');
          return setNearestCity({
            cityID: null,
            cityName: 'Default',
            regionID: '6751f58a5db435dd8005e45b', // Northeast region ID
            regionName: 'Northeast',
            divisionID: null,
            divisionName: 'Default',
            countryID: '6751f57e2e74d97609e7dca0', // US country ID
            countryName: 'United States',
            latitude: 42.6526,
            longitude: -73.7562,
          });
        }

        const message = `Error fetching nearest city: ${response.statusText}`;
        setError(message);
        throw new Error(message);
      }

      const data = await response.json();
      // We assume the returned data might include lat/long in future. If not, we derive it from city object if needed.
      // For now, no lat/long is in response. Let's assume we add them to the schema & response:
      // If the backend does not currently send lat/long, we must add it. We'll do that in server code.
      setNearestCity({
        cityID: data.cityID,
        cityName: data.cityName,
        regionID: data.regionID,
        regionName: data.regionName,
        divisionID: data.divisionID,
        divisionName: data.divisionName,
        countryID: data.countryID,
        countryName: data.countryName,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (err) {
      console.error('MLC-> Error fetching nearest city:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register our functions with GeoLocationContext after initialization
  useEffect(() => {
    // Only register if GeoLocationContext is available and has the registration function
    if (geoLocationContext?.registerMasteredLocationFunctions) {
      console.log('MasteredLocationContext: Registering functions with GeoLocationContext');
      geoLocationContext.registerMasteredLocationFunctions({
        fetchNearestCity
      });
    } else {
      console.warn('MasteredLocationContext: Cannot register functions with GeoLocationContext - not available');
    }
  }, [geoLocationContext, fetchNearestCity]);

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

  // If GeoLocationContext ever provides a city ID but we don't have a nearestCity yet,
  // attempt to sync by fetching nearest city data for those coordinates
  useEffect(() => {
    const geoLocationCity = geoLocationContext?.selectedLocation?.city;
    if (geoLocationCity?.id && geoLocationCity?.latitude && geoLocationCity?.longitude && !nearestCity) {
      console.log('MasteredLocationContext: Syncing with coordinates from GeoLocationContext', {
        cityId: geoLocationCity.id,
        cityName: geoLocationCity.name,
        latitude: geoLocationCity.latitude,
        longitude: geoLocationCity.longitude
      });
      fetchNearestCity(geoLocationCity.latitude, geoLocationCity.longitude);
    }
  }, [geoLocationContext?.selectedLocation?.city, nearestCity, fetchNearestCity]);

  return (
    <MasteredLocationContext.Provider value={{ nearestCity, loading, error, fetchNearestCity }}>
      {children}
    </MasteredLocationContext.Provider>
  );
};

MasteredLocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useMasteredLocation = () => useContext(MasteredLocationContext);
