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
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/calculatedLocations/activeCities`);
        setCities(response.data); // [{_id, cityName}, ...]
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
        <TextField select label="City Filter" value={cityFilter} onChange={handleCityChange} sx={{ minWidth: 200 }}>
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
            return (
              <React.Fragment key={v._id}>
                <ListItem
                  button="true"
                  onDoubleClick={() => onEdit(v)}
                  secondaryAction={
                    v.active && (
                      <Button variant="outlined" color="error" onClick={() => handleDeleteVenue(v._id)}>
                        Deactivate
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={`${v.name} (${v.shortName})`}
                    secondary={`${addr} - ${cityName} ${v.active ? '' : '(Inactive)'}`}
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
      name: PropTypes.string.isRequired,
      shortName: PropTypes.string.isRequired,
      address1: PropTypes.string,
      address2: PropTypes.string,
      address3: PropTypes.string,
      calculatedCityId: PropTypes.shape({
        cityName: PropTypes.string,
      }),
      active: PropTypes.bool,
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
