// src/app/components/Modals/Venues/VenueModalList.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useCalculatedLocations } from '@/hooks/useCalculatedLocations';

const VenueModalList = ({
  venues,
  onEdit,
  onDelete,
  selectedCityId,
  onCityChange,
  activeFilter,
  onActiveFilterChange,
  refreshList,
}) => {
  const { countries, regions, divisions, cities, fetchCountries, fetchRegions, fetchDivisions, fetchCities } =
    useCalculatedLocations();

  const [countryId, setCountryId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [cityId, setCityId] = useState(selectedCityId || '');
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    // Assume single country scenario. If multiple, we can prompt user.
    fetchCountries(true);
  }, [fetchCountries]);

  useEffect(() => {
    if (countryId) {
      fetchRegions(countryId, activeFilter);
    }
  }, [countryId, fetchRegions, activeFilter]);

  useEffect(() => {
    if (regionId) {
      fetchDivisions(regionId, activeFilter);
    }
  }, [regionId, fetchDivisions, activeFilter]);

  useEffect(() => {
    if (divisionId) {
      fetchCities(divisionId, activeFilter);
    }
  }, [divisionId, fetchCities, activeFilter]);

  useEffect(() => {
    setCityId(selectedCityId || '');
  }, [selectedCityId]);

  const handleCountryChange = (e) => {
    const val = e.target.value;
    setCountryId(val);
    setRegionId('');
    setDivisionId('');
    setCityId('');
    onCityChange(''); // reset city filter
  };

  const handleRegionChange = (e) => {
    const val = e.target.value;
    setRegionId(val);
    setDivisionId('');
    setCityId('');
    onCityChange('');
  };

  const handleDivisionChange = (e) => {
    const val = e.target.value;
    setDivisionId(val);
    setCityId('');
    onCityChange('');
  };

  const handleCityChangeEvent = (e) => {
    const val = e.target.value;
    setCityId(val);
    onCityChange(val); // Filter venues by this cityId
  };

  const handleActiveChange = (e) => {
    onActiveFilterChange(e.target.checked);
  };

  const handleDeleteVenue = async (venueId) => {
    setDeleteError(null);
    try {
      await onDelete(venueId);
      refreshList();
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Venue List
      </Typography>
      {deleteError && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {deleteError}
        </Typography>
      )}

      <Box display="flex" flexDirection="row" gap={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
        {/* Country Dropdown */}
        <TextField select label="Country" value={countryId} onChange={handleCountryChange} sx={{ minWidth: 200 }}>
          <MenuItem value="">Select Country</MenuItem>
          {countries.map((co) => (
            <MenuItem key={co._id} value={co._id}>
              {co.countryName}
            </MenuItem>
          ))}
        </TextField>

        {/* Region Dropdown */}
        <TextField
          select
          label="Region"
          value={regionId}
          onChange={handleRegionChange}
          sx={{ minWidth: 200 }}
          disabled={!countryId}
        >
          <MenuItem value="">Select Region</MenuItem>
          {regions.map((r) => (
            <MenuItem key={r._id} value={r._id}>
              {r.regionName}
            </MenuItem>
          ))}
        </TextField>

        {/* Division Dropdown */}
        <TextField
          select
          label="Division"
          value={divisionId}
          onChange={handleDivisionChange}
          sx={{ minWidth: 200 }}
          disabled={!regionId}
        >
          <MenuItem value="">Select Division</MenuItem>
          {divisions.map((d) => (
            <MenuItem key={d._id} value={d._id}>
              {d.divisionName}
            </MenuItem>
          ))}
        </TextField>

        {/* City Dropdown */}
        <TextField
          select
          label="City"
          value={cityId}
          onChange={handleCityChangeEvent}
          sx={{ minWidth: 200 }}
          disabled={!divisionId}
        >
          <MenuItem value="">All Cities</MenuItem>
          {cities.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.cityName}
            </MenuItem>
          ))}
        </TextField>

        <FormControlLabel
          control={<Switch checked={activeFilter} onChange={handleActiveChange} />}
          label="Show Active Only"
        />
        <Button variant="contained" onClick={refreshList}>
          Refresh
        </Button>
      </Box>

      {venues.length === 0 ? (
        <Typography>No venues found.</Typography>
      ) : (
        <List>
          {venues.map((v) => {
            const addr = [v.address1, v.address2, v.address3].filter(Boolean).join(', ');
            const cityName = v.calculatedCityId?.cityName || 'No City';
            const statusText = v.isActive ? '' : '(Inactive)';

            return (
              <React.Fragment key={v._id}>
                <ListItem
                  button="true"
                  onDoubleClick={() => onEdit(v)}
                  secondaryAction={
                    v.isActive && (
                      <Button variant="outlined" color="error" onClick={() => handleDeleteVenue(v._id)}>
                        Deactivate
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={`${v.name} (${v.shortName})`}
                    secondary={`${addr} - ${cityName} ${statusText}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

VenueModalList.propTypes = {
  venues: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      shortName: PropTypes.string,
      address1: PropTypes.string,
      address2: PropTypes.string,
      address3: PropTypes.string,
      calculatedCityId: PropTypes.shape({
        cityName: PropTypes.string,
      }),
      isActive: PropTypes.bool,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  selectedCityId: PropTypes.string,
  onCityChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  onActiveFilterChange: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
};

export default VenueModalList;
