/**
 * WelcomeModal - Simplified Location Flow
 *
 * Part of TIEMPO-329: Managed User Entry Flow
 *
 * Simplified flow:
 * - If user has saved/session location → use it silently
 * - If on /boston route → use Boston coordinates (handled elsewhere)
 * - Otherwise → open MapCenterModal directly
 *
 * No welcome banners - just handle location.
 *
 * @module WelcomeModal
 */

'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import {
  incrementVisitCount,
  getLastMapCenter
} from '@/utils/visitorTracking';

/**
 * Determine if user needs to set location
 *
 * @returns {boolean} true if user needs to set location
 */
const needsLocationSetup = () => {
  // Check if user has a stored location (either from cloud or session)
  const storedLocation = getLastMapCenter();

  // Check if on Boston route (Boston has forced coordinates)
  const isBostonRoute = typeof window !== 'undefined' && window.location.pathname.includes('/boston');

  if (isBostonRoute) {
    return false;  // Boston uses forced coordinates
  }

  if (storedLocation) {
    return false;  // Has location, no setup needed
  }

  return true;  // No location - need MapCenter modal
};

/**
 * WelcomeModal Component
 *
 * Handles location flow on page load - opens MapCenterModal if no location saved
 */
const WelcomeModal = () => {
  const { user } = useContext(AuthContext);
  const { openMapCenterModal } = useGeoLocation();
  const [hasChecked, setHasChecked] = useState(false);

  // Check location state and open MapCenterModal if needed
  useEffect(() => {
    if (hasChecked) return;

    // Increment visit count for analytics
    incrementVisitCount();

    // Check if location setup is needed
    if (needsLocationSetup()) {
      // Small delay to let page render first
      setTimeout(() => {
        openMapCenterModal();
      }, 500);
    }

    setHasChecked(true);
  }, [hasChecked, openMapCenterModal, user]);

  // No UI - just handles location flow
  return null;
};

export default WelcomeModal;
