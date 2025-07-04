// app/components/UI/SiteHeader.js

import React, { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { RoleContext } from '@/contexts/RoleContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';
import LocationContextModal from '@/components/Modals/misc/LocationContextModal';
import packageJson from '../../../../package.json';

const SiteHeader = () => {
  const { selectedLocation } = useGeoLocation();
  const { selectedRole } = useContext(RoleContext);
  const { user } = useContext(AuthContext);
  const { organizer, fetchOrganizerById } = useOrganizers();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const appVersion = `v${packageJson.version}`; // Dynamically read from package.json
  
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
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
      <Image
        src={headerImage}
        alt="Tango Tiempo"
        width={1200}
        height={600}
        style={{ width: '100%', height: 'auto' }}
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
        onClick={() => setLocationModalOpen(true)}
        title="Click to select a different city"
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'white',
          color: 'black',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '12px',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
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
        {/* User name */}
        {user && (
          <div style={{ fontSize: '10px', marginBottom: '2px', opacity: 0.8 }}>
            {user.displayName || user.email?.split('@')[0] || 'User'}
          </div>
        )}
        
        {/* Organizer shortName if RO role */}
        {selectedRole === 'RegionalOrganizer' && organizer && (
          <div style={{ fontSize: '10px', marginBottom: '2px', opacity: 0.8 }}>
            Organizer: {organizer.shortName || 'N/A'}
          </div>
        )}
        
        {/* City label */}
        <div>
          {`City: ${selectedLocation.city?.name || 'Unknown'}`}
        </div>
      </div>
      
      {/* Location Context Modal */}
      <LocationContextModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
};

export default SiteHeader;
