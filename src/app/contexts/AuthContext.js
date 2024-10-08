// app/contexts/AuthContext.js

'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await setUserData(currentUser);
      } else {
        setUser(null);
        setSelectedRole(''); // Reset selectedRole on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to fetch and set combined user data
  const setUserData = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const backendInfo = response.data;

      // Merge Firebase and backend user data
      const mergedUser = {
        ...firebaseUser, // Spread Firebase user properties directly
        backendInfo,
        roles: backendInfo.roleIds.map((role) => role.roleName) || [],
      };

      setUser(mergedUser);

      // Set selectedRole to the first available role
      setSelectedRole(mergedUser.roles[0] || '');
    } catch (err) {
      console.error('Error fetching combined user data:', err);
      setError('Failed to fetch user data.');
      setUser(null);
      setSelectedRole('');
    }
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
      console.log('Initiating Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result);
      const firebaseUser = result.user;

      // Fetch or create user in backend
      const idToken = await firebaseUser.getIdToken();
      try {
        console.log('Fetching user from backend...');
        await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUser.uid}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
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

          const roleResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/`,
            userData,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          if (roleResponse.status !== 204) {
            throw new Error('Failed to assign role in backend');
          }
        } else {
          throw error;
        }
      }

      signUpOngoing.current = false;
      await setUserData(firebaseUser); // Set merged user data
      setLoading(false);
      return firebaseUser;
    } catch (err) {
      console.error('Error in authenticateWithGoogle:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
      signUpOngoing.current = false;
      return null;
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
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
