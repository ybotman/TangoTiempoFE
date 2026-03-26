/**
 * WelcomeModal - Browser Geolocation First Flow
 *
 * Part of TIEMPO-329: Managed User Entry Flow
 * Updated TIEMPO-388: Try browser geolocation before showing modal
 *
 * Flow for anonymous users:
 * 1. If user has saved/session location → use it silently
 * 2. If on /boston route → use Boston coordinates (handled elsewhere)
 * 3. Otherwise → TRY browser geolocation first
 *    a. If granted → use it, show toast, DON'T show modal
 *    b. If denied/timeout → show MapCenterModal
 *
 * @module WelcomeModal
 */

'use client';

import { useState, useEffect, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import {
  incrementVisitCount,
  getLastMapCenter
} from '@/utils/visitorTracking';

/**
 * Determine if user needs location setup
 * @returns {boolean} true if no stored location
 */
const needsLocationSetup = () => {
  const storedLocation = getLastMapCenter();
  const isBostonRoute = typeof window !== 'undefined' && window.location.pathname.includes('/boston');

  if (isBostonRoute) return false;
  if (storedLocation) return false;
  return true;
};

/**
 * WelcomeModal Component
 * Tries browser geolocation first, only shows modal if denied/failed
 */
const WelcomeModal = () => {
  const { user } = useContext(AuthContext);
  const { openMapCenterModal, setSessionLocation } = useGeoLocation();
  const [hasChecked, setHasChecked] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (hasChecked) return;

    incrementVisitCount();

    // Skip for logged-in users - UserLocationLoader handles their location
    if (user) {
      setHasChecked(true);
      return;
    }

    // Skip if already have location
    if (!needsLocationSetup()) {
      setHasChecked(true);
      return;
    }

    // TIEMPO-388: Try browser geolocation first for anonymous users
    const tryBrowserGeolocation = () => {
      if (!('geolocation' in navigator)) {
        // No geolocation support - fall back to modal
        openMapCenterModal();
        return;
      }

      // Try to get browser location with timeout
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success! Use browser location
          const { latitude, longitude } = position.coords;
          setSessionLocation({
            lat: latitude,
            lng: longitude,
            zoomRange: 50
          });

          // Show friendly toast instead of modal
          setToastOpen(true);
        },
        (error) => {
          // Geolocation denied or failed - show modal
          openMapCenterModal();
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,  // 10 second timeout (VPN can slow geolocation)
          maximumAge: 300000  // Accept cached position up to 5 min old
        }
      );
    };

    // Small delay to let page render, then try geolocation
    setTimeout(tryBrowserGeolocation, 500);

    setHasChecked(true);
  }, [hasChecked, openMapCenterModal, setSessionLocation, user]);

  return (
    <Snackbar
      open={toastOpen}
      onClose={() => setToastOpen(false)}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setToastOpen(false)}
        severity="info"
        sx={{ backgroundColor: '#1976d2', color: 'white' }}
      >
        Using your location. Tap the pill to change.
      </Alert>
    </Snackbar>
  );
};

export default WelcomeModal;
