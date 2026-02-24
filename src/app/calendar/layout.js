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
  const { currentLocation, setSessionLocation } = useGeoLocation();

  // TIEMPO-313: Visitor tracking on calendar page load (fire and forget)
  // TIEMPO-329: Now includes visitor_id cookie for persistent identity
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        // TIEMPO-329: Get or create persistent visitor_id (UUID cookie)
        const visitorId = getOrCreateVisitorId();

        // TIEMPO-324: Get 3-tier geolocation data (browser GPS -> Google API -> ipinfo fallback)
        const browserGeoData = await getGeolocationData();

        // TIEMPO-329 Phase 1.1: Auto-center map from GPS if no location selected
        if ((!currentLocation?.lat && !currentLocation?.lng) &&
            browserGeoData?.google_browser_lat &&
            browserGeoData?.google_browser_long) {

          setSessionLocation({
            lat: browserGeoData.google_browser_lat,
            lng: browserGeoData.google_browser_long,
            zoomRange: 75  // 75-mile radius as requested
          });
        }

        // Skip AF tracking calls on localhost
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          return;
        }

        // Fetch all geolocation data (Cloudflare, Google, IP API) with distance calculation
        // PHASE 1.2: Use 24-hour cache for visitor tracking
        const geoData = await fetchAllGeolocationData(1440); // 1440 minutes = 24 hours

        await fetch(`${afUrl}/api/visitor/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appId: parseInt(process.env.NEXT_PUBLIC_APPLICATION_ID, 10) || 1,
            visitor_id: visitorId,
            pathname: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
            hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: -new Date().getTimezoneOffset(),
            cloudflare: geoData.cloudflare,
            google: geoData.google,
            ipapi: geoData.ipapi,
            distance: geoData.distance,
            google_browser_lat: browserGeoData.google_browser_lat,
            google_browser_long: browserGeoData.google_browser_long,
            google_browser_accuracy: browserGeoData.google_browser_accuracy,
            google_api_lat: browserGeoData.google_api_lat,
            google_api_long: browserGeoData.google_api_long
          })
        });
      } catch (error) {
        // Silent failure - don't break user experience
        console.warn('[Visitor Tracking] Failed:', error.message);
      }
    };

    trackVisitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only fire once on mount

  // TIEMPO-323: MapCenter tracking for all users (logged-in and anonymous)
  useEffect(() => {
    // Skip on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return () => {};
    }

    const trackMapCenterChange = async (location) => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

        // PHASE 1.2: Use 1-hour cache for map center changes
        const geoData = await fetchAllGeolocationData(60);

        const headers = { 'Content-Type': 'application/json' };
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        await fetch(`${afUrl}/api/user/mapcenter-track`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            mapCenter: { lat: location.lat, lng: location.lng },
            page: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: -new Date().getTimezoneOffset(),
            cloudflare: geoData.cloudflare,
            google: geoData.google,
            ipapi: geoData.ipapi
          })
        });
      } catch (error) {
        console.warn('[MapCenter Tracking] Failed:', error.message);
      }
    };

    const unsubscribe = locationEventBus.on(
      LOCATION_EVENTS.LOCATION_CHANGED,
      (location) => {
        if (location?.lat && location?.lng) {
          trackMapCenterChange(location);
        }
      }
    );

    return () => { unsubscribe(); };
  }, [user]);

  return <>{children}</>;
};

// Define prop types for validation
RootLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensure that children is a valid React node
};

export default RootLayout;
