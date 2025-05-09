// @/components/Providers.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegionsProvider } from '@/contexts/RegionsContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MasteredLocationProvider } from '@/contexts/MasteredLocationContext';
import { GeoLocationProvider } from '@/contexts/GeoLocationContext';
import MasteredLocationLogger from '@/utils/MasteredLocationLogger';

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <RegionsProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RoleProvider>
            {/* 
              Restructured provider hierarchy:
              GeoLocationProvider now initializes before rendering the MasteredLocationProvider
              This ensures GeoLocationContext does not depend on MasteredLocationContext being initialized first
            */}
            <GeoLocationProvider>
              <MasteredLocationProvider>
                <MasteredLocationLogger />
                {children}
              </MasteredLocationProvider>
            </GeoLocationProvider>
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
