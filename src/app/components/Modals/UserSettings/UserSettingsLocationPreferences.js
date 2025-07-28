// src/components/Modals/UserSettings/UserSettingsLocationPreferences.js
'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Slider,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const UserSettingsLocationPreferences = ({ userData, updateUserData, onSaveSuccess }) => {
  // Get auth context to check if user is logged in
  const { user } = useContext(AuthContext);
  const { setTemporaryLocation } = useGeoLocation();
  const isLoggedIn = !!user;
  
  // Map references
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  
  // State for location preferences - FORCE MAP CENTER MODE
  const useCenterLocation = true; // FORCED TO TRUE
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [zoomRange, setZoomRange] = useState(50);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [coordinatesLoaded, setCoordinatesLoaded] = useState(false);
  
  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    centerLat: '',
    centerLng: '',
    zoomRange: 50
  });

  // Load user's existing preferences or temporary location
  useEffect(() => {
    // First check if logged-in user has preferences
    if (userData?.localUserInfo?.userDefaults) {
      const defaults = userData.localUserInfo.userDefaults;
      
      console.log('Loading user defaults:', defaults);
      
      setZoomRange(defaults.defaultZoomRange || 50);
      
      if (defaults.defaultCenterLocation) {
        setCenterLat(defaults.defaultCenterLocation.latitude?.toString() || '');
        setCenterLng(defaults.defaultCenterLocation.longitude?.toString() || '');
        setCoordinatesLoaded(true);
      }
      
      // Store original values for change detection
      setOriginalValues({
        centerLat: defaults.defaultCenterLocation?.latitude?.toString() || '',
        centerLng: defaults.defaultCenterLocation?.longitude?.toString() || '',
        zoomRange: defaults.defaultZoomRange || 50
      });
    } else if (!isLoggedIn) {
      // For non-logged users, check sessionStorage for temporary location
      const savedTemp = sessionStorage.getItem('tempLocationPrefs');
      if (savedTemp) {
        try {
          const tempLocation = JSON.parse(savedTemp);
          console.log('Loading temporary location from sessionStorage:', tempLocation);
          
          if (tempLocation.centerLocation) {
            setCenterLat(tempLocation.centerLocation.lat?.toString() || '');
            setCenterLng(tempLocation.centerLocation.lng?.toString() || '');
            setZoomRange(tempLocation.zoomRange || 50);
            setCoordinatesLoaded(true);
            
            // Store as original values so hasChanges() works correctly
            setOriginalValues({
              centerLat: tempLocation.centerLocation.lat?.toString() || '',
              centerLng: tempLocation.centerLocation.lng?.toString() || '',
              zoomRange: tempLocation.zoomRange || 50
            });
          }
        } catch (e) {
          console.error('Error loading temporary location:', e);
        }
      }
    }
  }, [userData, isLoggedIn]);

  const isValidLatLng = () => {
    const lat = parseFloat(centerLat);
    const lng = parseFloat(centerLng);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Initialize map only once
  useEffect(() => {
    if (mapRef.current && typeof window !== 'undefined' && !mapInstanceRef.current) {
      // Dynamically import Leaflet to avoid SSR issues
      import('leaflet').then((L) => {
        // Check again inside the promise to prevent race conditions
        if (mapInstanceRef.current || !mapRef.current) {
          return;
        }
        
        // Fix Leaflet's default icon path issues in Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });

        // Always start with US view for initial load
        const initialCenter = [39.8283, -98.5795]; // Center of continental US
        const initialZoom = 4; // Show full continental US
        
        try {
          mapInstanceRef.current = L.map(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
            scrollWheelZoom: true,
            zoomControl: true,
            // Prevent map from growing beyond container
            preferCanvas: true,
          });
          
          // Force map to respect container size
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 100);
        } catch (error) {
          console.error('Error creating map:', error);
          return;
        }

        // Add tile layer
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
          {
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
          }
        ).addTo(mapInstanceRef.current);

        // Add click handler to set location
        mapInstanceRef.current.on('click', function(e) {
          const { lat, lng } = e.latlng;
          
          // Update coordinates
          setCenterLat(lat.toString());
          setCenterLng(lng.toString());

          // Remove existing marker and circle
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }
          if (circleRef.current) {
            mapInstanceRef.current.removeLayer(circleRef.current);
          }

          // Create custom icon for better visibility
          const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="
              background: #1976d2;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              "></div>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          // Add new marker with custom icon (no popup)
          markerRef.current = L.marker([lat, lng], { icon: customIcon })
            .addTo(mapInstanceRef.current);

          // Add circle to show the radius
          circleRef.current = L.circle([lat, lng], {
            radius: zoomRange * 1609.34, // Convert miles to meters for map display
            fillColor: '#1976d2',
            fillOpacity: 0.1,
            color: '#1976d2',
            weight: 2,
            dashArray: '5, 5'
          }).addTo(mapInstanceRef.current);
          
          // Center the map on the clicked point and zoom appropriately
          // Calculate zoom level based on radius to show the circle nicely with margin
          let targetZoom;
          if (zoomRange <= 10) targetZoom = 10;
          else if (zoomRange <= 25) targetZoom = 9;
          else if (zoomRange <= 50) targetZoom = 8;
          else if (zoomRange <= 100) targetZoom = 7;
          else if (zoomRange <= 150) targetZoom = 6;
          else targetZoom = 5; // For 250 miles
          
          // Animate to the new center and zoom
          mapInstanceRef.current.setView([lat, lng], targetZoom, {
            animate: true,
            duration: 0.5
          });
        });

        setMapInitialized(true);
        
        // Add resize observer to handle container size changes
        if (window.ResizeObserver && mapRef.current) {
          const resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          resizeObserver.observe(mapRef.current);
          
          // Store observer for cleanup
          mapRef.current._resizeObserver = resizeObserver;
        }
      }).catch((error) => {
        console.error('Error loading Leaflet:', error);
        setMessage({ type: 'error', text: 'Failed to load map' });
      });
    }

    // Cleanup function
    return () => {
      if (mapRef.current?._resizeObserver) {
        mapRef.current._resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []); // Only initialize once

  // Handle loading saved coordinates after map is initialized
  useEffect(() => {
    if (mapInitialized && mapInstanceRef.current && coordinatesLoaded && centerLat && centerLng && isValidLatLng()) {
      import('leaflet').then((L) => {
        const lat = parseFloat(centerLat);
        const lng = parseFloat(centerLng);
        
        // Remove existing marker and circle
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }
        if (circleRef.current) {
          mapInstanceRef.current.removeLayer(circleRef.current);
        }

        // Create custom icon for better visibility
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="
            background: #1976d2;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        // Add marker for current coordinates (no popup)
        markerRef.current = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstanceRef.current);

        // Add circle to show the radius
        circleRef.current = L.circle([lat, lng], {
          radius: zoomRange * 1609.34, // Convert miles to meters
          fillColor: '#1976d2',
          fillOpacity: 0.1,
          color: '#1976d2',
          weight: 2,
          dashArray: '5, 5'
        }).addTo(mapInstanceRef.current);

        // Zoom to the location
        let targetZoom;
        if (zoomRange <= 10) targetZoom = 10;
        else if (zoomRange <= 25) targetZoom = 9;
        else if (zoomRange <= 50) targetZoom = 8;
        else if (zoomRange <= 100) targetZoom = 7;
        else if (zoomRange <= 150) targetZoom = 6;
        else targetZoom = 5; // For 250 miles
        
        // Delay the zoom to allow map to fully render
        setTimeout(() => {
          mapInstanceRef.current.setView([lat, lng], targetZoom, {
            animate: true,
            duration: 1
          });
        }, 100);
      });
    }
  }, [mapInitialized, coordinatesLoaded, centerLat, centerLng]);

  // Separate effect to handle radius changes
  useEffect(() => {
    if (mapInstanceRef.current && circleRef.current && centerLat && centerLng && isValidLatLng()) {
      // Update the circle radius
      circleRef.current.setRadius(zoomRange * 1609.34);
      
      // Recenter and zoom to show the updated radius
      let targetZoom;
      if (zoomRange <= 10) targetZoom = 10;
      else if (zoomRange <= 25) targetZoom = 9;
      else if (zoomRange <= 50) targetZoom = 8;
      else if (zoomRange <= 100) targetZoom = 7;
      else if (zoomRange <= 150) targetZoom = 6;
      else targetZoom = 5; // For 250 miles
      
      mapInstanceRef.current.setView(
        [parseFloat(centerLat), parseFloat(centerLng)], 
        targetZoom, 
        { animate: true, duration: 0.3 }
      );
    }
  }, [zoomRange]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (isLoggedIn) {
        // LOGGED IN USER: SAVE to backend
        // Prepare the update data with proper nested structure
        const updateData = {
          localUserInfo: {
            userDefaults: {
              useCenterLocation: true, // ALWAYS TRUE
              defaultZoomRange: zoomRange,
              // Clear city selections since we're forcing map mode
              masteredCityIds: [],
              defaultCenterLocation: (centerLat && centerLng) ? {
                latitude: parseFloat(centerLat),  // Backend expects 'latitude'
                longitude: parseFloat(centerLng),  // Backend expects 'longitude'
                lat: parseFloat(centerLat),       // Also include 'lat' for useEvents
                lng: parseFloat(centerLng)        // Also include 'lng' for useEvents
              } : null
            }
          }
        };

        console.log('Saving location preferences to backend (logged in user):', updateData);
        
        // Call the update function
        await updateUserData(updateData);
        
        // Update original values after successful save
        setOriginalValues({
          centerLat: centerLat,
          centerLng: centerLng,
          zoomRange
        });
        
        setMessage({ type: 'success', text: 'Location preferences saved successfully!' });
        
        // Close modal and refresh after a short delay to show success message
        setTimeout(() => {
          if (onSaveSuccess) {
            onSaveSuccess();
          }
          // Refresh the page to reload calendar data with new preferences
          window.location.reload();
        }, 1500);
      } else {
        // NON-LOGGED USER: SET in context only (no backend save, no reload)
        const locationData = {
          centerLocation: {
            lat: parseFloat(centerLat),
            lng: parseFloat(centerLng)
          },
          zoomRange: zoomRange,
          useCenterLocation: true
        };

        console.log('Setting temporary location (non-logged user):', locationData);
        
        // Set temporary location in context
        setTemporaryLocation(locationData);
        
        // Store in sessionStorage for persistence across page refreshes
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('tempLocationPrefs', JSON.stringify(locationData));
        }
        
        // Update original values
        setOriginalValues({
          centerLat: centerLat,
          centerLng: centerLng,
          zoomRange
        });
        
        setMessage({ type: 'success', text: 'Location set for this session!' });
        
        // Close modal WITHOUT reload - just trigger event refresh
        setTimeout(() => {
          if (onSaveSuccess) {
            onSaveSuccess();
          }
          // NO RELOAD - events will refresh automatically via context
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving/setting location preferences:', error);
      setMessage({ type: 'error', text: isLoggedIn ? 'Failed to save preferences. Please try again.' : 'Failed to set location. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    // Check if any values have changed from original
    if (zoomRange !== originalValues.zoomRange) return true;
    if (centerLat !== originalValues.centerLat || centerLng !== originalValues.centerLng) return true;
    return false;
  };

  const canSave = () => {
    // Must have changes AND valid data
    if (!hasChanges()) return false;
    return isValidLatLng();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Event Location Preferences
        </Typography>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving || !canSave()}
          sx={{ 
            minWidth: 120,
            opacity: canSave() ? 1 : 0.5,
            transition: 'opacity 0.3s'
          }}
        >
          {saving ? (isLoggedIn ? 'Saving...' : 'Setting...') : 
           hasChanges() ? (isLoggedIn ? 'Save Changes' : 'Set Location') : 
           (isLoggedIn ? 'Save' : 'Set')}
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Set your location center point and distance radius to filter events in your area.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Map Center Location Mode */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MapIcon color="primary" />
          <Typography variant="subtitle1">
            Map Center Location
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Events will be filtered by distance from your custom map center point
        </Typography>

        {/* Interactive Map */}
        <Box sx={{ mb: 2, position: 'relative' }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Click anywhere on the map to set your center location
            </Typography>
          </Box>
          <Box
            ref={mapRef}
            sx={{
              width: '100%',
              height: { xs: 300, sm: 350, md: 400 }, // Responsive height
              maxHeight: '50vh', // Never exceed 50% of viewport
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'primary.main',
              position: 'relative',
              cursor: 'crosshair',
              overflow: 'hidden', // Prevent map from overflowing
              // Ensure Leaflet container respects our height
              '& .leaflet-container': {
                height: '100% !important',
                maxHeight: '100% !important',
              },
              '&::after': centerLat && centerLng && isValidLatLng() ? {} : {
                content: '"Click to place marker"',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 'bold',
                color: 'primary.main',
                pointerEvents: 'none',
                zIndex: 1000
              }
            }}
          />
          {centerLat && centerLng && isValidLatLng() && (
            <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
              📍 Center: {parseFloat(centerLat).toFixed(5)}, {parseFloat(centerLng).toFixed(5)} • Showing {zoomRange} mile radius
            </Typography>
          )}
        </Box>
        
        {/* Zoom Range Slider */}
        <Box sx={{ mt: 3 }}>
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
              { value: 25, label: '25mi' },
              { value: 50, label: '50mi' },
              { value: 100, label: '100mi' },
              { value: 150, label: '150mi' },
              { value: 250, label: '250mi' },
            ]}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
          
          <Typography variant="caption" color="text.secondary">
            Events within {zoomRange} miles of your selected location will be shown
          </Typography>
        </Box>
      </Paper>

      {/* What will be saved indicator */}
      {canSave() && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: 'info.light',
            borderColor: 'info.main',
            borderStyle: 'dashed'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="subtitle2" color="info.main">
              What will be saved:
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2">
              <strong>Filter Mode:</strong> Map Center (forced)
            </Typography>
            <Typography variant="body2">
              <strong>Center:</strong> {centerLat}, {centerLng}
            </Typography>
            <Typography variant="body2">
              <strong>Radius:</strong> {zoomRange} miles
            </Typography>
          </Box>
        </Paper>
      )}
      
      <Typography variant="body2" color="text.secondary">
        <strong>Note:</strong> Location filtering is now set to Map Center mode only. Events will be filtered based on distance from your selected center point.
      </Typography>
    </Box>
  );
};

UserSettingsLocationPreferences.propTypes = {
  userData: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  onSaveSuccess: PropTypes.func,
};

export default UserSettingsLocationPreferences;