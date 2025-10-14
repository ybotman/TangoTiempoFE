'use client';

import React, { useState, useEffect } from 'prop-types';
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
const NoEventsAlert = ({ events, eventsLoading, onOpenMapCenter, sx = {} }) => {
  const [dismissed, setDismissed] = useState(false);

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
    if (events && events.length > 0) {
      setDismissed(false);
      sessionStorage.removeItem('noEventsAlertDismissed');
    }
  }, [events?.length]);

  // Don't show if:
  // - Still loading
  // - Events exist
  // - User dismissed the alert
  if (eventsLoading || !events || events.length > 0 || dismissed) {
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
          No events found in this area and date range. Try adjusting your Map Center location to see more events.
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<LocationOnIcon />}
          onClick={onOpenMapCenter}
          sx={{ mt: 1 }}
        >
          Adjust Map Center
        </Button>
      </Alert>
    </Box>
  );
};

NoEventsAlert.propTypes = {
  events: PropTypes.array.isRequired,
  eventsLoading: PropTypes.bool.isRequired,
  onOpenMapCenter: PropTypes.func.isRequired,
  sx: PropTypes.object
};

export default NoEventsAlert;
