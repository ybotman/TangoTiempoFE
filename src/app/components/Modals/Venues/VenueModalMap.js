'use client';

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';

const VenueModalMap = ({ venues, selectedVenueId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return; // Ensure this only runs on the client

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) {
        // Fix Leaflet's default icon path issues in Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });

        mapInstanceRef.current = L.map(mapRef.current, {
          center: [37.0902, -95.7129],
          zoom: 4,
        });

        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
          {
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
          }
        ).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Find the selected venue
      const selectedVenue = venues.find(v => v._id === selectedVenueId);
      
      if (selectedVenue && selectedVenue.latitude && selectedVenue.longitude) {
        // Center map on selected venue
        map.setView([selectedVenue.latitude, selectedVenue.longitude], 16);
        
        // Add marker for selected venue with a different color/style
        const selectedIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        L.marker([selectedVenue.latitude, selectedVenue.longitude], { icon: selectedIcon })
          .addTo(map)
          .bindPopup(`<strong>${selectedVenue.name}</strong><br/>${selectedVenue.address1}<br/>${selectedVenue.city}, ${selectedVenue.state} ${selectedVenue.zip}`)
          .openPopup();
      } else {
        // If no venue is selected, show all venues
        venues.forEach((v) => {
          if (v.latitude && v.longitude) {
            const isSelected = v._id === selectedVenueId;
            const marker = L.marker([v.latitude, v.longitude]);
            
            if (isSelected) {
              marker.bindPopup(`<strong>${v.name}</strong><br/>${v.address1}<br/>${v.city}, ${v.state} ${v.zip}`).openPopup();
            } else {
              marker.bindPopup(`${v.name}`);
            }
            
            marker.addTo(map);
          }
        });
        
        // Fit map to show all venue markers
        if (venues.length > 0) {
          const bounds = L.latLngBounds(
            venues
              .filter(v => v.latitude && v.longitude)
              .map(v => [v.latitude, v.longitude])
          );
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      }
    }).catch((error) => {
      console.error('Error loading Leaflet:', error);
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venues, selectedVenueId]);

  const selectedVenue = venues.find(v => v._id === selectedVenueId);

  return (
    <Box sx={{ mt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Venue Location
      </Typography>
      {selectedVenue && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedVenue.name} - {selectedVenue.city}, {selectedVenue.state}
        </Typography>
      )}
      <Box ref={mapRef} sx={{ flexGrow: 1, minHeight: 400 }} />
    </Box>
  );
};

VenueModalMap.propTypes = {
  venues: PropTypes.array.isRequired,
  selectedVenueId: PropTypes.string,
};

export default VenueModalMap;
