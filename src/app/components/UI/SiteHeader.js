// app/components/UI/SiteHeader.js

import React from 'react';
import Image from 'next/image';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const SiteHeader = () => {
  const { selectedLocation } = useGeoLocation();
  const runNumber = process.env.NEXT_PUBLIC_BUILD_VERSION || 'Local'; // Fallback value if not set

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
      <Image
        src="/images/TangoTiempo3.jpg"
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
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'white',
          color: 'black',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '12px',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {`City: ${selectedLocation.city?.name || 'Unknown'}`}
      </div>
    </div>
  );
};

export default SiteHeader;
