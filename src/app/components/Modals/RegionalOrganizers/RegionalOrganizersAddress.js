// src/components/Modals/RegionalOrganizers/RegionalOrganizersAddress.js

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
} from '@mui/material';

const RegionalOrganizersAddress = ({
  organizerId,
  organizer,
  updateOrganizer,
}) => {
  const publicContactInfo = organizer?.publicContactInfo || {};
  const address = publicContactInfo.address || {};

  // Corrected `useState` initializations
  const [phone, setPhone] = useState(publicContactInfo.phone || '');
  const [Email, setEmail] = useState(publicContactInfo.Email || '');
  const [street1, setStreet1] = useState(
    publicContactInfo.address?.street1 || ''
  );
  const [street2, setStreet2] = useState(
    publicContactInfo.address?.street2 || ''
  );
  const [city, setCity] = useState(publicContactInfo.address?.city || '');
  const [state, setState] = useState(publicContactInfo.address?.state || '');
  const [zip, setZip] = useState(publicContactInfo.address?.postalCode || '');
  const [isSearchable, setIsSearchable] = useState(
    organizer?.wantRender || false
  );

  // Update state when organizer prop changes
  useEffect(() => {
    const publicContactInfo = organizer?.publicContactInfo || {};

    setPhone(publicContactInfo.phone || '');
    setEmail(publicContactInfo.Email || '');
    setStreet1(publicContactInfo.address?.street1 || '');
    setStreet2(publicContactInfo.address?.street2 || '');
    setCity(publicContactInfo.address?.city || '');
    setState(publicContactInfo.address?.state || '');
    setZip(publicContactInfo.address?.postalCode || '');
    setIsSearchable(organizer?.wantRender || false);
  }, [organizer]);

  // Determine if save button should be enabled
  const isSaveDisabled =
    phone === (publicContactInfo.phone || '') &&
    Email === (publicContactInfo.Email || '') &&
    street1 === (address.street1 || '') &&
    street2 === (address.street2 || '') &&
    city === (address.city || '') &&
    state === (address.state || '') &&
    zip === (address.postalCode || '') &&
    isSearchable === (organizer?.wantRender || false);

  // Handle save action
  const handleSave = async () => {
    const updateData = {
      publicContactInfo: {
        phone,
        Email,
        address: {
          street1,
          street2,
          city,
          state,
          postalCode: zip,
        },
      },
      wantRender: isSearchable,
    };
    try {
      await updateOrganizer(organizerId, updateData);
      console.log('Address updated successfully.');
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Line 1: Phone and Email */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={Email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Line 2: Address Fields (Street 1 and Street 2) */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Street 1"
          value={street1}
          onChange={(e) => setStreet1(e.target.value)}
          fullWidth
        />
        <TextField
          label="Street 2"
          value={street2}
          onChange={(e) => setStreet2(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Line 3: City, State, Zip */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          fullWidth
        />
        <TextField
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          fullWidth
        />
        <TextField
          label="Zip"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Toggle and Save Button */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <FormControlLabel
          control={
            <Switch
              checked={isSearchable}
              onChange={(e) => setIsSearchable(e.target.checked)}
              color="primary"
            />
          }
          label="Make Organizer Searchable"
        />
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={isSaveDisabled}
        >
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
      address: PropTypes.shape({
        street1: PropTypes.string,
        street2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        postalCode: PropTypes.string,
      }),
    }),
    wantRender: PropTypes.bool,
  }),
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersAddress;
