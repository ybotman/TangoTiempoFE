//src/app/utils/geoLocations.js
'use client';
import { useEffect } from 'react';

const LocationLogger = () => {
  useEffect(() => {
    // Fetch IP and location data from ipapi
    fetch('https://ipapi.co/json/')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('IP and Location Data:', data);

        console.log('City:Lat:Long:', data.city, data.latitude, data.longitude);
      })
      .catch((error) => {
        console.error('Failed to fetch location:', error);
      });
  }, []);
};

export default LocationLogger;
