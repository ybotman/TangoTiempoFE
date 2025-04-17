import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, CircularProgress, Alert } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useCategories from '@/hooks/useCategories'; // Import the categories hook
import { useOrganizers } from '@/hooks/useOrganizers'; // Import the organizers hook
import { useVenues } from '@/hooks/useVenues'; // Use the new venue-specific hook
import PropTypes from 'prop-types';

const CreateEventDetailsBasic = ({ eventData, setEventData }) => {
  const categories = useCategories(); // Fetch categories
  const { organizers, fetchLoading: loadingOrganizers, error: errorOrganizers } = useOrganizers(); // Fetch organizers
  const { venues, loading: loadingVenues, error: errorVenues } = useVenues(); // Fetch venues with the updated hook

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
  
  // Handle start date change
  const handleStartDateChange = (newDate) => {
    // Convert to dayjs objects for comparison
    const newDayjsDate = dayjs(newDate);
    const currentEndDate = dayjs(eventData.endDate);
    
    // If end date is before the new start date, update end date to match start date
    if (currentEndDate.isBefore(newDayjsDate)) {
      setEventData({ 
        ...eventData, 
        startDate: newDate,
        endDate: newDate
      });
    } else {
      setEventData({ ...eventData, startDate: newDate });
    }
  };
  
  // Handle end date change
  const handleEndDateChange = (newDate) => {
    // Convert to dayjs objects for comparison
    const newDayjsDate = dayjs(newDate);
    const currentStartDate = dayjs(eventData.startDate);
    
    // Ensure end date is not before start date
    if (newDayjsDate.isBefore(currentStartDate)) {
      // If selected end date is before start date, don't update
      console.warn('End date cannot be before start date');
      return;
    }
    setEventData({ ...eventData, endDate: newDate });
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
        
        {/* Start Date/Time Picker */}
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Date & Time"
              value={eventData.startDate}
              onChange={handleStartDateChange}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  required: true,
                  helperText: "When will the event start?"
                } 
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>
        
        {/* End Date/Time Picker */}
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="End Date & Time"
              value={eventData.endDate}
              onChange={handleEndDateChange}
              minDateTime={eventData.startDate}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  required: true,
                  helperText: "When will the event end?"
                } 
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
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
