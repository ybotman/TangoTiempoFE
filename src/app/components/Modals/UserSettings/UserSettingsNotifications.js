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
  // Determine current notification preference from userData
  const getCurrentNotificationPreference = () => {
    const preference = userData?.localUserInfo?.notificationPreference;
    if (preference === 'Email') return 'email';
    if (preference === 'SMS') return 'sms';
    if (preference === 'Both') return 'both';
    return 'none';
  };

  const [notificationPreference, setNotificationPreference] = useState(getCurrentNotificationPreference());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Compute derived email and SMS states from the preference
  const emailEnabled = notificationPreference === 'email' || notificationPreference === 'both';
  const smsEnabled = notificationPreference === 'sms' || notificationPreference === 'both';

  // Sync with props when they change
  useEffect(() => {
    setNotificationPreference(getCurrentNotificationPreference());
    setIsModified(false);
  }, [userData]);

  // Check for modifications
  useEffect(() => {
    const currentPreference = getCurrentNotificationPreference();
    setIsModified(notificationPreference !== currentPreference);
  }, [notificationPreference, userData]);

  // Update preference based on toggle states
  const updatePreference = (emailState, smsState) => {
    if (emailState && smsState) {
      setNotificationPreference('both');
    } else if (emailState) {
      setNotificationPreference('email');
    } else if (smsState) {
      setNotificationPreference('sms');
    } else {
      setNotificationPreference('none');
    }
  };

  const handleEmailChange = (event) => {
    updatePreference(event.target.checked, smsEnabled);
  };

  const handleSmsChange = (event) => {
    updatePreference(emailEnabled, event.target.checked);
  };

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setShowSuccessMessage(false);
    
    // Convert internal state to API expected format
    let preferenceValue;
    switch (notificationPreference) {
      case 'email': 
        preferenceValue = 'Email';
        break;
      case 'sms': 
        preferenceValue = 'SMS';
        break;
      case 'both': 
        preferenceValue = 'Both';
        break;
      default:
        preferenceValue = 'None';
    }
    
    try {
      await updateUserData({
        localUserInfo: {
          notificationPreference: preferenceValue
        }
      });
      
// TIEMPO-276: Security cleanup - removed logging
      setShowSuccessMessage(true);
      setIsModified(false);
    } catch (err) {
      console.error('Error saving notification preference:', err);
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
      notificationPreference: PropTypes.string
    })
  }),
  updateUserData: PropTypes.func.isRequired
};

export default UserSettingsNotifications;
