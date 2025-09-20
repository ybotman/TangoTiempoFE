'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Skeleton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudIcon from '@mui/icons-material/Cloud';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useCloudFlareData } from '@/hooks/useCloudFlareData';

/**
 * CloudFlareDebug Component
 * Displays CloudFlare IP geolocation data in the debug menu
 */
const CloudFlareDebug = () => {
  const { cfData, isLoading, isAvailable } = useCloudFlareData();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getDataAge = (timestamp) => {
    if (!timestamp) return null;
    const age = Date.now() - timestamp;
    const minutes = Math.floor(age / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <Box>
      {/* Status Alert */}
      <Alert 
        severity={isAvailable ? "success" : "warning"} 
        icon={<CloudIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body1">
          CloudFlare: {isAvailable ? 'Active' : 'No Data Available'}
        </Typography>
        {isAvailable && cfData?.timestamp && (
          <Typography variant="caption" color="text.secondary">
            Last updated: {getDataAge(cfData.timestamp)}
          </Typography>
        )}
      </Alert>

      {isAvailable && cfData ? (
        <>
          {/* IP Information Section */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NetworkCheckIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">IP Information</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">IP Address</Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {cfData.ipAddress || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ray ID</Typography>
                <Typography variant="body1" fontFamily="monospace" noWrap>
                  {cfData.rayId || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Protocol</Typography>
                <Chip 
                  label={cfData.protocol.toUpperCase()} 
                  size="small" 
                  color={cfData.protocol === 'https' ? 'success' : 'default'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Worker Status</Typography>
                <Chip 
                  label={cfData.workerActive ? 'Active' : 'Inactive'} 
                  size="small" 
                  color={cfData.workerActive ? 'success' : 'default'}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Location Information Section */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Location Information</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">City</Typography>
                <Typography variant="body1">
                  {cfData.city || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Region</Typography>
                <Typography variant="body1">
                  {cfData.region || 'Not available'}
                  {cfData.regionCode && ` (${cfData.regionCode})`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Country</Typography>
                <Typography variant="body1">
                  {cfData.country || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Continent</Typography>
                <Typography variant="body1">
                  {cfData.continent || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Timezone</Typography>
                <Typography variant="body1">
                  {cfData.timezone || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Postal Code</Typography>
                <Typography variant="body1">
                  {cfData.postalCode || 'Not available'}
                </Typography>
              </Grid>
              {(cfData.latitude && cfData.longitude) && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Latitude</Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {cfData.latitude.toFixed(4)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Longitude</Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {cfData.longitude.toFixed(4)}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Timestamp Section */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Timestamp</Typography>
            </Box>
            <Typography variant="body1">
              {formatTimestamp(cfData.timestamp)}
            </Typography>
          </Paper>

          {/* Raw Data Accordion */}
          <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Raw CloudFlare Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              >
                {JSON.stringify(cfData.raw, null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      ) : (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <CloudIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No CloudFlare geolocation data available.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            CloudFlare headers may not be present in this environment.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CloudFlareDebug;