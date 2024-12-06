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
import axios from 'axios';

// This component shows a list of venues with filters for city and active/inactive.
// Double-clicking a venue goes to edit mode.

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
  const [cities, setCities] = useState([]);
  const [cityFilter, setCityFilter] = useState(selectedCityId || '');
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    // Fetch city list for dropdown
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/calculatedLocations/activeCities`
        );
        // response data format: [{cityName, cityCode, ...}]
        // We'll just store as is and show cityName
        setCities(response.data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    setCityFilter(selectedCityId || '');
  }, [selectedCityId]);

  const handleCityChange = (e) => {
    const val = e.target.value;
    setCityFilter(val);
    onCityChange(val);
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
      <Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          select
          label="City Filter"
          value={cityFilter}
          onChange={handleCityChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Cities</MenuItem>
          {cities.map((c) => (
            <MenuItem key={c.cityName} value={c._id || ''}>
              {c.cityName}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Switch checked={activeFilter} onChange={handleActiveChange} />
          }
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
          {venues.map((v) => (
            <React.Fragment key={v._id}>
              <ListItem
                button="true"
                onDoubleClick={() => onEdit(v)}
                secondaryAction={
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteVenue(v._id)}
                  >
                    Deactivate
                  </Button>
                }
              >
                <ListItemText
                  primary={`${v.name} (${v.shortName})`}
                  secondary={`${v.address} - ${v.cityName} ${v.active ? '' : '(Inactive)'}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

VenueModalList.propTypes = {
  venues: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortName: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      cityName: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
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
