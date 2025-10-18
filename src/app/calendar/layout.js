//@/calendar/layout.js
'use client'; // Enable client-side rendering

import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { selectedLocation } = useGeoLocation();

  // Extract stable values to prevent infinite loops
  const userDisplayName = user?.displayName;
  const selectedRegionName = selectedLocation?.region?.name;

  // TIEMPO-313: Visitor tracking on calendar page load (fire and forget)
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        // Fetch Cloudflare info to include in tracking
        let cloudflareData = null;
        try {
          const cfResponse = await fetch(`${afUrl}/api/cloudflare/info`, {
            signal: AbortSignal.timeout(2000) // Quick timeout - don't block page load
          });
          if (cfResponse.ok) {
            const responseData = await cfResponse.json();
            // Azure Functions wraps response in { success, data }
            cloudflareData = responseData.data || responseData;
          }
        } catch (err) {
          console.warn('[Visitor Tracking] Cloudflare fetch failed:', err.message);
        }

        await fetch(`${afUrl}/api/visitor/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: -new Date().getTimezoneOffset(), // Negate for correct sign
            cloudflare: cloudflareData ? {
              ip: cloudflareData.ip,
              country: cloudflareData.country,
              ray: cloudflareData.ray
            } : null
          })
        });
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
