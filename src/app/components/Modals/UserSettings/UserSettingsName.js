// src/components/Modals/UserSettings/UserSettingsName.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Typography, Alert, Snackbar } from '@mui/material';
// import { useGeoLocation } from '@/contexts/GeoLocationContext';

const UserSettingsName = ({ userData, updateUserData }) => {
  // Connect to GeoLocationContext for future use
  // const geoLocation = useGeoLocation();
  
  const [first, setFirst] = useState(userData?.localUserInfo?.firstName || '');
  const [last, setLast] = useState(userData?.localUserInfo?.lastName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Sync prop changes into state
  useEffect(() => {
    setFirst(userData?.localUserInfo?.firstName || '');
    setLast(userData?.localUserInfo?.lastName || '');
    setIsModified(false);
  }, [userData]);

  // Check if the input fields have been modified
  useEffect(() => {
    const isNameModified =
      first !== (userData?.localUserInfo?.firstName || '') || 
      last !== (userData?.localUserInfo?.lastName || '');
    setIsModified(isNameModified);
  }, [first, last, userData]);

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setShowSuccessMessage(false);
    
    try {
      // Create a clean user data object for update - with proper nesting
      const updatedUserData = {
        localUserInfo: {
          firstName: first || '',
          lastName: last || '',
          // Maintain existing userDefaults if they exist
          userDefaults: userData?.localUserInfo?.userDefaults || {}
        }
      };
      
      // Log what we're saving
      console.log('Saving user data:', updatedUserData);

      // Call the update method
      await updateUserData(updatedUserData);
      
      console.log('User data updated successfully');
      // Show success message
      setShowSuccessMessage(true);
    } catch (err) {
      console.error('Error saving user data:', err);
      setError(err.message || 'Failed to update user settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Update Your Name</Typography>
      
      {/* Error message for API errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "There was an issue updating your information."}
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
          Your name has been updated successfully!
        </Alert>
      </Snackbar>
      
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
        disabled={loading || !isModified} 
        sx={{ mt: 2 }}
      >
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  );
};

UserSettingsName.propTypes = {
  userData: PropTypes.shape({
    localUserInfo: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      userDefaults: PropTypes.object,
    }),
  }).isRequired,
  updateUserData: PropTypes.func.isRequired,
};

export default UserSettingsName;