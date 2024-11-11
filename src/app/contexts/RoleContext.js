// app/contexts/RoleContext.js
'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '@/contexts/AuthContext';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user, selectedRole, setSelectedRole } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);

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
