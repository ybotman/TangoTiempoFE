/**
 * MapCenterModal - For setting temporary location for current session
 * 
 * This modal allows users (logged-in or not) to set a temporary location
 * for filtering events in the current session. It doesn't save to backend.
 * 
 * For permanent saved locations, logged-in users should use:
 * User Settings > Location Preferences
 * 
 * Data flow:
 * 1. Loads currentLocation or savedLocation as initial values
 * 2. Saves to sessionStorage via setSessionLocation (temporary)
 * 3. Does NOT save to backend
 */
'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Slider,
  Button,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import 'leaflet/dist/leaflet.css';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';

const MapCenterModal = ({ open, onClose }) => {
  const { user } = useContext(AuthContext);
  const { setSessionLocation, currentLocation, savedLocation } = useGeoLocation();
  
  // Map references
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  
  // State for temporary location - start with saved preferences or temporary location
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [zoomRange, setZoomRange] = useState(50);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [message, setMessage] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  
  // Load initial location when modal opens
  useEffect(() => {
    if (open) {
      // First priority: current location
      if (currentLocation?.lat) {
        setCenterLat(currentLocation.lat?.toString() || '');
        setCenterLng(currentLocation.lng?.toString() || '');
        setZoomRange(currentLocation.zoomRange || 50);
      }
      // Second priority: saved location (for logged-in users)
      else if (user && savedLocation?.lat) {
        setCenterLat(savedLocation.lat?.toString() || '');
        setCenterLng(savedLocation.lng?.toString() || '');
        setZoomRange(savedLocation.zoomRange || 50);
      }
    }
  }, [open, currentLocation, savedLocation, user]);
  
  // Initialize map when modal opens and is visible
  useEffect(() => {
    if (!open) {
      // Clean up when modal closes
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
      return;
    }

    // Wait for modal to be fully open and rendered
    const initTimer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

// TIEMPO-276: Security cleanup - removed logging
      setMapLoading(true);
      
      import('leaflet').then((L) => {
        // Double-check refs
        if (!mapRef.current || mapInstanceRef.current) {
// TIEMPO-276: Security cleanup - removed logging
          return;
        }
        
        // Fix Leaflet's default icon path issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });

        // Initialize with saved location or US center
        const initialLat = centerLat ? parseFloat(centerLat) : 39.8283;
        const initialLng = centerLng ? parseFloat(centerLng) : -98.5795;
        const initialZoom = 4;
        
// TIEMPO-276: Security cleanup - removed logging
        
        try {
          mapInstanceRef.current = L.map(mapRef.current, {
            center: [initialLat, initialLng],
            zoom: initialZoom,
            scrollWheelZoom: true,
            zoomControl: true,
          });
          
// TIEMPO-276: Security cleanup - removed logging
          
          // Add tile layer
          L.tileLayer(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
            {
              maxZoom: 18,
              tileSize: 512,
              zoomOffset: -1,
              attribution: '© Mapbox © OpenStreetMap'
            }
          ).addTo(mapInstanceRef.current);

          // Force invalidate size after a moment
          setTimeout(() => {
            if (mapInstanceRef.current) {
// TIEMPO-276: Security cleanup - removed logging
              mapInstanceRef.current.invalidateSize();
            }
          }, 300);

          // Add click handler
          mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setCenterLat(lat.toString());
            setCenterLng(lng.toString());
            updateMarker(lat, lng);
          });

          // If we have coordinates, add marker
          if (centerLat && centerLng && isValidLatLng()) {
            updateMarker(parseFloat(centerLat), parseFloat(centerLng));
          }

          setMapInitialized(true);
          setMapLoading(false);
        } catch (error) {
          console.error('Error creating map:', error);
          setMapLoading(false);
        }
      }).catch(error => {
        console.error('Error loading Leaflet:', error);
        setMapLoading(false);
      });
    }, 500); // Longer delay to ensure modal transition completes
    
    return () => clearTimeout(initTimer);
  }, [open]); // Only depend on open state
  
  // Helper to update marker and circle
  const updateMarker = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    
    import('leaflet').then((L) => {
      // Remove existing marker and circle
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
      if (circleRef.current) {
        mapInstanceRef.current.removeLayer(circleRef.current);
      }

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          background: #1976d2;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Add new marker
      markerRef.current = L.marker([lat, lng], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      // Add circle
      circleRef.current = L.circle([lat, lng], {
        radius: zoomRange * 1609.34,
        fillColor: '#1976d2',
        fillOpacity: 0.1,
        color: '#1976d2',
        weight: 2,
        dashArray: '5, 5'
      }).addTo(mapInstanceRef.current);
      
      // Center map
      let targetZoom;
      if (zoomRange <= 10) targetZoom = 10;
      else if (zoomRange <= 25) targetZoom = 9;
      else if (zoomRange <= 50) targetZoom = 8;
      else if (zoomRange <= 100) targetZoom = 7;
      else if (zoomRange <= 150) targetZoom = 6;
      else targetZoom = 5;
      
      mapInstanceRef.current.setView([lat, lng], targetZoom, { animate: true });
    });
  };
  
  // Update circle when zoom range changes
  useEffect(() => {
    if (circleRef.current && centerLat && centerLng) {
      circleRef.current.setRadius(zoomRange * 1609.34);
    }
  }, [zoomRange]);
  
  // Update marker when coordinates are loaded
  useEffect(() => {
    if (mapInitialized && centerLat && centerLng && isValidLatLng()) {
      updateMarker(parseFloat(centerLat), parseFloat(centerLng));
    }
  }, [mapInitialized, centerLat, centerLng]);
  
  const handleSet = () => {
    if (!centerLat || !centerLng) {
      setMessage({ type: 'error', text: 'Please click on the map to set a location' });
      return;
    }
    
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };

    // Set location for current session
    setSessionLocation(locationData);
    
    setMessage({ type: 'success', text: 'Location set for this session!' });
    
    // Close modal after short delay
    setTimeout(() => {
      onClose();
    }, 500);
  };
  
  const isValidLatLng = () => {
    const lat = parseFloat(centerLat);
    const lng = parseFloat(centerLng);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          maxHeight: '900px'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MyLocationIcon color="primary" />
          <Typography variant="h6">Set Location</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {user ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Welcome {user.displayName || user.email}!
            </Typography>
            <Typography variant="body2">
              This location will be used for this session only.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              To save as your default location, go to <strong>User Settings → Location Preferences</strong>
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              This location will be saved for this session only.
            </Typography>
            <Typography variant="body2">
              <strong>Want to save permanently?</strong> Please log in to save your location preferences.
            </Typography>
          </Alert>
        )}
        
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Click anywhere on the map to set your center point
        </Typography>
        
        <Box
          ref={mapRef}
          sx={{
            width: '100%',
            height: '400px',
            minHeight: '400px',
            borderRadius: 1,
            border: '2px solid',
            borderColor: 'primary.main',
            cursor: 'crosshair',
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            '& .leaflet-container': {
              height: '100% !important',
              width: '100% !important',
              position: 'relative !important',
            }
          }}
        >
          {mapLoading && (
            <Box sx={{ position: 'absolute', zIndex: 1000 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>Loading map...</Typography>
            </Box>
          )}
        </Box>
        
        {centerLat && centerLng && isValidLatLng() && (
          <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 2 }}>
            📍 Center: {parseFloat(centerLat).toFixed(5)}, {parseFloat(centerLng).toFixed(5)} • {zoomRange} mile radius
          </Typography>
        )}
        
        <Box sx={{ px: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Event Search Radius: {zoomRange} miles
          </Typography>
          <Slider
            value={zoomRange}
            onChange={(e, newValue) => setZoomRange(newValue)}
            min={1}
            max={250}
            marks={[
              { value: 10, label: '10mi' },
              { value: 50, label: '50mi' },
              { value: 100, label: '100mi' },
              { value: 250, label: '250mi' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSet}
          disabled={!isValidLatLng()}
        >
          Set Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MapCenterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MapCenterModal;