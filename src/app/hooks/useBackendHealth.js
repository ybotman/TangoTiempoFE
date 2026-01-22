// hooks/useBackendHealth.js
// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
'use client';

import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

/**
 * Hook to monitor backend server health
 * @returns {Object} { isHealthy, backendUrl, isChecking }
 */
export const useBackendHealth = () => {
  const [isHealthy, setIsHealthy] = useState(null); // null = not checked yet
  const [isChecking, setIsChecking] = useState(false);
  const backendUrl = getApiBaseUrl() || 'http://localhost:3010';

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

  useEffect(() => {
    const checkHealth = () => {
      setIsChecking(true);

      try {
        // Firebase config is stored as Base64-encoded JSON in NEXT_PUBLIC_FIREBASE_JSON
        const firebaseJson = process.env.NEXT_PUBLIC_FIREBASE_JSON;

        if (firebaseJson) {
          // Try to decode and parse to verify it's valid (browser-compatible)
          const decoded = atob(firebaseJson);
          const config = JSON.parse(decoded);

          // Check if required fields exist
          if (config.apiKey && config.authDomain && config.projectId) {
            setIsHealthy(true);
          } else {
            setIsHealthy(false);
          }
        } else {
          setIsHealthy(false);
        }
      } catch (error) {
        // Invalid Base64 or JSON
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
  }, []);

  return {
    isHealthy,
    firebaseConfig: isHealthy ? '***configured***' : 'not configured',
    isChecking
  };
};
