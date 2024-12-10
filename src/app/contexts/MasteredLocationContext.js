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
      const url = `/api/masteredLocations/nearestCity?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}&isActive=true`;

      const response = await fetch(url);
      const rawResponse = await response.text();
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not valid JSON. Check server configuration.');
      }
      const data = JSON.parse(rawResponse);

      setNearestCity({
        cityID: data.cityID,
        cityName: data.cityName,
        regionID: data.regionID,
        regionName: data.regionName,
        divisionID: data.divisionID,
        divisionName: data.divisionName,
        countryID: data.countryID,
        countryName: data.countryName,
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
      console.log('MLC-> IPAPI Response Status:', ipapiResponse.status);
      if (!ipapiResponse.ok) {
        throw new Error(`ipapi error: ${ipapiResponse.statusText}`);
      }

      const ipapiData = await ipapiResponse.json();
      console.log('MLC-> IPAPI Data:', ipapiData);

      const { latitude, longitude } = ipapiData;
      console.log('MLC-> Initial Latitude:', latitude, 'Longitude:', longitude);

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
