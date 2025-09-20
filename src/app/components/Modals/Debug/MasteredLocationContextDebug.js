'use client';

import React from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import DebugJsonView from './DebugJsonView';
import { useLocationAPI } from '@/contexts/LocationAPIContext';

/**
 * Debug component for LocationAPIContext (formerly MasteredLocationContext)
 */
const MasteredLocationContextDebug = () => {
  const { loading, error, fetchNearestCity } = useLocationAPI() || {};
  
  const handleRefresh = () => {
    if (fetchNearestCity && window && window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchNearestCity(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to New York coordinates
          fetchNearestCity(40.7128, -74.0060);
        }
      );
    } else if (fetchNearestCity) {
      // Fallback to New York coordinates
      fetchNearestCity(40.7128, -74.0060);
    }
  };
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <LocationOnIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Location API Context Debug
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This view shows the current state of the LocationAPIContext, which provides location API services.
      </Alert>

      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh Nearest City
        </Button>
      </Box>

      <DebugJsonView 
        title="API Context State" 
        data={{ 
          loading,
          error,
          hasAPIFunctions: !!fetchNearestCity 
        }} 
        expandByDefault 
      />
      
      <DebugJsonView 
        title="Loading State" 
        data={{ loading }} 
      />
      
      <DebugJsonView 
        title="Error State" 
        data={{ error }} 
      />
    </Box>
  );
};

export default MasteredLocationContextDebug;