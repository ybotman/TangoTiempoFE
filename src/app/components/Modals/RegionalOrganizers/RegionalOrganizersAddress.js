import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, Button, Box, Typography, Alert, Snackbar } from '@mui/material';

const RegionalOrganizersAddress = ({ organizerId, organizer, updateOrganizer }) => {
  const publicContactInfo = organizer?.publicContactInfo || {};
  const address = publicContactInfo.address || {};

  const [phone, setPhone] = useState(publicContactInfo.phone || '');
  const [Email, setEmail] = useState(publicContactInfo.Email || '');
  const [street1, setStreet1] = useState(address.street1 || '');
  const [street2, setStreet2] = useState(address.street2 || '');
  const [city, setCity] = useState(address.city || '');
  const [state, setState] = useState(address.state || '');
  const [zip, setZip] = useState(address.postalCode || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const publicContactInfo = organizer?.publicContactInfo || {};
    const address = publicContactInfo.address || {};

    setPhone(publicContactInfo.phone || '');
    setEmail(publicContactInfo.Email || '');
    setStreet1(address.street1 || '');
    setStreet2(address.street2 || '');
    setCity(address.city || '');
    setState(address.state || '');
    setZip(address.postalCode || '');
  }, [organizer]);

  const isSaveDisabled =
    phone === (publicContactInfo.phone || '') &&
    Email === (publicContactInfo.Email || '') &&
    street1 === (address.street1 || '') &&
    street2 === (address.street2 || '') &&
    city === (address.city || '') &&
    state === (address.state || '') &&
    zip === (address.postalCode || '');

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccessMessage(false);
    
    // Create a merged update data object that includes all existing publicContactInfo
    // this prevents overwriting other fields that might be in publicContactInfo
    const updateData = {
      publicContactInfo: {
        ...organizer?.publicContactInfo, // Preserve existing fields
        phone,
        Email,
        url: organizer?.publicContactInfo?.url || '', // Preserve URL
        address: {
          street1,
          street2,
          city,
          state,
          postalCode: zip,
        },
      },
      // Don't update wantRender here, as it's managed in the Name component now
    };
    
    try {
      await updateOrganizer(organizerId, updateData);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to update address:', error);
      setErrorMessage('An error occurred while updating the address information.');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Public Contact Information
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
          Contact information has been updated successfully!
        </Alert>
      </Snackbar>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
        <TextField label="Email" value={Email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Street 1" value={street1} onChange={(e) => setStreet1(e.target.value)} fullWidth />
        <TextField label="Street 2" value={street2} onChange={(e) => setStreet2(e.target.value)} fullWidth />
        <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
        <TextField label="State" value={state} onChange={(e) => setState(e.target.value)} fullWidth />
        <TextField label="Zip" value={zip} onChange={(e) => setZip(e.target.value)} fullWidth />
      </Box>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={isSaveDisabled}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

RegionalOrganizersAddress.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.shape({
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
  }),
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersAddress;
