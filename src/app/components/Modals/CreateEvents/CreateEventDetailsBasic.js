import React, { useEffect, useContext, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, CircularProgress, Alert, Autocomplete } from '@mui/material';
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
  
  // Force venue refresh when component mounts and set initial venue input
  useEffect(() => {
    fetchVenues();
    console.log('CreateEventDetailsBasic: Refreshing venues, current list:', venues?.length || 0);
    
    // If we have a venue ID but no venue name (edit mode), set the input value
    if ((eventData.venueId || eventData.locationID) && !venueInputValue) {
      const currentVenue = venues.find(v => v?._id === (eventData.venueId || eventData.locationID));
      if (currentVenue) {
        setVenueInputValue(currentVenue.name || currentVenue.shortName || '');
      }
    }
  }, [fetchVenues, eventData.venueId, eventData.locationID]);
  
  // Filter venues based on search input
  useEffect(() => {
    // Ensure venues is an array
    const venuesArray = Array.isArray(venues) ? venues : [];
    
    if (venuesArray.length === 0) {
      setFilteredVenues([]);
      return;
    }
    
    if (!venueInputValue) {
      setFilteredVenues(venuesArray);
      return;
    }
    
    const searchTerm = venueInputValue.toLowerCase();
    const filtered = venuesArray.filter(venue => {
      // Safety check for venue object
      if (!venue || typeof venue !== 'object') return false;
      const venueName = ((venue.name || venue.shortName || '').toString()).toLowerCase();
      return venueName.includes(searchTerm);
    });
    
    setFilteredVenues(filtered);
    console.log(`Filtered venues: ${filtered.length} of ${venuesArray.length} total`);
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
        // Use both new venue fields and legacy location fields for compatibility
        venueId: '',
        venueName: '',
        locationID: '',
        locationName: '',
        // Clear coordinates
        venueLatitude: null,
        venueLongitude: null
      });
      console.log('Venue cleared');
      return;
    }
    
    // Validate new value is a proper venue object
    if (typeof newValue !== 'object' || !newValue._id) {
      console.error('Invalid venue object received:', newValue);
      return;
    }
    
    // Store both the ID and the name
    const venueName = newValue.name || newValue.shortName || `Venue ${newValue._id}`;
    console.log(`Selected venue: ${venueName} (ID: ${newValue._id})`);
    
    // Create updated event data with venue info
    const updatedEventData = { 
      ...eventData, 
      // Use new standardized venue fields
      venueId: newValue._id,
      venueName: venueName,
      // Also keep legacy fields for backward compatibility
      locationID: newValue._id,
      locationName: venueName
    };
    
    // Add the coordinates if available
    if (newValue.latitude && newValue.longitude) {
      console.log(`Venue has coordinates: [${newValue.longitude}, ${newValue.latitude}]`);
      updatedEventData.venueLatitude = newValue.latitude;
      updatedEventData.venueLongitude = newValue.longitude;
    } else {
      console.log('Selected venue does not have coordinates');
      // Clear any existing coordinates
      updatedEventData.venueLatitude = null;
      updatedEventData.venueLongitude = null;
    }
    
    setEventData(updatedEventData);
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

        {/* Short Title Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField 
              label="Short Title (15 chars max)" 
              value={eventData.shortTitle || eventData.shortName || ''} 
              onChange={(e) => {
                const value = e.target.value.slice(0, 15); // Enforce 15 char limit
                setEventData({ ...eventData, shortTitle: value, shortName: value });
              }}
              required
              inputProps={{ maxLength: 15 }}
              helperText={`${(eventData.shortTitle || eventData.shortName || '').length}/15 characters`}
              fullWidth
            />
          </FormControl>
        </Grid>

        {/* Category Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={eventData.categoryFirstId || ''}
              onChange={handleCategoryChange}
              label="Category"
              required
            >
              <MenuItem value="" disabled>
                <em>Select a category</em>
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
              options={Array.isArray(filteredVenues) ? filteredVenues : []}
              loading={loadingVenues}
              value={(() => {
                if (!eventData.venueId && !eventData.locationID) return null;
                if (!Array.isArray(venues) || venues.length === 0) {
                  // If venues not loaded yet but we have venue data, create a placeholder
                  if (eventData.venueName || eventData.locationName) {
                    return {
                      _id: eventData.venueId || eventData.locationID,
                      name: eventData.venueName || eventData.locationName,
                      shortName: eventData.venueName || eventData.locationName
                    };
                  }
                  return null;
                }
                return venues.find(v => v?._id === (eventData.venueId || eventData.locationID)) || null;
              })()}
              onChange={handleVenueChange}
              onInputChange={handleVenueInputChange}
              getOptionLabel={(option) => {
                // Safety check for option
                if (!option || typeof option !== 'object') return '';
                return option.name || option.shortName || `Venue ${option._id || 'unknown'}`;
              }}
              isOptionEqualToValue={(option, value) => {
                // Safety checks for option and value
                if (!option || !value || typeof option !== 'object' || typeof value !== 'object') return false;
                return option._id === value._id;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Venue (type to search)"
                  variant="outlined"
                  required
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
              filterOptions={(x) => Array.isArray(x) ? x : []} // Ensure filter options is always an array
            />
            {venues && venues.length === 0 && !loadingVenues && !errorVenues && (
              <Alert severity="info" sx={{ mt: 1 }}>
                No venues found in the selected location. Please select a different region or contact an administrator.
              </Alert>
            )}
          </FormControl>
        </Grid>

        {/* Cost Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField 
              label="Cost" 
              value={eventData.cost || ''} 
              onChange={(e) => setEventData({ ...eventData, cost: e.target.value })}
              placeholder="e.g., Free, $20, Donation"
              helperText="Enter the cost or pricing information for the event"
              fullWidth
            />
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
          required
          fullWidth
        />
      </FormControl>
    </Box>
  );
};

CreateEventDetailsBasic.propTypes = {
  eventData: PropTypes.shape({
    title: PropTypes.string,
    shortTitle: PropTypes.string,
    shortName: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    categoryFirstId: PropTypes.string,
    categoryFirst: PropTypes.string,
    // Support both venue and location fields
    venueId: PropTypes.string,
    venueName: PropTypes.string,
    locationID: PropTypes.string,
    locationName: PropTypes.string,
    description: PropTypes.string,
    ownerOrganizerName: PropTypes.string,
    cost: PropTypes.string,
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default CreateEventDetailsBasic;
