// src/app/components/Providers.js

'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegionsProvider } from '@/contexts/RegionsContext';
import { RoleProvider } from '@/contexts/RoleContext';

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <RegionsProvider>
        <RoleProvider>{children}</RoleProvider>
      </RegionsProvider>
    </AuthProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;
