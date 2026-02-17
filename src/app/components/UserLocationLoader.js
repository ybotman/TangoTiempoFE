// UserLocationLoader.js
'use client';

import { useEffect, useRef } from 'react';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Component that bridges user authentication with GeoLocationContext
 * Loads user's saved map center from Azure Functions Cloud Default on login
 */
const UserLocationLoader = () => {
  const { fetchMapCenter, setNeedsOnboarding } = useGeoLocation();
  const { user, getIdToken } = useContext(AuthContext) || {};
  const hasFetched = useRef(false);
  const lastUserId = useRef(null);

  useEffect(() => {
    // Only fetch once per user login
    const currentUserId = user?.uid;

    // Skip if:
    // - No user (anonymous users don't need map center from cloud)
    // - Missing required functions
    // - Already fetched for this user
    // - Same user as last time (no new login)
    if (!user || !user.uid || !getIdToken || !fetchMapCenter) {
      return;
    }

    if (hasFetched.current && lastUserId.current === currentUserId) {
      return; // Already loaded for this user
    }

    const loadMapCenter = async () => {
      try {
        // Mark as fetching to prevent duplicates
        hasFetched.current = true;
        lastUserId.current = currentUserId;

        // Get fresh Firebase token using AuthContext method
        const token = await getIdToken();

        // Only clear sessionStorage on production where we fetch from Azure
        // On localhost, sessionStorage IS the storage, so don't clear it
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        if (!isLocalhost) {
          sessionStorage.removeItem('currentLocation');
        }

        // Skip if no valid token (401 would break mobile rendering)
        if (!token) {
          console.warn('[UserLocationLoader] No Firebase token available, skipping map center fetch');
          hasFetched.current = false;
          return;
        }

        // Fetch saved map center from Azure Functions
        const mapCenter = await fetchMapCenter(token);

        // TIEMPO-381 debug: Log what we got back
        console.log('[UserLocationLoader] fetchMapCenter returned:', mapCenter);

        // TIEMPO-381: If no mapCenter exists, trigger onboarding modal
        // Skip on Boston route - Boston has forced coordinates
        const isBostonRoute = typeof window !== 'undefined' && window.location.pathname.includes('/boston');
        if (!mapCenter && !isBostonRoute) {
          console.log('[UserLocationLoader] No mapCenter, setting needsOnboarding=true');
          setNeedsOnboarding(true);
        } else if (mapCenter) {
          console.log('[UserLocationLoader] Has mapCenter, NOT showing onboarding');
        }
      } catch (error) {
        console.error('[UserLocationLoader] Failed to load map center:', error);
        // Reset flag on error to allow retry
        hasFetched.current = false;
        // Don't throw - allow page to render even if map center fetch fails
      }
    };

    loadMapCenter();
  }, [user, getIdToken, fetchMapCenter, setNeedsOnboarding]);

  return null; // This is a logic-only component
};

export default UserLocationLoader;