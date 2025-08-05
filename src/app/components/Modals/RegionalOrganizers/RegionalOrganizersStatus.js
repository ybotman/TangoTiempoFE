'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const RegionalOrganizersStatus = ({ organizerId, organizer, updateOrganizer }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [initialIsEnabled, setInitialIsEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);

  useEffect(() => {
    if (organizer) {
      setIsEnabled(organizer.isEnabled || false);
      setInitialIsEnabled(organizer.isEnabled || false);
    }
  }, [organizer]);

  const isSaveDisabled = isEnabled === initialIsEnabled;

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleEnabledChange = (event) => {
    setIsEnabled(event.target.checked);
  };

  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccessMessage(false);
    
    try {
      await updateOrganizer(organizerId, { isEnabled });
      setInitialIsEnabled(isEnabled);
      setShowSuccessMessage(true);
      
      // Show restart warning if enabling
      if (isEnabled && !initialIsEnabled) {
        setShowRestartWarning(true);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setErrorMessage('An error occurred while updating organizer status.');
    }
  };

  const profileChecks = [
    {
      label: 'Organizer Name',
      passed: organizer?.fullName && organizer.fullName !== 'New Organizer' && organizer.fullName.length >= 7,
      icon: organizer?.fullName && organizer.fullName !== 'New Organizer' && organizer.fullName.length >= 7 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />
    },
    {
      label: 'Short Name',
      passed: organizer?.shortName && organizer.shortName.length >= 3 && organizer.shortName.length <= 9,
      icon: organizer?.shortName && organizer.shortName.length >= 3 && organizer.shortName.length <= 9 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />
    },
    {
      label: 'Description',
      passed: organizer?.description && organizer.description.length > 0,
      icon: organizer?.description && organizer.description.length > 0 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />
    },
    {
      label: 'Approved Status',
      passed: true, // Always true since they got this far
      icon: <CheckCircleIcon color="success" />
    },
  ];

  const allChecksPassed = profileChecks.every(check => check.passed);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Profile Status
      </Typography>

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
          Profile status has been updated successfully!
        </Alert>
      </Snackbar>

      {/* Restart warning */}
      {showRestartWarning && (
        <Alert 
          severity="warning" 
          icon={<RestartAltIcon />}
          sx={{ mb: 2 }}
          onClose={() => setShowRestartWarning(false)}
        >
          App restart required to activate your organizer role. Please restart the app after saving.
        </Alert>
      )}

      {/* Profile Checklist */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Profile Completeness
          </Typography>
          <List dense>
            {profileChecks.map((check, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {check.icon}
                </ListItemIcon>
                <ListItemText primary={check.label} />
              </ListItem>
            ))}
          </List>
          {!allChecksPassed && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Complete all profile requirements before enabling your organizer profile.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Enable/Disable Toggle */}
      <Card elevation={2} sx={{ p: 3, bgcolor: isEnabled ? 'success.light' : 'grey.100' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={isEnabled} 
                  onChange={handleEnabledChange} 
                  color="primary"
                  disabled={!allChecksPassed}
                />
              }
              label={
                <Typography variant="h6">
                  {isEnabled ? "Profile Enabled" : "Profile Disabled"}
                </Typography>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mt: 1 }}>
              {isEnabled 
                ? "Your profile is active and you can create events. Your organizer page is searchable if 'Crawlable' is enabled."
                : "Your profile is disabled. Enable it to start creating events and appear in organizer listings."
              }
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Additional Status Information */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Current Status:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Approved" 
              secondary="You have accepted the Rules of Engagement"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={isEnabled ? "Enabled" : "Disabled"} 
              secondary={isEnabled ? "You can create and manage events" : "Enable your profile to start managing events"}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Searchable" 
              secondary={organizer?.wantRender ? "Your profile appears in search results" : "Enable 'Crawlable' in Name tab for search visibility"}
            />
          </ListItem>
        </List>
      </Box>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSave} 
        disabled={isSaveDisabled}
        sx={{ mt: 3 }}
      >
        Save Status
      </Button>
    </Box>
  );
};

RegionalOrganizersStatus.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.shape({
    fullName: PropTypes.string,
    shortName: PropTypes.string,
    description: PropTypes.string,
    isEnabled: PropTypes.bool,
    wantRender: PropTypes.bool,
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersStatus;