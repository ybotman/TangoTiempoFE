'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Button, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import { RoleContext } from '@/contexts/RoleContext';
import { getVisitCount } from '@/utils/visitorTracking';

// TIEMPO-XXX: Elevated users don't need "no events" prompts - they know the system
const ELEVATED_ROLES = ['RegionalOrganizer', 'RegionalAdmin', 'SystemAdmin', 'SystemOwner'];
// TIEMPO-XXX: After 30 visits, assume user knows how to use map center
const VISIT_THRESHOLD = 30;
// Auto-dismiss after 8 seconds
const AUTO_DISMISS_MS = 8000;

/**
 * NoEventsAlert - Displays helpful message when no events are found
 *
 * Shows an informational alert suggesting users check their Map Center location
 * when the events array is empty and data has finished loading.
 *
 * Features:
 * - Dismissible with session persistence
 * - Action button to open Map Center modal
 * - MUI Alert component for consistent styling
 * - Responsive design
 *
 * @param {Object} props
 * @param {Array} props.events - Array of calendar events
 * @param {boolean} props.eventsLoading - Loading state for events
 * @param {Function} props.onOpenMapCenter - Callback to open Map Center modal
 * @param {Object} [props.sx] - Optional MUI sx prop for custom styling
 */
const NoEventsAlert = ({ events, eventsLoading, noLocationSelected, onOpenMapCenter, currentLocation, sx = {} }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { selectedRole } = useContext(RoleContext);

  // TIEMPO-381: Track Boston route for conditional rendering
  const [isBostonRoute, setIsBostonRoute] = useState(false);
  // TIEMPO-XXX: Track if user is elevated or experienced
  const [shouldSuppress, setShouldSuppress] = useState(false);

  useEffect(() => {
    setIsBostonRoute(window.location.pathname.includes('/boston'));
  }, []);

  // TIEMPO-XXX: Suppress for elevated users and experienced visitors
  useEffect(() => {
    const isElevated = ELEVATED_ROLES.includes(selectedRole);
    const isExperienced = getVisitCount() >= VISIT_THRESHOLD;
    setShouldSuppress(isElevated || isExperienced);
  }, [selectedRole]);

  // Check sessionStorage for dismissed state on mount
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('noEventsAlertDismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('noEventsAlertDismissed', 'true');
  };

  // Reset dismissed state when events change (new search/filter)
  useEffect(() => {
    if (events?.length > 0) {
      setDismissed(false);
      setShowAlert(false);
      sessionStorage.removeItem('noEventsAlertDismissed');
    }
  }, [events?.length]);

  // TIEMPO-388: Delay showing "No events" to avoid flash during initial load
  // Only show after 1 second of no events (after loading completes)
  useEffect(() => {
    let timer;
    if (!eventsLoading && events && events.length === 0 && !dismissed && !shouldSuppress) {
      // Wait 1 second before showing the alert
      timer = setTimeout(() => {
        setShowAlert(true);
      }, 1000);
    } else {
      setShowAlert(false);
    }
    return () => clearTimeout(timer);
  }, [eventsLoading, events, dismissed, shouldSuppress]);

  // TIEMPO-XXX: Auto-dismiss after 8 seconds (only for ANON/NU)
  useEffect(() => {
    let autoDismissTimer;
    if (showAlert && !shouldSuppress) {
      autoDismissTimer = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_MS);
    }
    return () => clearTimeout(autoDismissTimer);
  }, [showAlert, shouldSuppress]);

  // Don't show if:
  // - No location selected yet (user hasn't set map center)
  // - Still loading
  // - Events exist
  // - User dismissed the alert
  // - Delay hasn't passed yet
  // - User is elevated (RO/RA/Admin) or experienced (30+ visits)
  if (noLocationSelected || eventsLoading || !events || events.length > 0 || dismissed || !showAlert || shouldSuppress) {
    return null;
  }

  // Build location info string if available
  const locationInfo = currentLocation?.cityName
    ? `${currentLocation.cityName} (${currentLocation.zoomRange || 50}mi)`
    : currentLocation?.zoomRange
      ? `${currentLocation.zoomRange}mi radius`
      : null;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Alert
        severity="info"
        icon={<MapIcon fontSize="small" />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          '.MuiAlert-message': {
            width: '100%'
          },
          py: 1
        }}
      >
        <AlertTitle sx={{ fontSize: '0.9rem', mb: 0.5 }}>No Events Found</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {isBostonRoute
            ? 'No events in Boston area for this date range.'
            : locationInfo
              ? `No events within ${locationInfo}.`
              : 'No events in this area and date range.'
          }
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {isBostonRoute ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<LocationOnIcon />}
              href="https://www.tangotiempo.com/calendar"
            >
              Explore All Regions
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              startIcon={<LocationOnIcon />}
              onClick={onOpenMapCenter}
            >
              Change Location
            </Button>
          )}
          <Typography variant="caption" color="text.secondary">
            Tip: Use 🗺️ icon anytime
          </Typography>
        </Box>
      </Alert>
    </Box>
  );
};

NoEventsAlert.propTypes = {
  events: PropTypes.array.isRequired,
  eventsLoading: PropTypes.bool.isRequired,
  noLocationSelected: PropTypes.bool,
  onOpenMapCenter: PropTypes.func.isRequired,
  currentLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    zoomRange: PropTypes.number,
    cityName: PropTypes.string
  }),
  sx: PropTypes.object
};

export default NoEventsAlert;
