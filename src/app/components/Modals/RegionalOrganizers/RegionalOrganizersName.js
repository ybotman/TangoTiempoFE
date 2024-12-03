'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';

const RegionalOrganizersName = ({
  organizerId,
  organizer,
  updateOrganizer,
}) => {
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (organizer) {
      setFullName(organizer.fullName || '');
      setShortName(organizer.shortName || '');
      setDescription(organizer.description || '');
      setUrl(organizer.publicContactInfo?.url || '');
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
      url === organizer.publicContactInfo?.url) ||
    fullName === 'New Organizer' ||
    fullName.trim().length < 7 ||
    isShortNameInvalid();

  const handleShortNameChange = (e) => {
    const value = e.target.value;
    setShortName(value);
  };

  const handleSave = async () => {
    if (fullName.trim().length < 7 || fullName === 'New Organizer') {
      setErrorMessage(
        'Full Name must be at least 5 characters and cannot be "New Organizer".'
      );
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
        url,
      },
    };

    try {
      await updateOrganizer(organizerId, updateData);
      setErrorMessage(''); // Clear any existing error messages
      console.log('Name updated successfully.');
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
      {errorMessage && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

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
        <TextField
          label="URL (Web or Social Media)"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <TextField
          label="Description of Organizer"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={isSaveDisabled}
        sx={{ mt: 2 }}
      >
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
