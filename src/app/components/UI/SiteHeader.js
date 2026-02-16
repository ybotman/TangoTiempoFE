// app/components/UI/SiteHeader.js

import React, { useContext, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import packageJson from '../../../../package.json';

const SiteHeader = () => {
  const { selectedRole } = useContext(RoleContext);
  const { currentLocation, openMapCenterModal } = useGeoLocation();
  const { fetchNearestCity } = useLocationAPI();
  useBackendHealth();
  const appVersion = `v${packageJson.version}`; // Dynamically read from package.json

  // TIEMPO-381: State for nearest city name
  const [nearestCityName, setNearestCityName] = useState(null);
  const lastFetchedCoords = useRef(null);

  // Pulse animation state - triggers on mount and location changes
  const [isPulsing, setIsPulsing] = useState(true);
  const pulseTimeoutRef = useRef(null);

  // Trigger pulse animation on mount and location changes
  useEffect(() => {
    // Start pulsing
    setIsPulsing(true);

    // Clear any existing timeout
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }

    // Stop pulsing after 5 seconds
    pulseTimeoutRef.current = setTimeout(() => {
      setIsPulsing(false);
    }, 5000);

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [currentLocation?.lat, currentLocation?.lng, currentLocation?.zoomRange]);

  // TIEMPO-381: Fetch nearest city when currentLocation changes
  useEffect(() => {
    if (!currentLocation?.lat || !currentLocation?.lng || !fetchNearestCity) {
      setNearestCityName(null);
      return;
    }

    const lat = parseFloat(currentLocation.lat);
    const lng = parseFloat(currentLocation.lng);

    // Skip if we already fetched for these coordinates
    const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (lastFetchedCoords.current === coordKey) {
      return;
    }

    const fetchCity = async () => {
      try {
        lastFetchedCoords.current = coordKey;
        const cityData = await fetchNearestCity(lat, lng, 500000); // 500km radius
        if (cityData?.cityName) {
          setNearestCityName(cityData.cityName);
        } else {
          setNearestCityName(null);
        }
      } catch {
        // If no city found, fall back to coordinates
        setNearestCityName(null);
      }
    };

    fetchCity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation?.lat, currentLocation?.lng]); // fetchNearestCity excluded - stable context function

  // TIEMPO-381: Format location display text
  const getLocationDisplay = () => {
    if (!currentLocation?.lat || !currentLocation?.lng) {
      return null;
    }
    const radius = currentLocation.zoomRange || 50;

    // Use city name if available, otherwise coordinates
    if (nearestCityName) {
      return `${nearestCityName} ± ${radius}mi`;
    }

    // Fallback to coordinates
    const lat = parseFloat(currentLocation.lat).toFixed(1);
    const lng = parseFloat(currentLocation.lng).toFixed(1);
    return `${lat}°, ${lng}° ± ${radius}mi`;
  };

  const locationDisplay = getLocationDisplay();

  // Determine which image to use based on role
  let headerImage = '/images/TangoTiempo3.jpg'; // Default image
  if (selectedRole === 'RegionalOrganizer') {
    headerImage = '/images/TangoTiempo4-RO.jpg';
  } else if (selectedRole === 'LocalAdmin' || selectedRole === 'RegionalAdmin') {
    headerImage = '/images/TangoTiempo4-RA.jpeg'; // Note: .jpeg extension
  }

  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        overflow: 'hidden' // Crop edges when zoomed
      }}>
      <Image
        src={headerImage}
        alt="Tango Tiempo"
        width={1200}
        height={600}
        style={{ 
          width: '100%', 
          height: 'auto',
          // Media query effect via CSS class
        }}
        className="site-header-image"
        priority
      />

      {/* Version in top-right */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: 'white',
          fontSize: '12px',
          opacity: '0.8',
        }}
      >
        {appVersion}
      </div>

      {/* TIEMPO-381: Location indicator pill - top-left, compact for mobile */}
      {locationDisplay && (
        <button
          onClick={openMapCenterModal}
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: isPulsing ? 'rgba(25, 118, 210, 0.9)' : 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '12px',
            border: isPulsing ? '2px solid #fff' : 'none',
            fontSize: '11px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: isPulsing ? '0 0 10px rgba(25, 118, 210, 0.8)' : '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            maxWidth: '60%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            animation: isPulsing ? 'pulse 1s ease-in-out infinite' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
          }}
          title="Click to change your location"
        >
          <span style={{ fontSize: '12px' }}>📍</span>
          <span>{locationDisplay}</span>
        </button>
      )}

      </div>
    </>
  );
};

export default SiteHeader;
