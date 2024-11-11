// src/app/components/Modals/RegionalOrganizers/RegionalOrganizersName.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';

const RegionalOrganizersName = ({
  organizerId,
  organizer,
  updateOrganizer,
}) => {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (organizer) {
      setName(organizer.name || '');
      setFullName(organizer.fullName || '');
      setShortName(organizer.shortName || '');
      setDescription(organizer.description || '');
      setUrl(organizer.publicContactInfo?.url || '');
    }
  }, [organizer]);

  const isSaveDisabled =
    name === organizer?.name &&
    fullName === organizer?.fullName &&
    shortName === organizer?.shortName &&
    description === organizer?.description &&
    url === organizer.publicContactInfo?.url;

  const handleShortNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (value.length <= 9) {
      setShortName(value);
    }
  };

  const handleSave = async () => {
    const updateData = {
      name,
      fullName,
      shortName,
      description,
      publicContactInfo: {
        url,
      },
    };
    try {
      await updateOrganizer(organizerId, updateData);
      console.log('Name updated successfully.');
    } catch (error) {
      console.error('Failed to update name:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Edit Organizer Name
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Full Name"
          fullWidth
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          label="Short Name (No spaces, max 9 characters)"
          fullWidth
          value={shortName}
          onChange={handleShortNameChange}
        />
        <TextField
          label="URL"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <TextField
          label="Description"
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
    name: PropTypes.string,
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
