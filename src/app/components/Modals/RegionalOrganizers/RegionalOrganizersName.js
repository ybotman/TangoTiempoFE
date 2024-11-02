// src/components/Modals/RegionalOrganizers/RegionalOrganizersName.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';

const RegionalOrganizersName = ({
  organizerId,
  name = '',
  shortName = '',
  description = '',
  updateOrganizer,
}) => {
  const [currentName, setCurrentName] = useState(name);
  const [currentShortName, setCurrentShortName] = useState(shortName);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [isModified, setIsModified] = useState(false);

  // Sync state with props when the component receives new props after save
  useEffect(() => {
    setCurrentName(name || '');
    setCurrentShortName(shortName || '');
    setCurrentDescription(description || '');
  }, [name, shortName, description]);

  // Track if any field has been modified to enable the Save button
  useEffect(() => {
    setIsModified(
      currentName !== name ||
      currentShortName !== shortName ||
      currentDescription !== description
    );
  }, [currentName, currentShortName, currentDescription, name, shortName, description]);

  // Handle shortName restrictions
  const handleShortNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (value.length <= 9) {
      setCurrentShortName(value);
    }
  };

  const handleSave = async () => {
    const updateData = {
      name: currentName,
      shortName: currentShortName,
      description: currentDescription,
    };
    try {
      await updateOrganizer(organizerId, updateData);
      console.log('Organizer updated successfully');
    } catch (error) {
      console.log('Failed to update organizer', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Edit Organizer Details</Typography>

      {/* Name and Short Name on the Same Line */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
        />
        <TextField
          label="Short Name (No spaces, max 9 characters)"
          fullWidth
          margin="normal"
          value={currentShortName}
          onChange={handleShortNameChange}
          helperText="Converted to uppercase, limited to 9 characters."
        />
      </Box>

      {/* Description Field */}
      <TextField
        label="Description"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={currentDescription}
        onChange={(e) => setCurrentDescription(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={!isModified}
        sx={{ mt: 2 }}
      >
        Save
      </Button>
    </Box>
  );
};

RegionalOrganizersName.propTypes = {
  organizerId: PropTypes.string.isRequired,
  name: PropTypes.string,
  shortName: PropTypes.string,
  description: PropTypes.string,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersName;