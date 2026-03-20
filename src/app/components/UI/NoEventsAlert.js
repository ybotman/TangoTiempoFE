'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Button, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
const NoEventsAlert = ({ events, eventsLoading, noLocationSelected, onOpenMapCenter, sx = {} }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // TIEMPO-381: Track Boston route for conditional rendering
  const [isBostonRoute, setIsBostonRoute] = useState(false);

  useEffect(() => {
    setIsBostonRoute(window.location.pathname.includes('/boston'));
  }, []);

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
    if (!eventsLoading && events && events.length === 0 && !dismissed) {
      // Wait 1 second before showing the alert
      timer = setTimeout(() => {
        setShowAlert(true);
      }, 1000);
    } else {
      setShowAlert(false);
    }
    return () => clearTimeout(timer);
  }, [eventsLoading, events, dismissed]);

  // Don't show if:
  // - No location selected yet (user hasn't set map center)
  // - Still loading
  // - Events exist
  // - User dismissed the alert
  // - Delay hasn't passed yet
  if (noLocationSelected || eventsLoading || !events || events.length > 0 || dismissed || !showAlert) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Alert
        severity="info"
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
          }
        }}
      >
        <AlertTitle>No Events Found</AlertTitle>
        <Box sx={{ mb: 1 }}>
          {isBostonRoute
            ? 'No events found in Boston area for this date range. Check back soon or explore more regions!'
            : 'No events found in this area and date range. Try adjusting your Map Center location to see more events. Local organizers are invited to add their tango events to this free calendar!'
          }
        </Box>
        {isBostonRoute ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<LocationOnIcon />}
            href="https://www.tangotiempo.com/calendar"
            sx={{ mt: 1 }}
          >
            Explore All Regions
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<LocationOnIcon />}
            onClick={onOpenMapCenter}
            sx={{ mt: 1 }}
          >
            Adjust Map Center
          </Button>
        )}
      </Alert>
    </Box>
  );
};

NoEventsAlert.propTypes = {
  events: PropTypes.array.isRequired,
  eventsLoading: PropTypes.bool.isRequired,
  noLocationSelected: PropTypes.bool,
  onOpenMapCenter: PropTypes.func.isRequired,
  sx: PropTypes.object
};

export default NoEventsAlert;
