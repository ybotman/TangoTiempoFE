// @/components/Providers.js
'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocationAPIProvider } from '@/contexts/LocationAPIContext';
import { GeoLocationProvider, useGeoLocation } from '@/contexts/GeoLocationContext';
import { EventDiscoveryProvider } from '@/contexts/EventDiscoveryContext';
import UserLocationLoader from '@/components/UserLocationLoader';
import SeoCityLinkLoader from '@/components/SeoCityLinkLoader';
import { getCachedGeolocation } from '@/utils/trackingHelper';
import { getCountryMapLocation } from '@/utils/countryCenter';
import { initializeApiFailover, isUsingFailover } from '@/utils/apiUrlResolver';
import dynamic from 'next/dynamic';

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

// Brand theme — maroon primary from TangoTiempo brand identity
const brandTheme = createTheme({
  palette: {
    primary: {
      main: '#8B1538',
      light: '#B5476A',
      dark: '#5C0D24',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E8654A',
      light: '#FF9070',
      dark: '#B33A25',
      contrastText: '#ffffff',
    },
  },
});

// MAINTENANCE MODE - blocks entire app when true
const SHOW_EMERGENCY_ALERT = false;

// Failover indicator component - shows when using backup backend
const FailoverIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Check if using failover after a small delay to ensure sessionStorage is populated
    const checkFailover = () => {
      setShowIndicator(isUsingFailover());
    };
    checkFailover();
    // Re-check periodically in case of runtime failover switch
    const interval = setInterval(checkFailover, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!showIndicator) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: '#ff9800',
      color: 'black',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      ⚡ Failover Mode
    </div>
  );
};

const Providers = ({ children }) => {
  const [apiReady, setApiReady] = useState(false);

  // Initialize API failover on mount
  useEffect(() => {
    initializeApiFailover().then(({ url, isFailover }) => {
      if (isFailover) {
        console.warn('[Providers] App started in failover mode:', url);
      }
      setApiReady(true);
    });
  }, []);

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

  // SplashScreen in layout.js covers the apiReady delay (2s max for failover check)
  if (!apiReady) return null;

  return (
    <ThemeProvider theme={brandTheme}>
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
                <SeoCityLinkLoader />
                <UserLocationLoader />
                <MapCenterModalWrapper />
                <FailoverIndicator />
                {children}
              </EventDiscoveryProvider>
            </GeoLocationProvider>
          </LocationAPIProvider>
        </RoleProvider>
      </LocalizationProvider>
    </AuthProvider>
    </ThemeProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Providers;
