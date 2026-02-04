// app/components/UI/SiteHeader.js

import React, { useContext } from 'react';
import Image from 'next/image';
import { RoleContext } from '@/contexts/RoleContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import ServiceStatusIcon from '@/components/DevTools/ServiceStatusIcon';
import packageJson from '../../../../package.json';

const SiteHeader = () => {
  const { selectedRole } = useContext(RoleContext);
  useBackendHealth();
  const appVersion = `v${packageJson.version}`; // Dynamically read from package.json

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

      </div>
    </>
  );
};

export default SiteHeader;
