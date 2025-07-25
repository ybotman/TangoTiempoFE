// @/components/Providers.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MasteredLocationProvider } from '@/contexts/MasteredLocationContext';
import { GeoLocationProvider } from '@/contexts/GeoLocationContext';
import { EventDiscoveryProvider } from '@/contexts/EventDiscoveryContext';
import MasteredLocationLogger from '@/utils/MasteredLocationLogger';
import LocationPromptManager from '@/components/LocationPromptManager';

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RoleProvider>
          {/*
            Hierarchical provider model:
            MasteredLocationProvider provides the data service layer
            GeoLocationProvider uses MasteredLocationProvider for data
            MasteredLocationLogger must be inside both contexts to access data
          */}
          <MasteredLocationProvider>
            <GeoLocationProvider>
              <EventDiscoveryProvider>
                <MasteredLocationLogger />
                <LocationPromptManager />
                {children}
              </EventDiscoveryProvider>
            </GeoLocationProvider>
          </MasteredLocationProvider>
        </RoleProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;
