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

    // Row 3: Azure Functions & Google Geo APIs
    azureFunctions: { name: 'AF Health', status: 'disabled', detail: 'Not configured', accuracy: null },
    googleGeoAPI: { name: 'Google Geo', status: 'checking', detail: '', accuracy: null },
    googleReverseGeo: { name: 'Google Reverse', status: 'checking', detail: '', accuracy: null },
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
    checkGoogleReverseGeo();
    checkAzureFunctions();

    // Re-check every 30 seconds
    const interval = setInterval(() => {
      checkExpressBackend();
      checkFirebase();
      checkMapbox();
      checkMongoDB();
      checkGoogleAnalytics();
      checkGeoAPI();
      checkGoogleGeoAPI();
      checkGoogleReverseGeo();
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

  const checkGoogleReverseGeo = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEO_API_KEY;

    if (!apiKey) {
      setServices(prev => ({
        ...prev,
        googleReverseGeo: {
          name: 'Google Reverse',
          status: 'disabled',
          detail: 'API key not configured',
          accuracy: null
        }
      }));
      return;
    }

    // Use coordinates from Google Geo if available, otherwise try to get from ipapi
    setServices(prev => {
      const googleGeo = prev.googleGeoAPI;
      const geoAPI = prev.geoAPI;

      const lat = googleGeo?.latitude || geoAPI?.latitude;
      const lng = googleGeo?.longitude || geoAPI?.longitude;

      if (!lat || !lng) {
        return {
          ...prev,
          googleReverseGeo: {
            name: 'Google Reverse',
            status: 'error',
            detail: 'No coordinates available',
            accuracy: null
          }
        };
      }

      // Call reverse geocoding API
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`, {
        signal: AbortSignal.timeout(5000)
      })
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              // Get short address (first part before first comma)
              const shortAddress = address.split(',')[0];

              setServices(prev => ({
                ...prev,
                googleReverseGeo: {
                  name: 'Google Reverse',
                  status: 'healthy',
                  detail: shortAddress,
                  accuracy: null,
                  fullAddress: address,
                  latitude: lat,
                  longitude: lng
                }
              }));
            } else {
              throw new Error(`Geocoding failed: ${data.status}`);
            }
          } else {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status}`);
          }
        })
        .catch((error) => {
          setServices(prev => ({
            ...prev,
            googleReverseGeo: {
              name: 'Google Reverse',
              status: 'error',
              detail: error.message.includes('403') ? 'Referrer restriction' : 'Unavailable',
              accuracy: null
            }
          }));
        });

      // Return current state while async fetch runs
      return prev;
    });
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
