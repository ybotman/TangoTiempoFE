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

// MAINTENANCE MODE - blocks entire app when true
const SHOW_EMERGENCY_ALERT = false;

// DATA RECOVERY ALERT - shows dismissible modal when true
const SHOW_DATA_RECOVERY_ALERT = true;

const DataRecoveryAlertModal = () => {
  const [showAlert, setShowAlert] = useState(SHOW_DATA_RECOVERY_ALERT);

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
          border: '2px solid #4caf50'
        }
      }}
    >
      <DialogTitle style={{
        backgroundColor: '#4caf50',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>✅</span>
        We Are Back!
      </DialogTitle>
      <DialogContent style={{ paddingTop: '20px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '16px' }}>
          All the data is retrieved from the backups. The bug is gone.
        </p>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '16px' }}>
          <strong>BostonTangoCalendar</strong> and <strong>TangoTiempo</strong> are up and running! 💃🕺
        </p>
        <p style={{ fontSize: '16px', color: '#388e3c', fontWeight: 500 }}>
          Thank you for your patience. Ping Toby with any questions.
        </p>
      </DialogContent>
      <DialogActions style={{ padding: '16px', justifyContent: 'center' }}>
        <Button
          onClick={() => setShowAlert(false)}
          variant="contained"
          style={{ minWidth: '120px', backgroundColor: '#4caf50' }}
          size="large"
        >
          Got It!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Providers = ({ children }) => {
  // MAINTENANCE MODE: Block entire app, no API calls
  if (SHOW_EMERGENCY_ALERT) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔧💃</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#f57c00' }}>
          Site Being Repaired
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '12px', maxWidth: '400px' }}>
          Thank you for your patience!
        </p>
        <p style={{ fontSize: '1.1rem', color: '#4caf50' }}>
          All your tango will be back soon!
        </p>
      </div>
    );
  }

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
                <DataRecoveryAlertModal />
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
