'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
  Slider,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { AuthContext } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamic import for avoiding SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);

const UnifiedLocationModal = ({ 
  open, 
  onClose, 
  onSetLocation,
  onSaveLocation,
  initialLocation = { lat: 40.7128, lng: -74.0060, zoomRange: 50 },
  savedLocation = null
}) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  
  const [mapInitialized, setMapInitialized] = useState(false);
  const [centerLat, setCenterLat] = useState(initialLocation.lat || '');
  const [centerLng, setCenterLng] = useState(initialLocation.lng || '');
  const [zoomRange, setZoomRange] = useState(initialLocation.zoomRange || 50);
  const [scaleText, setScaleText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Initialize map
  useEffect(() => {
    if (!open || mapInitialized || !mapRef.current) return;
    
    const initializeMap = async () => {
      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: '<div style="background-color: #1976d2; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      // Initialize map
      const map = L.map(mapRef.current, {
        center: [centerLat || 40.7128, centerLng || -74.0060],
        zoom: 5,
        scrollWheelZoom: true,
        zoomControl: false // We'll add custom position
      });
      
      // Add tile layer
      L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`, {
        attribution: 'Map data &copy; OpenStreetMap contributors',
        tileSize: 512,
        zoomOffset: -1
      }).addTo(map);
      
      // Add zoom control in bottom-right for mobile, top-left for desktop
      L.control.zoom({
        position: isMobile ? 'bottomright' : 'topleft'
      }).addTo(map);
      
      // Add scale control at top
      L.control.scale({
        position: 'topright',
        imperial: true,
        metric: false
      }).addTo(map);
      
      // Custom CSS for larger mobile controls
      if (isMobile) {
        const style = document.createElement('style');
        style.textContent = `
          .leaflet-control-zoom a {
            width: 44px !important;
            height: 44px !important;
            line-height: 44px !important;
            font-size: 22px !important;
          }
          .leaflet-control-scale {
            font-size: 12px !important;
            border: 2px solid rgba(0,0,0,0.4) !important;
            background: rgba(255,255,255,0.9) !important;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        setCenterLat(lat.toFixed(6));
        setCenterLng(lng.toFixed(6));
      });
      
      // Update scale on zoom
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        const scale = Math.round(591657550.5 / Math.pow(2, zoom));
        setScaleText(`Scale: 1:${scale.toLocaleString()}`);
      });
      
      mapInstanceRef.current = map;
      setMapInitialized(true);
      
      // Set initial scale
      const zoom = map.getZoom();
      const scale = Math.round(591657550.5 / Math.pow(2, zoom));
      setScaleText(`Scale: 1:${scale.toLocaleString()}`);
    };
    
    initializeMap();
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, [open, isMobile]);
  
  const updateMarker = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.remove();
    }
    if (circleRef.current) {
      circleRef.current.remove();
    }
    
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-location-marker',
      html: '<div style="background-color: #1976d2; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
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
  };
  
  // Update circle when zoom range changes
  useEffect(() => {
    if (circleRef.current && centerLat && centerLng) {
      circleRef.current.setRadius(zoomRange * 1609.34);
    }
  }, [zoomRange]);
  
  // Update marker when location is set
  useEffect(() => {
    if (mapInitialized && centerLat && centerLng) {
      updateMarker(parseFloat(centerLat), parseFloat(centerLng));
    }
  }, [mapInitialized, centerLat, centerLng]);
  
  const handleSetTemp = () => {
    if (!centerLat || !centerLng) {
      setMessage({ type: 'error', text: 'Please click on the map to set a location' });
      return;
    }
    
    setLoading(true);
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };
    
    onSetLocation(locationData);
    setMessage({ type: 'success', text: 'Location set for this session!' });
    setLoading(false);
    
    setTimeout(() => {
      onClose();
    }, 500);
  };
  
  const handleSavePerm = async () => {
    if (!centerLat || !centerLng) {
      setMessage({ type: 'error', text: 'Please click on the map to set a location' });
      return;
    }
    
    setLoading(true);
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };
    
    try {
      await onSaveLocation(locationData);
      setMessage({ type: 'success', text: 'Location saved as default!' });
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save location' });
    }
    setLoading(false);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: isMobile ? '95vh' : '90vh',
          maxHeight: '900px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6">Map Center Settings</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click anywhere on the map to set your center point
        </Typography>
        
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 2 }} 
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button
            variant="contained"
            onClick={handleSetTemp}
            disabled={loading || !centerLat || !centerLng}
            startIcon={<MyLocationIcon />}
            sx={{ flex: 1 }}
          >
            SET (Temporary)
          </Button>
          
          <Tooltip 
            title={!user ? "Login to save permanently" : "Save as your default location"}
            arrow
          >
            <span style={{ flex: 1 }}>
              <Button
                variant={user ? "outlined" : "contained"}
                onClick={handleSavePerm}
                disabled={!user || loading || !centerLat || !centerLng}
                startIcon={<LocationOnIcon />}
                sx={{ 
                  width: '100%',
                  opacity: !user ? 0.5 : 1
                }}
              >
                SAVE (Permanent)
              </Button>
            </span>
          </Tooltip>
        </Box>
        
        {/* Zoom Range Slider */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Search Range: {zoomRange} miles
          </Typography>
          <Slider
            value={zoomRange}
            onChange={(e, newValue) => setZoomRange(newValue)}
            min={5}
            max={200}
            step={5}
            marks={[
              { value: 5, label: '5mi' },
              { value: 50, label: '50mi' },
              { value: 100, label: '100mi' },
              { value: 200, label: '200mi' }
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
        
        {/* Scale Indicator */}
        <Box sx={{ 
          mb: 1,
          p: 1,
          bgcolor: 'grey.100',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {scaleText || 'Scale: Calculating...'}
          </Typography>
        </Box>
        
        {/* Map Container */}
        <Box
          ref={mapRef}
          sx={{
            width: '100%',
            height: isMobile ? '350px' : '400px',
            borderRadius: 1,
            border: '2px solid',
            borderColor: 'primary.main',
            cursor: 'crosshair',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            '& .leaflet-container': {
              height: '100% !important',
              width: '100% !important',
            }
          }}
        >
          {!mapInitialized && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%'
            }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
        
        {/* Coordinates Display */}
        {centerLat && centerLng && (
          <Box sx={{ 
            mt: 2, 
            p: 1, 
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
            <Typography variant="caption" color="text.secondary">
              Selected Location: {parseFloat(centerLat).toFixed(4)}°, {parseFloat(centerLng).toFixed(4)}°
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedLocationModal;