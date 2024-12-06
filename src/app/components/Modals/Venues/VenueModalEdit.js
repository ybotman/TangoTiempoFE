// src/app/components/Modals/Venues/VenueModalEdit.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';

// Similar to Add, but pre-filled and can update.

const VenueModalEdit = ({ venue, onUpdate, refreshList, onDone }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [address, setAddress] = useState('');
  const [cityName, setCityName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (venue) {
      setName(venue.name || '');
      setShortName(venue.shortName || '');
      setAddress(venue.address || '');
      setCityName(venue.cityName || '');
      setLatitude(venue.latitude?.toString() || '');
      setLongitude(venue.longitude?.toString() || '');
      setActive(venue.active);
    }
  }, [venue]);

  if (!venue) {
    return <Typography>No venue selected.</Typography>;
  }

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
        active,
      };
      await onUpdate(venue._id, data);
      refreshList();
      onDone();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update venue');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Edit Venue
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
        <Typography variant="body2">
          Active: {active ? 'Yes' : 'No'} (To deactivate, use Deactivate button
          in list)
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={isSaveDisabled}
        sx={{ mt: 2 }}
      >
        Save Changes
      </Button>
      <Button variant="text" onClick={onDone} sx={{ mt: 1 }}>
        Cancel
      </Button>
    </Box>
  );
};

VenueModalEdit.propTypes = {
  venue: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    cityName: PropTypes.string.isRequired,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    active: PropTypes.bool,
  }),
  onUpdate: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default VenueModalEdit;
