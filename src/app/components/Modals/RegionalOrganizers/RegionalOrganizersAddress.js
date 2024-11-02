import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Switch, FormControlLabel, Typography } from '@mui/material';

const RegionalOrganizersAddress = ({ organizerId, publicContactInfo, wantRender, updateOrganizer }) => {
  const [contactInfo, setContactInfo] = useState(publicContactInfo);
  const [isWantRender, setIsWantRender] = useState(wantRender);
  const [isModified, setIsModified] = useState(false); // Tracks if the values are modified

  // Update local state when props change
  useEffect(() => {
    setContactInfo(publicContactInfo);
    setIsWantRender(wantRender);
    setIsModified(false); // Reset modification tracker on prop change
  }, [publicContactInfo, wantRender]);

  const handleInputChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
    setIsModified(true); // Mark as modified
  };

  const handleSave = async () => {
    const updateData = {
      publicContactInfo: contactInfo,
      wantRender: isWantRender,
    };
    await updateOrganizer(organizerId, updateData);
    setIsModified(false); // Reset modification tracker after saving
  };

  return (
    <Box>
      <Typography variant="h6">Organizer Address</Typography>

      <TextField
        label="Phone"
        fullWidth
        value={contactInfo.phone || ''}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        margin="normal"
      />
      <TextField
        label="Email"
        fullWidth
        value={contactInfo.email || ''}
        onChange={(e) => handleInputChange('email', e.target.value)}
        margin="normal"
      />
      <TextField
        label="URL"
        fullWidth
        value={contactInfo.url || ''}
        onChange={(e) => handleInputChange('url', e.target.value)}
        margin="normal"
      />
      <TextField
        label="Street 1"
        fullWidth
        value={contactInfo.address?.street1 || ''}
        onChange={(e) => handleInputChange('address.street1', e.target.value)}
        margin="normal"
      />
      <TextField
        label="Street 2"
        fullWidth
        value={contactInfo.address?.street2 || ''}
        onChange={(e) => handleInputChange('address.street2', e.target.value)}
        margin="normal"
      />
      <TextField
        label="City"
        fullWidth
        value={contactInfo.address?.city || ''}
        onChange={(e) => handleInputChange('address.city', e.target.value)}
        margin="normal"
      />
      <TextField
        label="State"
        fullWidth
        value={contactInfo.address?.state || ''}
        onChange={(e) => handleInputChange('address.state', e.target.value)}
        margin="normal"
      />
      <TextField
        label="Postal Code"
        fullWidth
        value={contactInfo.address?.postalCode || ''}
        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
        margin="normal"
      />

      <FormControlLabel
        control={
          <Switch
            checked={isWantRender}
            onChange={(e) => {
              setIsWantRender(e.target.checked);
              setIsModified(true); // Mark as modified
            }}
            color="primary"
          />
        }
        label="Make Organizer Searchable"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={!isModified} // Disable save if no changes
        style={{ marginTop: '1em' }}
      >
        Save
      </Button>
    </Box>
  );
};

RegionalOrganizersAddress.propTypes = {
  organizerId: PropTypes.string.isRequired,
  publicContactInfo: PropTypes.shape({
    phone: PropTypes.string,
    email: PropTypes.string,
    url: PropTypes.string,
    address: PropTypes.shape({
      street1: PropTypes.string,
      street2: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      postalCode: PropTypes.string,
    }),
  }),
  wantRender: PropTypes.bool,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersAddress;