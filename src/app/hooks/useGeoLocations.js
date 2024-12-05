'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export function useGeoLocations() {
  const [geoData, setGeoData] = useState(null);
  const [nearestCity, setNearestCity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGeoLocation = async () => {
      try {
        // Fetch IP-based geolocation
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(
            `Failed to fetch geolocation: ${response.statusText}`
          );
        }
        const data = await response.json();
        setGeoData(data);

        // Fetch the nearest city from the NEW backend route
        const cityResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/calculatedLocations/nearestCity`,
          {
            params: {
              longitude: data.longitude,
              latitude: data.latitude,
            },
          }
        );

        setNearestCity(cityResponse.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch geolocation or nearest city');
      }
    };

    fetchGeoLocation();
  }, []);

  return { geoData, nearestCity, error };
}
