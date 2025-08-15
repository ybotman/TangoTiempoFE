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
  // Removed scale text - not needed
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Initialize map - with retry logic for ref attachment
  useEffect(() => {
    console.log('[UnifiedLocationModal] useEffect triggered:', {
      open,
      mapInitialized,
      hasMapRef: !!mapRef.current,
      mapRefDimensions: mapRef.current ? {
        offsetWidth: mapRef.current.offsetWidth,
        offsetHeight: mapRef.current.offsetHeight
      } : null
    });
    
    if (!open) {
      console.log('[UnifiedLocationModal] Modal not open, skipping init');
      return;
    }
    if (mapInitialized) {
      console.log('[UnifiedLocationModal] Map already initialized, skipping');
      return;
    }
    
    // Retry logic for waiting for ref to attach
    let retryCount = 0;
    const maxRetries = 10;
    
    const checkAndInit = () => {
      retryCount++;
      console.log(`[UnifiedLocationModal] Checking for map ref (attempt ${retryCount}/${maxRetries})`);
      
      if (mapRef.current) {
        console.log('[UnifiedLocationModal] Map ref found, proceeding with initialization');
        initializeMap();
      } else if (retryCount < maxRetries) {
        console.log('[UnifiedLocationModal] No map ref yet, retrying in 100ms...');
        setTimeout(checkAndInit, 100);
      } else {
        console.error('[UnifiedLocationModal] Failed to get map ref after max retries');
        setMessage({ type: 'error', text: 'Failed to initialize map container' });
      }
    };
    
    const initializeMap = async () => {
      try {
        console.log('[UnifiedLocationModal] Starting map initialization...');
        console.log('[UnifiedLocationModal] Mapbox token exists:', !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
        console.log('[UnifiedLocationModal] Token preview:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.substring(0, 10) + '...');
        
        // Dynamic import L to avoid SSR issues
        const L = (await import('leaflet')).default;
        console.log('[UnifiedLocationModal] Leaflet imported successfully');
        
        // Fix Leaflet's default icon path issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });
        
        // Initialize map
        const initialLat = centerLat ? parseFloat(centerLat) : 40.7128;
        const initialLng = centerLng ? parseFloat(centerLng) : -74.0060;
        
        console.log('[UnifiedLocationModal] Creating map with center:', initialLat, initialLng);
        console.log('[UnifiedLocationModal] Map container dimensions:', {
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight
        });
        
        const map = L.map(mapRef.current, {
          center: [initialLat, initialLng],
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: true // Use default position for now
        });
        
        console.log('[UnifiedLocationModal] Map instance created');
        
        // Add tile layer
        const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
        console.log('[UnifiedLocationModal] Tile URL:', tileUrl.substring(0, 100) + '...');
        
        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 18,
          tileSize: 512,
          zoomOffset: -1,
          attribution: '© Mapbox © OpenStreetMap'
        });
        
        tileLayer.on('loading', () => {
          console.log('[UnifiedLocationModal] Tiles loading...');
        });
        
        tileLayer.on('load', () => {
          console.log('[UnifiedLocationModal] Tiles loaded successfully');
        });
        
        tileLayer.on('tileerror', (error) => {
          console.error('[UnifiedLocationModal] Tile error:', error);
        });
        
        tileLayer.addTo(map);
        console.log('[UnifiedLocationModal] Tile layer added to map');
      
      // Handle map click
      map.on('click', (e) => {
        console.log('[UnifiedLocationModal] Map clicked at:', e.latlng);
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        setCenterLat(lat.toFixed(6));
        setCenterLng(lng.toFixed(6));
      });
      
      // Force map to recalculate size after a delay
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      
        mapInstanceRef.current = map;
        console.log('[UnifiedLocationModal] Setting mapInitialized to true');
        setMapInitialized(true);
        
        // Force resize after initialization
        setTimeout(() => {
          if (mapInstanceRef.current) {
            console.log('[UnifiedLocationModal] Invalidating map size after 300ms');
            mapInstanceRef.current.invalidateSize();
          }
        }, 300);
        
        console.log('[UnifiedLocationModal] Map initialization complete');
        
      } catch (error) {
        console.error('[UnifiedLocationModal] Error initializing map:', error);
        console.error('[UnifiedLocationModal] Error stack:', error.stack);
        setMessage({ type: 'error', text: 'Failed to initialize map: ' + error.message });
      }
    };
    
    // Start the check and init process
    console.log('[UnifiedLocationModal] Starting ref check process...');
    checkAndInit();
    
    return () => {
      console.log('[UnifiedLocationModal] Cleanup function called');
      if (mapInstanceRef.current) {
        console.log('[UnifiedLocationModal] Removing map instance');
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.error('[UnifiedLocationModal] Error removing map:', e);
        }
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, [open]);
  
  // Force map resize when modal fully opens
  useEffect(() => {
    console.log('[UnifiedLocationModal] Resize useEffect:', { open, hasMapInstance: !!mapInstanceRef.current });
    if (open && mapInstanceRef.current) {
      // Give modal time to render
      const timer = setTimeout(() => {
        console.log('[UnifiedLocationModal] Invalidating size from resize useEffect');
        mapInstanceRef.current.invalidateSize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  const updateMarker = async (lat, lng) => {
    if (!mapInstanceRef.current) return;
    
    // Dynamic import L to avoid SSR issues
    const L = (await import('leaflet')).default;
    
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
        
        {/* Action Buttons - Always in one row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1.5, 
          mb: 2,
          justifyContent: 'center'
        }}>
          <Button
            variant="contained"
            onClick={handleSetTemp}
            disabled={loading || !centerLat || !centerLng}
            startIcon={<MyLocationIcon sx={{ fontSize: 18 }} />}
            size="small"
            sx={{ 
              px: 2,
              py: 0.75,
              fontSize: '0.875rem',
              fontWeight: 500,
              minWidth: '110px'
            }}
          >
            Set Temp
          </Button>
          
          <Tooltip 
            title={!user ? "Login to save permanently" : "Save as your default location"}
            arrow
          >
            <span>
              <Button
                variant={user ? "outlined" : "contained"}
                onClick={handleSavePerm}
                disabled={!user || loading || !centerLat || !centerLng}
                startIcon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                size="small"
                sx={{ 
                  px: 2,
                  py: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  minWidth: '110px',
                  opacity: !user ? 0.5 : 1
                }}
              >
                Save Default
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
        
        {/* Map Container */}
        {console.log('[UnifiedLocationModal] Rendering map container, mapInitialized:', mapInitialized)}
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