/**
 * WelcomeModal - First-visit location setup trigger
 *
 * TIEMPO-329: Managed User Entry Flow
 * TIEMPO-411: Auto-browser-geolocation path removed — iOS Safari rejected
 *             setTimeout-delayed getCurrentPosition as non-gesture and
 *             surfaced a confusing "not allowed" error.
 *
 * Flow for anonymous users:
 * 1. Logged in → UserLocationLoader handles it, skip
 * 2. Already have a saved/session location (or on /boston) → skip
 * 3. Otherwise → open MapCenterModal; user picks explicitly via crosshair
 *    map click or user-tap "Use My Location" button
 *
 * @module WelcomeModal
 */

'use client';

import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import {
  incrementVisitCount,
  getLastMapCenter
} from '@/utils/visitorTracking';

const needsLocationSetup = () => {
  const storedLocation = getLastMapCenter();
  const isBostonRoute = typeof window !== 'undefined' && window.location.pathname.includes('/boston');
  if (isBostonRoute) return false;
  if (storedLocation) return false;
  return true;
};

const WelcomeModal = () => {
  const { user } = useContext(AuthContext);
  const { openMapCenterModal, setMapCenterModalPrompt } = useGeoLocation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return;

    incrementVisitCount();

    if (user) {
      setHasChecked(true);
      return;
    }

    if (!needsLocationSetup()) {
      setHasChecked(true);
      return;
    }

    // TIEMPO-457 v1.27.3: set the prompt BEFORE opening so MapCenterModal
    // mounts with headerOverride + autoFocusCitySearch already active. Without
    // this WelcomeModal opens cold (t≈800ms) and the L4 cascade only sets the
    // prompt later (t≈1-5s), by which point autoFocus is dead (mount-time only).
    setMapCenterModalPrompt('What major city would you like to see?');
    openMapCenterModal();
    setHasChecked(true);
  }, [hasChecked, openMapCenterModal, setMapCenterModalPrompt, user]);

  return null;
};

export default WelcomeModal;
