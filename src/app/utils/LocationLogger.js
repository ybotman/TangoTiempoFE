'use client';

import { useEffect } from 'react';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';

const LocationLogger = () => {
  const { nearestCity, fetchNearestMastered, error } = useMasteredLocations();

  const safeParseJSON = async (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('LL:uE-> Expected JSON but got:', text.substring(0, 200));
      throw new Error('Response is not valid JSON');
    }
  };

  useEffect(() => {
    const fetchLocationAndNearestMastered = async () => {
      try {
        // Fetch IP-based geolocation from ipapi
        const ipapiUrl = 'https://ipapi.co/json/';
        const ipapiResponse = await fetch(ipapiUrl);
        if (!ipapiResponse.ok) {
          console.error(`LL:uE-> ipapi failed with status: ${ipapiResponse.status}`);
          throw new Error(`ipapi error: ${ipapiResponse.statusText}`);
        }
        const ipapiData = await safeParseJSON(ipapiResponse);

        // Log ipapi results
        // TIEMPO-276: Security cleanup - removed IP geolocation logging

        // Use hook to fetch nearest mastered location from ipapi location
        await fetchNearestMastered({
          latitude: ipapiData.latitude,
          longitude: ipapiData.longitude,
          maxDistance: 50000, // Example: 50 km
          isActive: true,
        });

        // Fetch IP-based geolocation from AbstractAPI
        const abstractApiKey = process.env.NEXT_PUBLIC_ABSTRACTAPI;
        if (!abstractApiKey) {
          console.warn('LL:uE-> AbstractAPI key is missing. Skipping AbstractAPI call.');
          return;
        }
        const abstractApiUrl = `https://ipgeolocation.abstractapi.com/v1/?api_key=${abstractApiKey}`;
        const abstractResponse = await fetch(abstractApiUrl);
        if (!abstractResponse.ok) {
          console.error(`LL:uE-> AbstractAPI failed with status: ${abstractResponse.status}`);
          throw new Error(`AbstractAPI error: ${abstractResponse.statusText}`);
        }
        await safeParseJSON(abstractResponse);

        // Log AbstractAPI results
        // TIEMPO-276: Security cleanup - removed Abstract API logging
      } catch (err) {
        console.error('LL:uE-> Failed to fetch location:', err.message);
      }
    };

    fetchLocationAndNearestMastered();
  }, [fetchNearestMastered]);

  useEffect(() => {
    if (nearestCity) {
      // TIEMPO-276: Security cleanup - removed nearest city logging
    }
    if (error) {
      console.error('LL:uE-> Error fetching nearest mastered location:', error);
    }
  }, [nearestCity, error]);

  return null; // No UI needed
};

export default LocationLogger;
