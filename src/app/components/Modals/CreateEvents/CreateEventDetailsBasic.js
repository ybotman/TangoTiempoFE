import React, { useEffect, useContext, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, CircularProgress, Alert, Paper, Autocomplete } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useCategories from '@/hooks/useCategories'; // Import the categories hook
import { useVenues } from '@/hooks/useVenues'; // Use the new venue-specific hook
import { AuthContext } from '@/contexts/AuthContext'; // Import Auth context
import PropTypes from 'prop-types';

const CreateEventDetailsBasic = ({ eventData, setEventData }) => {
  const categories = useCategories(); // Fetch categories
  const { venues, loading: loadingVenues, error: errorVenues, fetchVenues } = useVenues(); // Fetch venues with the updated hook
  const { user } = useContext(AuthContext); // Get current user info
  const [filteredVenues, setFilteredVenues] = useState([]); // State for filtered venues
  const [venueInputValue, setVenueInputValue] = useState(''); // Track input for search ahead
  
  // Force venue refresh when component mounts
  useEffect(() => {
    fetchVenues();
    console.log('CreateEventDetailsBasic: Refreshing venues, current list:', venues?.length || 0);
  }, [fetchVenues]);
  
  // Filter venues based on search input
  useEffect(() => {
    if (!venues) return;
    
    if (!venueInputValue) {
      setFilteredVenues(venues);
      return;
    }
    
    const searchTerm = venueInputValue.toLowerCase();
    const filtered = venues.filter(venue => {
      const venueName = (venue.name || venue.shortName || '').toLowerCase();
      return venueName.includes(searchTerm);
    });
    
    setFilteredVenues(filtered);
  }, [venues, venueInputValue]);
  
  // Set owner organizer info from user context when component mounts
  useEffect(() => {
    if (user && user.backendInfo?.regionalOrganizerInfo?.organizerId) {
      // Extract organizer information
      const orgInfo = user.backendInfo.regionalOrganizerInfo;
      const orgId = user.backendInfo.regionalOrganizerInfo.organizerId;
      const orgName = user.backendInfo.regionalOrganizerInfo.organizerName || 
                     (user.backendInfo.localUserInfo && 
                      `${user.backendInfo.localUserInfo.firstName || ''} ${user.backendInfo.localUserInfo.lastName || ''}`.trim());
      
      console.log('User has regionalOrganizerInfo:', orgInfo);
      console.log('Organizer flags:', {
        isActive: orgInfo.isActive,
        isEnabled: orgInfo.isEnabled,
        isApproved: orgInfo.isApproved
      });
      
      // Check if all required flags are set for the regionalOrganizerInfo
      const allFlagsEnabled = orgInfo.isActive && orgInfo.isEnabled && orgInfo.isApproved;
      if (!allFlagsEnabled) {
        console.warn('Regional organizer flags not all enabled - this will cause permission issues when creating events');
      }
      
      setEventData(prevData => ({
        ...prevData,
        // Owner Organizer data is set automatically from the current user's organization
        ownerOrganizerID: orgId,
        ownerOrganizerName: orgName || orgInfo.fullName || user.displayName || 'Your Organization'
      }));
      
      console.log('Set owner organizer from user profile:', orgName, 'ID:', orgId);
    }
  }, [user, setEventData]);

  // Handle category change
  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    
    // Find the selected category to get its name
    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
    
    // Store both the ID and the name - the ID in categoryFirstId (new field) and the name in categoryFirst
    setEventData({ 
      ...eventData, 
      categoryFirstId: selectedCategoryId,
      categoryFirst: selectedCategory ? selectedCategory.categoryName : '' 
    });
  };

  // Handle title change
  const handleTitleChange = (event) => {
    const title = event.target.value;
    setEventData({ ...eventData, title });
  };

  // Handle venue change from autocomplete
  const handleVenueChange = (event, newValue) => {
    if (!newValue) {
      // Clear venue selection
      setEventData({
        ...eventData,
        locationID: '',
        locationName: ''
      });
      return;
    }
    
    // Store both the ID and the name
    setEventData({ 
      ...eventData, 
      locationID: newValue._id,
      locationName: newValue.name || newValue.shortName || ''
    });
  };
  
  // Handle venue input change for filtering
  const handleVenueInputChange = (event, newInputValue) => {
    setVenueInputValue(newInputValue);
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
                  required: true
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
                  required: true
                } 
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Title Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField 
              label="Event Title" 
              value={eventData.title} 
              onChange={handleTitleChange}
              required
              fullWidth
            />
          </FormControl>
        </Grid>

        {/* Category Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={eventData.categoryFirstId || ''}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">
                <em>None (will use 'Other')</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Owner Organizer Display (not editable) - smaller size */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: '80px' }}>
                Created by:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {eventData.ownerOrganizerName || 
                 (user?.backendInfo?.regionalOrganizerInfo?.organizerName || 
                  user?.backendInfo?.regionalOrganizerInfo?.fullName || 
                  user?.displayName || 
                  'Your Organization')}
              </Typography>
            </Box>
          </FormControl>
        </Grid>

        {/* Venue Selection - Searchable Autocomplete */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <Autocomplete
              id="venue-autocomplete"
              options={filteredVenues || []}
              loading={loadingVenues}
              value={eventData.locationID ? (venues || []).find(v => v._id === eventData.locationID) || null : null}
              onChange={handleVenueChange}
              onInputChange={handleVenueInputChange}
              getOptionLabel={(option) => option.name || option.shortName || `Venue ${option._id}`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Venue (type to search)"
                  variant="outlined"
                  error={Boolean(errorVenues)}
                  helperText={errorVenues ? "Error loading venues" : ""}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingVenues ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText="No venues found. Try a different search or region."
              loadingText="Loading venues..."
              filterOptions={(x) => x} // We're handling filtering ourselves via the filteredVenues state
            />
            {venues && venues.length === 0 && !loadingVenues && !errorVenues && (
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
