// src/components/Modals/RegionalOrganizers/RegionalOrganizersName.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';

const RegionalOrganizersName = ({
  organizerId,
  shortName,
  description,
  updateOrganizer,
}) => {
  const [currentShortName, setCurrentShortName] = useState(shortName);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [isModified, setIsModified] = useState(false);

  // Detect changes to enable the Save button
  useEffect(() => {
    setIsModified(
      currentShortName !== shortName || currentDescription !== description
    );
  }, [currentShortName, currentDescription, shortName, description]);

  const handleSave = async () => {
    const updateData = {
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
      <TextField
        label="Short Name For Calendar"
        fullWidth
        margin="normal"
        value={currentShortName}
        onChange={(e) => setCurrentShortName(e.target.value)}
      />
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
  shortName: PropTypes.string,
  description: PropTypes.string,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersName;
