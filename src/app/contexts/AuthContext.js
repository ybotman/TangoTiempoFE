//app/contexts/AuthContext.js

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
//import { listOfAllRoles } from '@/utils/masterData';

// Create Auth Context
export const AuthContext = createContext();

//console.log('AuthContext created');

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('  ');
  const signUpOngoing = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (!signUpOngoing.current) {
          await fetchUserRoles(currentUser.uid); // Fetch user roles
        }
      } else {
        setUser(null);
        setAvailableRoles([]); // Clear roles on logout
      }
      setLoading(false);
    });
    console.warn('Force setting role to RegionalOrganizer');
    setAvailableRoles(['RegionalOrganizer']);
    setSelectedRole('RegionalOrganizer');
    return () => unsubscribe();
  }, []);

  //  useEffect(() => {
  //    updateRoleBooleans(selectedRole);
  //  }, [selectedRole]);

  const fetchUserRoles = async (firebaseUserId) => {
    try {
      //console.log('Fetching user roles for UID:', firebaseUserId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`
      );

      if (response.status === 200) {
        //console.log('Fetched roles:', response.data.roleIds);
        const roles = response.data.roleIds.map((role) => role.roleName);
        setAvailableRoles(roles);

        const initialRole = roles[0] || '';
        setSelectedRole(initialRole);
      } else {
        console.warn('Unexpected response status:', response.status);
        setAvailableRoles([]);
        setSelectedRole('');
      }
    } catch (err) {
      console.error('Failed to fetch user roles:', err);
      setError('Failed to fetch user roles');
      setAvailableRoles([]);
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
      const firebaseUserId = result.user.uid;

      try {
        console.log('Fetching user roles from backend...');
        await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`
        );
      } catch (error) {
        console.error('Error fetching user from backend:', error);
        if (error.response && error.response.status === 404) {
          console.log('User not found in backend. Creating new user...');
          const roleResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/`,
            { firebaseUserId }
          );
          if (roleResponse.status !== 204) {
            throw new Error('Failed to assign role in backend');
          }
        } else {
          throw error;
        }
      }

      signUpOngoing.current = false;
      setUser(result.user);
      await fetchUserRoles(firebaseUserId); // Fetch and set the user's roles after signup
      setLoading(false);
      return result.user;
    } catch (err) {
      console.error('Error in authenticateWithGoogle:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
      signUpOngoing.current = false;
      return null;
    }
  };

  // Login with Email and Password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout Function

  const logOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      // Optional: Reset other state variables if necessary
      setUser(null);
      setAvailableRoles([]);
      setSelectedRole('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  // Context Valu
  const value = {
    user,
    availableRoles,
    selectedRole,
    setSelectedRole,
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
