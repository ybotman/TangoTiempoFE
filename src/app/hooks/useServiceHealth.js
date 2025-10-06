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
    afEvents: { name: 'AF Events', status: 'disabled', detail: 'Not configured', accuracy: null },
    afVenues: { name: 'AF Venues', status: 'disabled', detail: 'Not configured', accuracy: null },
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
        // Calculate accuracy from response (ipapi.co doesn't provide accuracy, default to 5km for city-level)
        const accuracy = 5000; // meters - city level approximation

        setServices(prev => ({
          ...prev,
          geoAPI: {
            name: 'Geo API',
            status: 'healthy',
            detail: `ipapi.co (±${(accuracy / 1000).toFixed(1)}km)`,
            accuracy: accuracy // meters
          }
        }));
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
          accuracy: null
        }
      }));
    }
  };

  const checkAzureFunctions = async () => {
    // Determine AF URL: localhost:7071 for dev, env variable for production
    const afEnabled = process.env.NEXT_PUBLIC_AF_ENABLED === 'true';
    const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

    // Always try to check if on localhost (for dev)
    const isLocal = afUrl.includes('localhost');

    if (!afEnabled && !isLocal) {
      // Keep as disabled for production if not enabled
      return;
    }

    // Check AF Health endpoint
    try {
      const start = Date.now();
      const response = await fetch(`${afUrl}/api/health`, {
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
            detail: `${afUrl} (${duration}ms)`,
            accuracy: null
          }
        }));

        // Now check Events and Venues endpoints
        checkAFEvents(afUrl);
        checkAFVenues(afUrl);
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
        },
        afEvents: {
          name: 'AF Events',
          status: 'disabled',
          detail: 'Not available',
          accuracy: null
        },
        afVenues: {
          name: 'AF Venues',
          status: 'disabled',
          detail: 'Not available',
          accuracy: null
        }
      }));
    }
  };

  const checkAFEvents = async (afUrl) => {
    try {
      const response = await fetch(`${afUrl}/api/events?appId=1&limit=1`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setServices(prev => ({
          ...prev,
          afEvents: {
            name: 'AF Events',
            status: 'healthy',
            detail: 'API Ready',
            accuracy: null
          }
        }));
      } else {
        throw new Error('AF events not available');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        afEvents: {
          name: 'AF Events',
          status: 'disabled',
          detail: 'Coming soon',
          accuracy: null
        }
      }));
    }
  };

  const checkAFVenues = async (afUrl) => {
    try {
      const response = await fetch(`${afUrl}/api/venues?appId=1&limit=1`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setServices(prev => ({
          ...prev,
          afVenues: {
            name: 'AF Venues',
            status: 'healthy',
            detail: 'API Ready',
            accuracy: null
          }
        }));
      } else {
        throw new Error('AF venues not available');
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        afVenues: {
          name: 'AF Venues',
          status: 'disabled',
          detail: 'Coming soon',
          accuracy: null
        }
      }));
    }
  };

  return services;
};
