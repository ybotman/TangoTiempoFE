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
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, facebookProvider, googleProvider } from '@/utils/firebase';
import axios from 'axios';

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
    console.log('AuthProvider useEffect called'); // Debugging
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      //  console.log('onAuthStateChanged triggered');
      // const startTime = Date.now();

      if (currentUser) {
        console.log('AuthCtx:uE-> User is logged in:', currentUser.uid);
        await setUserData(currentUser);
      } else {
        console.log('AuthCtx:uE-> No user is logged in');
        setUser(null);
        setSelectedRole(''); // Reset selectedRole on logout
      }

      setLoading(false);
      //  const endTime = Date.now();
      //  console.log(`Auth state change handling took ${endTime - startTime} ms`);
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
            console.log('Auth token refreshed');
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
  const setUserData = async (firebaseUser) => {
    // console.log('setUserData called');
    // const startTime = Date.now();

    try {
      const idToken = await firebaseUser.getIdToken();
      console.log('Fetched ID token');

      console.log('Attempting to fetch user data from backend:', 
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`);
      
      // Add timeout to prevent hanging requests
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          timeout: 10000 // 10 second timeout
        }
      );
      console.log('Successfully fetched user data from backend');

      const backendInfo = response.data;
      
      // For debugging
      console.log('Auth provider:', firebaseUser.providerData[0].providerId);
      console.log('Backend roleIds:', backendInfo.roleIds);
      console.log('RegionalOrganizerInfo:', backendInfo.regionalOrganizerInfo);
      
      // Check if regionalOrganizerInfo is properly populated
      if (backendInfo.regionalOrganizerInfo && backendInfo.regionalOrganizerInfo.organizerId) {
        console.log('User has organizerId:', backendInfo.regionalOrganizerInfo.organizerId);
        
        // Ensure the flags are set properly
        if (!backendInfo.regionalOrganizerInfo.isActive ||
            !backendInfo.regionalOrganizerInfo.isEnabled ||
            !backendInfo.regionalOrganizerInfo.isApproved) {
          console.warn('RegionalOrganizer flags not all enabled:', {
            isActive: backendInfo.regionalOrganizerInfo.isActive,
            isEnabled: backendInfo.regionalOrganizerInfo.isEnabled,
            isApproved: backendInfo.regionalOrganizerInfo.isApproved
          });
        }
      } else if (backendInfo.roleIds && backendInfo.roleIds.some(role => 
        typeof role === 'object' && role.roleName === 'RegionalOrganizer'
      )) {
        console.warn('User has RegionalOrganizer role but no organizerId in regionalOrganizerInfo!');
      }

      // Merge Firebase and backend user data
      const mergedUser = {
        ...firebaseUser, // Spread Firebase user properties directly
        backendInfo,
        roles: backendInfo.roleIds.map((role) => role.roleName) || [],
        token: idToken, // Store the token for API calls
      };
      console.log('Merged user:', mergedUser);
      setUser(mergedUser);

      // Always default to NamedUser role if available
      if (mergedUser.roles.includes('NamedUser')) {
        console.log('Setting selectedRole to NamedUser by default');
        setSelectedRole('NamedUser');
      } else {
        // Fall back to first available role if NamedUser not available
        console.log('NamedUser role not found, using first available role:', mergedUser.roles[0] || '');
        setSelectedRole(mergedUser.roles[0] || '');
      }
      
      // Log available roles for debugging
      console.log('Available roles for user:', mergedUser.roles);
      console.log('Has RegionalOrganizer role:', mergedUser.roles.includes('RegionalOrganizer'));
      console.log('Has valid organizerId:', !!(mergedUser.backendInfo?.regionalOrganizerInfo?.organizerId));
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
      
      console.log('Using minimal user object due to backend error:', minimalUser);
      
      // Set a minimal user object instead of null to prevent complete login failure
      setUser(minimalUser);
      setSelectedRole('AnonymousUser');
      setError('Warning: Limited functionality due to server issues. Some features may not work.');
    }

    // const endTime = Date.now();
    // console.log(`setUserData execution time: ${endTime - startTime} ms`);
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
      console.log('Google sign-in successful:', result);
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
      console.log('Facebook sign-in successful:', result);
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
      console.log('Fetching user from backend...');
      await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      console.error('Error fetching user from backend:', error);
      if (error.response && error.response.status === 404) {
        console.log('User not found in backend. Creating new user...');
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
    console.log('Starting signup process', { 
      email, 
      passwordLength: password ? password.length : 0, 
      firstName, 
      lastName 
    });
    
    try {
      setLoading(true);
      
      // Create user with Firebase
      console.log('Attempting to create user with Firebase...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase user created successfully', { uid: firebaseUser.uid });
      
      // Update profile with display name
      const displayName = `${firstName} ${lastName}`.trim();
      console.log('Updating user profile with display name...');
      await updateProfile(firebaseUser, { displayName });
      console.log('Profile updated successfully');
      
      // Create user in backend
      console.log('Creating user in backend...');
      await handleBackendUser(firebaseUser);
      console.log('Backend user created/updated successfully');
      
      // Set user data in context
      console.log('Setting user data in context...');
      await setUserData(firebaseUser);
      console.log('User data set in context successfully');
      
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
      console.log('User signed out successfully');
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
    login,
    signUp,
    getIdToken, // Add method to get a fresh token
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
