import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, CircularProgress, Alert } from '@mui/material';
import useCategories from '@/hooks/useCategories'; // Import the categories hook
import { useOrganizers } from '@/hooks/useOrganizers'; // Import the organizers hook
import { useVenues } from '@/hooks/useLocations'; // Use the renamed hook for venues
import PropTypes from 'prop-types';

const CreateEventDetailsBasic = ({ eventData, setEventData }) => {
  const categories = useCategories(); // Fetch categories
  const { organizers, fetchLoading: loadingOrganizers, error: errorOrganizers } = useOrganizers(); // Fetch organizers
  const { locations: venues, loading: loadingVenues, error: errorVenues } = useVenues(); // Fetch venues (using locations for backward compatibility)

  // Handle category change
  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    setEventData({ ...eventData, categoryFirst: selectedCategoryId });
  };

  // Handle title change
  const handleTitleChange = (event) => {
    const title = event.target.value;
    setEventData({ ...eventData, title });
  };

  // Handle organizer change
  const handleOrganizerChange = (event) => {
    const selectedOrganizerId = event.target.value;
    setEventData({ ...eventData, grantedOrganizer: selectedOrganizerId });
  };

  // Handle venue change
  const handleVenueChange = (event) => {
    const selectedVenueId = event.target.value;
    setEventData({ ...eventData, locationID: selectedVenueId });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2">
        Mandatory Event Details (Basic)
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Title Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField label="Event Title" value={eventData.title} onChange={handleTitleChange} fullWidth />
          </FormControl>
        </Grid>

        {/* Category Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={eventData.categoryFirst || ''}
              onChange={handleCategoryChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Organizer Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="organizer-label">Organizer</InputLabel>
            <Select
              labelId="organizer-label"
              value={eventData.grantedOrganizer || ''}
              onChange={handleOrganizerChange}
              label="Organizer"
              disabled={loadingOrganizers}
            >
              {loadingOrganizers ? (
                <MenuItem disabled>
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading organizers...
                  </Box>
                </MenuItem>
              ) : errorOrganizers ? (
                <MenuItem disabled>Error loading organizers</MenuItem>
              ) : organizers.length === 0 ? (
                <MenuItem disabled>No organizers found in this area</MenuItem>
              ) : (
                organizers.map((organizer) => (
                  <MenuItem key={organizer._id} value={organizer._id}>
                    {organizer.name || organizer.fullName}
                  </MenuItem>
                ))
              )}
            </Select>
            {organizers.length === 0 && !loadingOrganizers && !errorOrganizers && (
              <Alert severity="info" sx={{ mt: 1 }}>
                No organizers found in the selected location. Please select a different region or contact an administrator.
              </Alert>
            )}
          </FormControl>
        </Grid>

        {/* Venue Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="venue-label">Venue</InputLabel>
            <Select
              labelId="venue-label"
              value={eventData.locationID || ''}
              onChange={handleVenueChange}
              label="Venue"
              disabled={loadingVenues}
            >
              {loadingVenues ? (
                <MenuItem disabled>
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading venues...
                  </Box>
                </MenuItem>
              ) : errorVenues ? (
                <MenuItem disabled>Error loading venues</MenuItem>
              ) : venues.length === 0 ? (
                <MenuItem disabled>No venues found in this area</MenuItem>
              ) : (
                venues.map((venue) => (
                  <MenuItem key={venue._id} value={venue._id}>
                    {venue.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {venues.length === 0 && !loadingVenues && !errorVenues && (
              <Alert severity="info" sx={{ mt: 1 }}>
                No venues found in the selected location. Please select a different region or contact an administrator.
              </Alert>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/* Description Input */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <TextField
          label="Event Description"
          multiline
          rows={4}
          value={eventData.description}
          onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
          fullWidth
        />
      </FormControl>
    </Box>
  );
};

CreateEventDetailsBasic.propTypes = {
  eventData: PropTypes.object.isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default CreateEventDetailsBasic;
