'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import DebugJsonView from './DebugJsonView';
import { useContext } from 'react';

/**
 * Debug component for RegionsContext
 */
const RegionsContextDebug = () => {
  let RegionsContext;
  let regionsContext = {};
  
  try {
    RegionsContext = require('@/contexts/RegionsContext').RegionsContext;
    if (RegionsContext) {
      regionsContext = useContext(RegionsContext) || {};
    }
  } catch (error) {
    console.error('Error importing RegionsContext:', error);
  }
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <LanguageIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Regions Context Debug
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        This context is deprecated and will be replaced with GeoLocationContext in the future.
      </Alert>

      <DebugJsonView title="Regions Context State" data={regionsContext} expandByDefault />
    </Box>
  );
};

export default RegionsContextDebug;