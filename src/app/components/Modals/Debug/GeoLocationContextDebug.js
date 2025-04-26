'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  Alert, 
  Paper,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import DebugJsonView from './DebugJsonView';

/**
 * Debug component for GeoLocationContext
 * 
 * Shows current state and allows manual update of location data.
 */
const GeoLocationContextDebug = () => {
  const geoLocation = useGeoLocation();
  const { 
    selectedLocation, 
    userLocation, 
    isLoading, 
    hasError, 
    errorState, 
    loadingState,
    refreshUserLocation,
    resetToNearestLocation,
    selectLocation
  } = geoLocation;

  // For manual setting of coordinates
  const [manualLatitude, setManualLatitude] = useState(selectedLocation.city.latitude || '');
  const [manualLongitude, setManualLongitude] = useState(selectedLocation.city.longitude || '');
  
  // Northeast region defaults for city selection
  const [manualCity, setManualCity] = useState({
    id: selectedLocation.city.id || '6751f58a5db435dd8005e479', // Boston
    name: selectedLocation.city.name || 'Boston',
    regionID: selectedLocation.region.id || '6751f58a5db435dd8005e45b', // Northeast
    regionName: selectedLocation.region.name || 'Northeast',
    divisionID: selectedLocation.division.id || '6751f58a5db435dd8005e461', // New England
    divisionName: selectedLocation.division.name || 'New England',
    countryID: selectedLocation.country.id || '6751f57e2e74d97609e7dca0', // USA
    countryName: selectedLocation.country.name || 'United States'
  });

  // Pre-defined test cities
  const testCities = [
    {
      id: '6751f58a5db435dd8005e479',
      name: 'Boston',
      regionID: '6751f58a5db435dd8005e45b',
      regionName: 'Northeast',
      divisionID: '6751f58a5db435dd8005e461',
      divisionName: 'New England',
      countryID: '6751f57e2e74d97609e7dca0',
      countryName: 'United States',
      latitude: 42.3601,
      longitude: -71.0589
    },
    {
      id: '6751f58a5db435dd8005e47f',
      name: 'New York',
      regionID: '6751f58a5db435dd8005e45b',
      regionName: 'Northeast',
      divisionID: '6751f58a5db435dd8005e462',
      divisionName: 'Mid-Atlantic',
      countryID: '6751f57e2e74d97609e7dca0',
      countryName: 'United States',
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      id: '6751f58a5db435dd8005e48a',
      name: 'Chicago',
      regionID: '6751f58a5db435dd8005e45c',
      regionName: 'Midwest',
      divisionID: '6751f58a5db435dd8005e465',
      divisionName: 'East North Central',
      countryID: '6751f57e2e74d97609e7dca0',
      countryName: 'United States',
      latitude: 41.8781,
      longitude: -87.6298
    }
  ];

  const handleManualLocationUpdate = () => {
    // Update the selected location with our manual entry
    selectLocation({
      country: { 
        id: manualCity.countryID, 
        name: manualCity.countryName 
      },
      region: { 
        id: manualCity.regionID, 
        name: manualCity.regionName 
      },
      division: { 
        id: manualCity.divisionID, 
        name: manualCity.divisionName 
      },
      city: { 
        id: manualCity.id, 
        name: manualCity.name,
        latitude: parseFloat(manualLatitude),
        longitude: parseFloat(manualLongitude)
      }
    });
  };

  const handleTestCitySelect = (event) => {
    const selectedCity = testCities.find(city => city.id === event.target.value);
    if (selectedCity) {
      setManualCity(selectedCity);
      setManualLatitude(selectedCity.latitude);
      setManualLongitude(selectedCity.longitude);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <LocationOnIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          GeoLocation Context Debug
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This view shows the current state of the GeoLocationContext, which manages location selection for the application.
        You can use the controls below to refresh the user's location or manually override it.
      </Alert>

      {/* Status indicators */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2">Loading Status</Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: isLoading ? 'warning.main' : 'success.main',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'LOADING' : 'READY'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2">Error Status</Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: hasError ? 'error.main' : 'success.main',
                fontWeight: 'bold'
              }}
            >
              {hasError ? 'ERROR' : 'OK'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2">Selected City</Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: selectedLocation.city.id ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}
            >
              {selectedLocation.city.id ? selectedLocation.city.name : 'NOT SELECTED'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Actions</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={refreshUserLocation}
            disabled={isLoading}
          >
            Refresh Location
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={resetToNearestLocation}
            disabled={isLoading}
          >
            Reset to Nearest
          </Button>
        </Box>
      </Box>

      {/* Manual Location Override */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Override Location</Typography>
        
        <Box mb={3}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="test-city-select-label">Test City</InputLabel>
            <Select
              labelId="test-city-select-label"
              id="test-city-select"
              value={manualCity.id}
              label="Test City"
              onChange={handleTestCitySelect}
            >
              {testCities.map(city => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}, {city.divisionName}, {city.regionName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <TextField
              label="Latitude"
              value={manualLatitude}
              onChange={(e) => setManualLatitude(e.target.value)}
              fullWidth
              type="number"
              inputProps={{ step: 0.0001 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Longitude"
              value={manualLongitude}
              onChange={(e) => setManualLongitude(e.target.value)}
              fullWidth
              type="number"
              inputProps={{ step: 0.0001 }}
            />
          </Grid>
        </Grid>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={handleManualLocationUpdate}
          disabled={!manualLatitude || !manualLongitude}
        >
          Set Location
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Current State */}
      <Typography variant="h6" gutterBottom>Current State</Typography>
      
      <DebugJsonView 
        title="Selected Location" 
        data={selectedLocation} 
        expandByDefault
      />
      
      <DebugJsonView 
        title="User Location" 
        data={userLocation} 
      />
      
      <DebugJsonView 
        title="Loading State" 
        data={loadingState} 
      />
      
      <DebugJsonView 
        title="Error State" 
        data={errorState} 
      />
      
      <DebugJsonView 
        title="Full Context" 
        data={geoLocation} 
      />
    </Box>
  );
};

export default GeoLocationContextDebug;