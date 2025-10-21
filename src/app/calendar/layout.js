//@/calendar/layout.js
'use client'; // Enable client-side rendering

import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { fetchAllGeolocationData } from '@/utils/trackingHelper';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { selectedLocation } = useGeoLocation();

  // Extract stable values to prevent infinite loops
  const userDisplayName = user?.displayName;
  const selectedRegionName = selectedLocation?.region?.name;

  // TIEMPO-313: Visitor tracking on calendar page load (fire and forget)
  // TIEMPO-319: Only track once per 24 hours per IP
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Check if we've already tracked this visitor today (24-hour rolling window)
        const lastTracked = localStorage.getItem('visitor_last_tracked');
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (lastTracked && (now - parseInt(lastTracked)) < TWENTY_FOUR_HOURS) {
          const hoursLeft = Math.round((TWENTY_FOUR_HOURS - (now - parseInt(lastTracked))) / 3600000);
          console.log(`[Visitor Tracking] Already tracked within 24h, skipping (${hoursLeft}h remaining)`);
          return;
        }

        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        // Fetch all geolocation data (Cloudflare, Google, IP API) with distance calculation
        // TIEMPO-319: Use 24-hour cache for visitor tracking (1440 minutes)
        const geoData = await fetchAllGeolocationData(1440);

        await fetch(`${afUrl}/api/visitor/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // Page routing details
            pathname: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar', // TIEMPO-323: Backend expects 'page' field
            hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : '',

            // Timezone info
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: -new Date().getTimezoneOffset(), // Negate for correct sign

            // Geolocation data
            cloudflare: geoData.cloudflare,
            google: geoData.google,
            ipapi: geoData.ipapi,
            distance: geoData.distance
          })
        });

        // Store the tracking timestamp after successful tracking
        localStorage.setItem('visitor_last_tracked', now.toString());
        console.log('[Visitor Tracking] Successfully tracked visitor');
      } catch (error) {
        // Silent failure - don't break user experience
        console.warn('[Visitor Tracking] Failed:', error.message);
      }
    };

    // Track visitor once on mount
    trackVisitor();
  }, []); // Empty dependency array - only fire once on mount

  useEffect(() => {
    if (userDisplayName) {
      // TIEMPO-276: Security cleanup - removed user logging
    }

    // Use GeoLocationContext instead of RegionsContext for logging
    if (selectedRegionName) {
      // TIEMPO-276: Security cleanup - removed region logging
    }
  }, [userDisplayName, selectedRegionName]);

  // TIEMPO-323: MapCenter tracking for logged-in users
  // Subscribe to location change events and track to backend
  useEffect(() => {
    // Only track for logged-in users with valid Firebase token
    if (!user || !user.token) {
      return; // Not logged in, skip tracking
    }

    // Helper function to track MapCenter changes
    const trackMapCenterChange = async (location) => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        await fetch(`${afUrl}/api/user/mapcenter-track`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mapCenter: {
              lat: location.lat,
              lng: location.lng
            },
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar'
          })
        });

        console.log('[MapCenter Tracking] Successfully tracked MapCenter change');
      } catch (error) {
        // Silent failure - don't break user experience
        console.warn('[MapCenter Tracking] Failed:', error.message);
      }
    };

    // Subscribe to location change events
    const unsubscribe = locationEventBus.on(
      LOCATION_EVENTS.LOCATION_CHANGED,
      (location) => {
        // Only track if location has valid coordinates
        if (location?.lat && location?.lng) {
          trackMapCenterChange(location);
        }
      }
    );

    // Cleanup subscription on unmount or when user changes
    return () => {
      unsubscribe();
    };
  }, [user]); // Re-subscribe if user changes (login/logout)

  return <>{children}</>;
};

// Define prop types for validation
RootLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensure that children is a valid React node
};

export default RootLayout;
