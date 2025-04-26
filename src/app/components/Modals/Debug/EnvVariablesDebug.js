'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DebugJsonView from './DebugJsonView';

/**
 * Debug component for displaying environment variables
 * Only shows whitelisted environment variables for safety
 */
const EnvVariablesDebug = () => {
  const [envVars, setEnvVars] = useState({});
  
  useEffect(() => {
    // Only collect whitelisted environment variables (no secrets!)
    const safeEnvVars = {
      // Application Info
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APPLICATION_ID: process.env.NEXT_PUBLIC_APPLICATION_ID,
      
      // API Endpoints
      NEXT_PUBLIC_BE_URL: process.env.NEXT_PUBLIC_BE_URL,
      
      // Feature Flags
      NEXT_PUBLIC_GEOLOCATION_ENABLED: process.env.NEXT_PUBLIC_GEOLOCATION_ENABLED,
      NEXT_PUBLIC_MAP_DEBUG: process.env.NEXT_PUBLIC_MAP_DEBUG,
      
      // Build Info
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME,
      
      // Other safe public vars
      NEXT_PUBLIC_MAP_PROVIDER: process.env.NEXT_PUBLIC_MAP_PROVIDER
    };
    
    setEnvVars(safeEnvVars);
  }, []);
  
  // Group environment variables by category
  const categories = {
    'Application': ['NODE_ENV', 'NEXT_PUBLIC_APPLICATION_ID'],
    'API Endpoints': ['NEXT_PUBLIC_BE_URL'],
    'Feature Flags': ['NEXT_PUBLIC_GEOLOCATION_ENABLED', 'NEXT_PUBLIC_MAP_DEBUG'],
    'Build Info': ['NEXT_PUBLIC_APP_VERSION', 'NEXT_PUBLIC_BUILD_TIME'],
    'Other': ['NEXT_PUBLIC_MAP_PROVIDER']
  };
  
  // Check if env variables are defined
  const getVarStatus = (value) => {
    if (value === undefined || value === null || value === '') {
      return 'missing';
    }
    return 'defined';
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <CodeIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Environment Variables
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This view shows whitelisted environment variables. For security reasons, sensitive values 
        like API keys and secrets are not displayed.
      </Alert>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">Current Environment: {process.env.NODE_ENV || 'Unknown'}</Typography>
        <Typography variant="body2">
          {process.env.NODE_ENV === 'production' 
            ? 'Production mode is active - be careful with any changes!' 
            : 'Development mode is active'}
        </Typography>
      </Alert>

      {/* Environment Variables Table */}
      {Object.entries(categories).map(([category, varNames]) => (
        <Box key={category} mb={3}>
          <Typography variant="h6" gutterBottom>{category}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="40%"><strong>Variable</strong></TableCell>
                  <TableCell width="45%"><strong>Value</strong></TableCell>
                  <TableCell width="15%"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {varNames.map(varName => {
                  const value = envVars[varName];
                  const status = getVarStatus(value);
                  
                  return (
                    <TableRow key={varName}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {varName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {value || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status} 
                          size="small"
                          color={status === 'defined' ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {/* All Environment Variables */}
      <Box mt={4}>
        <DebugJsonView title="All Environment Variables" data={envVars} />
      </Box>
    </Box>
  );
};

export default EnvVariablesDebug;