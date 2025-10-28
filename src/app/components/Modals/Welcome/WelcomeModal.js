/**
 * WelcomeModal - Managed Entry Flow for 4 User States
 *
 * Part of TIEMPO-329: Managed User Entry Flow with Welcome Modals
 *
 * STATE 1: FIRST_TIME_VISITOR - Show welcome with deployment map and location selector
 * STATE 2: RETURNING_VISITOR - Show welcome back banner with location restore
 * STATE 3: FIRST_LOGIN_USER - Show onboarding checklist
 * STATE 4: LOGGED_IN_RETURNING - No modal (handled by auto-load)
 *
 * @module WelcomeModal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Slide } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import {
  isFirstTimeVisitor,
  wasWelcomeShown,
  setWelcomeShown
} from '@/utils/visitorTracking';
import FirstTimeVisitorContent from './FirstTimeVisitorContent';
import ReturningVisitorContent from './ReturningVisitorContent';
import FirstLoginUserContent from './FirstLoginUserContent';

// Transition animation for modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Determine which user state applies
 *
 * @param {Object} user - Firebase user object (null if not logged in)
 * @returns {string} User state: FIRST_TIME_VISITOR, RETURNING_VISITOR, FIRST_LOGIN_USER, or LOGGED_IN_RETURNING
 */
const determineUserState = (user) => {
  // Priority 1: Check authentication status
  if (!user) {
    // Anonymous visitor
    if (isFirstTimeVisitor() && !wasWelcomeShown()) {
      return 'FIRST_TIME_VISITOR';  // Show full welcome modal
    } else if (!isFirstTimeVisitor() && !wasWelcomeShown()) {
      return 'RETURNING_VISITOR';  // Show welcome back banner
    } else {
      return 'ANONYMOUS_RETURNING';  // No modal
    }
  } else {
    // Authenticated user
    const isFirstLogin = localStorage.getItem('is_first_login') === 'true';

    if (isFirstLogin && !wasWelcomeShown()) {
      return 'FIRST_LOGIN_USER';  // Show onboarding checklist
    } else {
      return 'LOGGED_IN_RETURNING';  // No modal, auto-load prefs
    }
  }
};

/**
 * WelcomeModal Component
 *
 * Shows appropriate welcome experience based on user state
 *
 * @param {Object} props
 * @param {boolean} props.open - Control modal visibility from parent
 * @param {Function} props.onClose - Callback when modal closes
 */
const WelcomeModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const { openMapCenterModal } = useGeoLocation();
  const [userState, setUserState] = useState(null);
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine user state on mount and when user changes
  useEffect(() => {
    const state = determineUserState(user);
    setUserState(state);
    console.log('[WelcomeModal] User state determined:', state);

    // Only show modal for states that require it
    if (state === 'FIRST_TIME_VISITOR' ||
        state === 'RETURNING_VISITOR' ||
        state === 'FIRST_LOGIN_USER') {
      setInternalOpen(true);
    } else {
      setInternalOpen(false);
    }
  }, [user]);

  /**
   * Handle "Get Started" button click
   * Marks welcome as shown and opens appropriate next action
   */
  const handleGetStarted = () => {
    setWelcomeShown();

    if (userState === 'FIRST_TIME_VISITOR') {
      // Open map center modal for location selection
      console.log('[WelcomeModal] Opening MapCenterModal for first-time visitor');
      setInternalOpen(false);
      onClose();
      // Small delay to let welcome modal close first
      setTimeout(() => {
        openMapCenterModal();
      }, 300);
    } else if (userState === 'RETURNING_VISITOR') {
      // Just close - location is already restored
      console.log('[WelcomeModal] Closing for returning visitor');
      setInternalOpen(false);
      onClose();
    } else if (userState === 'FIRST_LOGIN_USER') {
      // TODO: Open user settings modal for onboarding
      console.log('[WelcomeModal] TODO: Open onboarding flow');
      setInternalOpen(false);
      onClose();
    }
  };

  /**
   * Handle "Skip" or "Close" button click
   * Marks welcome as shown but doesn't open additional modals
   */
  const handleSkip = () => {
    setWelcomeShown();
    setInternalOpen(false);
    onClose();
    console.log('[WelcomeModal] Skipped welcome');
  };

  // Don't render if state doesn't require modal
  if (!userState ||
      userState === 'ANONYMOUS_RETURNING' ||
      userState === 'LOGGED_IN_RETURNING') {
    return null;
  }

  // Don't render if welcome was already shown
  if (wasWelcomeShown()) {
    return null;
  }

  return (
    <Dialog
      open={open && internalOpen}
      onClose={handleSkip}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      aria-labelledby="welcome-modal-title"
      aria-describedby="welcome-modal-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 2
        }
      }}
    >
      {/* Render appropriate content based on user state */}
      {userState === 'FIRST_TIME_VISITOR' && (
        <FirstTimeVisitorContent
          onGetStarted={handleGetStarted}
          onSkip={handleSkip}
        />
      )}

      {userState === 'RETURNING_VISITOR' && (
        <ReturningVisitorContent
          onClose={handleSkip}
        />
      )}

      {userState === 'FIRST_LOGIN_USER' && (
        <FirstLoginUserContent
          onGetStarted={handleGetStarted}
          onSkip={handleSkip}
        />
      )}
    </Dialog>
  );
};

export default WelcomeModal;
