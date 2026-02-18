// @/components/Providers.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocationAPIProvider } from '@/contexts/LocationAPIContext';
import { GeoLocationProvider, useGeoLocation } from '@/contexts/GeoLocationContext';
import { EventDiscoveryProvider } from '@/contexts/EventDiscoveryContext';
import UserLocationLoader from '@/components/UserLocationLoader';
import { getCachedGeolocation } from '@/utils/trackingHelper';
import { getCountryMapLocation } from '@/utils/countryCenter';
import dynamic from 'next/dynamic';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

// Dynamic import to avoid SSR issues with Leaflet
const MapCenterModal = dynamic(
  () => import('@/components/Modals/misc/MapCenterModal'),
  { ssr: false }
);

// Wrapper component to render MapCenterModal with context access
const MapCenterModalWrapper = () => {
  const {
    mapCenterModalOpen,
    closeMapCenterModal,
    setSessionLocation,
    saveToCloudDefault,
    currentLocation,
    savedLocation
  } = useGeoLocation();

  // Smart fallback chain for initial location:
  // 1. currentLocation (user's explicit selection)
  // 2. savedLocation (user's saved preference)
  // 3. Google geolocation (from tracking cache - best accuracy)
  // 4. Cloudflare country center (country-level fallback)
  // 5. null (no default - let modal handle it)
  const getInitialLocation = () => {
    // Priority 1 & 2: User selections
    if (currentLocation) return currentLocation;
    if (savedLocation) return savedLocation;

    // Priority 3 & 4: Cached geolocation data
    const cachedGeo = getCachedGeolocation();

    // Try Google geolocation (most accurate)
    if (cachedGeo?.google?.latitude && cachedGeo?.google?.longitude) {
      return {
        lat: cachedGeo.google.latitude,
        lng: cachedGeo.google.longitude,
        zoomRange: 50
      };
    }

    // Fallback to Cloudflare country center
    if (cachedGeo?.cloudflare?.country) {
      const countryLocation = getCountryMapLocation(cachedGeo.cloudflare.country);
      if (countryLocation) {
        return countryLocation;
      }
    }

    // No fallback - modal will handle null location
    return null;
  };

  return (
    <MapCenterModal
      open={mapCenterModalOpen}
      onClose={closeMapCenterModal}
      onSetLocation={setSessionLocation}
      onSaveLocation={saveToCloudDefault}
      initialLocation={getInitialLocation()}
      savedLocation={savedLocation}
    />
  );
};

// Emergency Alert Component - set SHOW_EMERGENCY_ALERT to false to disable
const SHOW_EMERGENCY_ALERT = true;

const EmergencyAlertModal = () => {
  const [showAlert, setShowAlert] = useState(SHOW_EMERGENCY_ALERT);

  if (!showAlert) return null;

  return (
    <Dialog
      open={showAlert}
      onClose={() => setShowAlert(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          border: '2px solid #1976d2'
        }
      }}
    >
      <DialogTitle style={{
        backgroundColor: '#f57c00',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>🔧</span>
        Site Being Fixed
      </DialogTitle>
      <DialogContent style={{ paddingTop: '20px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '16px' }}>
          Thank you for your patience.
        </p>
        <p style={{ fontSize: '16px', color: '#388e3c', fontWeight: 500 }}>
          All data will be back very soon.
        </p>
      </DialogContent>
      <DialogActions style={{ padding: '16px', justifyContent: 'center' }}>
        <Button
          onClick={() => setShowAlert(false)}
          variant="contained"
          color="primary"
          size="large"
          style={{ minWidth: '120px' }}
        >
          Got It
        </Button>
      </DialogActions>
    </Dialog>
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
          */}
          <LocationAPIProvider>
            <GeoLocationProvider>
              <EventDiscoveryProvider>
                <EmergencyAlertModal />
                <UserLocationLoader />
                <MapCenterModalWrapper />
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
