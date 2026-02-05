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
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import { createDensityClusterIcon } from '@/components/EventDiscovery/clusterIcon';
import 'leaflet/dist/leaflet.css';

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
  const [loading, setLoading] = useState(false);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterMeta, setClusterMeta] = useState(null);
  const [message, setMessage] = useState(null);
  
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
      
        // TIEMPO-360: Create cluster layer for event density overlay
        clusterLayerRef.current = L.layerGroup().addTo(map);

        // Handle map click — only set center if not clicking a cluster marker
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng);
          setCenterLat(lat.toFixed(6));
          setCenterLng(lng.toFixed(6));
        });

        // TIEMPO-360: Fetch clusters on zoom/pan
        const fetchClustersForBounds = () => {
          if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
          fetchTimerRef.current = setTimeout(() => {
            fetchEventClusters(map);
          }, 500);
        };

        map.on('moveend', fetchClustersForBounds);
        map.on('zoomend', fetchClustersForBounds);

        // Force map to recalculate size after a delay
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        mapInstanceRef.current = map;
        setMapInitialized(true);

        // Force resize after initialization, then fetch initial clusters
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            fetchEventClusters(mapInstanceRef.current);
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
  
  // TIEMPO-360: Fetch event density clusters from /api/events/summary
  const fetchEventClusters = async (map) => {
    if (!map || !clusterLayerRef.current) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const boundsObj = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    // Build date range: current month + 2 months forward
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const endDate = `${endMonth.getFullYear()}-${String(endMonth.getMonth() + 1).padStart(2, '0')}`;

    setClusterLoading(true);
    try {
      const response = await axios.get(`${getApiBaseUrl()}/api/events/summary`, {
        params: {
          appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
          format: 'clusters',
          zoom,
          bounds: JSON.stringify(boundsObj),
          startDate,
          endDate
        },
        timeout: 10000
      });

      const clusters = response.data?.clusters || [];
      setClusterMeta(response.data?.metadata || null);

      // Clear existing cluster markers
      clusterLayerRef.current.clearLayers();

      const L = (await import('leaflet')).default;

      // Determine aggregation level from zoom so we can infer drill-down
      // even before BEAF adds canDrillDown (region=1-5, division=6-10, city=11-14, venue=15+)
      const aggregationLevel = zoom <= 5 ? 'region' : zoom <= 10 ? 'division' : zoom <= 14 ? 'city' : 'venue';
      const canDrill = aggregationLevel !== 'venue';

      // Add cluster markers (read-only — clicking does NOT set map center)
      clusters.forEach(cluster => {
        const lat = typeof cluster.center?.lat === 'number' ? cluster.center.lat : null;
        const lng = typeof cluster.center?.lng === 'number' ? cluster.center.lng : null;
        if (lat === null || lng === null) return;

        const icon = createDensityClusterIcon(
          L,
          cluster.eventCount,
          cluster.discoveredCount || 0
        );
        if (!icon) return;

        const marker = L.marker([lat, lng], {
          icon,
          interactive: true,
          bubblingMouseEvents: false // Prevent click from reaching the map
        });

        // Tooltip on hover with detail
        const tooltipContent = `<strong>${cluster.name || 'Events'}</strong><br/>${cluster.eventCount} event${cluster.eventCount !== 1 ? 's' : ''}${canDrill ? '<br/><em>Click to explore</em>' : ''}`;
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          className: 'density-cluster-tooltip'
        });

        // Click cluster to fly in closer (use canDrillDown from BEAF if available, else infer)
        const drillable = cluster.canDrillDown !== undefined ? cluster.canDrillDown : canDrill;
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (drillable) {
            map.flyTo([lat, lng], zoom + 3, {
              animate: true,
              duration: 0.8
            });
          }
        });

        clusterLayerRef.current.addLayer(marker);
      });
    } catch (error) {
      console.warn('[MapCenterModal] Failed to fetch event clusters:', error.message);
    } finally {
      setClusterLoading(false);
    }
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

          {/* TIEMPO-360: Event density legend + loading */}
          {mapInitialized && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.92)',
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
              {clusterLoading && <CircularProgress size={14} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#1976d2' }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>Events</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#7B1FA2' }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>AI Discovered</Typography>
              </Box>
              {clusterMeta && (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}>
                  {clusterMeta.totalEvents || 0} total
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
