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
import RecommendIcon from '@mui/icons-material/Recommend';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useMasteredCities } from '@/hooks/useMasteredCities';

const RegionalOrganizersStatus = ({ organizerId, organizer, updateOrganizer }) => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData } = useUsers();
  const { masteredCities } = useMasteredCities(true); // Include inactive to show selected cities
  
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
  const allowedCityIds = roInfo.allowedMasteredCityIds || [];

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
      // Update organizer collection only
      await updateOrganizer(organizerId, { 
        isEnabled
      });
      
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

  // Helper function to get city display names
  const getCityDisplayNames = () => {
    if (!allowedCityIds.length || !masteredCities.length) return [];
    return allowedCityIds
      .map(cityId => {
        const city = masteredCities.find(c => c._id === cityId);
        return city ? city.cityName + (city.active ? '' : ' (inactive)') : null;
      })
      .filter(name => name !== null);
  };

  const mandatoryChecks = [
    {
      label: 'Rules of Engagement Accepted',
      passed: isApprovedFromUserLogin,
      icon: isApprovedFromUserLogin ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />
    },
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
      label: 'At Least One City Selected',
      passed: allowedCityIds.length > 0,
      icon: allowedCityIds.length > 0 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />,
      details: allowedCityIds.length > 0 ? `${allowedCityIds.length} cities selected` : null
    },
  ];

  const optionalItems = [
    {
      label: 'Delegated Organizers',
      description: 'Allow others to manage events on your behalf',
      hasValue: organizer?.delegatedOrganizerIds?.length > 0,
      details: organizer?.delegatedOrganizerIds?.length > 0 ? `${organizer.delegatedOrganizerIds.length} delegates` : 'None'
    },
    {
      label: 'Profile Image',
      description: 'Logo or profile image for your organizer page',
      hasValue: organizer?.images?.profile?.length > 0,
      details: organizer?.images?.profile?.length > 0 ? 'Uploaded' : 'Not uploaded'
    }
  ];

  const allMandatoryPassed = mandatoryChecks.every(check => check.passed);

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

      {/* Mandatory Requirements */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Mandatory Requirements
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All items must be completed before enabling your profile
          </Typography>
          <List dense>
            {mandatoryChecks.map((check, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {check.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={check.label}
                  secondary={check.details}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Enable Switch */}
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          bgcolor: isEnabled ? 'success.light' : 'grey.100',
          opacity: allMandatoryPassed ? 1 : 0.7
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Activation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEnabled 
                  ? "Your profile is active - You can create and manage tango events"
                  : allMandatoryPassed 
                    ? "Enable your profile to start creating events"
                    : "Complete all mandatory requirements to enable"
                }
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={isEnabled} 
                  onChange={(e) => setIsEnabled(e.target.checked)} 
                  color="primary"
                  disabled={!allMandatoryPassed}
                  size="large"
                />
              }
              label={isEnabled ? "Enabled" : "Disabled"}
              labelPlacement="bottom"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Optional/Recommended Items */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <RecommendIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Optional & Recommended
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enhance your profile with these additional features
          </Typography>
          <List dense>
            {optionalItems.map((item, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {item.label}
                      <Chip 
                        label={item.details} 
                        size="small"
                        color={item.hasValue ? "primary" : "default"}
                        variant={item.hasValue ? "filled" : "outlined"}
                      />
                    </Box>
                  }
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Search Engine Visibility */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Data Source Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          This tab manages profile visibility settings. For account-level settings, use the Settings tab.
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
    delegatedOrganizerIds: PropTypes.array,
    images: PropTypes.shape({
      profile: PropTypes.array,
    }),
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersStatus;