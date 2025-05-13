'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button, Alert, Snackbar, Switch, FormControlLabel, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const RegionalOrganizersName = ({ organizerId, organizer, updateOrganizer }) => {
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isSearchable, setIsSearchable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (organizer) {
      setFullName(organizer.fullName || '');
      setShortName(organizer.shortName || '');
      setDescription(organizer.description || '');
      setUrl(organizer.publicContactInfo?.url || '');
      setIsSearchable(organizer?.wantRender || false);
    }
  }, [organizer]);

  const isShortNameInvalid = () => {
    const trimmedShortName = shortName.trim();
    return (
      trimmedShortName.length < 3 ||
      trimmedShortName.length > 9 ||
      trimmedShortName === 'CHANGE' ||
      trimmedShortName === 'TANGO' ||
      /(^[\s-]|[\s-]$|[-\s]{2,})/.test(trimmedShortName) // Checks for invalid patterns
    );
  };

  const isSaveDisabled =
    (fullName === organizer?.fullName &&
      shortName === organizer?.shortName &&
      description === organizer?.description &&
      url === organizer.publicContactInfo?.url &&
      isSearchable === (organizer?.wantRender || false)) ||
    fullName === 'New Organizer' ||
    fullName.trim().length < 7 ||
    isShortNameInvalid();

  const handleShortNameChange = (e) => {
    const value = e.target.value;
    setShortName(value);
  };

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    if (fullName.trim().length < 7 || fullName === 'New Organizer') {
      setErrorMessage('Full Name must be at least 5 characters and cannot be "New Organizer".');
      return;
    }
    if (isShortNameInvalid()) {
      setErrorMessage(
        'Short Name must be between 3 and 9 characters, cannot be "CHANGE" or "TANGO", and must not contain invalid patterns like double spaces or hyphens.'
      );
      return;
    }

    const updateData = {
      fullName,
      shortName,
      description,
      publicContactInfo: {
        ...organizer?.publicContactInfo, // Preserve existing fields
        url,
      },
      wantRender: isSearchable,
    };

    try {
      await updateOrganizer(organizerId, updateData);
      setErrorMessage(''); // Clear any existing error messages
      setShowSuccessMessage(true); // Show success notification
    } catch (error) {
      console.error('Failed to update name:', error);
      setErrorMessage('An error occurred while updating the name.');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Edit Organizer Name
      </Typography>
      
      {/* Search Engine Visibility Section */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch checked={isSearchable} onChange={(e) => setIsSearchable(e.target.checked)} color="primary" />
            }
            label="Create Public Web Page for This Organizer"
          />
          <Tooltip title="When enabled, we'll create a public web page for this organizer that displays their name, description, contact info, image, and events. This page will be indexed by search engines to help people find your tango events.">
            <IconButton>
              <InfoIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
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
          Organizer name has been updated successfully!
        </Alert>
      </Snackbar>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Org/Studio/Full/etc. name"
          fullWidth
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{
            backgroundColor:
              fullName === 'New Organizer' || fullName.trim().length < 5
                ? '#ffcccc' // Light red background for invalid fullName
                : 'inherit',
          }}
          helperText={
            fullName === 'New Organizer'
              ? 'Full Name cannot be "New Organizer".'
              : fullName.trim().length < 5
                ? 'Full Name must be at least 5 characters.'
                : ''
          }
          error={fullName === 'New Organizer' || fullName.trim().length < 5}
        />
        <TextField
          label="Short Name (Max 9 chars, no invalid patterns)"
          fullWidth
          value={shortName}
          onChange={handleShortNameChange}
          sx={{
            backgroundColor: isShortNameInvalid() ? '#ffcccc' : 'inherit',
          }}
          helperText={
            isShortNameInvalid()
              ? 'Short Name must be between 3-9 chars, cannot be "CHANGE" or "TANGO", and must not contain invalid patterns.'
              : ''
          }
          error={isShortNameInvalid()}
        />
        <TextField label="URL (Web or Social Media)" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} />
        <TextField
          label="Description of Organizer"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaveDisabled} sx={{ mt: 2 }}>
        Save
      </Button>
    </Box>
  );
};

RegionalOrganizersName.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.shape({
    fullName: PropTypes.string,
    shortName: PropTypes.string,
    publicContactInfo: PropTypes.shape({
      url: PropTypes.string,
    }),
    description: PropTypes.string,
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersName;
