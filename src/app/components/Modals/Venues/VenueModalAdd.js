'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
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
  const [masteredCityId, setMasteredCityId] = useState(null);
  const [masteredDivisionId, setMasteredDivisionId] = useState(null);
  const [masteredRegionId, setMasteredRegionId] = useState(null);
  const [masteredCountryId, setMasteredCountryId] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');

  const isSaveDisabled = !name || !shortName;

  function toRad(value) {
    return (value * Math.PI) / 180;
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // radius Earth in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist;
  }

  const verifyData = async () => {
    setErrorMessage('');

    // Step A: Geocode Address
    let latLongResult;
    try {
      latLongResult = await geocodeAddress(address1, address2, address3, city, state, zip);
      if (!latLongResult) {
        setErrorMessage('Geocoding failed. Cannot proceed without lat/long.');
        return;
      }
      setLatitude(latLongResult.latitude.toString());
      setLongitude(latLongResult.longitude.toString());
    } catch (err) {
      console.error(err);
      setErrorMessage('Geocoding failed. Cannot proceed.');
      return;
    }

    // Step B: Find nearest masteredCity
    let cityInfo;
    try {
      const cityResponse = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/masteredLocations/nearestCity`, {
        params: {
          latitude: latLongResult.latitude,
          longitude: latLongResult.longitude,
        },
      });
      cityInfo = cityResponse.data;
      if (!cityInfo || !cityInfo.cityId) {
        setErrorMessage('No nearest city found. Venue may be inactive.');
        return;
      }
      setMasteredCityId(cityInfo.cityId || null);
      setMasteredDivisionId(cityInfo.divisionId || null);
      setMasteredRegionId(cityInfo.regionId || null);
      setMasteredCountryId(cityInfo.countryId || null);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to find nearest calculated city.');
      return;
    }

    // Step D: Check for duplicates within 300 meters in the same masteredCity
    // We'll filter by cityId. If cityId is known, we can pass it as cityId param.
    try {
      const venuesResponse = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/venues`, {
        params: { cityId: cityInfo.cityId, isActive: true },
      });
      const venuesInCity = venuesResponse.data || [];
      const currentLat = parseFloat(latLongResult.latitude);
      const currentLon = parseFloat(latLongResult.longitude);

      for (const v of venuesInCity) {
        if (v.latitude && v.longitude) {
          const dist = calculateDistance(currentLat, currentLon, v.latitude, v.longitude);
          if (dist < 300) {
            console.log('Error: Another venue within 300 meters in this city.');
            // No blocking, just logging error.
            break;
          }
        }
      }
    } catch (err) {
      console.error('Error checking duplicates:', err);
    }

    // Done verifying, user can now save.
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

      // Include calculated fields if we got them
      if (masteredCityId) data.masteredCityId = masteredCityId;
      if (masteredDivisionId) data.masteredDivisionId = masteredDivisionId;
      if (masteredRegionId) data.masteredRegionId = masteredRegionId;
      if (masteredCountryId) data.masteredCountryId = masteredCountryId;

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
        <TextField label="Venue Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Short Name" fullWidth value={shortName} onChange={(e) => setShortName(e.target.value)} />

        {/* Address Box */}
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            border: '1px solid #ccc',
            p: 2,
            borderRadius: 1,
            backgroundColor: '#f9f9f9',
          }}
        >
          <TextField label="Address 1" fullWidth value={address1} onChange={(e) => setAddress1(e.target.value)} />

          {/* Address 2 and 3 on one line, smaller */}
          <Box display="flex" gap={2}>
            <TextField label="Address 2" fullWidth value={address2} onChange={(e) => setAddress2(e.target.value)} />
            <TextField label="Address 3" fullWidth value={address3} onChange={(e) => setAddress3(e.target.value)} />
          </Box>

          {/* City/State line */}
          <Box display="flex" gap={2} alignItems="flex-end">
            <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} sx={{ flex: 1 }} />
            <TextField label="State" value={state} onChange={(e) => setState(e.target.value)} sx={{ width: 120 }} />
          </Box>

          {/* Zip and Verify line */}
          <Box display="flex" gap={2} alignItems="flex-end">
            <TextField label="Zip" value={zip} onChange={(e) => setZip(e.target.value)} sx={{ flex: 1 }} />
            <Button variant="outlined" size="small" onClick={verifyData}>
              Verify
            </Button>
          </Box>
        </Box>

        <TextField label="Phone" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField label="Comments" fullWidth value={comments} onChange={(e) => setComments(e.target.value)} />

        {latitude && longitude && (
          <Typography variant="body2">
            Geo found: Lat: {latitude}, Lng: {longitude}
          </Typography>
        )}

        <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaveDisabled} sx={{ mt: 2 }}>
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
