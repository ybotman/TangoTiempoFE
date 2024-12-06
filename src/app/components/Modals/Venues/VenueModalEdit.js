// src/app/components/Modals/Venues/VenueModalEdit.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';
import { geocodeAddress } from '@/utils/geoLocations';

const VenueModalEdit = ({ venue, onUpdate, refreshList, onDone }) => {
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
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (venue) {
      setName(venue.name || '');
      setShortName(venue.shortName || '');
      setAddress1(venue.address1 || '');
      setAddress2(venue.address2 || '');
      setAddress3(venue.address3 || '');
      setCity(venue.city || '');
      setState(venue.state || '');
      setZip(venue.zip || '');
      setPhone(venue.phone || '');
      setComments(venue.comments || '');
      setLatitude(venue.latitude?.toString() || '');
      setLongitude(venue.longitude?.toString() || '');
      setActive(venue.active);
    }
  }, [venue]);

  if (!venue) {
    return <Typography>No venue selected.</Typography>;
  }

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
          'Geocoding failed. Without lat/long, venue may remain inactive.'
        );
      }
    } catch (err) {
      setErrorMessage(
        'Geocoding failed. Without lat/long, venue may remain inactive.'
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
        active,
      };
      if (latitude) data.latitude = parseFloat(latitude);
      if (longitude) data.longitude = parseFloat(longitude);

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
          Active: {active ? 'Yes' : 'No'} (Use deactivate button in list to turn
          off)
        </Typography>

        <Button variant="outlined" onClick={handleGetGeo}>
          Get Geo from Address
        </Button>
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
    name: PropTypes.string,
    shortName: PropTypes.string,
    address1: PropTypes.string,
    address2: PropTypes.string,
    address3: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zip: PropTypes.string,
    phone: PropTypes.string,
    comments: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    active: PropTypes.bool,
    calculatedCityId: PropTypes.shape({
      cityName: PropTypes.string,
    }),
  }),
  onUpdate: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default VenueModalEdit;
