// src/components/Modals/UserSettings/UserSettingsNotifications.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Button, 
  Alert, 
  Snackbar 
} from '@mui/material';

const UserSettingsNotifications = ({ userData, updateUserData }) => {
  const [emailEnabled, setEmailEnabled] = useState(
    userData?.localUserInfo?.notificationPreferences?.emailEnabled || false
  );
  const [smsEnabled, setSmsEnabled] = useState(
    userData?.localUserInfo?.notificationPreferences?.smsEnabled || false
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Sync with props when they change
  useEffect(() => {
    setEmailEnabled(userData?.localUserInfo?.notificationPreferences?.emailEnabled || false);
    setSmsEnabled(userData?.localUserInfo?.notificationPreferences?.smsEnabled || false);
    setIsModified(false);
  }, [userData]);

  // Check for modifications
  useEffect(() => {
    const currentEmailEnabled = userData?.localUserInfo?.notificationPreferences?.emailEnabled || false;
    const currentSmsEnabled = userData?.localUserInfo?.notificationPreferences?.smsEnabled || false;
    
    setIsModified(
      emailEnabled !== currentEmailEnabled || 
      smsEnabled !== currentSmsEnabled
    );
  }, [emailEnabled, smsEnabled, userData]);

  const handleEmailChange = (event) => {
    setEmailEnabled(event.target.checked);
  };

  const handleSmsChange = (event) => {
    setSmsEnabled(event.target.checked);
  };

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setShowSuccessMessage(false);
    
    try {
      await updateUserData({
        localUserInfo: {
          notificationPreferences: {
            emailEnabled,
            smsEnabled
          }
        }
      });
      
      console.log('Notification preferences updated successfully');
      setShowSuccessMessage(true);
      setIsModified(false);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError(err.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Notification Settings</Typography>
      
      {/* Error message for API errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
          Your notification preferences have been updated successfully!
        </Alert>
      </Snackbar>
      
      <Box sx={{ mt: 2 }}>
        <FormControlLabel 
          control={
            <Switch 
              checked={emailEnabled} 
              onChange={handleEmailChange} 
              disabled={loading}
            />
          } 
          label="Email Notifications" 
        />
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <FormControlLabel 
          control={
            <Switch 
              checked={smsEnabled} 
              onChange={handleSmsChange} 
              disabled={loading}
            />
          } 
          label="SMS Notifications" 
        />
      </Box>
      
      <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave} 
          disabled={loading || !isModified}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

UserSettingsNotifications.propTypes = {
  userData: PropTypes.shape({
    localUserInfo: PropTypes.shape({
      notificationPreferences: PropTypes.shape({
        emailEnabled: PropTypes.bool,
        smsEnabled: PropTypes.bool
      })
    })
  }),
  updateUserData: PropTypes.func.isRequired
};

export default UserSettingsNotifications;
