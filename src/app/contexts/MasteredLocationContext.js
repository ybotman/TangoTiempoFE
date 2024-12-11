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
      const url = `/api/masteredLocations/nearestMastered?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}&isActive=true`;

      const response = await fetch(url);
      if (!response.ok) {
        const message =
          response.status === 404 ? 'No nearby city found.' : `Error fetching nearest city: ${response.statusText}`;
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
      const ipapiResponse = await fetch('https://ipapi.co/json/');

      if (!ipapiResponse.ok) {
        throw new Error(`IPAPI Error: ${ipapiResponse.statusText}`);
      }
      const { latitude, longitude } = await ipapiResponse.json();

      if (!latitude || !longitude) {
        throw new Error('Invalid geolocation data from IPAPI.');
      }

      await fetchNearestCity(latitude, longitude);
    } catch (err) {
      console.error('MLC-> Error initializing MasteredLocationContext:', err.message);
      setError(err.message);
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
