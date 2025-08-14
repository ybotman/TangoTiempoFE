// @/components/Providers.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocationAPIProvider } from '@/contexts/LocationAPIContext';
import { GeoLocationProvider, useGeoLocation } from '@/contexts/GeoLocationContext';
import { EventDiscoveryProvider } from '@/contexts/EventDiscoveryContext';
import MasteredLocationLogger from '@/utils/MasteredLocationLogger';
import LocationPromptManager from '@/components/LocationPromptManager';
import UnifiedLocationModal from '@/components/Modals/misc/UnifiedLocationModal';
import UserLocationLoader from '@/components/UserLocationLoader';

// Wrapper component to render UnifiedLocationModal with context access
const UnifiedLocationModalWrapper = () => {
  const { 
    mapCenterModalOpen, 
    closeMapCenterModal,
    setSessionLocation,
    saveAndSetLocation,
    currentLocation,
    savedLocation
  } = useGeoLocation();
  
  return (
    <UnifiedLocationModal 
      open={mapCenterModalOpen} 
      onClose={closeMapCenterModal}
      onSetLocation={setSessionLocation}
      onSaveLocation={saveAndSetLocation}
      initialLocation={currentLocation || savedLocation}
      savedLocation={savedLocation}
    />
  );
};

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RoleProvider>
          {/*
            Hierarchical provider model:
            LocationAPIProvider provides the data service layer
            GeoLocationProvider uses LocationAPIProvider for data
            MasteredLocationLogger must be inside both contexts to access data
          */}
          <LocationAPIProvider>
            <GeoLocationProvider>
              <EventDiscoveryProvider>
                <MasteredLocationLogger />
                <UserLocationLoader />
                <LocationPromptManager />
                <UnifiedLocationModalWrapper />
                {children}
              </EventDiscoveryProvider>
            </GeoLocationProvider>
          </LocationAPIProvider>
        </RoleProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;
