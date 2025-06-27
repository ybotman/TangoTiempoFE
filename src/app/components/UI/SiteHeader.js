// app/components/UI/SiteHeader.js

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { RoleContext } from '@/contexts/RoleContext';
import LocationContextModal from '@/components/Modals/misc/LocationContextModal';

const SiteHeader = () => {
  const { selectedLocation } = useGeoLocation();
  const { selectedRole } = useContext(RoleContext);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const runNumber = process.env.NEXT_PUBLIC_BUILD_VERSION || 'Local'; // Fallback value if not set
  
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
          width: '100%',
          textAlign: 'center',
          color: 'white',
          fontSize: '12px',
          opacity: '0.8', // Slight transparency to keep it inconspicuous
        }}
      >
        {runNumber}
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
        {`City: ${selectedLocation.city?.name || 'Unknown'}`}
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
