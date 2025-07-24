// src/components/Modals/UserSettings/UserSettingsLocationPreferences.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Slider,
  Button,
  Alert,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  ListItemText,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SaveIcon from '@mui/icons-material/Save';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';
import 'leaflet/dist/leaflet.css';

const UserSettingsLocationPreferences = ({ userData, updateUserData }) => {
  const { cities, fetchCities, fetchDivisions, fetchRegions, fetchCountries } = useMasteredLocations();
  
  // Map references
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  
  // State for location preferences
  const [useCenterLocation, setUseCenterLocation] = useState(false);
  const [selectedCityIds, setSelectedCityIds] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]); // Store full city objects
  const [centerLat, setCenterLat] = useState('');
  const [centerLng, setCenterLng] = useState('');
  const [zoomRange, setZoomRange] = useState(50);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  
  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    useCenterLocation: false,
    selectedCityIds: [],
    centerLat: '',
    centerLng: '',
    zoomRange: 50
  });

  // Load user's existing preferences
  useEffect(() => {
    if (userData?.localUserInfo?.userDefaults) {
      const defaults = userData.localUserInfo.userDefaults;
      
      console.log('Loading user defaults:', defaults);
      console.log('masteredCityIds:', defaults.masteredCityIds);
      console.log('masteredCityId:', defaults.masteredCityId);
      
      setUseCenterLocation(defaults.useCenterLocation || false);
      // Handle both single city (legacy) and multiple cities (new)
      if (defaults.masteredCityIds && Array.isArray(defaults.masteredCityIds) && defaults.masteredCityIds.length > 0) {
        console.log('Setting city IDs from masteredCityIds:', defaults.masteredCityIds);
        setSelectedCityIds(defaults.masteredCityIds);
      } else if (defaults.masteredCityId) {
        console.log('Setting city ID from legacy masteredCityId:', defaults.masteredCityId);
        setSelectedCityIds([defaults.masteredCityId]);
      } else {
        console.log('No saved city preferences found');
        setSelectedCityIds([]);
      }
      setZoomRange(defaults.defaultZoomRange || 50);
      
      if (defaults.defaultCenterLocation) {
        setCenterLat(defaults.defaultCenterLocation.latitude?.toString() || '');
        setCenterLng(defaults.defaultCenterLocation.longitude?.toString() || '');
      }
      
      // Store original values for change detection
      setOriginalValues({
        useCenterLocation: defaults.useCenterLocation || false,
        selectedCityIds: defaults.masteredCityIds || (defaults.masteredCityId ? [defaults.masteredCityId] : []),
        centerLat: defaults.defaultCenterLocation?.latitude?.toString() || '',
        centerLng: defaults.defaultCenterLocation?.longitude?.toString() || '',
        zoomRange: defaults.defaultZoomRange || 50
      });
    }
  }, [userData]);

  // Load all cities for the dropdown
  useEffect(() => {
    const loadAllCities = async () => {
      try {
        console.log('UserSettingsLocationPreferences: Starting to load cities...');
        // Load all active cities without requiring coordinates for user preferences
        await fetchCities(undefined, true, false); // undefined divisionId = all cities, false = don't require coordinates
        console.log('UserSettingsLocationPreferences: Cities loaded:', cities.length);
        setCitiesLoaded(true);
      } catch (error) {
        console.error('Error loading cities:', error);
        setMessage({ type: 'error', text: 'Failed to load cities' });
      }
    };

    loadAllCities();
  }, [fetchCities]);

  // Monitor when cities array actually updates and sync selected cities
  useEffect(() => {
    console.log('UserSettingsLocationPreferences: Cities array updated, count:', cities.length);
    console.log('Current selectedCityIds:', selectedCityIds);
    
    if (cities.length > 0 && selectedCityIds.length > 0) {
      // Update selectedCities based on selectedCityIds
      const matchedCities = cities.filter(city => selectedCityIds.includes(city._id));
      console.log('Matched cities:', matchedCities);
      setSelectedCities(matchedCities);
      
      // Log if some cities weren't found
      if (matchedCities.length !== selectedCityIds.length) {
        console.warn('Some city IDs could not be matched:', 
          selectedCityIds.filter(id => !matchedCities.find(city => city._id === id))
        );
      }
    }
  }, [cities, selectedCityIds]);

  // Initialize map when in map center mode
  useEffect(() => {
    if (useCenterLocation && mapRef.current && typeof window !== 'undefined') {
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

          // Determine initial center and zoom
          let initialCenter = [39.8283, -98.5795]; // Default: Center of continental US
          let initialZoom = 4; // Default: Show full continental US
          
          // If we have coordinates, center on them instead
          if (centerLat && centerLng && isValidLatLng()) {
            initialCenter = [parseFloat(centerLat), parseFloat(centerLng)];
            // Calculate zoom level based on radius - zoom out more to show context
            // Adjusted to show more area around the circle
            if (zoomRange <= 25) initialZoom = 10;
            else if (zoomRange <= 50) initialZoom = 9;
            else if (zoomRange <= 100) initialZoom = 8;
            else if (zoomRange <= 150) initialZoom = 7;
            else if (zoomRange <= 250) initialZoom = 6;
            else initialZoom = 6; // For max 250 miles
          }
          
          mapInstanceRef.current = L.map(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
          });

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

            // Add new marker with custom icon
            markerRef.current = L.marker([lat, lng], { icon: customIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup(`<strong>Map Center Location</strong><br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}<br/><em>Events will be filtered within ${zoomRange} miles of this point</em>`)
              .openPopup();

            // Add circle to show the radius
            circleRef.current = L.circle([lat, lng], {
              radius: zoomRange * 1609.34, // Convert miles to meters
              fillColor: '#1976d2',
              fillOpacity: 0.1,
              color: '#1976d2',
              weight: 2,
              dashArray: '5, 5'
            }).addTo(mapInstanceRef.current);
            
            // Zoom to fit the circle with extra space around it
            const bounds = circleRef.current.getBounds();
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
            // Zoom out one more level to show context around the circle
            setTimeout(() => {
              mapInstanceRef.current.zoomOut(1);
            }, 300);
          });
        }

        // If coordinates exist, add marker
        if (centerLat && centerLng && isValidLatLng()) {
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

          // Add marker for current coordinates
          markerRef.current = L.marker([lat, lng], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`<strong>Current Map Center</strong><br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}<br/><em>Events will be filtered within ${zoomRange} miles of this point</em>`);

          // Add circle to show the radius
          circleRef.current = L.circle([lat, lng], {
            radius: zoomRange * 1609.34, // Convert miles to meters
            fillColor: '#1976d2',
            fillOpacity: 0.1,
            color: '#1976d2',
            weight: 2,
            dashArray: '5, 5'
          }).addTo(mapInstanceRef.current);
        }
      }).catch((error) => {
        console.error('Error loading Leaflet:', error);
        setMessage({ type: 'error', text: 'Failed to load map' });
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [useCenterLocation, centerLat, centerLng, zoomRange]); // Added zoomRange to dependencies to update circle

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Prepare the update data with proper nested structure
      const updateData = {
        localUserInfo: {
          userDefaults: {
            useCenterLocation: useCenterLocation,
            defaultZoomRange: zoomRange,
            // Preserve existing data when switching modes
            // Only update the data for the current mode, keep the other mode's data intact
            masteredCityIds: selectedCityIds.length > 0 ? selectedCityIds : 
                           (userData?.localUserInfo?.userDefaults?.masteredCityIds || []),
            defaultCenterLocation: (centerLat && centerLng) ? {
              latitude: parseFloat(centerLat),  // Backend expects 'latitude'
              longitude: parseFloat(centerLng),  // Backend expects 'longitude'
              lat: parseFloat(centerLat),       // Also include 'lat' for useEvents
              lng: parseFloat(centerLng)        // Also include 'lng' for useEvents
            } : (userData?.localUserInfo?.userDefaults?.defaultCenterLocation || null)
          }
        }
      };

      console.log('Saving location preferences with nested structure:', updateData);
      
      // Call the update function
      await updateUserData(updateData);
      
      // Log what we think we saved
      console.log('Save completed. Expected saved cities:', selectedCityIds);
      
      // Update original values after successful save
      setOriginalValues({
        useCenterLocation,
        selectedCityIds: !useCenterLocation && selectedCityIds.length > 0 ? selectedCityIds : [],
        centerLat: useCenterLocation && centerLat ? centerLat : '',
        centerLng: useCenterLocation && centerLng ? centerLng : '',
        zoomRange
      });
      
      setMessage({ type: 'success', text: 'Location preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving location preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };


  const isValidLatLng = () => {
    const lat = parseFloat(centerLat);
    const lng = parseFloat(centerLng);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const hasChanges = () => {
    // Check if any values have changed from original
    if (useCenterLocation !== originalValues.useCenterLocation) return true;
    if (zoomRange !== originalValues.zoomRange) return true;
    
    // For city mode
    if (!useCenterLocation) {
      const cityIdsChanged = JSON.stringify(selectedCityIds.sort()) !== JSON.stringify(originalValues.selectedCityIds.sort());
      if (cityIdsChanged) return true;
    }
    
    // For map center mode
    if (useCenterLocation) {
      if (centerLat !== originalValues.centerLat || centerLng !== originalValues.centerLng) return true;
    }
    
    return false;
  };

  const canSave = () => {
    // Must have changes AND valid data
    if (!hasChanges()) return false;
    
    if (useCenterLocation) {
      return isValidLatLng();
    } else {
      return selectedCityIds.length > 0;
    }
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
          {saving ? 'Saving...' : hasChanges() ? 'Save Changes' : 'Save'}
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose how to filter events: select major cities from a list OR set a custom map location with distance radius.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Toggle between Major Cities and User Map Center */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ textAlign: 'center' }}>
          Event Location Filter Mode (Pick one)
        </Typography>
        
        <Box sx={{ position: 'relative' }}>
          <ToggleButtonGroup
            value={useCenterLocation ? 'map' : 'cities'}
            exclusive
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setUseCenterLocation(newValue === 'map');
              }
            }}
            fullWidth
            sx={{ 
              mb: 2,
              '& .MuiToggleButton-root': {
                py: 2,
                textTransform: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                alignItems: 'center',
                justifyContent: 'center',
              }
            }}
          >
          <ToggleButton value="cities" aria-label="filter by cities">
            <LocationOnIcon sx={{ fontSize: 32, color: !useCenterLocation ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" fontWeight={!useCenterLocation ? 'bold' : 'medium'} sx={{ textAlign: 'center' }}>
              Major Cities
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Filter by nearest major city
            </Typography>
          </ToggleButton>
          <ToggleButton value="map" aria-label="filter by map center">
            <MapIcon sx={{ fontSize: 32, color: useCenterLocation ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" fontWeight={useCenterLocation ? 'bold' : 'medium'} sx={{ textAlign: 'center' }}>
              Map Center
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Filter by distance radius
            </Typography>
          </ToggleButton>
          </ToggleButtonGroup>
          
          {/* OR divider */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 2,
              borderColor: 'divider',
              boxShadow: 1,
            }}
          >
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              OR
            </Typography>
          </Box>
          
          {/* Optional: Arrows on either side */}
          <SwapHorizIcon 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              fontSize: 60,
              color: 'divider',
              opacity: 0.3,
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {useCenterLocation 
            ? 'Events will be filtered by distance from your custom map center point'
            : 'Events will be filtered to show only those near your selected major cities'
          }
        </Typography>
      </Paper>

      {/* Multiple City Selection */}
      {!useCenterLocation && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 2,
            borderColor: !useCenterLocation ? 'primary.main' : 'divider',
            borderWidth: !useCenterLocation ? 2 : 1,
            bgcolor: !useCenterLocation ? 'action.hover' : 'background.paper',
            transition: 'all 0.3s ease'
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Select Your Major Cities
          </Typography>
          
          <Autocomplete
            multiple
            id="city-multi-select"
            options={cities}
            groupBy={(option) => option.divisionName || 'Other'}
            value={selectedCities}
            onChange={(event, newValue) => {
              setSelectedCities(newValue);
              setSelectedCityIds(newValue.map(city => city._id));
            }}
            getOptionLabel={(option) => {
              if (!option.cityName) return '';
              // For display in input/chips, show city with state
              return option.divisionName ? 
                `${option.cityName}, ${option.divisionName}` : 
                option.cityName;
            }}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disabled={!citiesLoaded}
            loading={!citiesLoaded}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const tagProps = getTagProps({ index });
                // Show city name with state abbreviation in chip
                const label = option.divisionName ? 
                  `${option.cityName}, ${option.divisionName}` : 
                  option.cityName;
                return (
                  <Chip
                    {...tagProps}
                    key={option._id}
                    variant="outlined"
                    label={label}
                    size="small"
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Major Cities"
                placeholder={selectedCities.length === 0 ? "Select one or more cities..." : ""}
                helperText={
                  !citiesLoaded ? "Loading cities..." :
                  selectedCities.length > 0 ? 
                    `${selectedCities.length} ${selectedCities.length === 1 ? 'city' : 'cities'} selected. Events near these major cities will be shown.` : 
                    selectedCityIds.length > 0 ?
                      "Loading saved city selections..." :
                      "Select one or more cities to filter events"
                }
              />
            )}
            renderOption={(props, option, { selected }) => {
              // Ensure we use _id as key for the list item
              const { key, ...otherProps } = props;
              return (
                <li key={option._id} {...otherProps}>
                  <Checkbox
                    icon={<LocationOnIcon />}
                    checkedIcon={<LocationOnIcon color="primary" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  <ListItemText 
                    primary={option.cityName}
                    secondary={option.regionName || 'Unknown Region'}
                  />
                </li>
              );
            }}
            sx={{ mt: 1 }}
          />
          
          {(selectedCities.length > 0 || (selectedCityIds.length > 0 && !citiesLoaded)) && (
            <Box sx={{ mt: 2 }}>
              {citiesLoaded && selectedCities.length > 0 ? (
                <>
                  <Typography variant="body2" color="success" sx={{ mb: 1 }}>
                    ✓ {selectedCities.length} major {selectedCities.length === 1 ? 'city' : 'cities'} selected
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Events near all selected major cities will be displayed in your calendar. You can add or remove cities anytime.
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="info.main">
                  Loading {selectedCityIds.length} saved city {selectedCityIds.length === 1 ? 'selection' : 'selections'}...
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* Lat/Lng Input */}
      {useCenterLocation && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 2,
            borderColor: useCenterLocation ? 'primary.main' : 'divider',
            borderWidth: useCenterLocation ? 2 : 1,
            bgcolor: useCenterLocation ? 'action.hover' : 'background.paper',
            transition: 'all 0.3s ease'
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Click Map to Set Your Center Location
          </Typography>

          {/* Interactive Map - Always visible */}
          <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Click anywhere on the map to set your center location
                </Typography>
                {centerLat && centerLng && isValidLatLng() && (
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                    📍 Showing {zoomRange} mile radius
                  </Typography>
                )}
              </Box>
              <Box
                ref={mapRef}
                sx={{
                  width: '100%',
                  height: 400,
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  cursor: 'crosshair',
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
            </Box>
          
          {/* Zoom Range Slider - Integrated with map section */}
          <Box sx={{ mt: 2 }}>
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
      )}

      {/* City Mode Info */}
      {!useCenterLocation && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: 'action.selected',
            borderColor: 'divider',
            opacity: 0.7
          }}
        >
          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            Major City Mode Filtering
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When using "Major City" mode, events will be filtered to show only those near your selected major cities. Events from the surrounding areas of all selected cities will be displayed.
          </Typography>
          {selectedCities.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'medium' }}>
              Currently filtering events near {selectedCities.length} selected major {selectedCities.length === 1 ? 'city' : 'cities'}.
            </Typography>
          )}
        </Paper>
      )}

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
          
          {!useCenterLocation ? (
            <Box>
              <Typography variant="body2">
                <strong>Filter Mode:</strong> Major Cities
              </Typography>
              <Typography variant="body2">
                <strong>Selected Cities:</strong> {selectedCities.map(c => 
                  c.divisionName ? `${c.cityName}, ${c.divisionName}` : c.cityName
                ).join('; ')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Map center coordinates will be cleared
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2">
                <strong>Filter Mode:</strong> Map Center
              </Typography>
              <Typography variant="body2">
                <strong>Center:</strong> {centerLat}, {centerLng}
              </Typography>
              <Typography variant="body2">
                <strong>Radius:</strong> {zoomRange} miles
              </Typography>
              <Typography variant="caption" color="text.secondary">
                City selections will be cleared
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      <Divider sx={{ mt: 3, mb: 2 }} />
      
      <Typography variant="body2" color="text.secondary">
        <strong>Note:</strong> These preferences will determine how events are filtered in your calendar view. 
        You can always temporarily change your location context using the location selector in the main menu.
      </Typography>
    </Box>
  );
};

UserSettingsLocationPreferences.propTypes = {
  userData: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
};

export default UserSettingsLocationPreferences;