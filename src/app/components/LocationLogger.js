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
        console.log('LL:uE-> IP and Location Data:', geoData);
        console.log('LL:uE->IP Address:', geoData.ip);
        console.log('LL:uE-> City:', geoData.city);
        console.log('LL:uE-> Region:', geoData.region);
        console.log('LL:uE-> Country:', geoData.country_name);
        console.log('LL:uE-> Latitude:', geoData.latitude);
        console.log('LL:uE-> Longitude:', geoData.longitude);

        // Call backend API to find the closest city from the provided endpoint
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/masteredLocations/nearestCity?latitude=${geoData.latitude}&longitude=${geoData.longitude}`
        );
        if (!backendResponse.ok) {
          throw new Error(`Backend error! status: ${backendResponse.status}`);
        }
        const nearestCity = await backendResponse.json();
        console.log('LL:uE-> Closest Country/Region/Division/City:', nearestCity);
      } catch (error) {
        console.error('LL:uE-> Failed to fetch location or closest city:', error);
      }
    };

    fetchLocationAndClosestCity();
  }, []);

  return null; // No UI needed
};

LocationLogger.propTypes = {};

export default LocationLogger;
