//@/calendar/layout.js
'use client'; // Enable client-side rendering

/**
 * @typedef {Object} UserLocation
 * Canonical FE→BE contract for userLocation field in mapcenter-track and login-track POSTs.
 * Written to sessionStorage key 'cf_user_location' once per session in this file.
 * Read by AuthContext.js (login-track) and layout.js mapcenter-track.
 *
 * v1.28.3 shape (PROD today):
 * @property {number} lat
 * @property {number} lng
 * @property {string} city
 * @property {string} country
 *
 * TIEMPO-462 will extend with: source (string), confidence (number), cascadeLevel (number), region (string)
 */

import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { fetchAllGeolocationData } from '@/utils/trackingHelper';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';
import { getOrCreateVisitorId, getLastMapCenter } from '@/utils/visitorTracking';
import { getCountryMapLocation } from '@/utils/countryCenter';

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const {
    currentLocation,
    setSessionLocation,
    openMapCenterModal,
    setMapCenterModalPrompt,
  } = useGeoLocation();

  // TIEMPO-313 / TIEMPO-329 / TIEMPO-457: Calendar bootstrap.
  // Runs once on /calendar mount. Two responsibilities:
  //   (1) Resolve the user's location for the calendar view if not already set.
  //       Priority cascade Level 2 → 3 → 4 (Level 1 logged-in saved is upstream).
  //   (2) Fire visitor-tracking POST.
  useEffect(() => {
    const init = async () => {
      try {
        const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
        const visitorId = getOrCreateVisitorId();

        // Skip the cascade if any prior layer already set a location.
        const hasCurrentLocation = currentLocation?.lat && currentLocation?.lng;
        let resolved = !!hasCurrentLocation;

        // Level 2 — anonymous previously-set location restored from localStorage (silent).
        if (!resolved) {
          const lastCenter = getLastMapCenter();
          if (lastCenter?.lat && lastCenter?.lng) {
            await setSessionLocation({
              lat: lastCenter.lat,
              lng: lastCenter.lng,
              zoomRange: lastCenter.zoomRange || 50,
              source: 'anon-cookie',
            });
            try { sessionStorage.setItem('locationCascadeSource', 'anon-cookie'); } catch { /* sessionStorage unavailable */ }
            resolved = true;
          }
        }

        // TIEMPO-458: Level 3 — Cloudflare edge city (silent, no prompt, no pill).
        // Reads CF Managed Transform headers via /api/geo/cf-location route handler.
        // On TEST (CNAME/O2O), CF headers don't flow → miss is expected, falls to L4.
        // On PROD (A-record, full CF proxy), city resolves silently as mapCenter.
        let cfGeo = null;
        try {
          const cfRes = await fetch('/api/geo/cf-location');
          cfGeo = cfRes.ok ? await cfRes.json() : null;
        } catch { /* network error — fall to L4 */ }

        // TIEMPO-459: persist userLocation (where user IS) once per session.
        // Separate from mapCenter. Does not drive localStorage.
        if (cfGeo) {
          try {
            sessionStorage.setItem('cf_user_location', JSON.stringify({
              city: cfGeo.city, country: cfGeo.country,
              lat: cfGeo.lat, lng: cfGeo.lng,
            }));
          } catch { /* sessionStorage unavailable */ }
        }

        // TIEMPO-459: capture entryDomain (?src= param) once per session.
        try {
          const src = new URLSearchParams(window.location.search).get('src');
          if (src) sessionStorage.setItem('entry_domain', src);
        } catch { /* sessionStorage unavailable */ }

        if (!resolved && cfGeo?.city && cfGeo.lat !== null && cfGeo.lng !== null) {
          await setSessionLocation({
            lat: cfGeo.lat,
            lng: cfGeo.lng,
            zoomRange: 75,
            source: 'cf-city',
            skipPersist: true,
          });
          try { sessionStorage.setItem('locationCascadeSource', 'cf-city'); } catch { /* sessionStorage unavailable */ }
          resolved = true;
        }

        // Skip AF tracking calls on localhost
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          return;
        }

        // Fetch all geolocation data (Cloudflare, Google, IP API) with distance
        // calculation. PHASE 1.2: 24-hour cache for visitor tracking.
        const geoData = await fetchAllGeolocationData(1440);

        // Level 4 — Cloudflare country fallback (modal). CF city was null at L3
        // (country-only resolution). Per storage-rule: skipPersist:true so a
        // session-only country-center never overwrites a prior explicit pick.
        if (!resolved && cfGeo?.country) {
          const country = String(cfGeo.country).toUpperCase();
          const mapLoc = getCountryMapLocation(country);
          if (mapLoc) {
            await setSessionLocation({
              lat: mapLoc.lat,
              lng: mapLoc.lng,
              zoomRange: mapLoc.zoomRange || 200,
              source: 'cloudflare-country',
              skipPersist: true,
            });
            try { sessionStorage.setItem('locationCascadeSource', 'cloudflare-country'); } catch { /* sessionStorage unavailable */ }
            setMapCenterModalPrompt('What major city would you like to see?');
            openMapCenterModal();
            resolved = true;
          }
        }

        // Level 5 — no action. Toby confirmed browser provides something 99%+ of
        // the time; if everything fails, the existing default map center applies
        // and the header location selector remains available on-demand.
        if (!resolved) {
          try { sessionStorage.setItem('locationCascadeSource', 'default-fallback'); } catch { /* sessionStorage unavailable */ }
        }

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
            distance: geoData.distance
          })
        });
      } catch (error) {
        // Silent failure - don't break user experience
        console.warn('[Visitor Tracking] Failed:', error.message);
      }
    };

    init();
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

        // TIEMPO-457: cascadeSource = which level of the priority chain provided
        // this location. Falls back to sessionStorage when the emit didn't carry
        // it (e.g., LOCATION_CHANGED fired from a non-cascade caller).
        let cascadeSource = location.source || null;
        if (!cascadeSource && typeof sessionStorage !== 'undefined') {
          cascadeSource = sessionStorage.getItem('locationCascadeSource') || null;
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
            ipapi: geoData.ipapi,
                // TIEMPO-457: telemetry — which cascade level resolved this location
            cascadeSource,
            // TIEMPO-459: where the user IS (CF-inferred, session-start only)
            userLocation: (() => { try { return JSON.parse(sessionStorage.getItem('cf_user_location')); } catch { return null; } })(),
            entryDomain: (() => { try { return sessionStorage.getItem('entry_domain') || null; } catch { return null; } })()
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
/* v1.27.2 typeahead-prompt: prior Snackbar UX removed in favor of
   auto-opened MapCenterModal with header override "What major city would
   you like to see?" + autoFocused typeahead (per Quinn 19:49Z arbitration). */
