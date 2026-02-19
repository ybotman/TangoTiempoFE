// app/contexts/RoleContext.js
'use client';

import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '@/contexts/AuthContext';

// Elevated roles that should see the recovery alert when switching FROM NamedUser/Anonymous
const ELEVATED_ROLES = ['RegionalOrganizer', 'RegionalAdmin', 'SystemAdmin', 'SystemOwner'];
const BASE_ROLES = ['NamedUser', 'Anonymous', ''];

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user, selectedRole, setSelectedRole } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);

  // Track previous role for detecting role elevation
  const previousRoleRef = useRef(null);

  // State for showing the role elevation alert (recovery message)
  const [showRoleElevationAlert, setShowRoleElevationAlert] = useState(false);

  useEffect(() => {
    if (user && user.roles && user.roles.length > 0) {
      setRoles(user.roles);

      if (!selectedRole || !user.roles.includes(selectedRole)) {
        setSelectedRole(user.roles[0]);
      }
    } else {
      setRoles([]);
      setSelectedRole('');
    }
  }, [user, selectedRole, setSelectedRole]);

  // Detect role elevation: switching FROM NamedUser/Anonymous TO elevated role
  useEffect(() => {
    const previousRole = previousRoleRef.current;

    // Check if this is a role elevation (from base to elevated)
    const wasBaseRole = BASE_ROLES.includes(previousRole);
    const isNowElevated = ELEVATED_ROLES.includes(selectedRole);

    if (wasBaseRole && isNowElevated && previousRole !== null) {
      // User elevated their role - show the recovery alert
      setShowRoleElevationAlert(true);
    }

    // Update the previous role ref
    previousRoleRef.current = selectedRole;
  }, [selectedRole]);

  const selectRole = (role) => {
    if (roles.includes(role)) {
      setSelectedRole(role);
    }
  };

  // Function to dismiss the role elevation alert
  const dismissRoleElevationAlert = () => {
    setShowRoleElevationAlert(false);
  };

  return (
    <RoleContext.Provider value={{
      roles,
      selectedRole,
      selectRole,
      showRoleElevationAlert,
      dismissRoleElevationAlert
    }}>
      {children}
    </RoleContext.Provider>
  );
};

RoleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
