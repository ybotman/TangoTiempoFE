'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RecommendIcon from '@mui/icons-material/Recommend';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';

const RegionalOrganizersStatus = ({ organizerId, organizer, updateOrganizer, onFieldChange, unsavedChanges, onSave, isSaving }) => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData } = useUsers();
  
  // TIEMPO-254: Use unsaved changes if available, otherwise use organizer data
  const isEnabled = unsavedChanges?.isEnabled !== undefined ? unsavedChanges.isEnabled : (organizer?.isEnabled || false);
  
  // Initial values for comparison
  const [initialIsEnabled, setInitialIsEnabled] = useState(false);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);

  // Get values from both collections
  const roInfo = userData?.regionalOrganizerInfo || {};
  const email = user?.email || 'Not available';
  const firebaseUserId = userData?.firebaseUserId || 'Not available';
  const isApprovedFromUserLogin = roInfo.isApproved || false;
  const isActiveFromUserLogin = roInfo.isActive || false;
  const isEnabledFromUserLogin = roInfo.isEnabled || false;
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
      // Sync initial values from organizer collection
      setInitialIsEnabled(organizer.isEnabled || false);
    }
  }, [organizer, userData]);

  // TIEMPO-254: Use centralized isSaving if available, otherwise check for changes
  const isSaveDisabled = isSaving !== undefined ? isSaving : (isEnabled === initialIsEnabled);

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  // TIEMPO-254: Use centralized save handler
  const handleSave = async () => {
    // Call the centralized save handler if available
    if (onSave) {
      return onSave();
    }
    
    // Fallback to original implementation if no centralized handler
    setErrorMessage('');
    setShowSuccessMessage(false);
    
    try {
      // Update organizer collection only
      await updateOrganizer(organizerId, { 
        isEnabled
      });
      
      setInitialIsEnabled(isEnabled);
      setShowSuccessMessage(true);
      
      // Auto-refresh after 2 seconds if enabling
      if (isEnabled && !initialIsEnabled) {
        setShowRestartWarning(true);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setErrorMessage('An error occurred while updating organizer status.');
    }
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
      passed: organizer?.shortName && 
              organizer.shortName.length >= 3 && 
              organizer.shortName.length <= 9 &&
              organizer.shortName !== 'CHANGE' &&
              !organizer.shortName.toUpperCase().includes('TANGO') &&
              !/(^[\s-]|[\s-]$|[-\s]{2,})/.test(organizer.shortName),
      icon: organizer?.shortName && 
            organizer.shortName.length >= 3 && 
            organizer.shortName.length <= 9 &&
            organizer.shortName !== 'CHANGE' &&
            !organizer.shortName.toUpperCase().includes('TANGO') &&
            !/(^[\s-]|[\s-]$|[-\s]{2,})/.test(organizer.shortName) 
              ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />,
      details: !organizer?.shortName ? 'Required' : 
               organizer.shortName === 'CHANGE' ? 'Must change from default' :
               organizer.shortName.length < 3 ? 'Too short (min 3 chars)' :
               organizer.shortName.length > 9 ? 'Too long (max 9 chars)' :
               organizer.shortName.toUpperCase().includes('TANGO') ? 'Cannot contain "Tango"' :
               /(^[\s-]|[\s-]$|[-\s]{2,})/.test(organizer.shortName) ? 'Invalid format' : null
    },
    {
      label: 'Description',
      passed: organizer?.description && organizer.description.trim().length > 0,
      icon: organizer?.description && organizer.description.trim().length > 0 ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />,
      details: !organizer?.description || organizer.description.trim().length === 0 ? 'Required - Add a description of your events' : null
    },
  ];

  const allMandatoryPassed = mandatoryChecks.every(check => check.passed);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Profile Status Dashboard
        </Typography>
        {/* TIEMPO-272: Save button removed - use modal header Save All button */}
      </Box>

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
          Activating organizer role... The app will refresh automatically in 2 seconds.
        </Alert>
      )}

      {/* Profile Activation - MOVED TO TOP */}
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
              <Typography variant="body2" color={allMandatoryPassed || isEnabled ? "text.secondary" : "error"}>
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
                  onChange={(e) => {
                    // TIEMPO-272: Always use centralized field change handler
                    if (onFieldChange) {
                      onFieldChange('isEnabled', e.target.checked);
                    }
                    // Removed fallback setIsEnabled - no local state exists
                  }} 
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

      {/* Mandatory Requirements - SECOND */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Mandatory Requirements
          </Typography>
          <Typography variant="body2" color={mandatoryChecks.filter(c => !c.passed).length > 0 ? "error" : "success.main"} sx={{ mb: 2, fontWeight: 'bold' }}>
            {mandatoryChecks.filter(c => !c.passed).length > 0 
              ? `All ${mandatoryChecks.filter(c => !c.passed).length} items must be completed. You must activate to add events or artist types.`
              : isEnabled 
                ? 'All requirements completed! You can add events and apply for Artist+ types.'
                : 'All requirements completed! You can now enable your profile.'
            }
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

      {/* User Information - MOVED TO BOTTOM */}
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

      {/* Data Source Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          This dashboard shows your complete organizer status. To edit settings, use the appropriate tabs.
          Profile activation requires an app restart to take full effect.
        </Typography>
      </Box>
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
  // TIEMPO-254: Optional centralized state management props
  onFieldChange: PropTypes.func,
  unsavedChanges: PropTypes.object,
  onSave: PropTypes.func,
  isSaving: PropTypes.bool,
};

export default RegionalOrganizersStatus;