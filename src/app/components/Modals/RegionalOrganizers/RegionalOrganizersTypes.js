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
    isTeacher: false,
    isMaestro: false,
    isDJ: false,
    isOrchestra: false,
    isTaxiDancer: false,
    isVendor: false,
  });

  const [initialTypes, setInitialTypes] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (organizer) {
      const organizerTypes = organizer.organizerTypes || {};
      setTypes({
        isEventOrganizer: organizerTypes.isEventOrganizer ?? true,
        isTeacher: organizerTypes.isTeacher ?? false,
        isMaestro: organizerTypes.isMaestro ?? false,
        isDJ: organizerTypes.isDJ ?? false,
        isOrchestra: organizerTypes.isOrchestra ?? false,
        isTaxiDancer: organizerTypes.isTaxiDancer ?? false,
        isVendor: organizerTypes.isVendor ?? false,
      });

      setInitialTypes({
        isEventOrganizer: organizerTypes.isEventOrganizer ?? true,
        isTeacher: organizerTypes.isTeacher ?? false,
        isMaestro: organizerTypes.isMaestro ?? false,
        isDJ: organizerTypes.isDJ ?? false,
        isOrchestra: organizerTypes.isOrchestra ?? false,
        isTaxiDancer: organizerTypes.isTaxiDancer ?? false,
        isVendor: organizerTypes.isVendor ?? false,
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

  const renderTypeCheckbox = (label, name, infoText) => {
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
          <strong>Coming Soon:</strong> Each Artists+ type you select will become searchable both within TangoTiempo and on Google. You&apos;ll have dedicated profile pages where you can configure your activities and showcase your work in each role.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Select your Artists+ types now to be notified when your searchable profiles become available!
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
        {renderTypeCheckbox(
          'Vendor',
          'isVendor',
          'Sells tango-related products or services (shoes, clothing, music, etc.).'
        )}
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaveDisabled}>
        Save
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Note: Your Artists+ selections will create searchable profile pages. Start building your presence now!
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
      isTeacher: PropTypes.bool,
      isMaestro: PropTypes.bool,
      isDJ: PropTypes.bool,
      isOrchestra: PropTypes.bool,
      isTaxiDancer: PropTypes.bool,
      isVendor: PropTypes.bool,
    }),
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizerTypes;
