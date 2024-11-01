// src/components/Modals/UserSettings/UserSettingsName.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Typography } from '@mui/material';

const UserSettingsName = ({ firstName, lastName, updateUserData }) => {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Sync prop changes into state
  useEffect(() => {
    setFirst(firstName);
    setLast(lastName);
    setIsModified(false); // Reset modification state when props change
  }, [firstName, lastName]);

  // Check if the input fields have been modified
  useEffect(() => {
    setIsModified(first !== firstName || last !== lastName);
  }, [first, last, firstName, lastName]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserData({ firstName: first, lastName: last });
      console.log("Name updated successfully");
    } catch (error) {
      alert(`Failed to update name. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Update Your Name</Typography>
      <TextField
        label="First Name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Last Name"
        value={last}
        onChange={(e) => setLast(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={loading || !isModified} // Disable if not modified
        sx={{ mt: 2 }}
      >
        {loading ? "Saving..." : "Save"}
      </Button>
    </Box>
  );
};

// PropTypes validation
UserSettingsName.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  updateUserData: PropTypes.func.isRequired,
};

export default UserSettingsName;