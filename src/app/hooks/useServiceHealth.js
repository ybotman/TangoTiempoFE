// hooks/useServiceHealth.js
'use client';

import { useState, useEffect } from 'react';

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

    // Row 3: Azure Functions (Prep)
    azureFunctions: { name: 'AF Health', status: 'disabled', detail: 'Not configured', accuracy: null },
    afEvents: { name: 'AF Events', status: 'disabled', detail: 'Disabled', accuracy: null },
    afVenues: { name: 'AF Venues', status: 'disabled', detail: 'Disabled', accuracy: null },
  });

  useEffect(() => {
    // Check all services
    checkExpressBackend();
    checkFirebase();
    checkMapbox();
    checkMongoDB();
    checkGoogleAnalytics();
    checkGeoAPI();
    checkAzureFunctions();

    // Re-check every 30 seconds
    const interval = setInterval(() => {
      checkExpressBackend();
      checkFirebase();
      checkMapbox();
      checkMongoDB();
      checkGoogleAnalytics();
      checkGeoAPI();
      checkAzureFunctions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
    const backendUrl = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';
    try {
      const response = await fetch(`${backendUrl}/api/health/mongodb`, {
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
          status: 'error',
          detail: 'Connection failed',
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

  return services;
};
