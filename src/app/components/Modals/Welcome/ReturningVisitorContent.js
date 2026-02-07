/**
 * ReturningVisitorContent - Welcome back banner for returning anonymous visitors
 *
 * Shows subtle welcome message with last known location
 *
 * Part of TIEMPO-329: Managed User Entry Flow
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getLastMapCenter } from '@/utils/visitorTracking';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

/**
 * ReturningVisitorContent Component
 *
 * Shows a welcome back message with restored location info
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback when user closes banner
 */
// eslint-disable-next-line react/prop-types
const ReturningVisitorContent = ({ onClose }) => {
  const { openMapCenterModal } = useGeoLocation();
  const [lastCenter, setLastCenter] = useState(null);

  useEffect(() => {
    // Load last map center from localStorage
    const center = getLastMapCenter();
    setLastCenter(center);

    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleChangeLocation = () => {
    onClose();
    // Small delay to let banner close first
    setTimeout(() => {
      openMapCenterModal();
    }, 300);
  };

  return (
    <>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <WavingHandIcon sx={{ fontSize: 50, color: '#1976d2', mb: 1 }} />
        <Typography variant="h5" component="div">
          Welcome Back!
        </Typography>
      </DialogTitle>

      <DialogContent>
        {lastCenter ? (
          <Alert
            severity="success"
            icon={<LocationOnIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body1">
              We&apos;ve restored your location preferences
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Viewing events near: <strong>
                {lastCenter.lat.toFixed(4)}, {lastCenter.lng.toFixed(4)}
              </strong> ({lastCenter.zoomRange || 50}-mile radius)
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body1">
              Good to see you again! Select your location to view events.
            </Typography>
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This banner will auto-dismiss in 10 seconds
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Continue
        </Button>
        <Button
          onClick={handleChangeLocation}
          variant="outlined"
          startIcon={<LocationOnIcon />}
        >
          Change Location
        </Button>
      </DialogActions>
    </>
  );
};

export default ReturningVisitorContent;
