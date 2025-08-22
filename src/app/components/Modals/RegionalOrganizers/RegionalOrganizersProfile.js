'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  TextField, 
  Alert, 
  Snackbar, 
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const RegionalOrganizersProfile = ({ organizerId, organizer, updateOrganizer, onFieldChange, unsavedChanges, onSave, isSaving }) => {
  // Local state (needed for fallback when centralized state is not available)
  const [localFullName, setFullName] = useState('');
  const [localShortName, setShortName] = useState('');
  const [localDescription, setDescription] = useState('');
  const [localUrl, setUrl] = useState('');
  const [localPhone, setPhone] = useState('');
  const [localEmail, setEmail] = useState('');
  const [localStreet1, setStreet1] = useState('');
  const [localStreet2, setStreet2] = useState('');
  const [localCity, setCity] = useState('');
  const [localState, setState] = useState('');
  const [localZip, setZip] = useState('');
  
  // TIEMPO-254: Use unsaved changes if available, otherwise use local state
  const fullName = unsavedChanges?.fullName !== undefined ? unsavedChanges.fullName : localFullName;
  const shortName = unsavedChanges?.shortName !== undefined ? unsavedChanges.shortName : localShortName;
  const description = unsavedChanges?.description !== undefined ? unsavedChanges.description : localDescription;
  const url = unsavedChanges?.['publicContactInfo.url'] !== undefined ? unsavedChanges['publicContactInfo.url'] : localUrl;
  const phone = unsavedChanges?.['publicContactInfo.phone'] !== undefined ? unsavedChanges['publicContactInfo.phone'] : localPhone;
  const email = unsavedChanges?.['publicContactInfo.Email'] !== undefined ? unsavedChanges['publicContactInfo.Email'] : localEmail;
  const street1 = unsavedChanges?.['publicContactInfo.address.street1'] !== undefined ? unsavedChanges['publicContactInfo.address.street1'] : localStreet1;
  const street2 = unsavedChanges?.['publicContactInfo.address.street2'] !== undefined ? unsavedChanges['publicContactInfo.address.street2'] : localStreet2;
  const city = unsavedChanges?.['publicContactInfo.address.city'] !== undefined ? unsavedChanges['publicContactInfo.address.city'] : localCity;
  const state = unsavedChanges?.['publicContactInfo.address.state'] !== undefined ? unsavedChanges['publicContactInfo.address.state'] : localState;
  const zip = unsavedChanges?.['publicContactInfo.address.postalCode'] !== undefined ? unsavedChanges['publicContactInfo.address.postalCode'] : localZip;
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (organizer) {
      // Name fields
      setFullName(organizer.fullName || '');
      setShortName(organizer.shortName || '');
      setDescription(organizer.description || '');
      setUrl(organizer.publicContactInfo?.url || '');
      
      // Address fields
      const publicContactInfo = organizer.publicContactInfo || {};
      const address = publicContactInfo.address || {};
      
      setPhone(publicContactInfo.phone || '');
      setEmail(publicContactInfo.Email || '');
      setStreet1(address.street1 || '');
      setStreet2(address.street2 || '');
      setCity(address.city || '');
      setState(address.state || '');
      setZip(address.postalCode || '');
    }
  }, [organizer]);

  const isShortNameInvalid = () => {
    const trimmedShortName = shortName.trim();
    return (
      trimmedShortName.length < 3 ||
      trimmedShortName.length > 9 ||
      trimmedShortName === 'CHANGE' ||
      trimmedShortName.toUpperCase().includes('TANGO') ||
      /(^[\s-]|[\s-]$|[-\s]{2,})/.test(trimmedShortName)
    );
  };

  // TIEMPO-254: Use centralized isSaving if available
  const isSaveDisabled = () => {
    if (isSaving !== undefined) return isSaving;
    
    // Check if name fields have changed
    const nameChanged = 
      fullName !== (organizer?.fullName || '') ||
      shortName !== (organizer?.shortName || '') ||
      description !== (organizer?.description || '') ||
      url !== (organizer?.publicContactInfo?.url || '');
    
    // Check if address fields have changed
    const publicContactInfo = organizer?.publicContactInfo || {};
    const address = publicContactInfo.address || {};
    
    const addressChanged = 
      phone !== (publicContactInfo.phone || '') ||
      email !== (publicContactInfo.Email || '') ||
      street1 !== (address.street1 || '') ||
      street2 !== (address.street2 || '') ||
      city !== (address.city || '') ||
      state !== (address.state || '') ||
      zip !== (address.postalCode || '');
    
    // Check if data is valid
    const dataInvalid = 
      fullName === 'New Organizer' ||
      fullName.trim().length < 7 ||
      isShortNameInvalid();
    
    return (!nameChanged && !addressChanged) || dataInvalid;
  };

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    // TIEMPO-254: Use centralized save handler if available
    if (onSave) {
      return onSave();
    }
    
    // Fallback to original implementation
    if (fullName.trim().length < 7 || fullName === 'New Organizer') {
      setErrorMessage('Full Name must be at least 7 characters and cannot be "New Organizer".');
      return;
    }
    if (isShortNameInvalid()) {
      setErrorMessage(
        'Short Name must be between 3 and 9 characters, cannot be "CHANGE" or contain "TANGO", and must not contain invalid patterns like double spaces or hyphens.'
      );
      return;
    }

    const updateData = {
      fullName,
      shortName,
      description,
      publicContactInfo: {
        ...organizer?.publicContactInfo,
        url,
        phone,
        Email: email,
        address: {
          street1,
          street2,
          city,
          state,
          postalCode: zip,
        },
      },
    };

    try {
      await updateOrganizer(organizerId, updateData);
      setErrorMessage('');
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage('An error occurred while updating the profile information.');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Profile Information
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
          Profile information has been updated successfully!
        </Alert>
      </Snackbar>

      {/* Name Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Organizer Identity
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    onFieldChange('fullName', value);
                  } else {
                    setFullName(value);
                  }
                }}
                error={fullName === 'New Organizer' || fullName.trim().length < 7}
                helperText={
                  fullName === 'New Organizer'
                    ? 'Full Name cannot be "New Organizer".'
                    : fullName.trim().length < 7
                      ? 'Full Name must be at least 7 characters.'
                      : 'Official organizer name (min 7 chars)'
                }
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Short Name"
                fullWidth
                value={shortName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    onFieldChange('shortName', value);
                  } else {
                    setShortName(value);
                  }
                }}
                error={isShortNameInvalid()}
                helperText={
                  isShortNameInvalid()
                    ? 'Must be 3-9 chars, no "CHANGE" or "TANGO"'
                    : 'Display name (3-9 chars)'
                }
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="URL (Web or Social Media)"
                fullWidth
                value={url}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    onFieldChange('publicContactInfo', { ...organizer?.publicContactInfo, url: value });
                  } else {
                    setUrl(value);
                  }
                }}
                helperText="Optional website or social media link"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    onFieldChange('description', value);
                  } else {
                    setDescription(value);
                  }
                }}
                helperText="Tell dancers about your organization"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <ContactMailIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Contact Information
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    onFieldChange('publicContactInfo', { ...organizer?.publicContactInfo, phone: value });
                  } else {
                    setPhone(value);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    onFieldChange('publicContactInfo', { ...organizer?.publicContactInfo, Email: value });
                  } else {
                    setEmail(value);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Street Address 1"
                fullWidth
                value={street1}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    const currentAddress = organizer?.publicContactInfo?.address || {};
                    onFieldChange('publicContactInfo', { 
                      ...organizer?.publicContactInfo, 
                      address: { ...currentAddress, street1: value }
                    });
                  } else {
                    setStreet1(value);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Street Address 2"
                fullWidth
                value={street2}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    const currentAddress = organizer?.publicContactInfo?.address || {};
                    onFieldChange('publicContactInfo', { 
                      ...organizer?.publicContactInfo, 
                      address: { ...currentAddress, street2: value }
                    });
                  } else {
                    setStreet2(value);
                  }
                }}
                helperText="Apartment, suite, etc. (optional)"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                fullWidth
                value={city}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    const currentAddress = organizer?.publicContactInfo?.address || {};
                    onFieldChange('publicContactInfo', { 
                      ...organizer?.publicContactInfo, 
                      address: { ...currentAddress, city: value }
                    });
                  } else {
                    setCity(value);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                fullWidth
                value={state}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    const currentAddress = organizer?.publicContactInfo?.address || {};
                    onFieldChange('publicContactInfo', { 
                      ...organizer?.publicContactInfo, 
                      address: { ...currentAddress, state: value }
                    });
                  } else {
                    setState(value);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="Zip Code"
                fullWidth
                value={zip}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onFieldChange) {
                    const currentAddress = organizer?.publicContactInfo?.address || {};
                    onFieldChange('publicContactInfo', { 
                      ...organizer?.publicContactInfo, 
                      address: { ...currentAddress, postalCode: value }
                    });
                  } else {
                    setZip(value);
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

RegionalOrganizersProfile.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.shape({
    fullName: PropTypes.string,
    shortName: PropTypes.string,
    description: PropTypes.string,
    publicContactInfo: PropTypes.shape({
      phone: PropTypes.string,
      Email: PropTypes.string,
      url: PropTypes.string,
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

export default RegionalOrganizersProfile;