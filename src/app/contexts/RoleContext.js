//app/contexts/RoleContext.js

"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '@/contexts/AuthContext';

export const RoleContext = createContext();
console.log('RoleContext created');


export const RoleProvider = ({ children }) => {
  const { availableRoles, selectedRole, setSelectedRole } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
console.log('RoleProvider rendering : selectedRole:', selectedRole);
  useEffect(() => {
    if (availableRoles && availableRoles.length > 0) {
      setRoles(availableRoles);
      // Optionally set a default role
      // setSelectedRole(availableRoles[0].roleName);
    }
  }, [availableRoles]);

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