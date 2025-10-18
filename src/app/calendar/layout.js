//@/calendar/layout.js
'use client'; // Enable client-side rendering

import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { fetchAllGeolocationData } from '@/utils/trackingHelper';

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

  return <>{children}</>;
};

// Define prop types for validation
RootLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensure that children is a valid React node
};

export default RootLayout;
