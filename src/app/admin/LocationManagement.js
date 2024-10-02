//app/admin/LocationManagement.js

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  // Select,
  // MenuItem,
  CircularProgress,
  Switch,
} from '@mui/material';
import axios from 'axios';

function ManageLocations() {
  const [locations, setLocations] = useState([]);
  // const [regions, setRegions] = useState([]); // FIXME: This is not used, so it can be removed
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // FIXME: Region data is fetched and set but not used so I commented it out temporarily
        // const [locationResponse, regionResponse] = await Promise.all([
        //   axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/locations/all`),
        //   axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/regions`),
        // ]);
        const locationResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/locations/all`
        );
        setLocations(locationResponse.data);
        // setRegions(regionResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // FIXME: This is not used, so it can be removed
  // const handleCityChange = (cityId, divisionId, regionId) => {
  //   setSelectedLocation({
  //     ...selectedLocation,
  //     calculatedCity: cityId,
  //     calculatedDivision: divisionId,
  //     calculatedRegion: regionId,
  //   });
  // };

  const handleOpen = (location = null) => {
    setIsCreating(location === null);
    setSelectedLocation(
      location || {
        name: '',
        address_1: '',
        address_2: '',
        address_3: '',
        state: '',
        city: '',
        zip: '',
        country: 'USA',
        latitude: '',
        longitude: '',
        calculatedCity: '',
        calculatedDivision: '',
        calculatedRegion: '',
        activeFlag: true, // Ensure this is initialized
        lastUsed: null, // Initialize lastUsed
      }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedLocation({ ...selectedLocation, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/locations`,
          selectedLocation
        );
        setLocations([...locations, response.data]);
      } else {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/locations/${selectedLocation._id}`,
          selectedLocation
        );
        setLocations(
          locations.map((loc) =>
            loc._id === response.data._id ? response.data : loc
          )
        );
      }
      handleClose();
    } catch (error) {
      console.error(
        `Error ${isCreating ? 'creating' : 'updating'} location:`,
        error
      );
    }
  };

  const handleToggleActive = async (locationId, activeFlag) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/locations/${locationId}`,
        { activeFlag }
      );
      setLocations(
        locations.map((loc) =>
          loc._id === response.data._id ? response.data : loc
        )
      );
    } catch (error) {
      console.error('Error updating active flag:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Manage Locations</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Create / Add Location
      </Button>
      {locations.map((location) => (
        <Box
          key={location._id}
          sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {location.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {location.city}
          </Typography>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {location.state}
          </Typography>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {location.calculatedCity?.cityName || 'N/A'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginRight: 1 }}>
            Active:
          </Typography>
          <Switch
            checked={location.activeFlag}
            onChange={(e) => handleToggleActive(location._id, e.target.checked)}
            color="primary"
          />
          <Button size="small" onClick={() => handleOpen(location)}>
            View / Edit
          </Button>
        </Box>
      ))}

      {selectedLocation && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              width: 360,
              bgcolor: 'background.paper',
              margin: 'auto',
              padding: 2,
            }}
          >
            <Typography id="modal-title" variant="h6" sx={{ marginBottom: 2 }}>
              {isCreating ? 'Create Location' : 'Edit Location'}
            </Typography>
            <TextField
              label="Name"
              name="name"
              value={selectedLocation.name || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Address Line 1"
              name="address_1"
              value={selectedLocation.address_1 || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Address Line 2"
              name="address_2"
              value={selectedLocation.address_2 || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Address Line 3"
              name="address_3"
              value={selectedLocation.address_3 || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="State"
              name="state"
              value={selectedLocation.state || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="City"
              name="city"
              value={selectedLocation.city || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Zip"
              name="zip"
              value={selectedLocation.zip || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Country"
              name="country"
              value={selectedLocation.country || 'USA'}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Latitude"
              name="latitude"
              value={selectedLocation.latitude || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Longitude"
              name="longitude"
              value={selectedLocation.longitude || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Calculated City"
              name="calculatedCity"
              value={selectedLocation.calculatedCity?.cityName || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              disabled
            />
            <Button
              onClick={handleSave}
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
            >
              {isCreating ? 'Create' : 'Save'}
            </Button>
          </Box>
        </Modal>
      )}
    </Box>
  );
}

export default ManageLocations;
