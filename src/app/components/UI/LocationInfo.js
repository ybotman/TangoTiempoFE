'use client';

import React from 'react';
import { Box, Chip, Typography, Tooltip, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

/**
 * LocationInfo - Displays current location information in the header
 * Shows the currently selected location hierarchy and provides reset option
 */
const LocationInfo = () => {
  const { 
    selectedLocation, 
    isLoading, 
    hasError, 
    resetToNearestLocation,
    refreshUserLocation,
    locationDisplayText,
    userLocation
  } = useGeoLocation();

  // Extract location components
  const { region, division, city } = selectedLocation;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexWrap: 'wrap',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '4px 8px',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LocationOnIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
        <Typography variant="body2" fontWeight="bold">
          Location:
        </Typography>
      </Box>

      {isLoading ? (
        <CircularProgress size={16} thickness={4} sx={{ ml: 1 }} />
      ) : hasError ? (
        <Tooltip title="Error detecting your location. Using default location.">
          <Chip 
            icon={<InfoOutlinedIcon fontSize="small" />}
            label="Location Error" 
            size="small" 
            color="error" 
            variant="outlined"
          />
        </Tooltip>
      ) : (
        <>
          <Tooltip title={`Currently viewing events in ${locationDisplayText}`}>
            <Box>
              {region.name && (
                <Chip 
                  label={`${region.name} Region`} 
                  size="small" 
                  color="primary" 
                  variant={division.name ? "outlined" : "filled"} 
                  sx={{ mr: 0.5 }}
                />
              )}
              
              {division.name && (
                <Chip 
                  label={`${division.name} Division`} 
                  size="small" 
                  color="primary" 
                  variant={city.name ? "outlined" : "filled"} 
                  sx={{ mr: 0.5 }}
                />
              )}
              
              {city.name && (
                <Chip 
                  label={`${city.name} City`} 
                  size="small" 
                  color="primary" 
                  variant="filled" 
                  sx={{ mr: 0.5 }}
                />
              )}
            </Box>
          </Tooltip>
          
          <Tooltip title="Reset to your IP-based location">
            <Chip
              icon={<MyLocationIcon fontSize="small" />}
              label="Reset Location"
              size="small"
              color="secondary"
              variant="outlined"
              onClick={refreshUserLocation}
              clickable
            />
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default LocationInfo;