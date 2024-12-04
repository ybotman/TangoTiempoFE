import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const RegionalOrganizersAddress = ({
  organizerId,
  organizer,
  updateOrganizer,
}) => {
  const publicContactInfo = organizer?.publicContactInfo || {};
  const address = publicContactInfo.address || {};

  const [phone, setPhone] = useState(publicContactInfo.phone || '');
  const [Email, setEmail] = useState(publicContactInfo.Email || '');
  const [street1, setStreet1] = useState(address.street1 || '');
  const [street2, setStreet2] = useState(address.street2 || '');
  const [city, setCity] = useState(address.city || '');
  const [state, setState] = useState(address.state || '');
  const [zip, setZip] = useState(address.postalCode || '');
  const [isSearchable, setIsSearchable] = useState(
    organizer?.wantRender || false
  );

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
    setIsSearchable(organizer?.wantRender || false);
  }, [organizer]);

  const isSaveDisabled =
    phone === (publicContactInfo.phone || '') &&
    Email === (publicContactInfo.Email || '') &&
    street1 === (address.street1 || '') &&
    street2 === (address.street2 || '') &&
    city === (address.city || '') &&
    state === (address.state || '') &&
    zip === (address.postalCode || '') &&
    isSearchable === (organizer?.wantRender || false);

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
      //console.log('Address updated successfully.');
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Public Contact Information
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
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
        mt={2}
      >
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={isSearchable}
                onChange={(e) => setIsSearchable(e.target.checked)}
                color="primary"
              />
            }
            label="Allow Search Engines to Crawl"
          />
          <Tooltip title="Your name, phone, primary image, address, and description will be structured for search engines to crawl and display in relevant searches.">
            <IconButton>
              <InfoIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
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
