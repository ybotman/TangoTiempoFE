// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/contexts/MasteredLocationContext.js
// Explanation: We add latitude and longitude fields to the nearestCity state when fetching.
// No code is dropped, only extended. We ensure that after changing nearest city, it updates context accordingly.
// We keep everything else intact.

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MasteredLocationContext = createContext();

export const MasteredLocationProvider = ({ children }) => {
  const [nearestCity, setNearestCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNearestCity = async (latitude, longitude, maxDistance = 500000) => {
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
  };

  const initializeContext = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const ipapiResponse = await fetch(`${baseURL}/api/firebase/geo/ip`);

      if (!ipapiResponse.ok) {
        throw new Error(`Geolocation Error: ${ipapiResponse.statusText}`);
      }
      const data = await ipapiResponse.json();
      let latitude, longitude;
      
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

      await fetchNearestCity(latitude, longitude);
    } catch (err) {
      console.error('MLC-> Error initializing MasteredLocationContext:', err.message);
      setError(err.message);

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
      });
    }
  };

  useEffect(() => {
    initializeContext();
  }, []);

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
