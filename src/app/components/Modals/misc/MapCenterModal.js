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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { AuthContext } from '@/contexts/AuthContext';
import {
  useEventDensity,
  PILL_COLORS,
  TIME_RANGE_MARKS,
  TIME_RANGE_DEFAULT,
  TIME_RANGE_MIN,
  TIME_RANGE_MAX,
  getAggregationLevel,
} from '@/components/EventDensity';
import 'leaflet/dist/leaflet.css';

// TIEMPO-360: Helper to create pill marker HTML with level + name header
function createPillMarkerHtml(item, zoom) {
  const { socialCount = 0, eventCount = 0, discoveredCount = 0, level = '', name = '' } = item;

  // Build pills HTML
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

  // If no counts, show placeholder
  if (pills.length === 0) {
    return '<div style="display:none;"></div>';
  }

  // Level label (uppercase, abbreviated)
  const levelLabel = level ? level.toUpperCase().slice(0, 4) : '';

  // Truncate name if too long
  const displayName = name.length > 15 ? name.slice(0, 14) + '…' : name;

  // Header with level:name
  const header = levelLabel && displayName
    ? `<div style="font-size:9px;font-weight:600;color:#555;text-align:center;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;">${levelLabel}: ${displayName}</div>`
    : '';

  return `<div style="display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,0.95);padding:4px 6px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;">${header}<div style="display:flex;align-items:center;gap:2px;">${pills.join('')}</div></div>`;
}

const MapCenterModal = ({
  open,
  onClose,
  onSetLocation,
  onSaveLocation,
  initialLocation = null, // No hardcoded default - use smart fallback from Providers

}) => {
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
  const [centerLat, setCenterLat] = useState(initialLocation?.lat || '');
  const [centerLng, setCenterLng] = useState(initialLocation?.lng || '');
  const [zoomRange, setZoomRange] = useState(initialLocation?.zoomRange || 50);
  const [timeRangeDays, setTimeRangeDays] = useState(TIME_RANGE_DEFAULT); // TIEMPO-360: Time range slider
  const [currentZoom, setCurrentZoom] = useState(5); // TIEMPO-360: Track map zoom for pill rendering
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // TIEMPO-360: Use new density pill system
  const { densityData, loading: densityLoading, metadata: densityMeta, fetchDensity } = useEventDensity();
  
  // Initialize map - with retry logic for ref attachment
  useEffect(() => {
    if (!open || mapInitialized) return;
    
    // Retry logic for waiting for ref to attach
    let retryCount = 0;
    const maxRetries = 10;
    
    const checkAndInit = () => {
      retryCount++;
      
      if (mapRef.current) {
        initializeMap();
      } else if (retryCount < maxRetries) {
        setTimeout(checkAndInit, 100);
      } else {
        setMessage({ type: 'error', text: 'Failed to initialize map container' });
      }
    };
    
    const initializeMap = async () => {
      try {
        // Dynamic import L to avoid SSR issues
        const L = (await import('leaflet')).default;
        
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
        
        const map = L.map(mapRef.current, {
          center: [initialLat, initialLng],
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: true
        });
        
        // Add tile layer
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
          {
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
            attribution: '© Mapbox © OpenStreetMap'
          }
        ).addTo(map);
      
        // TIEMPO-360: Create layer for density pill markers
        clusterLayerRef.current = L.layerGroup().addTo(map);

        // Handle map click — only set center if not clicking a density marker
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng);
          setCenterLat(lat.toFixed(6));
          setCenterLng(lng.toFixed(6));
        });

        // TIEMPO-360: Fetch density pills on zoom/pan (debounced)
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
              timeRangeDays,
            });
          }, 500);
        };

        map.on('moveend', fetchDensityForBounds);
        map.on('zoomend', fetchDensityForBounds);

        // Force map to recalculate size after a delay
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        mapInstanceRef.current = map;
        setMapInitialized(true);

        // Force resize after initialization, then fetch initial density pills
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            const bounds = mapInstanceRef.current.getBounds();
            const zoom = mapInstanceRef.current.getZoom();
            setCurrentZoom(zoom);
            fetchDensity({
              bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              },
              zoom,
              timeRangeDays,
            });
          }
        }, 300);
        
      } catch (error) {
        console.error('[MapCenterModal] Error initializing map:', error);
        setMessage({ type: 'error', text: 'Failed to initialize map' });
      }
    };
    
    // Start the check and init process
    checkAndInit();
    
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      if (clusterLayerRef.current) clusterLayerRef.current = null;
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
  }, [open]);
  
  // Force map resize when modal fully opens
  useEffect(() => {
    if (open && mapInstanceRef.current) {
      const timer = setTimeout(() => {
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
  
  // TIEMPO-360: Render density pill markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterLayerRef.current || !densityData.length) return;

    const renderPills = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      clusterLayerRef.current.clearLayers();

      const level = getAggregationLevel(currentZoom);
      const canDrill = level !== 'venue';

      densityData.forEach((item) => {
        if (!item.center?.lat || !item.center?.lng) return;

        // Skip or flag "Unknown" items (data quality issue)
        const isUnknown = item.name?.toLowerCase().includes('unknown');
        if (isUnknown && level === 'venue') {
          // At venue level, skip unknown venues entirely
          // These are events with missing venue data - flag for Fulton
          console.warn(`[Density] Skipping Unknown venue with ${item.totalCount} events - data quality issue`);
          return;
        }

        // Create HTML for the pill group
        const pillHtml = createPillMarkerHtml(item, currentZoom);

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

        // Tooltip with location name and pill breakdown
        const totalCount = item.socialCount + item.eventCount;
        const tooltipContent = `<strong>${item.name}</strong><br/>${item.socialCount} Mil/Pra | ${item.eventCount} Festival+${item.discoveredCount ? ` | ${item.discoveredCount} AI-Dscv` : ''}${canDrill ? '<br/><em>Click to explore</em>' : ''}`;
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -15],
          className: 'density-pill-tooltip',
        });

        // Click to drill down
        if (canDrill) {
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            mapInstanceRef.current.flyTo([item.center.lat, item.center.lng], currentZoom + 3, {
              animate: true,
              duration: 0.8,
            });
          });
        }

        clusterLayerRef.current.addLayer(marker);
      });
    };

    renderPills();
  }, [densityData, currentZoom]);

  // TIEMPO-360: Refetch when time range changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInitialized) return;

    const bounds = mapInstanceRef.current.getBounds();
    const zoom = mapInstanceRef.current.getZoom();
    fetchDensity({
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      zoom,
      timeRangeDays,
    });
  }, [timeRangeDays, mapInitialized]);

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
    setMessage({ type: 'success', text: 'Map Center set for Session (temporary)!' });
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

    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to save Cloud Default' });
      return;
    }

    setLoading(true);
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };

    try {
      // Get FRESH Firebase auth token (force refresh to avoid expired tokens)
      // Import firebase auth to get fresh token
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User not logged in');
      }

      // Force refresh token to ensure it's not expired
      const firebaseToken = await currentUser.getIdToken(true);

      // Call saveToCloudDefault with Firebase token
      await onSaveLocation(locationData, firebaseToken);
      setMessage({ type: 'success', text: 'Location saved as Cloud Default!' });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('[MapCenterModal] Error saving Cloud Default:', error);
      setMessage({ type: 'error', text: `Failed to save: ${error.message}` });
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

        {/* Phase 1 & 2: Alert messages explaining Session vs Cloud Default */}
        {user ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Welcome {user.displayName || user.email}!
            </Typography>
            <Typography variant="body2">
              You can save this location for your <strong>Session</strong> (temporary) or as your <strong>Cloud Default</strong> (permanent across devices).
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Set your map center for this <strong>Session</strong> (temporary only).
            </Typography>
            <Typography variant="body2">
              <strong>Want to save permanently?</strong> Sign up to save as your Cloud Default!
            </Typography>
          </Alert>
        )}

        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        
        {/* Action Buttons - Phase 1: Auth-aware layout */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          mb: 2,
          justifyContent: 'center'
        }}>
          {/* Button 1: Set Map Center (Session) - Always visible */}
          <Button
            variant="outlined"
            onClick={handleSetTemp}
            disabled={loading || !centerLat || !centerLng}
            startIcon={<MyLocationIcon sx={{ fontSize: 18 }} />}
            size="small"
            sx={{
              px: 2,
              py: 0.75,
              fontSize: '0.875rem',
              fontWeight: 500,
              minWidth: '160px'
            }}
          >
            Set Map Center (Session)
          </Button>

          {/* Button 2: Auth users see "Save as Default", Anonymous see "Sign Up" */}
          {user ? (
            <Tooltip
              title="Save to your Cloud Default (permanent across devices)"
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  onClick={handleSavePerm}
                  disabled={loading || !centerLat || !centerLng}
                  startIcon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                  size="small"
                  sx={{
                    px: 2,
                    py: 0.75,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    minWidth: '180px'
                  }}
                >
                  Save as Default
                </Button>
              </span>
            </Tooltip>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  window.location.href = '/auth/login';
                }}
                size="small"
                sx={{
                  px: 2,
                  py: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  minWidth: '100px'
                }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  window.location.href = '/auth/signup';
                }}
                size="small"
                sx={{
                  px: 2,
                  py: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  minWidth: '100px'
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
        
        {/* Sliders Row - Search Range and Time Range side by side */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          {/* Search Range Slider (miles - for user's calendar center) */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MyLocationIcon sx={{ fontSize: 16 }} />
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
              size="small"
            />
          </Box>

          {/* TIEMPO-360: Time Range Slider (days - for event discovery) */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarMonthIcon sx={{ fontSize: 16 }} />
              Time Range: {timeRangeDays <= 30 ? `${timeRangeDays} days` : `${Math.round(timeRangeDays / 30)} months`}
            </Typography>
            <Slider
              value={timeRangeDays}
              onChange={(e, newValue) => setTimeRangeDays(newValue)}
              min={TIME_RANGE_MIN}
              max={TIME_RANGE_MAX}
              step={null}
              marks={TIME_RANGE_MARKS}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value <= 30 ? `${value}d` : `${Math.round(value / 30)}mo`}
              size="small"
            />
          </Box>
        </Box>
        
        {/* Map Container with density overlay */}
        <Box sx={{ position: 'relative' }}>
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

          {/* TIEMPO-360: Event density pill legend + loading */}
          {mapInitialized && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 1000,
              pointerEvents: 'none'
            }}>
              {densityLoading && <CircularProgress size={14} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 5, bgcolor: PILL_COLORS.social }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>Mil/Pra</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 5, bgcolor: PILL_COLORS.events }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>Festival+</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 5, bgcolor: PILL_COLORS.discovered }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>AI-Dscv</Typography>
              </Box>
              {densityMeta && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1 }}>
                  {densityMeta.totalEvents || 0} events
                </Typography>
              )}
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

export default MapCenterModal;

MapCenterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSetLocation: PropTypes.func.isRequired,
  onSaveLocation: PropTypes.func.isRequired,
  initialLocation: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    zoomRange: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  savedLocation: PropTypes.oneOfType([
    PropTypes.shape({
      lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      zoomRange: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    PropTypes.oneOf([null])
  ]),
};
