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
  });

  const [initialTypes, setInitialTypes] = useState({});
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
      });

      setInitialTypes({
        isEventOrganizer: organizerTypes.isEventOrganizer ?? true,
        isVenue: organizerTypes.isVenue ?? false,
        isTeacher: organizerTypes.isTeacher ?? false,
        isMaestro: organizerTypes.isMaestro ?? false,
        isDJ: organizerTypes.isDJ ?? false,
        isOrchestra: organizerTypes.isOrchestra ?? false,
      });
    }
  }, [organizer]);

  const handleTypeChange = (event) => {
    const { name, checked } = event.target;

    if (name === 'isEventOrganizer' && !checked) {
      alert('You cannot uncheck Event Organizer.');
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

  const renderTypeCheckbox = (label, name, infoText) => (
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

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Organizer Types
      </Typography>

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
          Organizer types have been updated successfully!
        </Alert>
      </Snackbar>

      <Box display="flex" flexDirection="column" sx={{ mb: 2 }} maxWidth={isMobile ? '100%' : '400px'}>
        {renderTypeCheckbox(
          'Event Organizer',
          'isEventOrganizer',
          'Is allowed to Manage Events in TangoTiempo like milongas, festivals, classes, etc.'
        )}
        {renderTypeCheckbox(
          'Venue',
          'isVenue',
          'The address provided will be listed for OTHER Organizers to select for their calendar events.'
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
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaveDisabled}>
        Save
      </Button>
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
    }),
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizerTypes;
