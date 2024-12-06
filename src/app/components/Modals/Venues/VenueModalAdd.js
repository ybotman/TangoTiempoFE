'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';
import { geocodeAddress } from '@/utils/geoLocations';

const VenueModalAdd = ({ onAdd, refreshList, onDone }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [comments, setComments] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isSaveDisabled = !name || !shortName;

  const handleGetGeo = async () => {
    setErrorMessage('');
    try {
      const result = await geocodeAddress(
        address1,
        address2,
        address3,
        city,
        state,
        zip
      );
      if (result) {
        setLatitude(result.latitude.toString());
        setLongitude(result.longitude.toString());
      } else {
        setErrorMessage(
          'Geocoding failed. Without lat/long, venue may be inactive.'
        );
      }
    } catch (err) {
      setErrorMessage(
        'Geocoding failed. Without lat/long, venue may be inactive.'
      );
      console.log(err);
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    try {
      const data = {
        name: name.trim(),
        shortName: shortName.trim(),
        address1: address1.trim(),
        address2: address2.trim(),
        address3: address3.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        phone: phone.trim(),
        comments: comments.trim(),
      };
      if (latitude && longitude) {
        data.latitude = parseFloat(latitude);
        data.longitude = parseFloat(longitude);
      }

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
          label="Address 1"
          fullWidth
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
        />
        <TextField
          label="Address 2"
          fullWidth
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
        />
        <TextField
          label="Address 3"
          fullWidth
          value={address3}
          onChange={(e) => setAddress3(e.target.value)}
        />
        <TextField
          label="City"
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <TextField
          label="State"
          fullWidth
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        <TextField
          label="Zip"
          fullWidth
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
        <TextField
          label="Phone"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          label="Comments"
          fullWidth
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />

        <Button variant="outlined" onClick={handleGetGeo}>
          Get Geo from Address
        </Button>
        {latitude && longitude && (
          <Typography variant="body2">
            Geo found: Lat: {latitude}, Lng: {longitude}
          </Typography>
        )}

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
    </Box>
  );
};

VenueModalAdd.propTypes = {
  onAdd: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default VenueModalAdd;
