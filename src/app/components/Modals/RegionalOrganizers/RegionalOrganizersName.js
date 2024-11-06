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

  // Sync state with organizer prop on each prop update
  useEffect(() => {
    if (organizer) {
      setName(organizer.name || '');
      setFullName(organizer.fullName || '');
      setShortName(organizer.shortName || '');
      setDescription(organizer.description || '');
      setUrl(organizer.url || '');
    }
  }, [organizer]);

  // Determine if save button should be enabled based on field changes
  const isSaveDisabled =
    name === organizer?.name &&
    fullName === organizer?.fullName &&
    shortName === organizer?.shortName &&
    description === organizer?.description &&
    url === organizer?.url;

  // Handle shortName with validation
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
      url,
    };
    try {
      const updatedOrganizer = await updateOrganizer(organizerId, updateData);
      setName(updatedOrganizer.name);
      setFullName(updatedOrganizer.fullName);
      setShortName(updatedOrganizer.shortName);
      setDescription(updatedOrganizer.description);
      setUrl(updatedOrganizer.url);
      console.log('Name updated successfully.');
    } catch (error) {
      console.error('Failed to update name:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Edit Organizer Name</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Short Name (No spaces, max 9 characters)"
          fullWidth
          margin="normal"
          value={shortName}
          onChange={handleShortNameChange}
        />
        <TextField
          label="URL"
          fullWidth
          margin="normal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </Box>

      <TextField
        label="Description"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

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
    url: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersName;
