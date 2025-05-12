'use client';

import React from 'react';
import { Box, Chip, Typography, Tooltip, CircularProgress, Badge } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useEvents } from '@/hooks/useEvents';

/**
 * LocationInfo - Displays current location information in the header
 * Shows the currently selected location hierarchy and provides reset option
 */
const LocationInfo = () => {
  const {
    selectedLocation,
    isLoading,
    refreshUserLocation,
    locationDisplayText
  } = useGeoLocation();
  
  // Get event counts for different location levels
  // First, get events for the region level only
  const { 
    events: regionEvents, 
    loading: regionLoading,
    error: regionError
  } = useEvents(
    selectedLocation.region.name || '',
    '', // No division filter
    '', // No city filter
    null, // No date filters for counts
    null
  );
  
  // Get events for the division level (region + division)
  const divisionFilterActive = !!selectedLocation.division.name;
  const { 
    events: divisionEvents,
    loading: divisionLoading,
    error: divisionError
  } = useEvents(
    selectedLocation.region.name || '',
    divisionFilterActive ? (selectedLocation.division.name || '') : '',
    '', // No city filter
    null,
    null
  );
  
  // Get events for the city level (region + division + city)
  const cityFilterActive = !!selectedLocation.city.name;
  const { 
    events: cityEvents,
    loading: cityLoading,
    error: cityError
  } = useEvents(
    selectedLocation.region.name || '',
    selectedLocation.division.name || '',
    cityFilterActive ? (selectedLocation.city.name || '') : '',
    null,
    null
  );
  
  // Aggregated loading state for the event counts
  const aggregatedLoading = regionLoading || divisionLoading || cityLoading;
  
  // Use fallback values for event counts if there are errors
  const regionCount = regionEvents?.length || 0;
  const divisionCount = divisionEvents?.length || 0;
  const cityCount = cityEvents?.length || 0;

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
      ) : (
        <>
          <Tooltip title={`Currently viewing events in ${locationDisplayText}`}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {region.name && (
                <Badge 
                  badgeContent={regionLoading ? '...' : regionCount} 
                  color="secondary"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  max={999}
                >
                  <Chip 
                    label={`${region.name} Region`} 
                    size="small" 
                    color="primary" 
                    variant={division.name ? "outlined" : "filled"} 
                    sx={{ mr: 0.5 }}
                  />
                </Badge>
              )}
              
              {division.name && (
                <Badge 
                  badgeContent={divisionLoading ? '...' : divisionCount} 
                  color="secondary"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  max={999}
                >
                  <Chip 
                    label={`${division.name} Division`} 
                    size="small" 
                    color="primary" 
                    variant={city.name ? "outlined" : "filled"} 
                    sx={{ mr: 0.5 }}
                  />
                </Badge>
              )}
              
              {city.name && (
                <Badge 
                  badgeContent={cityLoading ? '...' : cityCount} 
                  color="secondary"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  max={999}
                >
                  <Chip 
                    label={`${city.name} City`} 
                    size="small" 
                    color="primary" 
                    variant="filled" 
                    sx={{ mr: 0.5 }}
                  />
                </Badge>
              )}
            </Box>
          </Tooltip>
          
          <Tooltip title="Reset to your nearest location based on IP address">
            <Chip
              icon={<MyLocationIcon fontSize="small" />}
              label="Near Me"
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