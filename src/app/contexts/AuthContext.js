// app/contexts/AuthContext.js

'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, facebookProvider, googleProvider, appleProvider } from '@/utils/firebase';
import axios from 'axios';
import { dedupeFetch } from '@/utils/dedupeFetch';
import { fetchAllGeolocationData } from '@/utils/trackingHelper';
import { getGeolocationData } from '@/utils/geolocationHelper'; // TIEMPO-324: 3-tier geolocation

// Create Auth Context
export const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Unified user state
  const [selectedRole, setSelectedRole] = useState(''); // Preserve selectedRole
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const signUpOngoing = useRef(false);

  useEffect(() => {
// TIEMPO-276: Security cleanup - removed logging
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
// TIEMPO-276: Security cleanup - removed logging
      // const startTime = Date.now();

      if (currentUser) {
// TIEMPO-276: Security cleanup - removed logging
        await setUserData(currentUser, 'auto');
      } else {
// TIEMPO-276: Security cleanup - removed logging
        setUser(null);
        setSelectedRole(''); // Reset selectedRole on logout
      }

      setLoading(false);
      //  const endTime = Date.now();
// TIEMPO-276: Security cleanup - removed logging
    });
    
    // Set up token refresh interval if a user exists
    let tokenRefreshInterval;
    if (auth.currentUser) {
      // Refresh token every 30 minutes to ensure it doesn't expire
      tokenRefreshInterval = setInterval(async () => {
        try {
          if (auth.currentUser) {
            const newToken = await auth.currentUser.getIdToken(true);
            setUser(prevUser => ({
              ...prevUser,
              token: newToken
            }));
// TIEMPO-276: Security cleanup - removed logging
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes
    }

    return () => {
      unsubscribe();
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
    };
  }, []);

  // Function to fetch and set combined user data
  const setUserData = async (firebaseUser, loginType = 'manual') => {
// TIEMPO-276: Security cleanup - removed logging
    // const startTime = Date.now();

    try {
      const idToken = await firebaseUser.getIdToken();
// TIEMPO-276: Security cleanup - removed logging

      // Track login analytics (fire and forget - non-blocking)
      const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

      // TIEMPO-324: Get 3-tier geolocation data (browser GPS → Google API → ipinfo fallback)
      getGeolocationData().then(browserGeoData => {
        // Fetch all geolocation data (Cloudflare, Google, IP API) with distance calculation
        // TIEMPO-319: Use 8-hour cache for login tracking (480 minutes)
        fetchAllGeolocationData(480).then(geoData => {
          fetch(`${afUrl}/api/user/login-track`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              loginType: loginType, // 'auto' or 'manual'
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              timezoneOffset: -new Date().getTimezoneOffset(), // Negate because JS returns opposite sign

              // Existing geolocation data
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
          }).catch(err => console.warn('[Login Tracking] Failed:', err.message));
        }).catch(err => console.warn('[Login Tracking] Geolocation fetch failed:', err.message));
      }).catch(err => console.warn('[Login Tracking] Browser geolocation failed:', err.message));

// TIEMPO-276: Security cleanup - removed logging

      // TIEMPO-257: Use dedupeFetch to prevent duplicate calls
      const response = await dedupeFetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          params: { appId: process.env.NEXT_PUBLIC_APPLICATION_ID },
          timeout: 10000 // 10 second timeout
        }
      );
// TIEMPO-276: Security cleanup - removed logging

      const backendInfo = response.data;
      
// TIEMPO-276: Security cleanup - removed logging
      
      // Check if regionalOrganizerInfo is properly populated
      if (backendInfo.regionalOrganizerInfo && backendInfo.regionalOrganizerInfo.organizerId) {
// TIEMPO-276: Security cleanup - removed logging
        
        // Ensure the flags are set properly
        if (!backendInfo.regionalOrganizerInfo.isActive ||
            !backendInfo.regionalOrganizerInfo.isEnabled ||
            !backendInfo.regionalOrganizerInfo.isApproved) {
          // TIEMPO-275: Keep console.warn for important warnings
          console.warn('RegionalOrganizer flags not all enabled:', {
            isActive: backendInfo.regionalOrganizerInfo.isActive,
            isEnabled: backendInfo.regionalOrganizerInfo.isEnabled,
            isApproved: backendInfo.regionalOrganizerInfo.isApproved
          });
        }
      } else if (backendInfo.roleIds && backendInfo.roleIds.some(role => 
        typeof role === 'object' && role.roleName === 'RegionalOrganizer'
      )) {
        // TIEMPO-275: Keep console.warn for important warnings
        console.warn('User has RegionalOrganizer role but no organizerId in regionalOrganizerInfo!');
      }

      // Merge Firebase and backend user data
      const mergedUser = {
        ...firebaseUser, // Spread Firebase user properties directly
        backendInfo,
        roles: backendInfo.roleIds.map((role) => role.roleName) || [],
        token: idToken, // Store the token for API calls
      };
// TIEMPO-276: Security cleanup - removed logging
      setUser(mergedUser);

      // Always default to NamedUser role if available
      if (mergedUser.roles.includes('NamedUser')) {
// TIEMPO-276: Security cleanup - removed logging
        setSelectedRole('NamedUser');
      } else {
        // Fall back to first available role if NamedUser not available
// TIEMPO-276: Security cleanup - removed logging
        setSelectedRole(mergedUser.roles[0] || '');
      }
      
// TIEMPO-276: Security cleanup - removed logging
    } catch (err) {
      console.error('Error fetching combined user data:', err);
      
      // Log detailed error information for debugging
      if (err.response) {
        // Server responded with non-2xx status
        console.error('Backend server error details:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      } else if (err.request) {
        // Request was made but no response received (network issue)
        console.error('No response received from server:', err.request);
      } else {
        // Error setting up the request
        console.error('Request setup error:', err.message);
      }
      
      // Create a minimal user object with just Firebase data
      // This allows the user to still use the app with limited functionality
      const minimalUser = {
        ...firebaseUser,
        roles: ['AnonymousUser'], // Fallback role
        token: await firebaseUser.getIdToken(),
        backendInfo: {
          roleIds: [{roleName: 'AnonymousUser', _id: 'temporary'}]
        }
      };
      
// TIEMPO-276: Security cleanup - removed logging
      
      // Set a minimal user object instead of null to prevent complete login failure
      setUser(minimalUser);
      setSelectedRole('AnonymousUser');
      setError('Warning: Limited functionality due to server issues. Some features may not work.');
    }

    // const endTime = Date.now();
// TIEMPO-276: Security cleanup - removed logging
  };

  // Authenticate with Google
  const authenticateWithGoogle = async () => {
    if (user) {
      setError('You are already signed in.');
      return null;
    }

    setLoading(true);

    try {
      signUpOngoing.current = true;
      const result = await signInWithPopup(auth, googleProvider);
// TIEMPO-276: Security cleanup - removed logging
      const firebaseUser = result.user;

      // Fetch or create user in backend
      await handleBackendUser(firebaseUser);

      signUpOngoing.current = false;
      await setUserData(firebaseUser); // Set merged user data
      setLoading(false);
      return firebaseUser;
    } catch (err) {
      console.error('Error in authenticateWithGoogle:', err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        // Handle account linking
        const user = await handleAccountExistsWithDifferentCredential(err);
        return user;
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      setLoading(false);
      signUpOngoing.current = false;
      return null;
    }
  };

  // Authenticate with Facebook
  const authenticateWithFacebook = async () => {
    if (user) {
      setError('You are already signed in.');
      return null;
    }

    setLoading(true);

    try {
      signUpOngoing.current = true;
      const result = await signInWithPopup(auth, facebookProvider);
// TIEMPO-276: Security cleanup - removed logging
      const firebaseUser = result.user;

      // Fetch or create user in backend
      await handleBackendUser(firebaseUser);

      signUpOngoing.current = false;
      await setUserData(firebaseUser); // Set merged user data
      setLoading(false);
      return firebaseUser;
    } catch (err) {
      console.error('Error in authenticateWithFacebook:', err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        // Handle account linking
        const user = await handleAccountExistsWithDifferentCredential(err);
        return user;
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      setLoading(false);
      signUpOngoing.current = false;
      return null;
    }
  };

  // Authenticate with Apple
  const authenticateWithApple = async () => {
// TIEMPO-276: Security cleanup - removed logging
    
    if (user) {
// TIEMPO-276: Security cleanup - removed logging
      setError('You are already signed in.');
      return null;
    }

    setLoading(true);

    try {
      signUpOngoing.current = true;
      
// TIEMPO-276: Security cleanup - removed logging
      const result = await signInWithPopup(auth, appleProvider);
      
// TIEMPO-276: Security cleanup - removed logging
      
      const firebaseUser = result.user;

      // Extract name from Apple profile on first login
      if (result.additionalUserInfo?.isNewUser && result.additionalUserInfo?.profile) {
        const profile = result.additionalUserInfo.profile;
// TIEMPO-276: Security cleanup - removed logging
        
        // Apple provides name data differently - could be in various formats
        let fullName = '';
        
        if (profile.name) {
          // Sometimes Apple provides a name object
          if (typeof profile.name === 'object') {
            fullName = `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim();
          } else if (typeof profile.name === 'string') {
            fullName = profile.name;
          }
        } else if (profile.firstName || profile.lastName) {
          // Sometimes provided as separate fields
          fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        } else if (profile.given_name || profile.family_name) {
          // OAuth standard claims
          fullName = `${profile.given_name || ''} ${profile.family_name || ''}`.trim();
        }
        
        if (fullName) {
// TIEMPO-276: Security cleanup - removed logging
          await updateProfile(firebaseUser, { displayName: fullName });
          // Update the local user object to reflect the change
          firebaseUser.displayName = fullName;
        } else {
          // TIEMPO-275: Keep console.warn for important warnings
          console.warn('No name data found in Apple profile');
        }
      }

// TIEMPO-276: Security cleanup - removed logging
      await handleBackendUser(firebaseUser);

      signUpOngoing.current = false;
      await setUserData(firebaseUser); // Set merged user data
      setLoading(false);
// TIEMPO-276: Security cleanup - removed logging
      return firebaseUser;
    } catch (err) {
      console.error('=== Apple Sign-In Error ===');
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        customData: err.customData,
        serverResponse: err.serverResponse,
        fullError: err
      });
      
      if (err.code === 'auth/account-exists-with-different-credential') {
// TIEMPO-276: Security cleanup - removed logging
        const user = await handleAccountExistsWithDifferentCredential(err);
        return user;
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Apple Sign-In is not properly configured. Please try another sign-in method.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err.code === 'auth/unauthorized-domain') {
        console.error('Unauthorized domain. Current domain:', window.location.hostname);
        setError('This domain is not authorized for Apple Sign-In.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      setLoading(false);
      signUpOngoing.current = false;
      return null;
    }
  };

  // Function to handle account linking when the error occurs
  const handleAccountExistsWithDifferentCredential = async (error) => {
    const pendingCred = error.credential;
    const email = error.email;

    // Ensure email is available
    if (!email) {
      setError('Your email address is not available. Please use a different sign-in method.');
      setLoading(false);
      return null;
    }

    try {
      // Get sign-in methods for this email
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        let existingProvider;

        // Determine existing provider
        if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
          existingProvider = new GoogleAuthProvider();
        } else if (methods.includes(EmailAuthProvider.PROVIDER_ID)) {
          existingProvider = new EmailAuthProvider();
        } else if (methods.includes(FacebookAuthProvider.PROVIDER_ID)) {
          existingProvider = new FacebookAuthProvider();
        } else if (methods.includes('apple.com')) {
          existingProvider = new OAuthProvider('apple.com');
        } else {
          // Handle unknown providers gracefully
          setError('Please sign in using your existing provider.');
          return null;
        }

        // Prompt the user to sign in with the existing provider
        const existingUserResult = await signInWithPopup(auth, existingProvider);

        // Link the pending credential to the existing user
        await linkWithCredential(existingUserResult.user, pendingCred);

        // Fetch or create user in backend
        await handleBackendUser(existingUserResult.user);
        await setUserData(existingUserResult.user); // Update user data
        setLoading(false);
        return existingUserResult.user;
      } else {
        // No sign-in methods found for the email
        setError('No existing sign-in methods found for this email.');
        setLoading(false);
        return null;
      }
    } catch (linkError) {
      console.error('Error during account linking:', linkError);
      setError(linkError.message || 'An unexpected error occurred during account linking.');
      setLoading(false);
      return null;
    }
  };

  // Function to handle fetching or creating the user in the backend
  const handleBackendUser = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    try {
// TIEMPO-276: Security cleanup - removed logging
      await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      console.error('Error fetching user from backend:', error);
      if (error.response && error.response.status === 404) {
// TIEMPO-276: Security cleanup - removed logging
        const displayName = firebaseUser.displayName || '';
        const [firstName, lastName] = displayName.split(' ');
        const userData = {
          firebaseUserId: firebaseUser.uid,
          firstName: firstName || '',
          lastName: lastName || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          photoUrl: firebaseUser.photoURL || '',
        };

        const roleResponse = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/`, userData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (roleResponse.status !== 204) {
          throw new Error('Failed to assign role in backend');
        }
      } else {
        throw error;
      }
    }
  };

  // Login with Email and Password
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await setUserData(result.user);
      setLoading(false);
      return result.user;
    } catch (err) {
      console.error('Error in login:', err);
      setError(err.message || 'Login failed.');
      setLoading(false);
      return null;
    }
  };

  // Sign up with Email and Password
  const signUp = async ({ email, password, firstName, lastName }) => {
// TIEMPO-276: Security cleanup - removed logging
    
    try {
      setLoading(true);
      
// TIEMPO-276: Security cleanup - removed logging
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
// TIEMPO-276: Security cleanup - removed logging
      
      // Update profile with display name
      const displayName = `${firstName} ${lastName}`.trim();
// TIEMPO-276: Security cleanup - removed logging
      await updateProfile(firebaseUser, { displayName });
// TIEMPO-276: Security cleanup - removed logging
      
      // Send email verification
// TIEMPO-276: Security cleanup - removed logging
      try {
        await sendEmailVerification(firebaseUser);
// TIEMPO-276: Security cleanup - removed logging
      } catch (verifyErr) {
        console.error('Error sending verification email:', verifyErr);
        // Don't fail signup if verification email fails
      }
      
      // Create user in backend
// TIEMPO-276: Security cleanup - removed logging
      await handleBackendUser(firebaseUser);
// TIEMPO-276: Security cleanup - removed logging
      
      // Set user data in context
// TIEMPO-276: Security cleanup - removed logging
      await setUserData(firebaseUser);
// TIEMPO-276: Security cleanup - removed logging
      
      setLoading(false);
      return firebaseUser;
    } catch (err) {
      console.error('Error in signUp:', err);
      console.error('Error details:', { 
        code: err.code, 
        message: err.message,
        stack: err.stack
      });
      
      // Parse Firebase error messages to make them more user-friendly
      let errorMessage = 'Sign up failed.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email address is invalid.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error occurred. Please check your connection.';
      } else {
        // Include original error for debugging
        errorMessage = `Sign up failed: ${err.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Logout Function
  const logOut = async () => {
    try {
      await signOut(auth);
// TIEMPO-276: Security cleanup - removed logging
      setUser(null);
      setSelectedRole(''); // Reset selectedRole on logout
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out.');
    }
  };

  // Helper method to get a fresh token
  const getIdToken = async (forceRefresh = false) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      const token = await auth.currentUser.getIdToken(forceRefresh);
      
      // Update the stored token
      setUser(prevUser => ({
        ...prevUser,
        token
      }));
      
      return token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      throw error;
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
// TIEMPO-276: Security cleanup - removed logging
    try {
      setLoading(true);
      setError('');
      
// TIEMPO-276: Security cleanup - removed logging
      await sendPasswordResetEmail(auth, email);
// TIEMPO-276: Security cleanup - removed logging
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error sending password reset email:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Send Verification Email
  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err) {
      console.error('Error sending verification email:', err);
      
      let errorMessage = 'Failed to send verification email.';
      if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Context Value
  const value = {
    user,
    selectedRole,
    setSelectedRole, // Provide setter for selectedRole
    loading,
    error,
    logOut,
    authenticateWithGoogle,
    authenticateWithFacebook,
    authenticateWithApple,
    login,
    signUp,
    getIdToken, // Add method to get a fresh token
    resetPassword, // Password reset functionality
    sendVerificationEmail, // Email verification functionality
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
