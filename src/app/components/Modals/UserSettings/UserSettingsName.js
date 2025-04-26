// src/components/Modals/UserSettings/UserSettingsName.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useRegions } from '@/hooks/useRegions';

const UserSettingsName = ({ userData, updateUserData }) => {
  const regions = useRegions();
  const [first, setFirst] = useState(userData?.localUserInfo?.firstName || '');
  const [last, setLast] = useState(userData?.localUserInfo?.lastName || '');
  const [region, setRegion] = useState(userData?.localUserInfo?.userDefaults?.region || '');
  const [division, setDivision] = useState(userData?.localUserInfo?.userDefaults?.division?._id || '');
  const [city, setCity] = useState(userData?.localUserInfo?.userDefaults?.city?._id || '');
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Sync prop changes into state
  useEffect(() => {
    setFirst(userData?.localUserInfo?.firstName || '');
    setLast(userData?.localUserInfo?.lastName || '');
    setRegion(userData?.localUserInfo?.userDefaults?.region || '');
    setDivision(userData?.localUserInfo?.userDefaults?.division?._id || '');
    setCity(userData?.localUserInfo?.userDefaults?.city?._id || '');
    setIsModified(false);
  }, [userData]);

  // Check if the input fields have been modified
  useEffect(() => {
    const isNameModified =
      first !== (userData?.localUserInfo?.firstName || '') || last !== (userData?.localUserInfo?.lastName || '');
    const isRegionModified = region !== (userData?.localUserInfo?.userDefaults?.region || '');
    const isDivisionModified = division !== (userData?.localUserInfo?.userDefaults?.division?._id || '');
    const isCityModified = city !== (userData?.localUserInfo?.userDefaults?.city?._id || '');
    setIsModified(isNameModified || isRegionModified || isDivisionModified || isCityModified);
  }, [first, last, region, division, city, userData]);

  const handleRegionChange = (e) => {
    const selectedRegionId = e.target.value;
    setRegion(selectedRegionId);
    setDivision('');
    setCity('');
  };

  const handleDivisionChange = (e) => {
    const selectedDivisionId = e.target.value;
    setDivision(selectedDivisionId);
    setCity('');
  };

  const handleCityChange = (e) => {
    const selectedCityId = e.target.value;
    setCity(selectedCityId);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const selectedRegionObj = regions.find((r) => r._id === region);
      const divisions = selectedRegionObj?.divisions || [];
      const selectedDivisionObj = divisions.find((d) => d._id === division);
      const cities = selectedDivisionObj?.majorCities || [];
      const selectedCityObj = cities.find((c) => c._id === city);

      await updateUserData({
        firstName: first,
        lastName: last,
        userDefaults: {
          region,
          division: selectedDivisionObj,
          city: selectedCityObj,
        },
      });
      console.log('User data updated successfully');
    } catch (error) {
      alert(`Failed to update user data. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Find the list of divisions based on the selected region
  const selectedRegionObj = regions.find((r) => r._id === region);
  const divisions = selectedRegionObj ? selectedRegionObj.divisions.filter((div) => div.active) : [];

  // Find the list of cities based on the selected division
  const selectedDivisionObj = divisions.find((d) => d._id === division);
  const cities = selectedDivisionObj ? selectedDivisionObj.majorCities.filter((city) => city.active) : [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Update Your Name and Default Location</Typography>
      <TextField
        label="First Name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField label="Last Name" value={last} onChange={(e) => setLast(e.target.value)} fullWidth margin="normal" />
      {/* Region Selection */}
      {regions.length === 0 ? (
        <Typography>Loading regions...</Typography>
      ) : (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel id="region-label">Region</InputLabel>
            <Select labelId="region-label" value={region} label="Region" onChange={handleRegionChange}>
              {regions.map((regionItem) => (
                <MenuItem key={regionItem._id} value={regionItem._id}>
                  {regionItem.regionName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Division Selection */}
          {region && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="division-label">Division</InputLabel>
              <Select labelId="division-label" value={division} label="Division" onChange={handleDivisionChange}>
                {divisions.map((divisionItem) => (
                  <MenuItem key={divisionItem._id} value={divisionItem._id}>
                    {divisionItem.divisionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {/* City Selection */}
          {division && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="city-label">City</InputLabel>
              <Select labelId="city-label" value={city} label="City" onChange={handleCityChange}>
                {cities.map((cityItem) => (
                  <MenuItem key={cityItem._id} value={cityItem._id}>
                    {cityItem.cityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </>
      )}
      <Button variant="contained" color="primary" onClick={handleSave} disabled={loading || !isModified} sx={{ mt: 2 }}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  );
};

UserSettingsName.propTypes = {
  userData: PropTypes.shape({
    localUserInfo: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      userDefaults: PropTypes.shape({
        region: PropTypes.string,
        division: PropTypes.shape({
          _id: PropTypes.string,
        }),
        city: PropTypes.shape({
          _id: PropTypes.string,
        }),
      }),
    }),
  }).isRequired,
  updateUserData: PropTypes.func.isRequired,
};

export default UserSettingsName;
