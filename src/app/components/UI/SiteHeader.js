// app/components/UI/SiteHeader.js

import React, { useContext, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import ServiceStatusIcon from '@/components/DevTools/ServiceStatusIcon';
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
  }, [currentLocation?.lat, currentLocation?.lng, fetchNearestCity]);

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
      <a
        href="https://www.buymeacoffee.com/ybotman"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 255, 255, 0.7)',
          color: '#000',
          padding: '5px 10px',
          borderRadius: '3px',
          textDecoration: 'none',
          fontWeight: 'normal',
          fontSize: '12px',
        }}
      >
        Gift an Empanada
      </a>

      {/* Service Status Icon - Opens modal with service health details */}
      <ServiceStatusIcon />

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

      {/* TIEMPO-381: Location indicator in bottom-center */}
      {locationDisplay && (
        <button
          onClick={openMapCenterModal}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            padding: '6px 14px',
            borderRadius: '16px',
            border: '1px solid #ccc',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          }}
          title="Click to change your location"
        >
          <span style={{ fontSize: '14px' }}>📍</span>
          <span>{locationDisplay}</span>
          <span style={{ fontSize: '10px', color: '#666' }}>✎</span>
        </button>
      )}

      </div>
    </>
  );
};

export default SiteHeader;
