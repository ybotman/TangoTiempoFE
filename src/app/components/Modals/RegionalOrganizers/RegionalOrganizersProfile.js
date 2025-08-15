'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Snackbar, 
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const RegionalOrganizersProfile = ({ organizerId, organizer, updateOrganizer }) => {
  // Name fields
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  
  // Address fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
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

  const isSaveDisabled = () => {
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
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave} 
          disabled={isSaveDisabled()}
          size="medium"
          sx={{ minWidth: 150 }}
        >
          Save Profile
        </Button>
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
                onChange={(e) => setFullName(e.target.value)}
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
                onChange={(e) => setShortName(e.target.value)}
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
                onChange={(e) => setUrl(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
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
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Street Address 1"
                fullWidth
                value={street1}
                onChange={(e) => setStreet1(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Street Address 2"
                fullWidth
                value={street2}
                onChange={(e) => setStreet2(e.target.value)}
                helperText="Apartment, suite, etc. (optional)"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                fullWidth
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="Zip Code"
                fullWidth
                value={zip}
                onChange={(e) => setZip(e.target.value)}
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
};

export default RegionalOrganizersProfile;