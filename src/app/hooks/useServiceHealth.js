// hooks/useServiceHealth.js
'use client';

import { useState, useEffect } from 'react';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {object} - { km: number, mi: number }
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R_KM = 6371; // Earth's radius in kilometers
  const R_MI = 3959; // Earth's radius in miles

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return {
    km: R_KM * c,
    mi: R_MI * c
  };
};

/**
 * Consolidated health check hook for all services
 * Returns status for 9 services in 3x3 grid layout
 */
export const useServiceHealth = () => {
  const [services, setServices] = useState({
    // Row 1: Core Backend
    expressBackend: { name: 'Express Backend', status: 'checking', detail: '', accuracy: null },
    firebase: { name: 'Firebase', status: 'checking', detail: '', accuracy: null },
    mapbox: { name: 'Mapbox', status: 'checking', detail: '', accuracy: null },

    // Row 2: Data & Tracking
    mongodb: { name: 'MongoDB', status: 'checking', detail: '', accuracy: null },
    googleAnalytics: { name: 'Google Analytics', status: 'checking', detail: '', accuracy: null },
    geoAPI: { name: 'Geo API', status: 'checking', detail: '', accuracy: null },

    // Row 3: Azure Functions & Google Geo API
    azureFunctions: { name: 'AF Health', status: 'disabled', detail: 'Not configured', accuracy: null },
    googleGeoAPI: { name: 'Google Geo', status: 'checking', detail: '', accuracy: null },
    cloudflare: { name: 'Cloudflare', status: 'checking', detail: '', accuracy: null },
  });

  useEffect(() => {
    // Check all services
    checkExpressBackend();
    checkFirebase();
    checkMapbox();
    checkMongoDB();
    checkGoogleAnalytics();
    checkGeoAPI();
    checkGoogleGeoAPI();
    checkAzureFunctions();
    checkCloudflare();

    // Re-check every 30 seconds
    const interval = setInterval(() => {
      checkExpressBackend();
      checkFirebase();
      checkMapbox();
      checkMongoDB();
      checkGoogleAnalytics();
      checkGeoAPI();
      checkGoogleGeoAPI();
      checkAzureFunctions();
      checkCloudflare();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate distance between Geo API and Google Geo API when both have coordinates
  useEffect(() => {
    const geoAPICoords = services.geoAPI;
    const googleGeoCoords = services.googleGeoAPI;

    // Only calculate if both services have coordinates
    if (geoAPICoords.latitude && geoAPICoords.longitude &&
        googleGeoCoords.latitude && googleGeoCoords.longitude) {

      const distance = calculateDistance(
        geoAPICoords.latitude,
        geoAPICoords.longitude,
        googleGeoCoords.latitude,
        googleGeoCoords.longitude
      );

      // Update both services with distance information
      setServices(prev => ({
        ...prev,
        geoAPI: {
          ...prev.geoAPI,
          detail: `ipapi.co (±${(prev.geoAPI.accuracy / 1000).toFixed(1)}km) | Δ${distance.km.toFixed(1)}km / ${distance.mi.toFixed(1)}mi`,
          distanceToGoogle: distance
        },
        googleGeoAPI: {
          ...prev.googleGeoAPI,
          detail: `Google (±${prev.googleGeoAPI.accuracy ? (prev.googleGeoAPI.accuracy / 1000).toFixed(1) : '?'}km) | Δ${distance.km.toFixed(1)}km / ${distance.mi.toFixed(1)}mi`,
          distanceToIpapi: distance
        }
      }));
    }
  }, [services.geoAPI.latitude, services.geoAPI.longitude, services.googleGeoAPI.latitude, services.googleGeoAPI.longitude]);

  const checkExpressBackend = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';
    try {
      const start = Date.now();
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      const duration = Date.now() - start;

      setServices(prev => ({
        ...prev,
        expressBackend: {
          name: 'Express Backend',
          status: response.ok ? 'healthy' : 'error',
          detail: response.ok ? `${backendUrl} (${duration}ms)` : 'Health check failed',
          accuracy: null
        }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        expressBackend: {
          name: 'Express Backend',
          status: 'error',
          detail: 'Unreachable',
          accuracy: null
        }
      }));
    }
  };

  const checkFirebase = () => {
    try {
      const firebaseJson = process.env.NEXT_PUBLIC_FIREBASE_JSON;
      if (firebaseJson) {
        const decoded = atob(firebaseJson);
        const config = JSON.parse(decoded);

        if (config.apiKey && config.authDomain && config.projectId) {
          setServices(prev => ({
            ...prev,
            firebase: {
              name: 'Firebase',
              status: 'healthy',
              detail: `Project: ${config.projectId}`,
              accuracy: null
            }
          }));
        } else {
          throw new Error('Missing required fields');
        }
      } else {
        throw new Error('Not configured');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        firebase: {
          name: 'Firebase',
          status: 'error',
          detail: 'Configuration error',
          accuracy: null
        }
      }));
    }
  };

  const checkMapbox = async () => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    if (!mapboxToken) {
      setServices(prev => ({
        ...prev,
        mapbox: {
          name: 'Mapbox',
          status: 'error',
          detail: 'Token not set',
          accuracy: null
        }
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${mapboxToken}`,
        { signal: AbortSignal.timeout(5000) }
      );

      setServices(prev => ({
        ...prev,
        mapbox: {
          name: 'Mapbox',
          status: response.ok ? 'healthy' : 'error',
          detail: response.ok ? 'API Connected' : 'API Error',
          accuracy: null
        }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        mapbox: {
          name: 'Mapbox',
          status: 'error',
          detail: 'API Unreachable',
          accuracy: null
        }
      }));
    }
  };

  const checkMongoDB = async () => {
    // MongoDB health check via Azure Functions (not Express BE)
    const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
    const isLocal = afUrl.includes('localhost');

    // In production (HTTPS), skip localhost checks (browser will block them)
    if (isLocal && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      setServices(prev => ({
        ...prev,
        mongodb: {
          name: 'MongoDB',
          status: 'disabled',
          detail: 'Local AF not accessible from HTTPS',
          accuracy: null
        }
      }));
      return;
    }

    try {
      const response = await fetch(`${afUrl}/api/health/mongodb`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        setServices(prev => ({
          ...prev,
          mongodb: {
            name: 'MongoDB',
            status: 'healthy',
            detail: data.database || 'Connected',
            accuracy: null
          }
        }));
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        mongodb: {
          name: 'MongoDB',
          status: isLocal ? 'disabled' : 'error',
          detail: isLocal ? 'AF not running (start with: func start)' : 'Connection failed',
          accuracy: null
        }
      }));
    }
  };

  const checkGoogleAnalytics = () => {
    try {
      const gaId = process.env.NEXT_PUBLIC_GA_ID;
      // Check if GA script is loaded
      const gaLoaded = typeof window !== 'undefined' && window.gtag !== undefined;

      setServices(prev => ({
        ...prev,
        googleAnalytics: {
          name: 'Google Analytics',
          status: gaLoaded && gaId ? 'healthy' : (gaId ? 'checking' : 'disabled'),
          detail: gaId ? `ID: ${gaId}` : 'Not configured',
          accuracy: null
        }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        googleAnalytics: {
          name: 'Google Analytics',
          status: 'error',
          detail: 'Check failed',
          accuracy: null
        }
      }));
    }
  };

  const checkGeoAPI = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';
    try {
      const response = await fetch(`${backendUrl}/api/firebase/geo/ip`, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();

        // Extract actual location coordinates (not fallback)
        const latitude = data.latitude;
        const longitude = data.longitude;

        // Only process if we have actual coordinates (not fallback)
        if (latitude && longitude) {
          // Calculate accuracy from response (ipapi.co doesn't provide accuracy, default to 5km for city-level)
          const accuracy = 5000; // meters - city level approximation

          setServices(prev => ({
            ...prev,
            geoAPI: {
              name: 'Geo API',
              status: 'healthy',
              detail: `ipapi.co (±${(accuracy / 1000).toFixed(1)}km)`,
              accuracy: accuracy, // meters
              latitude: latitude,
              longitude: longitude,
              city: data.city || null,
              region: data.region || null,
              region_code: data.region_code || null,
              postal: data.postal || null,
              country: data.country || null,
              country_name: data.country_name || null,
              country_code: data.country_code || null,
              timezone: data.timezone || null,
              ip: data.ip || null
            }
          }));
        } else {
          throw new Error('No actual coordinates returned');
        }
      } else {
        throw new Error('Geo API failed');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        geoAPI: {
          name: 'Geo API',
          status: 'error',
          detail: 'Unavailable',
          accuracy: null,
          latitude: null,
          longitude: null
        }
      }));
    }
  };

  const checkGoogleGeoAPI = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEO_API_KEY;

    if (!apiKey) {
      setServices(prev => ({
        ...prev,
        googleGeoAPI: {
          name: 'Google Geo',
          status: 'disabled',
          detail: 'API key not configured',
          accuracy: null
        }
      }));
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ considerIp: true }),
          signal: AbortSignal.timeout(5000)
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Google returns { location: { lat, lng }, accuracy }
        const latitude = data.location?.lat;
        const longitude = data.location?.lng;
        const accuracy = data.accuracy || null; // in meters

        if (latitude && longitude) {
          setServices(prev => ({
            ...prev,
            googleGeoAPI: {
              name: 'Google Geo',
              status: 'healthy',
              detail: `Google (±${accuracy ? (accuracy / 1000).toFixed(1) : '?'}km)`,
              accuracy: accuracy,
              latitude: latitude,
              longitude: longitude
            }
          }));
        } else {
          throw new Error('No coordinates in response');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        googleGeoAPI: {
          name: 'Google Geo',
          status: 'error',
          detail: error.message.includes('403') ? 'Referrer restriction' :
                  error.message.includes('400') ? 'Invalid payload' : 'Unavailable',
          accuracy: null,
          latitude: null,
          longitude: null
        }
      }));
    }
  };

  const checkAzureFunctions = async () => {
    // Check if Azure Functions monitoring is enabled
    const afEnabled = process.env.NEXT_PUBLIC_AF_ENABLED === 'true';
    const afUrl = process.env.NEXT_PUBLIC_AF_URL;

    // If not enabled and no URL configured, skip all AF checks
    if (!afEnabled && !afUrl) {
      return;
    }

    // Default to localhost only in development (when no URL is set but we want to try local)
    const effectiveUrl = afUrl || 'http://localhost:7071';
    const isLocal = effectiveUrl.includes('localhost');

    // In production (HTTPS), skip localhost checks (browser will block them)
    if (isLocal && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      return;
    }

    // Check AF Health endpoint
    try {
      const start = Date.now();
      const response = await fetch(`${effectiveUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      const duration = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        setServices(prev => ({
          ...prev,
          azureFunctions: {
            name: 'AF Health',
            status: 'healthy',
            detail: `${effectiveUrl} (${duration}ms)`,
            accuracy: null
          }
        }));

        // AF Events and Venues checks removed - keeping as grey dots
      } else {
        throw new Error('AF health check failed');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        azureFunctions: {
          name: 'AF Health',
          status: isLocal ? 'disabled' : 'error',
          detail: isLocal ? 'Not running (start with: func start)' : 'Unreachable',
          accuracy: null
        }
        // AF Events and Venues remain as disabled (grey) - no checks performed
      }));
    }
  };

  // checkAFEvents and checkAFVenues removed - AF Events/Venues kept as disabled grey dots

  const checkCloudflare = async () => {
    const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
    try {
      const response = await fetch(`${afUrl}/api/cloudflare/info`, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const responseData = await response.json();
        // Azure Functions wraps response in { success, data }
        const data = responseData.data || responseData;
        const ip = data.ip || 'Unknown';
        const country = data.country || 'Unknown';

        setServices(prev => ({
          ...prev,
          cloudflare: {
            name: 'Cloudflare',
            status: 'healthy',
            detail: `${ip} (${country})`,
            accuracy: null,
            ip: ip,
            country: country,
            ray: data.ray || null
          }
        }));
      } else {
        throw new Error('Cloudflare API failed');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        cloudflare: {
          name: 'Cloudflare',
          status: 'error',
          detail: 'Unavailable',
          accuracy: null
        }
      }));
    }
  };

  return services;
};
