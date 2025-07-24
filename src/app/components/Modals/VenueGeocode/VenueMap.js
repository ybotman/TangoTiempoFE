'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <CircularProgress size={24} />
  }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { 
    ssr: false,
    loading: () => null
  }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { 
    ssr: false,
    loading: () => null
  }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { 
    ssr: false,
    loading: () => null
  }
);

// Fix for default markers in Leaflet - only run on client
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }).catch(err => {
    console.error('Failed to load leaflet:', err);
  });
}

const VenueMap = ({ latitude, longitude, venueName, address }) => {
  const [mounted, setMounted] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || mapError) {
    return (
      <Box
        sx={{
          height: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const position = [parseFloat(latitude), parseFloat(longitude)];

  try {
    return (
      <Box sx={{ height: 350, width: '100%', position: 'relative' }}>
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <Box>
                <strong>{venueName || 'New Venue'}</strong>
                <br />
                {address}
              </Box>
            </Popup>
          </Marker>
        </MapContainer>
      </Box>
    );
  } catch (err) {
    console.error('Map render error:', err);
    setMapError(true);
    return null;
  }
};

VenueMap.propTypes = {
  latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  venueName: PropTypes.string,
  address: PropTypes.string
};

export default VenueMap;