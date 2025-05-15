'use client';

import React, { useContext } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import DebugJsonView from './DebugJsonView';
import { RegionsContext } from '@/contexts/RegionsContext';

/**
 * Debug component for RegionsContext
 */
const RegionsContextDebug = () => {
  const regionsContext = useContext(RegionsContext) || {};

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