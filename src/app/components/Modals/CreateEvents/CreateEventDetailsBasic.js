import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Box, Typography, FormControl, TextField, Grid, CircularProgress, Alert, Autocomplete, FormControlLabel, Checkbox, Collapse, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useCategories from '@/hooks/useCategories'; // Import the categories hook
import { useVenues } from '@/hooks/useVenues'; // Use the new venue-specific hook
// TIEMPO-388: useOrganizers moved to CreateEventDetailsGrants.js
import { AuthContext } from '@/contexts/AuthContext'; // Import Auth context
import { useGeoLocation } from '@/contexts/GeoLocationContext'; // TIEMPO-276: Import location context for debugging
import VenueModal from '@/components/Modals/Venues/VenueModal'; // TIEMPO-290: Import full venue modal
import SeriesDetectionHint from '@/components/Modals/CreateEvents/SeriesDetectionHint'; // TIEMPO-409: SAS-FTPNTD hint
import PropTypes from 'prop-types';

// TIEMPO-408 strict gate, aligned with BE TIEMPO-440 / CALBEAF-154.
// BE BEGINNER_ELIGIBLE_CATEGORIES = ['Class', 'Workshop']. Festival dropped
// (BE never had it); DayWorkshop dropped (deprecated — Workshop covers both
// short and long durations now).
const FOR_BEGINNERS_ELIGIBLE = new Set(['Class', 'Workshop']);

const CreateEventDetailsBasic = ({ eventData, setEventData, editMode = false, organizer = null, onTimeModified = null }) => {
  const allCategories = useCategories(); // Fetch categories
  // TIEMPO-440: Filter out DayWorkshop (deprecated — Workshop covers both
  // short and long durations), Trip, and Unknown.
  const categories = useMemo(() =>
    allCategories.filter(cat =>
      cat.categoryName !== 'DayWorkshop' &&
      cat.categoryName !== 'Trip' &&
      cat.categoryName !== 'Unknown'
    ),
    [allCategories]
  );
  // Fetch venues within user's map center range - same as calendar view
  const { venues, loading: loadingVenues, error: errorVenues, fetchVenues } = useVenues();
  const { savedLocation, currentLocation } = useGeoLocation(); // TIEMPO-276: Get location for venue context
  const { user, selectedRole } = useContext(AuthContext); // Get current user info and selected role
  // TIEMPO-388: organizers moved to CreateEventDetailsGrants.js
  const [filteredVenues, setFilteredVenues] = useState([]); // State for filtered venues
  const [venueInputValue, setVenueInputValue] = useState(''); // Track input for search ahead
  const [isVenueReady, setIsVenueReady] = useState(false); // Track if venue select is ready
  const [showVenueModal, setShowVenueModal] = useState(false); // TIEMPO-258: Venue modal state
  
  
  // TIEMPO-276: Removed manual fetchVenues - let useVenues handle it with location context
  // Set venue ready when venues are loaded
  useEffect(() => {
    if (venues.length > 0 || !loadingVenues) {
      setTimeout(() => setIsVenueReady(true), 100);
    }
  }, [venues, loadingVenues]);

  // TIEMPO-408: Auto-clear forBeginners when category becomes ineligible.
  // Prevents stale flag surviving a category change (e.g. Class -> Milonga).
  useEffect(() => {
    if (eventData.forBeginners && !FOR_BEGINNERS_ELIGIBLE.has(eventData.categoryFirst)) {
      setEventData((prev) => ({ ...prev, forBeginners: false }));
    }
  }, [eventData.categoryFirst, eventData.forBeginners, setEventData]);
  
  // TIEMPO-302: Don't set venue input value - let Autocomplete handle display
  // Setting venueInputValue causes filtering which limits the dropdown to matching venues only
  // The Autocomplete component will show the selected venue's name automatically
  // useEffect removed - no longer needed
  
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
  
  // TIEMPO-325: Track if we've set the initial default organizer for RO
  const [hasSetInitialOrganizer, setHasSetInitialOrganizer] = useState(false);

  // Set owner organizer info from user context when component mounts (only for RegionalOrganizer)
  // TIEMPO-325: Only set default ONCE on mount, don't override user selections
  useEffect(() => {
    if (selectedRole === 'RegionalOrganizer' &&
        user &&
        user.backendInfo?.regionalOrganizerInfo?.organizerId &&
        !hasSetInitialOrganizer &&
        !eventData.ownerOrganizerID) { // Only set if not already set
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

      // Use the fetched organizer data if available
      const organizerData = organizer || orgInfo;
      const shortName = organizerData?.shortName || organizerData?.fullName || orgName || 'Event Organizer';

      setEventData(prevData => ({
        ...prevData,
        // Owner Organizer data is set automatically from the current user's organization
        ownerOrganizerID: orgId,
        ownerOrganizerName: orgName || orgInfo.fullName || user.displayName || 'Your Organization',
        ownerOrganizerShortName: shortName
      }));

      setHasSetInitialOrganizer(true);
    }
  }, [user, selectedRole, organizer, setEventData, hasSetInitialOrganizer, eventData.ownerOrganizerID]);

  // Category change is now handled inline in the Autocomplete component

  // Handle title change
  const handleTitleChange = (event) => {
    const title = event.target.value;
    setEventData(prevData => ({ ...prevData, title }));
  };

  // TIEMPO-388: Organizer handlers moved to CreateEventDetailsGrants.js

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

    // Check if user selected "Add Venue" option
    if (newValue.isAddVenue) {
      setShowVenueModal(true);
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


  
  // Handle start date change
  const handleStartDateChange = (newDate) => {
    // Notify parent that user has manually modified time
    if (onTimeModified) onTimeModified();

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
    // Notify parent that user has manually modified time
    if (onTimeModified) onTimeModified();

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

  // TIEMPO-388: Organizer memoizations moved to CreateEventDetailsGrants.js

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
      // TIEMPO-302: Use geo context center city, not first venue's city
      const nearestCity = currentLocation?.city || savedLocation?.city || 'your area';
      const radius = currentLocation?.zoomRange || savedLocation?.zoomRange || 50;
      groupedOptions.push({
        _id: 'location-header',
        isDivider: true,
        isHeader: true,
        text: `📍 Near ${nearestCity} (within ${radius} miles)`
      });
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
    
    // TIEMPO-302: If we have a selected venue that's not in the geo-filtered options,
    // add it to the list so it remains selectable, but still show all other venues
    if ((eventData.venueId || eventData.locationID) && (eventData.venueName || eventData.locationName)) {
      const venueId = eventData.venueId || eventData.locationID;
      const exists = venueOptionsArray.some(v => v?._id === venueId);
      if (!exists && groupedOptions.length > 0) {
        // Insert the current venue after the headers but before other venues
        // Find the index after the "Active Venues" header
        const activeHeaderIndex = groupedOptions.findIndex(opt => opt._id === 'active-header');
        if (activeHeaderIndex >= 0) {
          groupedOptions.splice(activeHeaderIndex + 1, 0, {
            _id: venueId,
            name: `${eventData.venueName || eventData.locationName} (Current - outside filter range)`,
            shortName: eventData.venueName || eventData.locationName,
            isPlaceholder: true,
            isActive: true  // Treat as active for grouping
          });
        } else {
          // Fallback: add at the beginning if no header found
          groupedOptions.unshift({
            _id: venueId,
            name: `${eventData.venueName || eventData.locationName} (Current)`,
            shortName: eventData.venueName || eventData.locationName,
            isPlaceholder: true
          });
        }
      }
    }

    // Add "Add Venue" option at the very end
    groupedOptions.push({
      _id: 'add-new-venue',
      name: '➕ Add New Venue',
      isAddVenue: true
    });

    return groupedOptions;
  }, [filteredVenues, eventData.venueId, eventData.locationID, eventData.venueName, eventData.locationName, currentLocation, savedLocation]);

  return (
    <>
    <Box>
      <Typography variant="h5" component="h2">
        Mandatory Event Details (Basic)
      </Typography>

      {/* TIEMPO-409: SAS-FTPNTD Layer 2 hint — detects when organizer is
          publishing the same class repeatedly as singletons instead of a
          recurring master. Non-blocking, advisory only. */}
      <SeriesDetectionHint eventData={eventData} />

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

        {/* Venue Selection - Next to Category */}
        <Grid item xs={12} md={6}>
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

                // Handle "Add Venue" option
                if (option.isAddVenue) {
                  return (
                    <li {...props} key={option._id}>
                      <Typography
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          borderTop: '1px solid #e0e0e0',
                          pt: 1,
                          mt: 1
                        }}
                      >
                        {option.name}
                      </Typography>
                    </li>
                  );
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
              getOptionDisabled={(option) => (option.isDivider && !option.isAddVenue) || option.disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Venues within ${currentLocation?.zoomRange || savedLocation?.zoomRange || 50} miles (type to search)`}
                  variant="outlined"
                  required
                  error={Boolean(errorVenues) || !(eventData.venueId || eventData.locationID)}
                  helperText={errorVenues ? "Error loading venues" : !(eventData.venueId || eventData.locationID) ? "Venue is required" : `${venues.length} venues within your map range`}
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

        {/* TIEMPO-401: Beginner-friendly flag (gates Beginner UX mode) */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(eventData.beginnerFriendly)}
                  onChange={(e) => setEventData(prevData => ({ ...prevData, beginnerFriendly: e.target.checked }))}
                />
              }
              label="Beginner-friendly event"
            />
            <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: -0.5 }}>
              Check if someone with zero tango experience can show up and feel welcome.
            </Typography>
          </FormControl>
        </Grid>

        {/* TIEMPO-408 + TIEMPO-440: forBeginners toggle with strict
            client-side gate (Class/Workshop). Aligned with BE
            BEGINNER_ELIGIBLE_CATEGORIES per CALBEAF-154. */}
        <Grid item xs={12} md={6}>
          <Collapse in={FOR_BEGINNERS_ELIGIBLE.has(eventData.categoryFirst)} timeout={150}>
            <FormControl fullWidth>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(eventData.forBeginners)}
                      onChange={(e) => setEventData(prevData => ({ ...prevData, forBeginners: e.target.checked }))}
                    />
                  }
                  label="This event is designed for beginners"
                />
                <Tooltip
                  arrow
                  title="Available for Classes, Workshops, and beginner-targeted Festivals. Switches off automatically if you change to a different category."
                >
                  <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mt: -0.5 }}>
                Shown on the Beginner tab. Removed from the main (Local) calendar.
              </Typography>
            </FormControl>
          </Collapse>
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

      {/* TIEMPO-388: Organizers section moved to GRANTS tab */}
    </Box>

    {/* TIEMPO-290: Venue Modal with Map/Add/Edit tabs */}
    <VenueModal
      open={showVenueModal}
      onClose={() => {
        setShowVenueModal(false);
        // Refresh venues after modal closes
        fetchVenues();
      }}
    />
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
    alternateOrganizerID: PropTypes.string,
    alternateOrganizerName: PropTypes.string,
    grantedOrganizerID: PropTypes.string,
    grantedOrganizerName: PropTypes.string,
    authorOrganizerID: PropTypes.string,
    authorOrganizerName: PropTypes.string,
    authorOrganizerShortName: PropTypes.string,
    cost: PropTypes.string,
    beginnerFriendly: PropTypes.bool,
    forBeginners: PropTypes.bool,
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  organizer: PropTypes.object,
  onTimeModified: PropTypes.func,
};

export default CreateEventDetailsBasic;
