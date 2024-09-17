'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Switch,
} from '@mui/material';
import axios from 'axios';

function ManageOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [organizerResponse, regionResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/all`),
          axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/regions`),
        ]);
        setOrganizers(organizerResponse.data);
        setRegions(regionResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  const handleCityChange = (cityId, divisionId, regionId) => {
    setSelectedOrganizer({
      ...selectedOrganizer,
      organizerCity: cityId,
      organizerDivision: divisionId,
      organizerRegion: regionId,
    });
  };

  const handleOpen = (organizer = null) => {
    setIsCreating(organizer === null);
    setSelectedOrganizer(
      organizer || {
        name: '',
        shortName: '',
        firebaseUserId: '',
        organizerCity: '',
        organizerDivision: '',
        organizerRegion: '',
        url: '',
        description: '',
        phone: '',
        publicEmail: '',
        loginId: '',
        paymentTier: 'free',
        activeFlag: true, // Ensure this is initialized
      }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedOrganizer(null);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedOrganizer({ ...selectedOrganizer, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`,
          selectedOrganizer
        );
        setOrganizers([...organizers, response.data]);
      } else {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${selectedOrganizer._id}`,
          selectedOrganizer
        );
        setOrganizers(
          organizers.map((org) =>
            org._id === response.data._id ? response.data : org
          )
        );
      }
      handleClose();
    } catch (error) {
      console.error(
        `Error ${isCreating ? 'creating' : 'updating'} organizer:`,
        error
      );
    }
  };

  const handleToggleActive = async (organizerId, activeFlag) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`,
        { activeFlag }
      );
      setOrganizers(
        organizers.map((org) =>
          org._id === response.data._id ? response.data : org
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
      <Typography variant="h6">Manage Organizers</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Create / Add Organizer
      </Button>
      {organizers.map((organizer) => (
        <Box
          key={organizer._id}
          sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {organizer.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {regions
              .flatMap((region) =>
                region.divisions.flatMap((division) =>
                  division.majorCities.filter(
                    (city) => city._id === organizer.organizerCity
                  )
                )
              )
              .map((city) => city.cityName)}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginRight: 1 }}>
            Active:
          </Typography>
          <Switch
            checked={organizer.activeFlag}
            onChange={(e) =>
              handleToggleActive(organizer._id, e.target.checked)
            }
            color="primary"
          />
          <Button size="small" onClick={() => handleOpen(organizer)}>
            View / Edit
          </Button>
        </Box>
      ))}

      {selectedOrganizer && (
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
              {isCreating ? 'Create Organizer' : 'Edit Organizer'}
            </Typography>
            {/* Add form fields for editing/creating an organizer here */}
            <TextField
              label="Name"
              name="name"
              value={selectedOrganizer.name || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Short Name"
              name="shortName"
              value={selectedOrganizer.shortName || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Firebase ID"
              name="firebaseUserId"
              value={selectedOrganizer.firebaseUserId || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <Select
              label="City"
              name="organizerCity"
              value={selectedOrganizer.organizerCity || ''}
              onChange={(e) => {
                const selectedCity = e.target.value;
                const region = regions.find((region) =>
                  region.divisions.some((division) =>
                    division.majorCities.some(
                      (city) => city._id === selectedCity
                    )
                  )
                );
                const division = region.divisions.find((division) =>
                  division.majorCities.some((city) => city._id === selectedCity)
                );
                handleCityChange(selectedCity, division._id, region._id);
              }}
              fullWidth
              margin="dense"
            >
              {regions.flatMap((region) =>
                region.divisions.flatMap((division) =>
                  division.majorCities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.cityName}
                    </MenuItem>
                  ))
                )
              )}
            </Select>
            <TextField
              label="URL"
              name="url"
              value={selectedOrganizer.url || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Description"
              name="description"
              value={selectedOrganizer.description || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Phone"
              name="phone"
              value={selectedOrganizer.phone || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Public Email"
              name="publicEmail"
              value={selectedOrganizer.publicEmail || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Login ID"
              name="loginId"
              value={selectedOrganizer.loginId || ''}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            />
            <Select
              label="Payment Tier"
              name="paymentTier"
              value={selectedOrganizer.paymentTier || 'free'}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </Select>
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

export default ManageOrganizers;
