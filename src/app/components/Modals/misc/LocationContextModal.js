// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/components/Modals/misc/LocationContextModal.js
// Explanation: New file. Displays Leaflet map centered on nearestCity.
// Fetches all cities from backend (modified route) and shows circle markers.
// Current city: green, others: blue. Clicking another city calls fetchNearestCity() and closes modal.
// Uses dynamic imports for Leaflet components. Ensures PropTypes. Runs in 'use client'.

'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });

const LocationContextModal = ({ open, onClose }) => {
  const { cities, fetchCities } = useMasteredLocations();
  const { nearestCity, fetchNearestCity } = useMasteredLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      console.log('LCM uE: loadCities Start');
      if (open) {
        setLoading(true);
        // We will fetch ALL cities with no divisionId filter
        await fetchCities(undefined, true); // no divisionId => fetch all active cities
        setLoading(false);
      }
    };
    loadCities();
  }, [open, fetchCities]);

  // Log to debug when component renders
  console.log('LocationContextModal - Cities available:', cities?.length || 0);
  console.log('LocationContextModal - Current city:', nearestCity);

  const handleCityClick = async (city) => {
    if (!city.latitude || !city.longitude) return;
    await fetchNearestCity(city.latitude, city.longitude);
    onClose();
  };

  // Ensure we have a valid center
  const center =
    nearestCity && nearestCity.latitude && nearestCity.longitude
      ? [nearestCity.latitude, nearestCity.longitude]
      : [39.8283, -98.5795]; // Default fallback center (USA approx)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Nearest City</DialogTitle>
      <DialogContent style={{ height: '400px', position: 'relative' }}>
        {loading || !nearestCity ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </div>
        ) : (
          <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <ZoomControl position="bottomright" />
            {cities &&
              cities.length > 0 &&
              cities.map((city) => {
                const isCurrent = city._id === nearestCity.cityID;
                const color = isCurrent ? 'green' : 'blue';
                return (
                  <CircleMarker
                    key={city._id}
                    center={[city.latitude, city.longitude]}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                    radius={isCurrent ? 12 : 8}
                    eventHandlers={{
                      click: () => {
                        console.log('City clicked:', city.cityName);
                        if (!isCurrent) handleCityClick(city);
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent={isCurrent}>
                      {city.cityName}
                    </Tooltip>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LocationContextModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LocationContextModal;
