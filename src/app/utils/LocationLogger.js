// @/utils/LocationLogger.js
'use client';

import { useEffect } from 'react';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';

const LocationLogger = () => {
  const { nearestCity, fetchNearestCity, error } = useMasteredLocations();

  useEffect(() => {
    const fetchLocationAndClosestCity = async () => {
      try {
        // Fetch IP-based geolocation from ipapi
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const geoData = await response.json();

        // Log IP and location details (IP, Latitude, Longitude)
        console.log('LL:uE-> ipapi full:', geoData);
        console.log(`LL:uE-> ipapi IP: ${geoData.ip}, Lat: ${geoData.latitude}, Long: ${geoData.longitude}`);
        console.log(`LL:uE-> ipapi Location: ${geoData.country_name},${geoData.region}, ${geoData.city}`);

        // Use hook to fetch nearest city
        fetchNearestCity({
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          maxDistance: 50000, // Example: 50 km
          isActive: true,
        });
      } catch (error) {
        console.error('LL:uE-> Failed to fetch location or closest city:', error);
      }
    };

    fetchLocationAndClosestCity();
  }, [fetchNearestCity]);

  useEffect(() => {
    if (nearestCity) {
      console.log(
        'LL:uE-> Nearest Mastered to ipapi :',
        [nearestCity.countryName, nearestCity.regionName, nearestCity.divisionName, nearestCity.cityName].join(', ')
      );
    }
    if (error) {
      console.error('LL:uE-> Error fetching nearest city:', error);
    }
  }, [nearestCity, error]);

  return null; // No UI needed
};

export default LocationLogger;
