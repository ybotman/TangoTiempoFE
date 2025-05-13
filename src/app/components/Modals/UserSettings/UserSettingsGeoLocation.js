// src/components/Modals/UserSettings/UserSettingsGeoLocation.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Divider, Grid, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PublicIcon from '@mui/icons-material/Public';

const UserSettingsGeoLocation = ({ geoLocation }) => {
  // Extract all location information from the geoLocation context
  const {
    userLocation,
    selectedLocation,
    userLocationLoading,
    hasSelectedCity,
    hasSelectedDivision,
    hasSelectedRegion,
    getLocationHierarchyDisplay
  } = geoLocation || {};

  // Format coordinates for display
  const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return 'Unknown';
    }
    return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
  };

  // Get a display string for a location with fallbacks
  const getLocationDisplay = (location) => {
    if (!location) return 'None selected';
    
    if (typeof location === 'string') return location;
    
    if (location.name) return location.name;
    
    if (location.coordinates) {
      return formatCoordinates(location.coordinates);
    }
    
    return 'Unknown';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Geographic Location Settings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This information shows your detected location and your currently selected location context for filtering events.
      </Typography>
      
      {/* IP-based User Location */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MyLocationIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Detected Location</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {userLocationLoading ? (
          <Typography>Detecting your location...</Typography>
        ) : userLocation ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
              <Typography>
                {userLocation.coordinates ? 
                  formatCoordinates(userLocation.coordinates) : 
                  'Not available'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Source:</Typography>
              <Typography>{userLocation.source || 'IP Geolocation'}</Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography>Unable to detect your location</Typography>
        )}
      </Paper>
      
      {/* Selected Location Context */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Selected Location for Events</Typography>
          
          {getLocationHierarchyDisplay && (
            <Chip 
              label={getLocationHierarchyDisplay()} 
              size="small" 
              color="secondary" 
              sx={{ ml: 'auto' }} 
            />
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Region:</Typography>
            <Typography>
              {hasSelectedRegion && selectedLocation?.region ? 
                getLocationDisplay(selectedLocation.region) : 
                'None selected'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">Division/State:</Typography>
            <Typography>
              {hasSelectedDivision && selectedLocation?.division ? 
                getLocationDisplay(selectedLocation.division) : 
                'None selected'}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">City:</Typography>
            <Typography>
              {hasSelectedCity && selectedLocation?.city ? 
                getLocationDisplay(selectedLocation.city) : 
                'None selected'}
            </Typography>
          </Grid>
        </Grid>
        
        {selectedLocation?.coordinates && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">Selected Coordinates:</Typography>
            <Typography>{formatCoordinates(selectedLocation.coordinates)}</Typography>
          </Box>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Note: To change your selected location, use the location selector in the main menu.
      </Typography>
    </Box>
  );
};

UserSettingsGeoLocation.propTypes = {
  userData: PropTypes.object,
  geoLocation: PropTypes.shape({
    userLocation: PropTypes.object,
    selectedLocation: PropTypes.object,
    userLocationLoading: PropTypes.bool,
    hasSelectedCity: PropTypes.bool,
    hasSelectedDivision: PropTypes.bool,
    hasSelectedRegion: PropTypes.bool,
    getLocationHierarchyDisplay: PropTypes.func
  })
};

export default UserSettingsGeoLocation;