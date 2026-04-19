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
  const { openMapCenterModal } = useGeoLocation();
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

    openMapCenterModal();
    setHasChecked(true);
  }, [hasChecked, openMapCenterModal, user]);

  return null;
};

export default WelcomeModal;
