//@/calendar/layout.js
'use client'; // Enable client-side rendering

import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { fetchAllGeolocationData } from '@/utils/trackingHelper';
import { getGeolocationData } from '@/utils/geolocationHelper'; // TIEMPO-324: 3-tier geolocation
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';
import { getOrCreateVisitorId } from '@/utils/visitorTracking'; // TIEMPO-329: Visitor ID tracking

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { selectedLocation, currentLocation, setSessionLocation } = useGeoLocation();

  // Extract stable values to prevent infinite loops
  const userDisplayName = user?.displayName;
  const selectedRegionName = selectedLocation?.region?.name;

  // TIEMPO-313: Visitor tracking on calendar page load (fire and forget)
  // TIEMPO-329: Now includes visitor_id cookie for persistent identity
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        // TIEMPO-329: Get or create persistent visitor_id (UUID cookie)
        const visitorId = getOrCreateVisitorId();

        // TIEMPO-324: Get 3-tier geolocation data (browser GPS → Google API → ipinfo fallback)
        const browserGeoData = await getGeolocationData();

        // TIEMPO-329 Phase 1.1: Auto-center map from GPS if no location selected
        // If no saved location AND GPS available, set as default map center (75mi zoom)
        if ((!currentLocation?.lat && !currentLocation?.lng) &&
            browserGeoData?.google_browser_lat &&
            browserGeoData?.google_browser_long) {

          console.log('[Auto-Center] Setting map center from GPS:',
            browserGeoData.google_browser_lat, browserGeoData.google_browser_long);

          setSessionLocation({
            lat: browserGeoData.google_browser_lat,
            lng: browserGeoData.google_browser_long,
            zoomRange: 75  // 75-mile radius as requested
          });
        }

        // Fetch all geolocation data (Cloudflare, Google, IP API) with distance calculation
        const geoData = await fetchAllGeolocationData();

        await fetch(`${afUrl}/api/visitor/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // TIEMPO-329: Visitor identity
            visitor_id: visitorId,

            // Page routing details
            pathname: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar', // TIEMPO-323: Backend expects 'page' field
            hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : '',

            // Timezone info
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: -new Date().getTimezoneOffset(), // Negate for correct sign

            // Geolocation data (existing)
            cloudflare: geoData.cloudflare,
            google: geoData.google,
            ipapi: geoData.ipapi,
            distance: geoData.distance,

            // TIEMPO-324: 3-tier geolocation (browser GPS, Google API)
            google_browser_lat: browserGeoData.google_browser_lat,
            google_browser_long: browserGeoData.google_browser_long,
            google_browser_accuracy: browserGeoData.google_browser_accuracy,
            google_api_lat: browserGeoData.google_api_lat,
            google_api_long: browserGeoData.google_api_long
          })
        });

        console.log('[Visitor Tracking] Successfully tracked visitor with ID:', visitorId);
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

  // TIEMPO-323: MapCenter tracking for all users (logged-in and anonymous)
  // Subscribe to location change events and track to backend
  useEffect(() => {
    // Helper function to track MapCenter changes
    const trackMapCenterChange = async (location) => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        // Get geolocation data (IP-based lat/long)
        const geoData = await fetchAllGeolocationData();

        // Build headers - include auth token only if user is logged in
        const headers = {
          'Content-Type': 'application/json'
        };
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        await fetch(`${afUrl}/api/user/mapcenter-track`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            // Requested map center (user's selected location)
            mapCenter: {
              lat: location.lat,
              lng: location.lng
            },
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar',

            // IP-based geolocation data (always included)
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: -new Date().getTimezoneOffset(),
            cloudflare: geoData.cloudflare,
            google: geoData.google,
            ipapi: geoData.ipapi
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
