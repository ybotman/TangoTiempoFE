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
import UserLocationLoader from '@/components/UserLocationLoader';
import { getCachedGeolocation } from '@/utils/trackingHelper';
import { getCountryMapLocation } from '@/utils/countryCenter';
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

// MAINTENANCE MODE - blocks entire app when true
const SHOW_EMERGENCY_ALERT = false;

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
