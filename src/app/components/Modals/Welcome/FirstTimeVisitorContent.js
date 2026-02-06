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
  Link
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';

/**
 * FirstTimeVisitorContent Component
 *
 * @param {Object} props
 * @param {Function} props.onSelectLocation - Callback when user clicks "Select My Location"
 * @param {Function} props.onSignup - Callback when user clicks "Sign Up"
 * @param {Function} props.onLogin - Callback when user clicks "Login" link
 */
// eslint-disable-next-line react/prop-types
const FirstTimeVisitorContent = ({ onSelectLocation, onSignup, onLogin }) => {
  return (
    <>
      <DialogTitle id="welcome-modal-title" sx={{ textAlign: 'center', pb: 1 }}>
        <PublicIcon sx={{ fontSize: 60, color: '#1976d2', mb: 1 }} />
        <Typography variant="h4" component="div" gutterBottom>
          Welcome to Tango Tiempo!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Rolling out nationwide through 2026
        </Typography>
      </DialogTitle>

      <DialogContent id="welcome-modal-description">
        {/* Mission Statement */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            We&apos;re building the most comprehensive Argentine Tango calendar in the US,
            and we need your help!
          </Typography>
          <Typography variant="body1" paragraph>
            Help us get better informed about Argentine Tango by encouraging your local
            event organizers to add their events to this free calendar. Together, we can
            make it easier for dancers everywhere to discover tango opportunities.
          </Typography>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <LocationOnIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Get Started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select your location to see events near you
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 2 }}>
        {/* Login link row */}
        <Box sx={{ width: '100%', textAlign: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              onClick={onLogin}
              sx={{ cursor: 'pointer' }}
            >
              Login
            </Link>
          </Typography>
        </Box>

        {/* Button row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
          <Button
            onClick={onSignup}
            variant="outlined"
            size="large"
          >
            Sign Up
          </Button>
          <Button
            onClick={onSelectLocation}
            variant="contained"
            size="large"
            startIcon={<LocationOnIcon />}
          >
            Select My Location
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};

export default FirstTimeVisitorContent;
