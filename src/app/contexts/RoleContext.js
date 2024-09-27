// app/contexts/RoleContext.js

'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '@/contexts/AuthContext';

// Create Role Context
export const RoleContext = createContext();
console.log('RoleContext created');

// RoleProvider Component
export const RoleProvider = ({ children }) => {
  const { user, selectedRole, setSelectedRole } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);

  console.log('RoleProvider rendering : selectedRole:', selectedRole);

  useEffect(() => {
    if (user && user.roles && user.roles.length > 0) {
      setRoles(user.roles);

      // If selectedRole is not set or invalid, set it to the first available role
      if (!selectedRole || !user.roles.includes(selectedRole)) {
        setSelectedRole(user.roles[0]);
      }
    } else {
      setRoles([]);
      setSelectedRole(''); // Reset selectedRole if no roles are available
    }
  }, [user, selectedRole, setSelectedRole]);

  // Function to select a role
  const selectRole = (role) => {
    if (roles.includes(role)) {
      setSelectedRole(role);
    }
  };

  return (
    <RoleContext.Provider value={{ roles, selectedRole, selectRole }}>
      {children}
    </RoleContext.Provider>
  );
};

RoleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
