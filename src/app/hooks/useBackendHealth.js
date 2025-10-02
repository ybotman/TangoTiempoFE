// hooks/useBackendHealth.js
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to monitor backend server health
 * @returns {Object} { isHealthy, backendUrl, isChecking }
 */
export const useBackendHealth = () => {
  const [isHealthy, setIsHealthy] = useState(null); // null = not checked yet
  const [isChecking, setIsChecking] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);

      try {
        // Try to ping the backend health endpoint
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        setIsHealthy(response.ok);
      } catch (error) {
        // Backend is down or unreachable
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Check on mount
    checkHealth();

    // Re-check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  return { isHealthy, backendUrl, isChecking };
};

/**
 * Hook to monitor Mapbox service health
 * @returns {Object} { isHealthy, mapboxToken, isChecking }
 */
export const useMapboxHealth = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);

      try {
        // Check if token exists and test Mapbox API
        if (!mapboxToken) {
          setIsHealthy(false);
          return;
        }

        // Ping Mapbox geocoding API with a simple query
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${mapboxToken}`,
          { signal: AbortSignal.timeout(5000) }
        );

        setIsHealthy(response.ok);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [mapboxToken]);

  return { isHealthy, mapboxToken: mapboxToken ? '***configured***' : 'not set', isChecking };
};

/**
 * Hook to monitor Firebase service health
 * @returns {Object} { isHealthy, firebaseConfig, isChecking }
 */
export const useFirebaseHealth = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);

      try {
        // Check if Firebase config exists
        if (!firebaseApiKey) {
          setIsHealthy(false);
          return;
        }

        // Try to access Firebase Auth (lightweight check)
        // If the key is valid, it should respond
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: 'test' }),
            signal: AbortSignal.timeout(5000)
          }
        );

        // 400 means API is reachable (invalid token expected)
        // Non-400 errors mean API issue
        setIsHealthy(response.status === 400 || response.ok);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [firebaseApiKey]);

  return { isHealthy, firebaseConfig: firebaseApiKey ? '***configured***' : 'not set', isChecking };
};
