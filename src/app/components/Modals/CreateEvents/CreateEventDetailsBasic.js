import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Box, Typography, FormControl, InputLabel, TextField, Grid, CircularProgress, Alert, Autocomplete, Select, MenuItem, Button } from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useCategories from '@/hooks/useCategories'; // Import the categories hook
import { useVenues } from '@/hooks/useVenues'; // Use the new venue-specific hook
import { useOrganizers } from '@/hooks/useOrganizers'; // Import organizers hook for RA selection
import { useRAOrganizers } from '@/hooks/useRAOrganizers'; // Import specialized RA organizers hook
import { AuthContext } from '@/contexts/AuthContext'; // Import Auth context
import { useGeoLocation } from '@/contexts/GeoLocationContext'; // TIEMPO-276: Import location context for debugging
import VenueModalAdd from '@/components/Modals/Venues/VenueModalAdd'; // TIEMPO-258: Import venue modal
import PropTypes from 'prop-types';

const CreateEventDetailsBasic = ({ eventData, setEventData, editMode = false, organizer = null }) => {
  const categories = useCategories(); // Fetch categories
  const { venues, loading: loadingVenues, error: errorVenues, fetchVenues } = useVenues(); // Fetch venues with the updated hook
  const { selectedLocation } = useGeoLocation(); // TIEMPO-276: Get location for debugging
  const { user, selectedRole } = useContext(AuthContext); // Get current user info and selected role
  const { organizers: regularOrganizers, loading: loadingRegularOrganizers } = useOrganizers(); // Fetch organizers for regular use
  const { organizers: raOrganizers, loading: loadingRAOrganizers } = useRAOrganizers(); // Fetch RA-specific organizers
  
  // Use appropriate organizers based on selected role
  const organizers = selectedRole === 'RegionalAdmin' ? raOrganizers : regularOrganizers;
  const loadingOrganizers = selectedRole === 'RegionalAdmin' ? loadingRAOrganizers : loadingRegularOrganizers;
  const [filteredVenues, setFilteredVenues] = useState([]); // State for filtered venues
  const [venueInputValue, setVenueInputValue] = useState(''); // Track input for search ahead
  const [isVenueReady, setIsVenueReady] = useState(false); // Track if venue select is ready
  const [showVenueModal, setShowVenueModal] = useState(false); // TIEMPO-258: Venue modal state
  
  // TIEMPO-276: DEBUG - Remove after testing
  useEffect(() => {
    console.log('🔍 VENUE DEBUG:');
    console.log('- Selected Location:', selectedLocation);
    console.log('- Lat/Lng:', selectedLocation?.latitude, selectedLocation?.longitude);
    console.log('- ZoomRange:', selectedLocation?.zoomRange);
    console.log('- Venues loaded:', venues.length);
    console.log('- First venue:', venues[0]?.venueName, venues[0]?.distance);
  }, [selectedLocation, venues]);
  
  // Force venue refresh when component mounts
  useEffect(() => {
    setIsVenueReady(false);
    fetchVenues().then(() => {
      // Delay setting venue ready to prevent MUI warnings during initial render
      setTimeout(() => setIsVenueReady(true), 100);
    });
  }, [fetchVenues]);
  
  // Set initial venue input value when venues are loaded or eventData changes
  useEffect(() => {
    // If we have a venue ID and venue name from event data, use it
    if ((eventData.venueId || eventData.locationID) && (eventData.venueName || eventData.locationName)) {
      const newValue = eventData.venueName || eventData.locationName || '';
      // Only update if different to prevent loops
      if (venueInputValue !== newValue) {
        setVenueInputValue(newValue);
      }
    } else if ((eventData.venueId || eventData.locationID) && venues.length > 0) {
      // Try to find venue in loaded list
      const currentVenue = venues.find(v => v?._id === (eventData.venueId || eventData.locationID));
      if (currentVenue) {
        const newValue = currentVenue.name || currentVenue.shortName || '';
        // Only update if different to prevent loops
        if (venueInputValue !== newValue) {
          setVenueInputValue(newValue);
        }
      }
    }
  }, [eventData.venueId, eventData.locationID, eventData.venueName, eventData.locationName, venues.length, venueInputValue]); // Add venueInputValue to dependencies
  
  // Filter venues based on search input
  useEffect(() => {
    // Ensure venues is an array
    const venuesArray = Array.isArray(venues) ? venues : [];
    
    // Add test inactive venues if we have venues but none are inactive
    let enhancedVenues = [...venuesArray];
    if (venuesArray.length > 0 && !venuesArray.some(v => v.isActive === false)) {
      // Mark the first two venues as inactive for testing
      if (venuesArray.length >= 2) {
        enhancedVenues = venuesArray.map((venue, index) => {
          if (index === 0 || index === 1) {
            return { ...venue, isActive: false };
          }
          return venue;
        });
      }
    }
    
    if (enhancedVenues.length === 0) {
      setFilteredVenues([]);
      return;
    }
    
    if (!venueInputValue) {
      setFilteredVenues(enhancedVenues);
      return;
    }
    
    const searchTerm = venueInputValue.toLowerCase();
    const filtered = enhancedVenues.filter(venue => {
      // Safety check for venue object
      if (!venue || typeof venue !== 'object') return false;
      const venueName = ((venue.name || venue.shortName || '').toString()).toLowerCase();
      return venueName.includes(searchTerm);
    });
    
    setFilteredVenues(filtered);
  }, [venues, venueInputValue]);
  
  // Set owner organizer info from user context when component mounts (only for RegionalOrganizer)
  useEffect(() => {
    if (selectedRole === 'RegionalOrganizer' && user && user.backendInfo?.regionalOrganizerInfo?.organizerId) {
      // Extract organizer information
      const orgInfo = user.backendInfo.regionalOrganizerInfo;
      const orgId = user.backendInfo.regionalOrganizerInfo.organizerId;
      const orgName = user.backendInfo.regionalOrganizerInfo.organizerName || 
                     (user.backendInfo.localUserInfo && 
                      `${user.backendInfo.localUserInfo.firstName || ''} ${user.backendInfo.localUserInfo.lastName || ''}`.trim());
      
      
      // Check if all required flags are set for the regionalOrganizerInfo
      const allFlagsEnabled = orgInfo.isActive && orgInfo.isEnabled && orgInfo.isApproved;
      if (!allFlagsEnabled) {
        console.warn('Regional organizer flags not all enabled - this will cause permission issues when creating events');
      }
      
      setEventData(prevData => {
        // Only update if values are different to prevent infinite loops
        if (prevData.ownerOrganizerID !== orgId || prevData.ownerOrganizerName !== (orgName || orgInfo.fullName || user.displayName || 'Your Organization')) {
          // Use the fetched organizer data if available
          const organizerData = organizer || orgInfo;
          const shortName = organizerData?.shortName || organizerData?.fullName || orgName || 'Event Organizer';
          
          return {
            ...prevData,
            // Owner Organizer data is set automatically from the current user's organization
            ownerOrganizerID: orgId,
            ownerOrganizerName: orgName || orgInfo.fullName || user.displayName || 'Your Organization',
            ownerOrganizerShortName: shortName
          };
        }
        return prevData;
      });
    }
  }, [user, selectedRole, organizer, setEventData]); // Add selectedRole and organizer dependencies

  // Category change is now handled inline in the Autocomplete component

  // Handle title change
  const handleTitleChange = (event) => {
    const title = event.target.value;
    setEventData(prevData => ({ ...prevData, title }));
  };

  // Handle organizer selection for RA users
  const handleOrganizerChange = (event) => {
    const selectedOrganizerId = event.target.value;
    
    // Find the selected organizer to get its name
    const selectedOrganizer = organizers.find(org => org._id === selectedOrganizerId);
    
    // Store the ID, name, and shortName (use fullName as fallback for shortName)
    setEventData(prevData => ({ 
      ...prevData, 
      ownerOrganizerID: selectedOrganizerId,
      ownerOrganizerName: selectedOrganizer ? selectedOrganizer.fullName : '',
      ownerOrganizerShortName: selectedOrganizer ? (selectedOrganizer.shortName || selectedOrganizer.fullName) : ''
    }));
  };

  // Handle venue change from autocomplete
  const handleVenueChange = (event, newValue) => {
    if (!newValue) {
      // Clear venue selection
      setEventData(prevData => ({
        ...prevData,
        // Use both new venue fields and legacy location fields for compatibility
        venueId: '',
        venueName: '',
        locationID: '',
        locationName: '',
        // Clear coordinates
        venueLatitude: null,
        venueLongitude: null
      }));
      return;
    }
    
    // Validate new value is a proper venue object
    if (typeof newValue !== 'object' || !newValue._id) {
      console.error('Invalid venue object received:', newValue);
      return;
    }
    
    // TIEMPO-246: Log venue data to check for timezone
    // TIEMPO-276: Security cleanup - removed logging
    
    // Store both the ID and the name
    const venueName = newValue.name || newValue.shortName || `Venue ${newValue._id}`;
    
    // Create updated event data with venue info
    setEventData(prevData => {
      const updatedEventData = { 
        ...prevData, 
        // Use new standardized venue fields
        venueId: newValue._id,
        venueName: venueName,
        // TIEMPO-246: Store venue timezone for event creation
        venueTimezone: newValue.timezone || newValue.venueTimezone || null,
        venueTimezoneAbbr: newValue.timezoneAbbr || null,
        // Also keep legacy fields for backward compatibility
        locationID: newValue._id,
        locationName: venueName
      };
      
      // Add the coordinates if available
      if (newValue.latitude && newValue.longitude) {
        updatedEventData.venueLatitude = newValue.latitude;
        updatedEventData.venueLongitude = newValue.longitude;
      } else {
        // Clear any existing coordinates
        updatedEventData.venueLatitude = null;
        updatedEventData.venueLongitude = null;
      }
      
      return updatedEventData;
    });
  };
  
  // Handle venue input change for filtering
  const handleVenueInputChange = (event, newInputValue) => {
    setVenueInputValue(newInputValue);
  };


  // TIEMPO-258: Handle venue creation callback
  const handleVenueCreated = async (newVenue) => {
// TIEMPO-276: Security cleanup - removed logging
    
    // Refresh venue list
    await fetchVenues();
    
    // Auto-select the new venue
    if (newVenue && newVenue._id) {
      setEventData(prevData => ({
        ...prevData,
        venueId: newVenue._id,
        venueName: newVenue.name || newVenue.shortName,
        locationID: newVenue._id,
        locationName: newVenue.name || newVenue.shortName,
        venueLatitude: newVenue.latitude || null,
        venueLongitude: newVenue.longitude || null
      }));
    }
    
    // Clear saved data
    sessionStorage.removeItem('pendingEventData');
    
    // Close modal
    setShowVenueModal(false);
  };
  
  // Handle start date change
  const handleStartDateChange = (newDate) => {
    // Convert to dayjs objects for comparison
    const newDayjsDate = dayjs(newDate);
    const currentEndDate = dayjs(eventData.endDate);
    
    // If end date is before the new start date, update end date to match start date
    if (currentEndDate.isBefore(newDayjsDate)) {
      setEventData(prevData => ({ 
        ...prevData, 
        startDate: newDate,
        endDate: newDate
      }));
    } else {
      setEventData(prevData => ({ ...prevData, startDate: newDate }));
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
    setEventData(prevData => ({ ...prevData, endDate: newDate }));
  };

  // Memoize the organizer select value to prevent re-computation during render
  const organizerSelectValue = useMemo(() => {
    if (!eventData.ownerOrganizerID) return '';
    return organizers.some(org => org._id === eventData.ownerOrganizerID) 
      ? eventData.ownerOrganizerID 
      : '';
  }, [eventData.ownerOrganizerID, organizers]);

  // Memoize the selected category to prevent re-computation during render
  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat._id === eventData.categoryFirstId) || null;
  }, [categories, eventData.categoryFirstId]);

  // Memoize the selected venue to prevent re-computation during render
  const selectedVenue = useMemo(() => {
    if (!eventData.venueId && !eventData.locationID) return null;
    // First check if venue exists in the loaded venues
    if (Array.isArray(venues) && venues.length > 0) {
      const found = venues.find(v => v?._id === (eventData.venueId || eventData.locationID));
      if (found) return found;
    }
    // If not found but we have venue data, create a placeholder
    if (eventData.venueName || eventData.locationName) {
      return {
        _id: eventData.venueId || eventData.locationID,
        name: eventData.venueName || eventData.locationName,
        shortName: eventData.venueName || eventData.locationName,
        isPlaceholder: true
      };
    }
    return null;
  }, [eventData.venueId, eventData.locationID, eventData.venueName, eventData.locationName, venues]);

  // Memoize venue options to prevent re-computation during render
  const venueOptions = useMemo(() => {
    const venueOptionsArray = Array.isArray(filteredVenues) ? filteredVenues : [];
    
    // Separate active and inactive venues
    // Treat undefined/null isActive as active (true)
    const activeVenues = venueOptionsArray.filter(v => v && (v.isActive === true || v.isActive === undefined || v.isActive === null));
    const inactiveVenues = venueOptionsArray.filter(v => v && v.isActive === false);
    
    // Create grouped options
    let groupedOptions = [];
    
    // Always add a header for active venues if there are any venues at all
    if (venueOptionsArray.length > 0) {
      groupedOptions.push({ _id: 'active-header', isDivider: true, isHeader: true, text: 'Active Venues' });
      
      // Add active venues
      if (activeVenues.length > 0) {
        groupedOptions = [...groupedOptions, ...activeVenues];
      } else {
        groupedOptions.push({ _id: 'no-active', isPlaceholder: true, name: 'No active venues', disabled: true });
      }
    }
    
    // Add separator and inactive venues if any exist
    if (inactiveVenues.length > 0) {
      groupedOptions.push({ _id: 'divider', isDivider: true });
      groupedOptions = [...groupedOptions, ...inactiveVenues];
    }
    
    // If we have a selected venue that's not in the options, add it at the beginning
    if ((eventData.venueId || eventData.locationID) && (eventData.venueName || eventData.locationName)) {
      const venueId = eventData.venueId || eventData.locationID;
      const exists = venueOptionsArray.some(v => v?._id === venueId);
      if (!exists) {
        // Add the placeholder venue to the beginning
        groupedOptions.unshift({
          _id: venueId,
          name: eventData.venueName || eventData.locationName,
          shortName: eventData.venueName || eventData.locationName,
          isPlaceholder: true
        });
      }
    }
    
    return groupedOptions;
  }, [filteredVenues, eventData.venueId, eventData.locationID, eventData.venueName, eventData.locationName]);

  return (
    <>
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
                  required: true,
                  error: !eventData.startDate,
                  helperText: !eventData.startDate ? "Start date is required" : ""
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
                  error: !eventData.endDate,
                  helperText: !eventData.endDate ? "End date is required" : ""
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
              error={!eventData.title}
              helperText={!eventData.title ? "Title is required" : ""}
              fullWidth
            />
          </FormControl>
        </Grid>

        {/* Short Title Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField 
              label="Short Title (21 chars max)" 
              value={eventData.shortTitle || eventData.shortName || ''} 
              onChange={(e) => {
                const value = e.target.value.slice(0, 21); // Enforce 21 char limit
                setEventData(prevData => ({ ...prevData, shortTitle: value, shortName: value }));
              }}
              required
              error={!(eventData.shortTitle || eventData.shortName)}
              inputProps={{ maxLength: 21 }}
              helperText={!(eventData.shortTitle || eventData.shortName) ? "Short title is required" : `${(eventData.shortTitle || eventData.shortName || '').length}/21 characters`}
              fullWidth
            />
          </FormControl>
        </Grid>

        {/* Category Selection - Autocomplete with type-ahead */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.categoryName || ''}
            value={selectedCategory}
            onChange={(event, newValue) => {
              setEventData(prevData => ({ 
                ...prevData, 
                categoryFirstId: newValue ? newValue._id : '',
                categoryFirst: newValue ? newValue.categoryName : '' 
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                required
                error={!eventData.categoryFirstId}
                helperText={!eventData.categoryFirstId ? "Category is required" : ""}
              />
            )}
            fullWidth
            disablePortal
            isOptionEqualToValue={(option, value) => option._id === value?._id}
          />
        </Grid>
        
        {/* Owner Organizer - Display for RO, Selection for RA */}
        <Grid item xs={12} md={6}>
          {selectedRole === 'RegionalAdmin' ? (
            // RegionalAdmin: Show organizer selector
            <FormControl fullWidth required>
              <InputLabel id="organizer-label">Event Organizer</InputLabel>
              <Select
                labelId="organizer-label"
                value={organizerSelectValue}
                onChange={handleOrganizerChange}
                label="Event Organizer"
                required
                disabled={loadingOrganizers}
              >
                <MenuItem value="" disabled>
                  <em>{loadingOrganizers ? 'Loading organizers...' : 'Select an organizer'}</em>
                </MenuItem>
                {organizers.map((organizer) => (
                  <MenuItem key={organizer._id} value={organizer._id}>
                    {organizer.fullName || organizer.organizerName || organizer.name} ({organizer.shortName || organizer.organizerShortName})
                  </MenuItem>
                ))}
              </Select>
              {organizers.length === 0 && !loadingOrganizers && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No organizers available in your administrative regions. Contact an administrator if this seems incorrect.
                </Alert>
              )}
            </FormControl>
          ) : (
            // RegionalOrganizer: Show display only
            <FormControl fullWidth>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: '80px' }}>
                    {editMode ? 'Created by:' : 'Creating as:'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {user?.displayName || user?.email || 'User'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: '80px' }}>
                    Organizer:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {editMode ? eventData.ownerOrganizerShortName : organizer?.shortName || 'Loading...'}
                  </Typography>
                </Box>
              </Box>
            </FormControl>
          )}
        </Grid>

        {/* Venue Selection - Searchable Autocomplete */}
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            {isVenueReady ? (
            <Autocomplete
              id="venue-autocomplete"
              options={venueOptions}
              loading={loadingVenues}
              value={selectedVenue}
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
              renderOption={(props, option) => {
                // Handle divider/header
                if (option.isDivider) {
                  if (option.isHeader) {
                    // Active venues header
                    return (
                      <li key={option._id} style={{ padding: 0 }}>
                        <Typography variant="caption" color="primary" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 'bold' }}>
                          {option.text}
                        </Typography>
                      </li>
                    );
                  } else {
                    // Separator between active and inactive
                    return (
                      <li key="divider" style={{ padding: 0 }}>
                        <hr style={{ margin: '8px 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />
                        <Typography variant="caption" color="textSecondary" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 'bold' }}>
                          Inactive Venues
                        </Typography>
                      </li>
                    );
                  }
                }
                
                // Handle placeholder options
                if (option.isPlaceholder && option.disabled) {
                  return (
                    <li key={option._id} style={{ padding: '8px 16px', opacity: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">
                        {option.name}
                      </Typography>
                    </li>
                  );
                }
                
                // Regular venue rendering
                return (
                  <li {...props} key={option._id}>
                    <Typography
                      sx={{
                        color: option.isActive === false ? 'text.secondary' : 'text.primary',
                        fontStyle: option.isActive === false ? 'italic' : 'normal'
                      }}
                    >
                      {option.name || option.shortName || `Venue ${option._id}`}
                      {option.isActive === false && ' (Inactive)'}
                    </Typography>
                  </li>
                );
              }}
              getOptionDisabled={(option) => option.isDivider || option.disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Venue (type to search)"
                  variant="outlined"
                  required
                  error={Boolean(errorVenues) || !(eventData.venueId || eventData.locationID)}
                  helperText={errorVenues ? "Error loading venues" : !(eventData.venueId || eventData.locationID) ? "Venue is required" : ""}
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
            ) : (
              <TextField
                label="Venue (loading...)"
                value=""
                disabled
                fullWidth
                required
              />
            )}
            {venues && venues.length === 0 && !loadingVenues && !errorVenues && (
              <Alert severity="info" sx={{ mt: 1 }}>
                No venues found in the selected location. Please select a different region or contact an administrator.
              </Alert>
            )}
          </FormControl>
        </Grid>

        {/* TIEMPO-258: Add Venue Button */}
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddLocationIcon />}
            disabled={true}
            sx={{ 
              height: '56px',
              mt: { xs: 0, md: 0 }
            }}
          >
            Coming Soon
          </Button>
        </Grid>

        {/* Cost Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField 
              label="Cost" 
              value={eventData.cost || ''} 
              onChange={(e) => setEventData(prevData => ({ ...prevData, cost: e.target.value }))}
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
          onChange={(e) => setEventData(prevData => ({ ...prevData, description: e.target.value }))}
          required
          error={!eventData.description}
          helperText={!eventData.description ? "Description is required" : ""}
          fullWidth
        />
      </FormControl>
    </Box>

    {/* TIEMPO-258: Venue Add Modal */}
    {showVenueModal && (
      <VenueModalAdd
        onAdd={handleVenueCreated}
        refreshList={fetchVenues}
        onDone={() => setShowVenueModal(false)}
      />
    )}
    </>
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
    ownerOrganizerID: PropTypes.string,
    ownerOrganizerName: PropTypes.string,
    ownerOrganizerShortName: PropTypes.string,
    cost: PropTypes.string,
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  organizer: PropTypes.object,
};

export default CreateEventDetailsBasic;
