// app/components/UI/SiteHeader.js

import React, { useContext, useEffect } from 'react';
import Image from 'next/image';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { RoleContext } from '@/contexts/RoleContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';
import { useUsers } from '@/hooks/useUsers';
import MapIcon from '@mui/icons-material/Map';
import packageJson from '../../../../package.json';
// Removed userSettingsEvent - using GeoLocationContext instead

const SiteHeader = () => {
  const { selectedLocation, openMapCenterModal } = useGeoLocation();
  const { selectedRole } = useContext(RoleContext);
  const { user } = useContext(AuthContext);
  const { userData } = useUsers();
  const { organizer, fetchOrganizerById } = useOrganizers();
  const appVersion = `v${packageJson.version}`; // Dynamically read from package.json
  
  // Determine if user is in map mode or city mode
  const isMapMode = true; // FORCED TO TRUE - Always use map mode
  
  // Fetch organizer data when user is a RegionalOrganizer
  useEffect(() => {
    if (selectedRole === 'RegionalOrganizer' && user?.backendInfo?.regionalOrganizerInfo?.organizerId) {
      fetchOrganizerById(user.backendInfo.regionalOrganizerInfo.organizerId);
    }
  }, [selectedRole, user, fetchOrganizerById]);
  
  // Determine which image to use based on role
  let headerImage = '/images/TangoTiempo3.jpg'; // Default image
  if (selectedRole === 'RegionalOrganizer') {
    headerImage = '/images/TangoTiempo4-RO.jpg';
  } else if (selectedRole === 'LocalAdmin' || selectedRole === 'RegionalAdmin') {
    headerImage = '/images/TangoTiempo4-RA.jpeg'; // Note: .jpeg extension
  }

  return (
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
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: 'white',
          fontSize: '12px',
          opacity: '0.8', // Slight transparency to keep it inconspicuous
        }}
      >
        {appVersion}
      </div>
      <div
        onClick={() => openMapCenterModal()}
        title="Click to explore other locations"
        style={{
          position: 'fixed',  // Changed from absolute to fixed
          bottom: '20px',     // Increased spacing from edge
          right: '20px',      // Increased spacing from edge
          backgroundColor: 'white',
          color: 'black',
          padding: '8px',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,       // Ensure it stays above other content
          '&:hover': {
            backgroundColor: '#f0f0f0',
            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.3)',
          }
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.boxShadow = '0px 3px 8px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.2)';
        }}
      >
        {/* Just the icon */}
        <MapIcon style={{ fontSize: '20px', color: '#1976d2' }} />
      </div>
    </div>
  );
};

export default SiteHeader;
