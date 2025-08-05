'use client';

import React, { useState, useEffect, useContext } from 'react';
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
  Chip,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LockIcon from '@mui/icons-material/Lock';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';

const RegionalOrganizersStatus = ({ organizerId, organizer, updateOrganizer }) => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData } = useUsers();
  
  // State for switchable attributes
  const [isEnabled, setIsEnabled] = useState(false);
  const [wantRender, setWantRender] = useState(false);
  
  // Initial values for comparison
  const [initialIsEnabled, setInitialIsEnabled] = useState(false);
  const [initialWantRender, setInitialWantRender] = useState(false);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);

  // Get values from both collections
  const roInfo = userData?.regionalOrganizerInfo || {};
  const isApprovedFromUserLogin = roInfo.isApproved || false;
  const isActiveFromUserLogin = roInfo.isActive || false;
  const isEnabledFromUserLogin = roInfo.isEnabled || false;

  useEffect(() => {
    if (organizer && userData) {
      // Sync from both sources - userLogin takes precedence for shared fields
      setIsEnabled(isEnabledFromUserLogin || organizer.isEnabled || false);
      setWantRender(organizer.wantRender || false);
      
      setInitialIsEnabled(isEnabledFromUserLogin || organizer.isEnabled || false);
      setInitialWantRender(organizer.wantRender || false);
    }
  }, [organizer, userData, isEnabledFromUserLogin]);

  const isSaveDisabled = isEnabled === initialIsEnabled;

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccessMessage(false);
    
    try {
      // Update organizer collection
      await updateOrganizer(organizerId, { 
        isEnabled
      });
      
      // Update userLogin collection if isEnabled changed
      if (isEnabled !== initialIsEnabled && userData) {
        const updatedRegionalInfo = {
          ...roInfo,
          isEnabled: isEnabled
        };
        await updateUserData({
          regionalOrganizerInfo: updatedRegionalInfo
        });
      }
      
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
  ];

  const allChecksPassed = profileChecks.every(check => check.passed);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Profile Status & Visibility
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
          Profile settings have been updated successfully!
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
            Profile Requirements
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

      {/* Status Controls Section */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Status Controls
      </Typography>

      <Grid container spacing={3}>
        {/* Non-editable Status Fields */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                System-Managed Status (Read-Only)
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body1">
                        ROE Approved
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Chip 
                          label={isApprovedFromUserLogin ? "Yes" : "No"} 
                          color={isApprovedFromUserLogin ? "success" : "default"}
                          size="small"
                        />
                        <Tooltip title="Set automatically when you accept the Rules of Engagement">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <LockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body1">
                        Account Active
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Chip 
                          label={isActiveFromUserLogin ? "Yes" : "No"} 
                          color={isActiveFromUserLogin ? "success" : "default"}
                          size="small"
                        />
                        <Tooltip title="Managed by system administrators">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <LockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Editable Status Fields */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ p: 3, bgcolor: isEnabled ? 'success.light' : 'grey.100' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Profile Activation
            </Typography>
            
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isEnabled} 
                      onChange={(e) => setIsEnabled(e.target.checked)} 
                      color="primary"
                      disabled={!allChecksPassed || !isApprovedFromUserLogin}
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
                    ? "You can create and manage tango events"
                    : "Enable to start creating events"
                  }
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Search Engine Visibility
            </Typography>
            
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Typography variant="body1">
                Searchable Profile
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={wantRender ? "Yes" : "No"} 
                  color={wantRender ? "primary" : "default"}
                  size="small"
                />
                <Tooltip title="Manage this setting in the 'Name' tab">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {wantRender 
                ? "Your organizer page appears in search results and can be found by the community"
                : "Your profile is hidden from search engines and public listings"
              }
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              To change this setting, go to the "Name" tab
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Data Source Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Status data is synchronized between your user profile and organizer profile. 
          Changes may require an app restart to take full effect.
        </Typography>
      </Box>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSave} 
        disabled={isSaveDisabled}
        sx={{ mt: 3 }}
        fullWidth
      >
        Save Settings
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