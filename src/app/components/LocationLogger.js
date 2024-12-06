// src/app/components/LocationLogger.js
'use client';

import { useEffect } from 'react';
//import PropTypes from 'prop-types';

const LocationLogger = () => {
  useEffect(() => {
    const fetchLocationAndClosestCity = async () => {
      try {
        // Fetch IP-based geolocation from ipapi
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const geoData = await response.json();
        console.log('IP and Location Data:', geoData);
        console.log('IP Address:', geoData.ip);
        console.log('City:', geoData.city);
        console.log('Region:', geoData.region);
        console.log('Country:', geoData.country_name);
        console.log('Latitude:', geoData.latitude);
        console.log('Longitude:', geoData.longitude);

        // Call backend API to find the closest city from the provided endpoint
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/calculatedLocations/nearestCity?latitude=${geoData.latitude}&longitude=${geoData.longitude}`
        );
        if (!backendResponse.ok) {
          throw new Error(`Backend error! status: ${backendResponse.status}`);
        }
        const nearestCity = await backendResponse.json();
        console.log('Closest Country/Region/Division/City:', nearestCity);
      } catch (error) {
        console.error('Failed to fetch location or closest city:', error);
      }
    };

    fetchLocationAndClosestCity();
  }, []);

  return null; // No UI needed
};

LocationLogger.propTypes = {};

export default LocationLogger;
