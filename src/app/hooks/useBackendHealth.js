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
