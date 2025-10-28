/**
 * FirstTimeVisitorContent - Welcome screen for brand new visitors
 *
 * Shows deployment map, explains app purpose, and prompts for location selection
 *
 * Part of TIEMPO-329: Managed User Entry Flow
 */

'use client';

import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';

/**
 * FirstTimeVisitorContent Component
 *
 * @param {Object} props
 * @param {Function} props.onGetStarted - Callback when user clicks "Get Started"
 * @param {Function} props.onSkip - Callback when user clicks "Skip"
 */
const FirstTimeVisitorContent = ({ onGetStarted, onSkip }) => {
  return (
    <>
      <DialogTitle id="welcome-modal-title" sx={{ textAlign: 'center', pb: 1 }}>
        <PublicIcon sx={{ fontSize: 60, color: '#1976d2', mb: 1 }} />
        <Typography variant="h4" component="div" gutterBottom>
          Welcome to Tango Tiempo!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your gateway to tango events across the nation
        </Typography>
      </DialogTitle>

      <DialogContent id="welcome-modal-description">
        {/* App Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            Discover tango events in your area and beyond. From weekly practicas to
            international festivals, find your next dance adventure.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Deployment Statistics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            Events Nationwide
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h4" color="primary">1,200+</Typography>
              <Typography variant="body2" color="text.secondary">
                Active Events
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h4" color="primary">350+</Typography>
              <Typography variant="body2" color="text.secondary">
                Venues
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h4" color="primary">75+</Typography>
              <Typography variant="body2" color="text.secondary">
                Cities
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h4" color="primary">45+</Typography>
              <Typography variant="body2" color="text.secondary">
                States
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <LocationOnIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Select Your Location to Get Started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We'll show you events in your area
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button
          onClick={onSkip}
          color="inherit"
        >
          Skip for Now
        </Button>
        <Button
          onClick={onGetStarted}
          variant="contained"
          size="large"
          startIcon={<LocationOnIcon />}
        >
          Select My Location
        </Button>
      </DialogActions>
    </>
  );
};

export default FirstTimeVisitorContent;
