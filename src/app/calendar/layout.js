//@/calendar/layout.js
'use client'; // Enable client-side rendering

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Snackbar, Alert, Button } from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { fetchAllGeolocationData } from '@/utils/trackingHelper';
import { getGeolocationData } from '@/utils/geolocationHelper'; // TIEMPO-324: 3-tier geolocation
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';
import { getOrCreateVisitorId, getLastMapCenter } from '@/utils/visitorTracking';
import { getCountryCenter, getCountryMapLocation } from '@/utils/countryCenter';

// TIEMPO-457: Country-size split for Level-4 fallback nudge. Big countries get a
// "Select your city" CTA in the Snackbar because the country center is far from
// most users; small countries omit the CTA because the center is effectively the
// main metro.
const BIG_COUNTRIES = new Set(['US', 'CA', 'AR', 'BR', 'AU', 'DE', 'ES', 'FR', 'IT', 'GB']);

const RootLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { currentLocation, setSessionLocation, openMapCenterModal } = useGeoLocation();

  // TIEMPO-457: Level-4 soft popup state. Null when not needed.
  const [countryHint, setCountryHint] = useState(null);

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

        // TIEMPO-324: 3-tier geolocation data (browser GPS → Google API → ipinfo
        // fallback). Always called — needed for the visitor-tracking POST below,
        // and for Level-3 resolution.
        const browserGeoData = await getGeolocationData();

        // Level 3 — browser GPS (Tier 1) or Google API (Tier 2). Silent.
        if (!resolved) {
          if (browserGeoData?.google_browser_lat && browserGeoData?.google_browser_long) {
            await setSessionLocation({
              lat: browserGeoData.google_browser_lat,
              lng: browserGeoData.google_browser_long,
              zoomRange: 75, // 75-mile radius
              source: 'browser-gps',
            });
            try { sessionStorage.setItem('locationCascadeSource', 'browser-gps'); } catch { /* sessionStorage unavailable */ }
            resolved = true;
          } else if (browserGeoData?.google_api_lat && browserGeoData?.google_api_long) {
            await setSessionLocation({
              lat: browserGeoData.google_api_lat,
              lng: browserGeoData.google_api_long,
              zoomRange: 75,
              source: 'google-api',
            });
            try { sessionStorage.setItem('locationCascadeSource', 'google-api'); } catch { /* sessionStorage unavailable */ }
            resolved = true;
          }
        }

        // Skip AF tracking calls on localhost
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          return;
        }

        // Fetch all geolocation data (Cloudflare, Google, IP API) with distance
        // calculation. PHASE 1.2: 24-hour cache for visitor tracking.
        const geoData = await fetchAllGeolocationData(1440);

        // Level 4 — Cloudflare country fallback (soft popup).
        // fetchAllGeolocationData populates the CF cache, so we read its result
        // directly rather than re-reading via getCachedGeolocation.
        if (!resolved && geoData?.cloudflare?.country) {
          const country = String(geoData.cloudflare.country).toUpperCase();
          const center = getCountryCenter(country);
          const mapLoc = getCountryMapLocation(country);
          if (center && mapLoc) {
            await setSessionLocation({
              lat: mapLoc.lat,
              lng: mapLoc.lng,
              zoomRange: mapLoc.zoomRange || 200,
              source: 'cloudflare-country',
            });
            try { sessionStorage.setItem('locationCascadeSource', 'cloudflare-country'); } catch { /* sessionStorage unavailable */ }
            setCountryHint({
              countryCode: country,
              countryName: center.name,
              isBig: BIG_COUNTRIES.has(country),
            });
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

        // TIEMPO-324 backfill (Geolocation cycle Phase 6, beat-65): 3-tier
        // geolocation flat fields (browser GPS → Google API → ipinfo fallback)
        // — matches the existing VisitorTrack + UserLoginTrack writers so BE
        // source-attribution chain (GoogleBrowser > GoogleGeolocation > IPInfoIO)
        // can stamp the canonical source per Invariant 8. Without this call,
        // MapCenterTrack POSTs only the nested {cloudflare, google, ipapi}
        // shape, which fails the BE's flat-field priority chain and falls
        // through to 100% IPInfoIO attribution.
        const browserGeoData = await getGeolocationData();

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
            // TIEMPO-324 backfill: 3-tier flat fields (Invariant 8 contract)
            google_browser_lat: browserGeoData.google_browser_lat,
            google_browser_long: browserGeoData.google_browser_long,
            google_browser_accuracy: browserGeoData.google_browser_accuracy,
            google_api_lat: browserGeoData.google_api_lat,
            google_api_long: browserGeoData.google_api_long,
            // TIEMPO-457: telemetry — which cascade level resolved this location
            cascadeSource
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

  return (
    <>
      {children}
      {/* TIEMPO-457 Level-4 soft popup: CF country fallback notice */}
      <Snackbar
        open={!!countryHint}
        autoHideDuration={countryHint?.isBig ? null : 8000}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          setCountryHint(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          onClose={() => setCountryHint(null)}
          action={
            countryHint?.isBig ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  openMapCenterModal();
                  setCountryHint(null);
                }}
              >
                Select your city
              </Button>
            ) : null
          }
          sx={{ width: '100%' }}
        >
          {countryHint
            ? `No good location found — centering on ${countryHint.countryName}`
            : ''}
        </Alert>
      </Snackbar>
    </>
  );
};

// Define prop types for validation
RootLayout.propTypes = {
  children: PropTypes.node.isRequired, // Ensure that children is a valid React node
};

export default RootLayout;
