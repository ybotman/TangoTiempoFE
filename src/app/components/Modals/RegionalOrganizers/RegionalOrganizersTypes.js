'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const RegionalOrganizerTypes = ({ organizerId, organizer, updateOrganizer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [types, setTypes] = useState({
    isEventOrganizer: true,
    isVenue: false,
    isTeacher: false,
    isMaestro: false,
    isDJ: false,
    isOrchestra: false,
    isTaxiDancer: false,
  });

  const [initialTypes, setInitialTypes] = useState({});
  const [pendingVenueRequest, setPendingVenueRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (organizer) {
      const organizerTypes = organizer.organizerTypes || {};
      setTypes({
        isEventOrganizer: organizerTypes.isEventOrganizer ?? true,
        isVenue: organizerTypes.isVenue ?? false,
        isTeacher: organizerTypes.isTeacher ?? false,
        isMaestro: organizerTypes.isMaestro ?? false,
        isDJ: organizerTypes.isDJ ?? false,
        isOrchestra: organizerTypes.isOrchestra ?? false,
        isTaxiDancer: organizerTypes.isTaxiDancer ?? false,
      });

      setInitialTypes({
        isEventOrganizer: organizerTypes.isEventOrganizer ?? true,
        isVenue: organizerTypes.isVenue ?? false,
        isTeacher: organizerTypes.isTeacher ?? false,
        isMaestro: organizerTypes.isMaestro ?? false,
        isDJ: organizerTypes.isDJ ?? false,
        isOrchestra: organizerTypes.isOrchestra ?? false,
        isTaxiDancer: organizerTypes.isTaxiDancer ?? false,
      });
      
      // Reset venue request when organizer data changes
      setPendingVenueRequest(false);
    }
  }, [organizer]);

  const handleTypeChange = (event) => {
    const { name, checked } = event.target;

    if (name === 'isEventOrganizer' && !checked) {
      alert('You cannot uncheck Event Organizer.');
      return;
    }

    // Special handling for venue checkbox
    if (name === 'isVenue') {
      if (checked) {
        // When checked, set to pending request
        setPendingVenueRequest(true);
      } else {
        // When unchecked, cancel the request
        setPendingVenueRequest(false);
      }
      return;
    }

    setTypes((prevTypes) => ({
      ...prevTypes,
      [name]: checked,
    }));
  };

  const isSaveDisabled = JSON.stringify(types) === JSON.stringify(initialTypes);

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccessMessage(false);
    
    const updateData = {
      organizerTypes: types,
    };

    try {
      await updateOrganizer(organizerId, updateData);
      setInitialTypes(types);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to update types:', error);
      setErrorMessage('An error occurred while updating organizer types.');
    }
  };

  // For handling venue registration request
  const handleVenueRequest = () => {
    // In the future, this would submit the request to create a venue
    // For now, it's just a placeholder that will reset the UI
    setShowSuccessMessage(true);
    setPendingVenueRequest(false);
  };

  const renderTypeCheckbox = (label, name, infoText) => {
    // Special case for venue checkbox
    if (name === 'isVenue') {
      return (
        <Box key={name} sx={{ mb: 2, mt: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <FormControlLabel
              control={<Checkbox checked={initialTypes.isVenue || pendingVenueRequest} onChange={handleTypeChange} name={name} color="primary" />}
              label={initialTypes.isVenue ? "Venue (Approved)" : "Venue"}
            />
            <Tooltip title="Request to be listed as a venue in the system. Admin approval required. Your address will be used to create the venue.">
              <IconButton size="small" aria-label="Venue info">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Show submit button when venue is checked but not yet approved */}
          {pendingVenueRequest && !initialTypes.isVenue && (
            <Box mt={1} ml={4}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Submit a request to create a venue at your address. System will check for duplicates.
              </Typography>
              <Button 
                variant="contained" 
                color="inherit"
                size="small"
                onClick={handleVenueRequest}
                sx={{ bgcolor: '#e0e0e0' }}
              >
                Submit Venue Request
              </Button>
            </Box>
          )}
        </Box>
      );
    }
    
    // Regular checkboxes for other types
    return (
      <Box key={name} display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={types[name]} onChange={handleTypeChange} name={name} color="primary" />}
          label={label}
        />
        <Tooltip title={infoText}>
          <IconButton size="small" aria-label={`${label} info`}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Artists+ Types
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Event Organizer Feature Available Now!
        </Typography>
        <Typography variant="body2">
          Currently, only the Event Organizer feature is fully functional for managing milongas, festivals, classes, and other tango events.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Coming Next Quarter:</strong> When you select your Artists+ types below, you'll receive notifications upon login about new features available for your profile type!
        </Typography>
      </Alert>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      {/* Success notification */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          Artists+ types have been updated successfully!
        </Alert>
      </Snackbar>

      <Box display="flex" flexDirection="column" sx={{ mb: 2 }} maxWidth={isMobile ? '100%' : '400px'}>
        {renderTypeCheckbox(
          'Event Organizer',
          'isEventOrganizer',
          'Is allowed to Manage Events in TangoTiempo like milongas, festivals, classes, etc.'
        )}
        {renderTypeCheckbox(
          'Teacher',
          'isTeacher',
          'Offers tango classes and workshops. Will be listed in the Teachers directory.'
        )}
        {renderTypeCheckbox(
          'Maestro',
          'isMaestro',
          'Recognized master teacher in tango. Travels to teach and perform.'
        )}
        {renderTypeCheckbox('DJ', 'isDJ', 'Provides music for tango events.')}
        {renderTypeCheckbox(
          'Orchestra',
          'isOrchestra',
          'Performs live Argentine tango music. Will be listed in the Orchestras directory.'
        )}
        {renderTypeCheckbox(
          'Taxi Dancer',
          'isTaxiDancer',
          'Available for hire as a dance partner at events.'
        )}
        {/* Venue is handled specially and placed last */}
        {renderTypeCheckbox(
          'Venue',
          'isVenue',
          'The address provided will be listed for OTHER Organizers to select for their calendar events.'
        )}
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaveDisabled}>
        Save
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Note: Features for each Artists+ type will be rolled out progressively. Start tagging your profile now!
      </Typography>
    </Box>
  );
};

RegionalOrganizerTypes.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.shape({
    _id: PropTypes.string,
    organizerTypes: PropTypes.shape({
      isEventOrganizer: PropTypes.bool,
      isVenue: PropTypes.bool,
      isTeacher: PropTypes.bool,
      isMaestro: PropTypes.bool,
      isDJ: PropTypes.bool,
      isOrchestra: PropTypes.bool,
      isTaxiDancer: PropTypes.bool,
    }),
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizerTypes;
