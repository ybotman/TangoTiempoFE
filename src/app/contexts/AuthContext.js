// src/app/contexts/AuthContext.js

'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import axios from 'axios';

// Create Auth Context
export const AuthContext = createContext();

console.log('AuthContext created');

// AuthProvider Component
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [availableRoles, setavailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRegionalOrganizer, setIsRegionalOrganizer] = useState(false);
  const [isRegionalAdmin, setIsRegionalAdmin] = useState(false);
  const [isSystemOwner, setIsSystemOwner] = useState(false);
  const [isNamedUser, setIsNamedUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const signUpOngoing = useRef(false);

  console.log('AuthProvider rendering', user, isAnonymous, isRegionalOrganizer, isRegionalAdmin, isSystemOwner, isNamedUser);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (!signUpOngoing.current) {
          await fetchUserRoles(currentUser.uid); // Fetch user roles
        }
      } else {
        setUser(null);
        setavailableRoles([]); // Clear roles on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    updateRoleBooleans(selectedRole);
  }, [selectedRole]);

  const fetchUserRoles = async (firebaseUserId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`
      );

      if (response.status === 200) {
        const roles = response.data.roleIds.map((role) => role.roleName);
        setavailableRoles(roles); // Set available roles

        const initialRole = roles[0] || ""; // Set the first role as selectedRole by default
        setSelectedRole(initialRole);
      } else {
        setavailableRoles([]);
      }
    } catch (err) {
      setError("Failed to fetch user roles");
      setavailableRoles([]);
    }
  };

  // Update boolean values based on selected role
  const updateRoleBooleans = (roleName) => {
    setIsNamedUser(roleName === "NamedUser");
    setIsRegionalOrganizer(roleName === "RegionalOrganizer");
    setIsRegionalAdmin(roleName === "RegionalAdmin");
    setIsSystemOwner(roleName === "SystemOwner");
    setIsAnonymous(roleName === "Anonymous");
  };

  // Authenticate with Google
  const authenticateWithGoogle = async () => {
    if (user) {
      setError("You are already signed in.");
      return null;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      signUpOngoing.current = true;
      const result = await signInWithPopup(auth, provider);
      const firebaseUserId = result.user.uid;

      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${firebaseUserId}`
        );
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If user not found, create the user in the backend
          const roleResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/`,
            { firebaseUserId }
          );
          if (roleResponse.status !== 204) {
            throw new Error("Failed to assign role in backend");
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
      setError(err.message);
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
  const logout = () => {
    return signOut(auth);
  };

  // Context Value
  const value = {
    user,
    availableRoles,
    selectedRole,
    setSelectedRole,
    isAnonymous,
    isRegionalOrganizer,
    isRegionalAdmin,
    isSystemOwner,
    isNamedUser,
    loading,
    error,
    logout,
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