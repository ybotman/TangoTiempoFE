// @/components/Providers.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegionsProvider } from '@/contexts/RegionsContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { MasteredLocationProvider } from '@/contexts/MasteredLocationContext';

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <RegionsProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <RoleProvider>
            <MasteredLocationProvider>{children}</MasteredLocationProvider>
          </RoleProvider>
        </LocalizationProvider>
      </RegionsProvider>
    </AuthProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;
