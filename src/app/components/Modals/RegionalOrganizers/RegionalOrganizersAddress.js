// src/components/Modals/RegionalOrganizers/RegionalOrganizersAddress.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';

const RegionalOrganizersAddress = ({
  publicContactInfo,
  wantRender,
  updateOrganizer,
}) => {
  const [formValues, setFormValues] = useState({
    phone: publicContactInfo?.phone || '',
    email: publicContactInfo?.email || '',
    url: publicContactInfo?.url || '',
    street1: publicContactInfo?.address?.street1 || '',
    street2: publicContactInfo?.address?.street2 || '',
    city: publicContactInfo?.address?.city || '',
    state: publicContactInfo?.address?.state || '',
    postalCode: publicContactInfo?.address?.postalCode || '',
  });

  const [isChanged, setIsChanged] = useState(false);
  const [isSearchable, setIsSearchable] = useState(wantRender);

  useEffect(() => {
    const initialValues = JSON.stringify(formValues);
    const currentValues = JSON.stringify({
      phone: publicContactInfo?.phone || '',
      email: publicContactInfo?.email || '',
      url: publicContactInfo?.url || '',
      street1: publicContactInfo?.address?.street1 || '',
      street2: publicContactInfo?.address?.street2 || '',
      city: publicContactInfo?.address?.city || '',
      state: publicContactInfo?.address?.state || '',
      postalCode: publicContactInfo?.address?.postalCode || '',
    });
    setIsChanged(initialValues !== currentValues);
  }, [formValues, publicContactInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleSaveClick = async () => {
    const updateData = {
      publicContactInfo: {
        phone: formValues.phone,
        email: formValues.email,
        url: formValues.url,
        address: {
          street1: formValues.street1,
          street2: formValues.street2,
          city: formValues.city,
          state: formValues.state,
          postalCode: formValues.postalCode,
        },
      },
      wantRender: isSearchable,
    };

    try {
      await updateOrganizer(formValues._id, updateData);
      alert('Address information updated successfully.');
    } catch (error) {
      console.error('Error updating address information:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Contact Information</Typography>
      <TextField
        label="Phone"
        name="phone"
        fullWidth
        margin="normal"
        value={formValues.phone}
        onChange={handleChange}
      />
      <TextField
        label="Email"
        name="email"
        fullWidth
        margin="normal"
        value={formValues.email}
        onChange={handleChange}
      />
      <TextField
        label="URL"
        name="url"
        fullWidth
        margin="normal"
        value={formValues.url}
        onChange={handleChange}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Address
      </Typography>
      <TextField
        label="Street 1"
        name="street1"
        fullWidth
        margin="normal"
        value={formValues.street1}
        onChange={handleChange}
      />
      <TextField
        label="Street 2"
        name="street2"
        fullWidth
        margin="normal"
        value={formValues.street2}
        onChange={handleChange}
      />
      <TextField
        label="City"
        name="city"
        fullWidth
        margin="normal"
        value={formValues.city}
        onChange={handleChange}
      />
      <TextField
        label="State"
        name="state"
        fullWidth
        margin="normal"
        value={formValues.state}
        onChange={handleChange}
      />
      <TextField
        label="Postal Code"
        name="postalCode"
        fullWidth
        margin="normal"
        value={formValues.postalCode}
        onChange={handleChange}
      />

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
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSaveClick}
        disabled={!isChanged}
      >
        Save
      </Button>
    </Box>
  );
};

RegionalOrganizersAddress.propTypes = {
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
  wantRender: PropTypes.bool.isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersAddress;
