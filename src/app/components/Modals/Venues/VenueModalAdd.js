// src/app/components/Modals/Venues/VenueModalAdd.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';

// The Add form:
// name, shortName, address, cityName
// "Get Geo" button simulates geocoding. For now assume user inputs lat/long or integrated geocode logic externally.
// We'll just trust user for lat/long. Real scenario: call a geocoding API.

const VenueModalAdd = ({ onAdd, refreshList, onDone }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [address, setAddress] = useState('');
  const [cityName, setCityName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isSaveDisabled =
    !name || !shortName || !address || !cityName || !latitude || !longitude;

  const handleSave = async () => {
    setErrorMessage('');
    try {
      const data = {
        name: name.trim(),
        shortName: shortName.trim(),
        address: address.trim(),
        cityName: cityName.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      await onAdd(data);
      refreshList();
      onDone();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add venue');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Venue
      </Typography>
      {errorMessage && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Venue Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Short Name"
          fullWidth
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
        />
        <TextField
          label="Address (full)"
          fullWidth
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextField
          label="City Name"
          fullWidth
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
        />
        <TextField
          label="Latitude"
          fullWidth
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <TextField
          label="Longitude"
          fullWidth
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={isSaveDisabled}
        sx={{ mt: 2 }}
      >
        Save
      </Button>
      <Button variant="text" onClick={onDone} sx={{ mt: 1 }}>
        Cancel
      </Button>
    </Box>
  );
};

VenueModalAdd.propTypes = {
  onAdd: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default VenueModalAdd;
