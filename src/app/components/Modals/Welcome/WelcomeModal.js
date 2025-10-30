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

import React, { useState, useEffect, useContext } from 'react';
import { Dialog, Slide } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import {
  isFirstTimeVisitor,
  wasWelcomeShown,
  setWelcomeShown,
  getVisitCount,
  incrementVisitCount,
  getLastMapCenter
} from '@/utils/visitorTracking';
import FirstTimeVisitorContent from './FirstTimeVisitorContent';
import ReturningVisitorContent from './ReturningVisitorContent';
import FirstLoginUserContent from './FirstLoginUserContent';
import SignupPromptContent from './SignupPromptContent';

// Transition animation for modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Determine which user state applies
 * TIEMPO-329 Phase 1.1: Simplified onboarding pattern
 *
 * @param {Object} user - Firebase user object (null if not logged in)
 * @returns {string} User state: FIRST_TIME_VISITOR, WELCOME_BACK, SIGNUP_PROMPT, FIRST_LOGIN_USER, or SILENT
 */
const determineUserState = (user) => {
  // Increment visit count on each page load
  const visitCount = incrementVisitCount();
  const welcomeShown = wasWelcomeShown();

  console.log('[WelcomeModal DEBUG] ======================');
  console.log('[WelcomeModal DEBUG] Visit count:', visitCount);
  console.log('[WelcomeModal DEBUG] User authenticated:', user ? 'YES' : 'NO');
  console.log('[WelcomeModal DEBUG] Welcome shown before:', welcomeShown);

  // Priority 1: Check authentication status
  if (!user) {
    // Anonymous visitor - use visit counter pattern
    let state;
    if (visitCount === 1) {
      state = 'FIRST_TIME_VISITOR';  // Visit 1: Full welcome
    } else if (visitCount === 2) {
      state = 'WELCOME_BACK';  // Visit 2: Welcome back
    } else if (visitCount >= 5 && visitCount % 5 === 0) {
      state = 'SIGNUP_PROMPT';  // Visits 5, 10, 15, 20...: Encourage signup
    } else {
      state = 'SILENT';  // All other visits: Silent load
    }
    console.log('[WelcomeModal DEBUG] Anonymous user state:', state);
    return state;
  } else {
    // Authenticated user
    const isFirstLogin = localStorage.getItem('is_first_login') === 'true';
    console.log('[WelcomeModal DEBUG] First login flag:', isFirstLogin);

    let state;
    if (isFirstLogin && !welcomeShown) {
      state = 'FIRST_LOGIN_USER';  // Show onboarding checklist
    } else {
      state = 'LOGGED_IN_RETURNING';  // No modal, auto-load prefs
    }
    console.log('[WelcomeModal DEBUG] Authenticated user state:', state);
    return state;
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
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { openMapCenterModal, setSessionLocation } = useGeoLocation();
  const [userState, setUserState] = useState(null);
  const [internalOpen, setInternalOpen] = useState(false);

  // BUGFIX: Determine user state ONLY ONCE on mount
  // Lock the state to prevent race condition where cookie gets created mid-render
  useEffect(() => {
    console.log('[WelcomeModal DEBUG] useEffect triggered, userState:', userState, 'user:', user ? 'authenticated' : 'anonymous');

    // Only determine state if not already set
    if (userState === null) {
      const state = determineUserState(user);
      setUserState(state);
      console.log('[WelcomeModal DEBUG] User state locked:', state);

      // Only show modal for states that require it
      const shouldOpen = state === 'FIRST_TIME_VISITOR' ||
                         state === 'WELCOME_BACK' ||
                         state === 'SIGNUP_PROMPT' ||
                         state === 'FIRST_LOGIN_USER';

      console.log('[WelcomeModal DEBUG] Should open modal?', shouldOpen, '(state:', state + ')');

      if (shouldOpen) {
        setInternalOpen(true);
        console.log('[WelcomeModal DEBUG] Setting internalOpen = TRUE');
      } else {
        setInternalOpen(false);
        console.log('[WelcomeModal DEBUG] Setting internalOpen = FALSE');
      }
    } else {
      console.log('[WelcomeModal DEBUG] User state already set to:', userState, '- skipping determination');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only re-run if user login state changes

  /**
   * Handle "Select My Location" button click
   * Checks for stored location first, restores if available, otherwise opens map modal
   */
  const handleSelectLocation = () => {
    // Check for stored location
    const storedLocation = getLastMapCenter();

    if (storedLocation) {
      console.log('[WelcomeModal] Restoring previous location:', storedLocation);

      // Restore location to session
      setSessionLocation(storedLocation);

      // Mark welcome as shown
      setWelcomeShown();

      // Close modal
      setInternalOpen(false);
      onClose();
    } else {
      console.log('[WelcomeModal] No stored location, opening MapCenterModal');

      // No stored location - open map modal
      setWelcomeShown();
      setInternalOpen(false);
      onClose();

      // Small delay to let welcome modal close first
      setTimeout(() => {
        openMapCenterModal();
      }, 300);
    }
  };

  /**
   * Handle "Sign Up" button click
   * Redirects to signup page
   */
  const handleSignup = () => {
    console.log('[WelcomeModal] Redirecting to signup');
    setWelcomeShown();
    setInternalOpen(false);
    onClose();
    router.push('/auth/signup');
  };

  /**
   * Handle "Login" link click
   * Redirects to login page
   */
  const handleLogin = () => {
    console.log('[WelcomeModal] Redirecting to login');
    setWelcomeShown();
    setInternalOpen(false);
    onClose();
    router.push('/auth/login');
  };

  /**
   * Handle "Get Started" button click (for other user states)
   * Marks welcome as shown and opens appropriate next action
   */
  const handleGetStarted = () => {
    setWelcomeShown();

    if (userState === 'RETURNING_VISITOR') {
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
      userState === 'SILENT' ||
      userState === 'LOGGED_IN_RETURNING') {
    console.log('[WelcomeModal DEBUG] Early return - NOT rendering modal. State:', userState);
    return null;
  }

  console.log('[WelcomeModal DEBUG] Rendering modal. State:', userState, 'open:', open, 'internalOpen:', internalOpen);

  return (
    <Dialog
      open={internalOpen}
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
        <>
          {console.log('[WelcomeModal DEBUG] Rendering: FirstTimeVisitorContent')}
          <FirstTimeVisitorContent
            onSelectLocation={handleSelectLocation}
            onSignup={handleSignup}
            onLogin={handleLogin}
          />
        </>
      )}

      {userState === 'WELCOME_BACK' && (
        <>
          {console.log('[WelcomeModal DEBUG] Rendering: ReturningVisitorContent')}
          <ReturningVisitorContent
            onClose={handleSkip}
          />
        </>
      )}

      {userState === 'SIGNUP_PROMPT' && (
        <>
          {console.log('[WelcomeModal DEBUG] Rendering: SignupPromptContent')}
          <SignupPromptContent
            onSignup={handleSignup}
            onLogin={handleLogin}
            onClose={handleSkip}
          />
        </>
      )}

      {userState === 'FIRST_LOGIN_USER' && (
        <>
          {console.log('[WelcomeModal DEBUG] Rendering: FirstLoginUserContent')}
          <FirstLoginUserContent
            onGetStarted={handleGetStarted}
            onSkip={handleSkip}
          />
        </>
      )}
    </Dialog>
  );
};

export default WelcomeModal;
