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
} from 'firebase/auth';
import { auth, facebookProvider } from '@/utils/firebase';
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
        console.log('User is logged in:', currentUser.uid);
        await setUserData(currentUser);
      } else {
        console.log('No user is logged in');
        setUser(null);
        setSelectedRole(''); // Reset selectedRole on logout
      }

      setLoading(false);
      //  const endTime = Date.now();
      //  console.log(`Auth state change handling took ${endTime - startTime} ms`);
    });

    return () => unsubscribe();
  }, []);

  // Function to fetch and set combined user data
  const setUserData = async (firebaseUser) => {
    // console.log('setUserData called');
    // const startTime = Date.now();

    try {
      const idToken = await firebaseUser.getIdToken();
      console.log('Fetched ID token');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      //  console.log('Fetched user data from backend');

      const backendInfo = response.data;

      // Merge Firebase and backend user data
      const mergedUser = {
        ...firebaseUser, // Spread Firebase user properties directly
        backendInfo,
        roles: backendInfo.roleIds.map((role) => role.roleName) || [],
      };
      console.log('Merged user:', mergedUser);
      setUser(mergedUser);

      // Set selectedRole to the first available role
      setSelectedRole(mergedUser.roles[0] || '');
    } catch (err) {
      console.error('Error fetching combined user data:', err);
      setError('Failed to fetch user data.');
      setUser(null);
      setSelectedRole('');
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
    const provider = new GoogleAuthProvider();

    try {
      signUpOngoing.current = true;
      const result = await signInWithPopup(auth, provider);
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

    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      setError('Facebook authentication is disabled in development.');
      return null;
    }

    setLoading(true);
    const provider = facebookProvider; // Already initialized in firebase.js

    if (!provider) {
      setError('Facebook authentication is not configured.');
      setLoading(false);
      return null;
    }

    try {
      signUpOngoing.current = true;
      const result = await signInWithPopup(auth, provider);
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
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
