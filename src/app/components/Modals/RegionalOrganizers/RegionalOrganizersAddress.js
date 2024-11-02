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
  publicContactInfo,
  wantRender,
  updateOrganizer,
}) => {
  const [phone, setPhone] = useState(publicContactInfo?.phone || '');
  const [email, setEmail] = useState(publicContactInfo?.email || '');
  const [url, setUrl] = useState(publicContactInfo?.url || '');
  const [street, setStreet] = useState(publicContactInfo?.street1 || '');
  const [city, setCity] = useState(publicContactInfo?.city || '');
  const [zip, setZip] = useState(publicContactInfo?.postalCode || '');
  const [isSearchable, setIsSearchable] = useState(wantRender);

  // Update state when props change (e.g., after saving)
  useEffect(() => {
    setPhone(publicContactInfo?.phone || '');
    setEmail(publicContactInfo?.email || '');
    setUrl(publicContactInfo?.url || '');
    setStreet(publicContactInfo?.street1 || '');
    setCity(publicContactInfo?.city || '');
    setZip(publicContactInfo?.postalCode || '');
    setIsSearchable(wantRender);
  }, [publicContactInfo, wantRender]);

  // Determine if save button should be enabled based on field changes
  const isSaveDisabled =
    phone === (publicContactInfo?.phone || '') &&
    email === (publicContactInfo?.email || '') &&
    url === (publicContactInfo?.url || '') &&
    street === (publicContactInfo?.street1 || '') &&
    city === (publicContactInfo?.city || '') &&
    zip === (publicContactInfo?.postalCode || '') &&
    isSearchable === wantRender;

  // Handle save action
  const handleSave = async () => {
    const updateData = {
      publicContactInfo: {
        phone,
        email,
        url,
        street1: street,
        city,
        postalCode: zip,
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Line 2: URL */}
      <Box mb={2}>
        <TextField
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Line 3: Street, City, Zip */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          fullWidth
        />
        <TextField
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          fullWidth
        />
        <TextField
          label="Zip"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Toggle and Save Button on the Same Line */}
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
  publicContactInfo: PropTypes.shape({
    phone: PropTypes.string,
    email: PropTypes.string,
    url: PropTypes.string,
    street1: PropTypes.string,
    city: PropTypes.string,
    postalCode: PropTypes.string,
  }),
  wantRender: PropTypes.bool,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersAddress;
