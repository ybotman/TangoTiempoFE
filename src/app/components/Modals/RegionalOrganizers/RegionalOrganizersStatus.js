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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useMasteredCities } from '@/hooks/useMasteredCities';

const RegionalOrganizersStatus = ({ organizerId, organizer, updateOrganizer }) => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData } = useUsers();
  const { masteredCities } = useMasteredCities(true); // Include inactive to show selected cities
  
  // State for switchable attributes
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Initial values for comparison
  const [initialIsEnabled, setInitialIsEnabled] = useState(false);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);

  // Get values from both collections
  const roInfo = userData?.regionalOrganizerInfo || {};
  const email = userData?.email || 'Not available';
  const firebaseUserId = userData?.firebaseUserId || 'Not available';
  const isApprovedFromUserLogin = roInfo.isApproved || false;
  const isActiveFromUserLogin = roInfo.isActive || false;
  const isEnabledFromUserLogin = roInfo.isEnabled || false;
  const allowedCityIds = roInfo.allowedMasteredCityIds || [];
  const approvalDate = roInfo.ApprovalDate ? new Date(roInfo.ApprovalDate).toLocaleDateString() : 'Not set';

  // Organizer collection values
  const wantRender = organizer?.wantRender || false;
  const isVisible = organizer?.isVisible !== false; // Default true
  const delegatedCount = organizer?.delegatedOrganizerIds?.length || 0;
  const hasProfileImage = organizer?.images?.profile?.length > 0;
  
  // Address completeness check
  const address = organizer?.publicContactInfo?.address || {};
  const hasCompleteAddress = Boolean(
    address.street1 && 
    address.city && 
    address.state && 
    address.postalCode
  );

  useEffect(() => {
    if (organizer && userData) {
      // Sync isEnabled from organizer collection
      setIsEnabled(organizer.isEnabled || false);
      setInitialIsEnabled(organizer.isEnabled || false);
    }
  }, [organizer, userData]);

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
      details: allowedCityIds.length > 0 ? `${allowedCityIds.length} cities: ${getCityDisplayNames().join(', ')}` : null
    },
  ];

  const allMandatoryPassed = mandatoryChecks.every(check => check.passed);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Profile Status Dashboard
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

      {/* User Information - Moved from Settings */}
      <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 1.5 }}>
            <AccountCircleIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              User Information
            </Typography>
          </Box>
          
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body2">{email}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Approval Date</Typography>
              <Typography variant="body2">{approvalDate}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Organizer ID</Typography>
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem' 
              }}>
                {organizerId || 'Not set'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Firebase ID</Typography>
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                wordBreak: 'break-all' 
              }}>
                {firebaseUserId}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

      {/* Optional Status Indicators */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <RecommendIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Optional Status & Features
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {/* Delegated Organizers */}
            <Grid item xs={12} sm={6}>
              <ListItem>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Delegated Organizers"
                  secondary={`${delegatedCount} delegate${delegatedCount !== 1 ? 's' : ''}`}
                />
                <Chip 
                  label={delegatedCount > 0 ? "Active" : "None"} 
                  size="small"
                  color={delegatedCount > 0 ? "primary" : "default"}
                  variant={delegatedCount > 0 ? "filled" : "outlined"}
                />
              </ListItem>
            </Grid>

            {/* Profile Image */}
            <Grid item xs={12} sm={6}>
              <ListItem>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile Image"
                  secondary="Logo or organizer image"
                />
                <Chip 
                  label={hasProfileImage ? "Uploaded" : "Not set"} 
                  size="small"
                  color={hasProfileImage ? "primary" : "default"}
                  variant={hasProfileImage ? "filled" : "outlined"}
                />
              </ListItem>
            </Grid>

            {/* Crawlable/Searchable */}
            <Grid item xs={12} sm={6}>
              <ListItem>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Search Engine Visible"
                  secondary="Appears in search results"
                />
                <Chip 
                  label={wantRender ? "Yes" : "No"} 
                  size="small"
                  color={wantRender ? "primary" : "default"}
                />
              </ListItem>
            </Grid>

            {/* Visible */}
            <Grid item xs={12} sm={6}>
              <ListItem>
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile Visible"
                  secondary="Others can see and select"
                />
                <Chip 
                  label={isVisible ? "Yes" : "No"} 
                  size="small"
                  color={isVisible ? "primary" : "default"}
                />
              </ListItem>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Address Information"
                  secondary={hasCompleteAddress ? 
                    `${address.street1}, ${address.city}, ${address.state} ${address.postalCode}` : 
                    "Not complete"
                  }
                />
                <Chip 
                  label={hasCompleteAddress ? "Complete" : "Incomplete"} 
                  size="small"
                  color={hasCompleteAddress ? "primary" : "default"}
                  variant={hasCompleteAddress ? "filled" : "outlined"}
                />
              </ListItem>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Source Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          This dashboard shows your complete organizer status. To edit settings, use the appropriate tabs.
          Profile activation requires an app restart to take full effect.
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
        Save Profile Status
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
    isVisible: PropTypes.bool,
    delegatedOrganizerIds: PropTypes.array,
    images: PropTypes.shape({
      profile: PropTypes.array,
    }),
    publicContactInfo: PropTypes.shape({
      address: PropTypes.shape({
        street1: PropTypes.string,
        street2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        postalCode: PropTypes.string,
      }),
    }),
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersStatus;