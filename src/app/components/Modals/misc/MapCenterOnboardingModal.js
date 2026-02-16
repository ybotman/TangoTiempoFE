'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  Typography,
  Alert,
  Slider,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { AuthContext } from '@/contexts/AuthContext';
import 'leaflet/dist/leaflet.css';

/**
 * MapCenterOnboardingModal - Blocking modal for new users without mapCenter
 *
 * TIEMPO-381: Forces user to set their location before accessing the calendar.
 * Cannot be dismissed - user must save a location to continue.
 */
const MapCenterOnboardingModal = ({
  open,
  onSaveLocation,
}) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [mapInitialized, setMapInitialized] = useState(false);
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [zoomRange, setZoomRange] = useState(50);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!open || mapInitialized) return;

    let retryCount = 0;
    const maxRetries = 10;

    const checkAndInit = () => {
      retryCount++;

      if (mapRef.current) {
        initializeMap();
      } else if (retryCount < maxRetries) {
        setTimeout(checkAndInit, 100);
      } else {
        setMessage({ type: 'error', text: 'Failed to initialize map' });
      }
    };

    const initializeMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });

        // Start with world view centered on US
        const map = L.map(mapRef.current, {
          center: [39.8, -98.5],
          zoom: 4,
          scrollWheelZoom: true,
          zoomControl: true
        });

        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
          {
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
            attribution: '© Mapbox © OpenStreetMap'
          }
        ).addTo(map);

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng);
          setCenterLat(lat.toFixed(6));
          setCenterLng(lng.toFixed(6));
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        mapInstanceRef.current = map;
        setMapInitialized(true);

      } catch (error) {
        console.error('[MapCenterOnboardingModal] Error initializing map:', error);
        setMessage({ type: 'error', text: 'Failed to initialize map' });
      }
    };

    checkAndInit();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, [open, mapInitialized]);

  const updateMarker = async (lat, lng) => {
    if (!mapInstanceRef.current) return;

    const L = (await import('leaflet')).default;

    if (markerRef.current) {
      markerRef.current.remove();
    }
    if (circleRef.current) {
      circleRef.current.remove();
    }

    const customIcon = L.divIcon({
      className: 'custom-location-marker',
      html: '<div style="background-color: #1976d2; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    markerRef.current = L.marker([lat, lng], { icon: customIcon })
      .addTo(mapInstanceRef.current);

    circleRef.current = L.circle([lat, lng], {
      radius: zoomRange * 1609.34,
      fillColor: '#1976d2',
      fillOpacity: 0.1,
      color: '#1976d2',
      weight: 2,
      dashArray: '5, 5'
    }).addTo(mapInstanceRef.current);

    let targetZoom;
    if (zoomRange <= 10) targetZoom = 10;
    else if (zoomRange <= 25) targetZoom = 9;
    else if (zoomRange <= 50) targetZoom = 8;
    else if (zoomRange <= 100) targetZoom = 7;
    else if (zoomRange <= 150) targetZoom = 6;
    else targetZoom = 5;

    mapInstanceRef.current.setView([lat, lng], targetZoom, { animate: true });
  };

  useEffect(() => {
    if (circleRef.current && centerLat && centerLng) {
      circleRef.current.setRadius(zoomRange * 1609.34);
    }
  }, [zoomRange, centerLat, centerLng]);

  // "Use My Location" button handler
  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setMessage({ type: 'error', text: 'Geolocation not supported by your browser' });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenterLat(latitude.toFixed(6));
        setCenterLng(longitude.toFixed(6));
        updateMarker(latitude, longitude);
        setGettingLocation(false);
        setMessage({ type: 'success', text: 'Location detected! Adjust if needed, then save.' });
      },
      (error) => {
        setGettingLocation(false);
        setMessage({ type: 'error', text: `Could not get location: ${error.message}` });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSave = async () => {
    if (!centerLat || !centerLng) {
      setMessage({ type: 'error', text: 'Please click on the map or use "My Location" to set your location' });
      return;
    }

    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to save your location' });
      return;
    }

    setLoading(true);
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };

    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User not logged in');
      }

      const firebaseToken = await currentUser.getIdToken(true);
      await onSaveLocation(locationData, firebaseToken);
      setMessage({ type: 'success', text: 'Location saved! Loading your events...' });

    } catch (error) {
      console.error('[MapCenterOnboardingModal] Error saving:', error);
      setMessage({ type: 'error', text: `Failed to save: ${error.message}` });
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          height: isMobile ? '95vh' : '85vh',
          maxHeight: '800px'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <LocationOnIcon />
        <Box component="span">Welcome! Set Your Location</Box>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2">
            <strong>Where do you dance tango?</strong> Click on the map or use &quot;My Location&quot; to set your home base.
            We&apos;ll show you events within your selected radius.
          </Typography>
        </Alert>

        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Use My Location Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleUseMyLocation}
            disabled={gettingLocation}
            startIcon={gettingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
          >
            {gettingLocation ? 'Getting Location...' : 'Use My Location'}
          </Button>
        </Box>

        {/* Search Range Slider */}
        <Box sx={{ mb: 2, px: isMobile ? 0 : 2 }}>
          <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MyLocationIcon sx={{ fontSize: 18 }} />
            Search Range: <strong>{zoomRange} miles</strong>
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
            size="small"
          />
        </Box>

        {/* Map Container */}
        <Box
          ref={mapRef}
          sx={{
            width: '100%',
            height: isMobile ? '280px' : '320px',
            borderRadius: 1,
            border: '2px solid',
            borderColor: 'primary.main',
            cursor: 'crosshair',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            mb: 2,
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

        {/* Selected Location Display */}
        {centerLat && centerLng && (
          <Box sx={{
            mb: 2,
            p: 1.5,
            bgcolor: 'success.light',
            borderRadius: 1,
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="success.contrastText">
              ✓ Location set: {parseFloat(centerLat).toFixed(4)}°, {parseFloat(centerLng).toFixed(4)}° ± {zoomRange}mi
            </Typography>
          </Box>
        )}

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={loading || !centerLat || !centerLng}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocationOnIcon />}
            sx={{ minWidth: 200, py: 1.5 }}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

MapCenterOnboardingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onSaveLocation: PropTypes.func.isRequired,
};

export default MapCenterOnboardingModal;
