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
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { AuthContext } from '@/contexts/AuthContext';
import {
  useEventDensity,
  PILL_COLORS,
  TIME_RANGE_DEFAULT,
  getAggregationLevel,
} from '@/components/EventDensity';
import 'leaflet/dist/leaflet.css';

/**
 * @deprecated TIEMPO-440 — Replaced by MapCenterModal opened via
 * `openMapCenterModal()` for the onboarding case. This file is retained for
 * one merge cycle as a rollback fallback; if nothing renders it after soak
 * on TEST, it will be deleted.
 *
 * If you see the console.warn below firing, something is still importing
 * this component — please migrate to MapCenterModal and report back to Sarah.
 *
 * MapCenterOnboardingModal - Blocking modal for new users without mapCenter
 *
 * TIEMPO-381: Forces user to set their location before accessing the calendar.
 * Cannot be dismissed - user must save a location to continue.
 */
const MapCenterOnboardingModal = ({
  open,
  onSaveLocation,
}) => {
  // TIEMPO-440: Surface accidental rendering to error tracking. If you're
  // seeing this fire, something still imports the deprecated modal — should
  // route through openMapCenterModal() / MapCenterModal instead.
  if (open && typeof window !== 'undefined') {
    console.warn('[DEPRECATED] MapCenterOnboardingModal rendered — TIEMPO-440 replaced this with MapCenterModal. Please migrate.');
  }
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const clusterLayerRef = useRef(null);
  const fetchTimerRef = useRef(null);

  const [mapInitialized, setMapInitialized] = useState(false);
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [zoomRange, setZoomRange] = useState(50);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showDensityPills, setShowDensityPills] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(4);

  // Event density hook
  const { densityData, loading: densityLoading, metadata: densityMeta, fetchDensity } = useEventDensity();

  // Initialize map
  useEffect(() => {
    if (!open) return;

    // Already initialized with a valid map instance
    if (mapInitialized && mapInstanceRef.current) return;

    let retryCount = 0;
    const maxRetries = 10;
    let isMounted = true;

    const checkAndInit = () => {
      if (!isMounted) return;
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
      if (!isMounted) return;

      try {
        const L = (await import('leaflet')).default;

        // Clean up any existing Leaflet instance on this container
        if (mapRef.current && mapRef.current._leaflet_id) {
          // Container already has a map - remove it first
          const existingMap = mapRef.current._leaflet;
          if (existingMap) {
            try {
              existingMap.remove();
            } catch {
              // Ignore
            }
          }
          // Clear Leaflet's internal marker
          delete mapRef.current._leaflet_id;
        }

        // Also clean up our ref if it has a stale instance
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch {
            // Ignore
          }
          mapInstanceRef.current = null;
        }

        if (!isMounted || !mapRef.current) return;

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

        // Create layer for density pill markers
        clusterLayerRef.current = L.layerGroup().addTo(map);

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng);
          setCenterLat(lat.toFixed(6));
          setCenterLng(lng.toFixed(6));
        });

        // Fetch density pills on zoom/pan (debounced)
        const fetchDensityForBounds = () => {
          if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
          fetchTimerRef.current = setTimeout(() => {
            const bounds = map.getBounds();
            const zoom = map.getZoom();
            setCurrentZoom(zoom);
            fetchDensity({
              bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              },
              zoom,
              timeRangeDays: TIME_RANGE_DEFAULT,
            });
          }, 500);
        };

        map.on('moveend', fetchDensityForBounds);
        map.on('zoomend', fetchDensityForBounds);

        setTimeout(() => {
          if (map && map._container) {
            map.invalidateSize();
            // Fetch initial density data
            fetchDensityForBounds();
          }
        }, 100);

        mapInstanceRef.current = map;
        if (isMounted) {
          setMapInitialized(true);
        }

      } catch (error) {
        console.error('[MapCenterOnboardingModal] Error initializing map:', error);
        if (isMounted) {
          setMessage({ type: 'error', text: 'Failed to initialize map' });
        }
      }
    };

    checkAndInit();

    return () => {
      isMounted = false;
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      if (clusterLayerRef.current) clusterLayerRef.current = null;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
      // Clear the ref's Leaflet marker too
      if (mapRef.current && mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }
      setMapInitialized(false);
    };
  }, [open, mapInitialized]);

  // Render density pill markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterLayerRef.current) return;

    // Clear markers if toggle is off
    if (!showDensityPills) {
      clusterLayerRef.current.clearLayers();
      return;
    }

    if (!densityData.length) return;

    const renderPills = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      clusterLayerRef.current.clearLayers();

      const level = getAggregationLevel(currentZoom);

      densityData.forEach((item) => {
        if (!item.center?.lat || !item.center?.lng) return;

        // Skip unknown venues
        const isUnknown = item.name?.toLowerCase().includes('unknown');
        if (isUnknown && level === 'venue') return;

        // Build pills HTML
        const { socialCount = 0, eventCount = 0, discoveredCount = 0 } = item;
        const pills = [];

        if (socialCount > 0) {
          pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:${PILL_COLORS.social};color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${socialCount}</span>`);
        }
        if (eventCount > 0) {
          pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:${PILL_COLORS.events};color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${eventCount}</span>`);
        }
        if (discoveredCount > 0) {
          pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:${PILL_COLORS.discovered};color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${discoveredCount}</span>`);
        }

        if (pills.length === 0) return;

        const displayName = item.name.length > 18 ? item.name.slice(0, 17) + '…' : item.name;
        const header = `<div style="font-size:9px;font-weight:600;color:#555;text-align:center;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;">${displayName}</div>`;
        const pillHtml = `<div style="display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,0.95);padding:4px 6px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;">${header}<div style="display:flex;align-items:center;gap:2px;">${pills.join('')}</div></div>`;

        const icon = L.divIcon({
          className: 'density-pill-marker',
          html: pillHtml,
          iconSize: [130, 50],
          iconAnchor: [65, 25],
        });

        const marker = L.marker([item.center.lat, item.center.lng], {
          icon,
          interactive: true,
          bubblingMouseEvents: false,
        });

        // Tooltip
        const tooltipContent = `<strong>${item.name}</strong><br/>${socialCount} Mil/Pra | ${eventCount} Festival+${discoveredCount ? ` | ${discoveredCount} BOT` : ''}`;
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -15],
          className: 'density-pill-tooltip',
        });

        clusterLayerRef.current.addLayer(marker);
      });
    };

    renderPills();
  }, [densityData, currentZoom, showDensityPills]);

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
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 500
        }}
      >
        <LocationOnIcon />
        <Box component="span">Welcome! Set Your Location</Box>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 1.5 : 2 }}>
        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 2, mt: 1 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Action buttons row - Use My Location, Show Events toggle, and Save */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleUseMyLocation}
            disabled={gettingLocation}
            size="small"
            startIcon={gettingLocation ? <CircularProgress size={14} /> : <MyLocationIcon />}
          >
            {gettingLocation ? 'Getting...' : 'Use My Location'}
          </Button>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showDensityPills}
                onChange={(e) => setShowDensityPills(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Show Events
              </Typography>
            }
            sx={{ m: 0 }}
          />

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !centerLat || !centerLng}
            size="small"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <LocationOnIcon />}
          >
            {loading ? 'Saving...' : 'Save'}
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

        {/* Map Container with density overlay */}
        <Box sx={{ position: 'relative', mb: 2 }}>
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

          {/* Legend for event density pills - only show when enabled */}
          {mapInitialized && showDensityPills && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 1000,
              pointerEvents: 'none',
            }}>
              {densityLoading && <CircularProgress size={12} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: PILL_COLORS.social }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>Mil/Pra</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: PILL_COLORS.events }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>Festival+</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: PILL_COLORS.discovered }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>BOT</Typography>
              </Box>
              {densityMeta && (
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', lineHeight: 1 }}>
                  {densityMeta.totalEvents || 0} events
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Selected Location Display */}
        {centerLat && centerLng && (
          <Box sx={{
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
      </DialogContent>
    </Dialog>
  );
};

MapCenterOnboardingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onSaveLocation: PropTypes.func.isRequired,
};

export default MapCenterOnboardingModal;
