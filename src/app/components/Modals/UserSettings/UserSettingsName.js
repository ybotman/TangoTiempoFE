// src/components/Modals/UserSettings/UserSettingsName.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress } from '@mui/material';
import { useRegions } from '@/hooks/useRegions';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const UserSettingsName = ({ userData, updateUserData }) => {
  // Use updated regions hook with loading and error state
  const { regions, loading: regionsLoading, error: regionsError } = useRegions();

  // Also connect to GeoLocationContext as a backup data source
  // This helps prepare for future migration from RegionsContext
  const geoLocation = useGeoLocation();

  const [first, setFirst] = useState(userData?.localUserInfo?.firstName || '');
  const [last, setLast] = useState(userData?.localUserInfo?.lastName || '');
  const [region, setRegion] = useState(userData?.localUserInfo?.userDefaults?.region || '');
  const [division, setDivision] = useState(userData?.localUserInfo?.userDefaults?.division?._id || '');
  const [city, setCity] = useState(userData?.localUserInfo?.userDefaults?.city?._id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);

    try {
      // Get region data with proper error handling
      const selectedRegionObj = Array.isArray(regions) ? regions.find((r) => r && r._id === region) : null;

      // Get division data with proper error handling
      const divisionsArray = selectedRegionObj && selectedRegionObj.divisions ?
        (Array.isArray(selectedRegionObj.divisions) ? selectedRegionObj.divisions : []) : [];
      const selectedDivisionObj = Array.isArray(divisionsArray) ?
        divisionsArray.find((d) => d && d._id === division) : null;

      // Get city data with proper error handling
      const citiesArray = selectedDivisionObj && selectedDivisionObj.majorCities ?
        (Array.isArray(selectedDivisionObj.majorCities) ? selectedDivisionObj.majorCities : []) : [];
      const selectedCityObj = Array.isArray(citiesArray) ?
        citiesArray.find((c) => c && c._id === city) : null;

      // Validate we have at least a region before saving
      if (!region) {
        throw new Error("Please select a region before saving");
      }

      // Create a clean user data object for update
      const userData = {
        firstName: first || '',
        lastName: last || '',
        userDefaults: {
          region,
          division: selectedDivisionObj || null,
          city: selectedCityObj || null,
        },
      };

      // Log what we're saving
      console.log('Saving user data:', userData);

      // Call the update method
      await updateUserData(userData);

      console.log('User data updated successfully');
    } catch (err) {
      console.error('Error saving user data:', err);
      setError(err.message || 'Failed to update user settings');
    } finally {
      setLoading(false);
    }
  };

  // Find the list of divisions based on the selected region
  const selectedRegionObj = Array.isArray(regions) ? regions.find((r) => r._id === region) : null;
  const divisions = selectedRegionObj && Array.isArray(selectedRegionObj.divisions)
    ? selectedRegionObj.divisions.filter((div) => div.active)
    : [];

  // Find the list of cities based on the selected division
  const selectedDivisionObj = Array.isArray(divisions) ? divisions.find((d) => d._id === division) : null;
  const cities = selectedDivisionObj && Array.isArray(selectedDivisionObj.majorCities)
    ? selectedDivisionObj.majorCities.filter((city) => city.active)
    : [];

  // Try to get location data from GeoLocationContext if regions data is not available
  useEffect(() => {
    if (regionsError && geoLocation && geoLocation.selectedLocation) {
      console.log('Using GeoLocationContext as fallback for regions data');
      // TODO: In Phase 2, fully migrate to using GeoLocationContext
      // For now, just set selected region if we don't have one
      if (!region && geoLocation.selectedLocation.region.id) {
        setRegion(geoLocation.selectedLocation.region.id);
      }
    }
  }, [regionsError, geoLocation, region]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Update Your Name and Default Location</Typography>

      {/* Error message for API errors */}
      {(regionsError || error) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error || regionsError || "There was an issue loading location data. Some options may be limited."}
        </Alert>
      )}

      <TextField
        label="First Name"
        value={first}
        onChange={(e) => setFirst(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField label="Last Name" value={last} onChange={(e) => setLast(e.target.value)} fullWidth margin="normal" />

      {/* Region Selection */}
      {regionsLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Loading regions data...</Typography>
        </Box>
      ) : !Array.isArray(regions) || regions.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No regions data available. Please try again later.
        </Alert>
      ) : (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel id="region-label">Region</InputLabel>
            <Select
              labelId="region-label"
              value={region}
              label="Region"
              onChange={handleRegionChange}
              error={!region && Boolean(regionsError)}
            >
              {Array.isArray(regions) ? regions.map((regionItem) => regionItem && (
                <MenuItem key={regionItem._id} value={regionItem._id}>
                  {regionItem.regionName}
                </MenuItem>
              )) : null}
            </Select>
          </FormControl>

          {/* Division Selection */}
          {region && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="division-label">Division</InputLabel>
              <Select
                labelId="division-label"
                value={division}
                label="Division"
                onChange={handleDivisionChange}
                error={!division && Boolean(regionsError)}
              >
                {Array.isArray(divisions) ? divisions.map((divisionItem) => divisionItem && (
                  <MenuItem key={divisionItem._id} value={divisionItem._id}>
                    {divisionItem.divisionName}
                  </MenuItem>
                )) : (
                  <MenuItem disabled value="">
                    <em>No divisions available</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          {/* City Selection */}
          {division && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                value={city}
                label="City"
                onChange={handleCityChange}
                error={!city && Boolean(regionsError)}
              >
                {Array.isArray(cities) ? cities.map((cityItem) => cityItem && (
                  <MenuItem key={cityItem._id} value={cityItem._id}>
                    {cityItem.cityName}
                  </MenuItem>
                )) : (
                  <MenuItem disabled value="">
                    <em>No cities available</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={loading || !isModified}
        sx={{ mt: 2 }}
      >
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
