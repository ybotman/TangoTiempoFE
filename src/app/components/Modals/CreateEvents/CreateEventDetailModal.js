import React, { useEffect, useState, useContext } from 'react';
import { Modal, Box, Typography, Button, Tabs, Tab, Switch, FormControlLabel, Alert, Chip, CircularProgress } from '@mui/material';
import CreateEventDetailsBasic from './CreateEventDetailsBasic';
import CreateEventDetailsImage from './CreateEventDetailsImage';
import CreateEventDetailsOther from './CreateEventDetailsOther';
import CreateEventDetailsRepeating from './CreateEventDetailsRepeating';
import ValidationDialog from './ValidationDialog';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useEventOperations } from '@/hooks/useEvents';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import axios from 'axios';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CreateEventModal = ({ open, onClose, selectedDate, editMode = false, eventToEdit = null }) => {
  const { nearestCity } = useMasteredLocation();
  const { selectedLocation } = useGeoLocation();
  const { user, getIdToken } = useContext(AuthContext);
  const [currentTab, setCurrentTab] = useState('basic');
  
  // Helper function to get default start time (7pm of selected date or next day if past 7pm)
  const getDefaultStartTime = (date) => {
    const selectedDay = date ? dayjs(date) : dayjs();
    const sevenPM = selectedDay.hour(19).minute(0).second(0);
    const now = dayjs();
    
    // If current time is past 7pm today, use tomorrow at 7pm
    if (now.isAfter(sevenPM)) {
      return sevenPM.add(1, 'day');
    }
    return sevenPM;
  };
  
  // Helper function to get initial event data for CREATE mode
  const getInitialEventData = (date, location, city) => {
    const startDate = getDefaultStartTime(date);
    const endDate = startDate.add(3, 'hour');
    
    return {
      title: '',
      description: '',
      startDate: startDate,
      endDate: endDate,
      cost: '',
      // Venue fields
      venueId: '',
      venueName: '',
      locationID: '',
      locationName: '',
      venueLatitude: null,
      venueLongitude: null,
      // Categories
      categoryFirst: '',
      categoryFirstId: '',
      categorySecond: '',
      categorySecondId: '',
      categoryThird: '',
      categoryThirdId: '',
      // Organizer fields
      ownerOrganizerID: '',
      ownerOrganizerName: '',
      ownerOrganizerShortName: '', // Added for RO CREATE fix
      grantedOrganizerID: '',
      grantedOrganizerName: '',
      alternateOrganizerID: '',
      alternateOrganizerName: '',
      // Other fields
      isRepeating: false,
      imageFile: null,
      imagePreviewUrl: null,
      eventImage: null,
      fallbackImageUrl: null,
      shortTitle: '',
      shortName: '',
      // Location hierarchy - preserve user's selected location
      masteredRegionName: location?.region?.name || city?.regionName || '',
      masteredDivisionName: location?.division?.name || city?.divisionName || '',
      masteredCityName: location?.city?.name || city?.cityName || '',
      // Legacy fields
      selectedRegion: location?.region?.name || city?.regionName || '',
      selectedRegionID: location?.region?.id || city?.regionID || '',
      // ID field
      _id: null
    };
  };
  
  // Initialize event data with helper function
  const [eventData, setEventData] = useState(() => 
    getInitialEventData(selectedDate, selectedLocation, nearestCity)
  );

  // Refresh event data and related data when modal opens or location changes
  useEffect(() => {
    if (open) {
      // Clear any previous errors/success when modal opens
      setSaveError(null);
      setSaveSuccess(false);
      
      // Handle edit mode - populate form with existing event data
      if (editMode && eventToEdit) {
        
        // Convert dates to dayjs objects for form compatibility
        const startDate = eventToEdit.startDate ? dayjs(eventToEdit.startDate) : dayjs();
        const endDate = eventToEdit.endDate ? dayjs(eventToEdit.endDate) : dayjs().add(2, 'hour');
        
        // Map API event data to form state
        setEventData({
          // Basic info
          title: eventToEdit.title || '',
          description: eventToEdit.description || '',
          shortTitle: eventToEdit.shortTitle || eventToEdit.shortName || '',
          shortName: eventToEdit.shortName || eventToEdit.shortTitle || '',
          startDate: startDate,
          endDate: endDate,
          cost: eventToEdit.cost || '',
          
          // Categories
          categoryFirst: eventToEdit.categoryFirst || '',
          categoryFirstId: eventToEdit.categoryFirstId || eventToEdit.categoryFirstID || '',
          categorySecond: eventToEdit.categorySecond || '',
          categorySecondId: eventToEdit.categorySecondId || eventToEdit.categorySecondID || '',
          categoryThird: eventToEdit.categoryThird || '',
          categoryThirdId: eventToEdit.categoryThirdId || eventToEdit.categoryThirdID || '',
          
          // Venue/Location - support both new and legacy fields with all variations
          venueId: eventToEdit.venueId || eventToEdit.venueID || eventToEdit.locationID || '',
          venueName: eventToEdit.venueName || eventToEdit.locationName || '',
          locationID: eventToEdit.locationID || eventToEdit.venueId || eventToEdit.venueID || '',
          locationName: eventToEdit.locationName || eventToEdit.venueName || '',
          
          // Venue coordinates if available
          venueLatitude: eventToEdit.venueGeolocation?.coordinates?.[1] || '',
          venueLongitude: eventToEdit.venueGeolocation?.coordinates?.[0] || '',
          
          // Organizer info
          ownerOrganizerID: eventToEdit.ownerOrganizerID || '',
          ownerOrganizerName: eventToEdit.ownerOrganizerName || '',
          grantedOrganizerID: eventToEdit.grantedOrganizerID || '',
          grantedOrganizerName: eventToEdit.grantedOrganizerName || '',
          alternateOrganizerID: eventToEdit.alternateOrganizerID || '',
          alternateOrganizerName: eventToEdit.alternateOrganizerName || '',
          
          // Image
          imageFile: null, // Can't pass file objects, only URLs
          imagePreviewUrl: eventToEdit.eventImage || null,
          eventImage: eventToEdit.eventImage || null,
          fallbackImageUrl: eventToEdit.fallbackImageUrl || null,
          
          // Location hierarchy
          masteredRegionName: eventToEdit.masteredRegionName || selectedLocation.region.name || (nearestCity?.regionName || ''),
          masteredDivisionName: eventToEdit.masteredDivisionName || selectedLocation.division.name || (nearestCity?.divisionName || ''),
          masteredCityName: eventToEdit.masteredCityName || selectedLocation.city.name || (nearestCity?.cityName || ''),
          
          // Legacy fields for backward compatibility
          selectedRegion: eventToEdit.selectedRegion || selectedLocation.region.name || (nearestCity?.regionName || ''),
          selectedRegionID: eventToEdit.selectedRegionID || selectedLocation.region.id || (nearestCity?.regionID || ''),
          
          // Repeating event settings
          isRepeating: eventToEdit.isRepeating || false,
          
          // Maintain the original ID for updates
          _id: eventToEdit._id || null
        });
        
        setHasUnsavedChanges(false); // Reset unsaved changes for edit mode
      } else {
        // Create mode - reset all fields to initial values
        const initialData = getInitialEventData(selectedDate, selectedLocation, nearestCity);
        setEventData(initialData);
        setHasUnsavedChanges(false); // Reset unsaved changes for create mode
      }

      // Log current location for debugging
      console.log(`Modal opened in ${editMode ? 'EDIT' : 'CREATE'} mode`, {
        mode: editMode ? 'EDIT' : 'CREATE',
        eventId: eventToEdit?._id || null,
        selectedRole: user?.backendInfo?.selectedRole,
        organizerId: user?.backendInfo?.regionalOrganizerInfo?.organizerId
      });
    }
  }, [open, selectedLocation, nearestCity, selectedDate, editMode, eventToEdit]);

  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Import event operations hook
  const { createEvent, updateEvent } = useEventOperations();
  
  // Check if all required fields are filled
  const isFormValid = () => {
    return !!(
      eventData.title?.trim() &&
      (eventData.shortTitle?.trim() || eventData.shortName?.trim()) &&
      eventData.startDate &&
      eventData.endDate &&
      eventData.categoryFirstId &&
      eventData.venueId &&
      eventData.description?.trim()
    );
  };

  const validateEventData = () => {
    const errors = [];
    
    // Check required fields
    if (!eventData.title || eventData.title.trim() === '') {
      errors.push({ field: 'Title', message: 'Event title is required', required: true });
    }
    
    if ((!eventData.shortTitle || eventData.shortTitle.trim() === '') && 
        (!eventData.shortName || eventData.shortName.trim() === '')) {
      errors.push({ field: 'Short Title', message: 'Short title is required (max 15 characters)', required: true });
    }
    
    if (!eventData.startDate) {
      errors.push({ field: 'Start Date', message: 'Event start date is required', required: true });
    }
    
    if (!eventData.endDate) {
      errors.push({ field: 'End Date', message: 'Event end date is required', required: true });
    }
    
    if (!eventData.categoryFirstId) {
      errors.push({ field: 'Category', message: 'Please select a category for the event', required: true });
    }
    
    if (!eventData.venueId) {
      errors.push({ field: 'Venue', message: 'Please select a venue for the event', required: true });
    }
    
    if (!eventData.description || eventData.description.trim() === '') {
      errors.push({ field: 'Description', message: 'Event description is required', required: true });
    }
    
    // Check recommended fields
    if (!eventData.eventImage) {
      errors.push({ field: 'image', message: 'Adding an image helps attract attendees', required: false });
    }
    
    return errors;
  };

  const handleSave = async (skipValidation = false) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to create events');
      }
      
      // Validate fields unless skipping (for "Save Without Image")
      if (!skipValidation) {
        const errors = validateEventData();
        if (errors.length > 0) {
          setValidationErrors(errors);
          setValidationDialogOpen(true);
          setSaving(false);
          return;
        }
      }
      
      if (!eventData.masteredRegionName) {
        throw new Error('Region is required');
      }
      
      // Check if user can create events (RegionalOrganizer or RegionalAdmin)
      const selectedRole = user.backendInfo?.selectedRole || '';
      const isRegionalOrganizer = user.backendInfo?.regionalOrganizerInfo?.organizerId;
      const isRegionalAdmin = selectedRole === 'RegionalAdmin' && 
                             user.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds?.length > 0;

      if (!isRegionalOrganizer && !isRegionalAdmin) {
        // Determine specific error message based on user's roles
        const userRoles = user.backendInfo?.roleIds || [];
        const hasOrganizerRole = userRoles.some(role => 
          (typeof role === 'string' && role === 'RegionalOrganizer') ||
          (typeof role === 'object' && role.roleName === 'RegionalOrganizer')
        );
        
        const hasAdminRole = userRoles.some(role => 
          (typeof role === 'string' && role === 'RegionalAdmin') ||
          (typeof role === 'object' && role.roleName === 'RegionalAdmin')
        );
        
        if (hasOrganizerRole) {
          throw new Error('You have the RegionalOrganizer role but no organizer profile. Please contact an administrator.');
        } else if (hasAdminRole) {
          throw new Error('You have the RegionalAdmin role but no allowed admin cities assigned. Please contact an administrator.');
        } else {
          throw new Error('You need the RegionalOrganizer or RegionalAdmin role to create events.');
        }
      }
      
      // Check if the user's organizerInfo flags are all enabled (only for RegionalOrganizer)
      if (isRegionalOrganizer) {
        const orgInfo = user.backendInfo.regionalOrganizerInfo;
        const allFlagsEnabled = orgInfo.isActive && orgInfo.isEnabled && orgInfo.isApproved;
        
        if (!allFlagsEnabled) {
        console.warn('Attempting to fix regionalOrganizerInfo flags...');
        
        // Try to automatically fix the flags first
        try {
          // Get fresh token for authorization
          const token = await getIdToken(true);
          
          // Call API to activate the organizer flags
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/activate-organizer`,
            { firebaseUserId: user.uid },
            { 
              headers: { Authorization: `Bearer ${token}` },
              params: { appId: process.env.NEXT_PUBLIC_APPLICATION_ID }
            }
          );
          
          
          // Update the user's info with the updated flags
          if (response.data.regionalOrganizerInfo) {
            // Update the flags in the local user context state
            // Update the flags in the local user context state
            // const updatedUser = {
            //   ...user,
            //   backendInfo: {
            //     ...user.backendInfo,
            //     regionalOrganizerInfo: {
            //       ...user.backendInfo.regionalOrganizerInfo,
            //       isActive: true,
            //       isEnabled: true,
            //       isApproved: true
            //     }
            //   }
            // };
            
            // Force a refresh of the user data from backend
            try {
              await axios.get(
                `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${user.uid}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
              
              // Try to continue with event creation now that flags are activated
              // No longer need to throw error as flags are now fixed
            } catch (refreshError) {
              console.warn('Failed to refresh user data after updating flags:', refreshError);
            }
          }
        } catch (flagsError) {
          console.error('Failed to update organizer flags:', flagsError);
          throw new Error('Your organizer profile is not fully activated. Please contact an administrator.');
        }
      }
      }
      
      // Apply defaults for optional fields
      const eventDataWithDefaults = {
        ...eventData,
        masteredRegionName: eventData.masteredRegionName || (user?.backendInfo?.localUserInfo?.userDefaults?.region?.name || 'Default Region'), 
        categoryFirst: eventData.categoryFirst || 'Other',
        selectedRole: selectedRole, // Add selectedRole for backend validation
        adminCities: isRegionalAdmin ? user.backendInfo.localAdminInfo.allowedAdminMasteredCityIds : undefined,
        description: eventData.description || ''
      };
      
      // Update the event data with defaults
      setEventData(eventDataWithDefaults);
      
      // Try to refresh the auth token before saving
      try {
        await getIdToken(true); // Force token refresh
      } catch (tokenError) {
        console.warn('Could not refresh token, but will continue with existing token:', tokenError);
      }
      
      
      if (editMode && eventData._id) {
        // Update existing event
        await updateEvent(eventData._id, eventDataWithDefaults);
        setSaveSuccess(true);
        setHasUnsavedChanges(false);
        
        // Show success message for 2 seconds then close
        setTimeout(() => {
          setSaveSuccess(false);
          onClose(); // Call onClose directly instead of handleClose
        }, 2000);
      } else {
        // Create new event
        console.log('Creating new event');
        await createEvent(eventDataWithDefaults);
        console.log('Event created successfully');
        setSaveSuccess(true);
        setHasUnsavedChanges(false);
        
        // Show success message for 2 seconds then close
        setTimeout(() => {
          setSaveSuccess(false);
          onClose(); // Call onClose directly instead of handleClose
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setSaveError(error.message || 'Error saving event');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const handleToggleRepeating = () => {
    setEventData((prevData) => ({
      ...prevData,
      isRepeating: !prevData.isRepeating,
    }));
    setHasUnsavedChanges(true);
  };

  // Wrapper for setEventData to track changes
  const updateEventData = (newData) => {
    setEventData(newData);
    setHasUnsavedChanges(true);
  };

  // Handle modal close - clear form data
  const handleClose = () => {
    // Always clear success/error states when closing
    setSaveSuccess(false);
    setSaveError(null);
    setHasUnsavedChanges(false);
    
    // Reset form to initial state when closing (only in create mode)
    if (!editMode) {
      setEventData({
        title: '',
        description: '',
        startDate: getDefaultStartTime(null),
        endDate: getDefaultStartTime(null).add(3, 'hour'),
        cost: '',
        venueId: '',
        venueName: '',
        locationID: '',
        categoryFirst: '',
        categoryFirstId: '',
        categorySecond: '',
        categorySecondId: '',
        categoryThird: '',
        categoryThirdId: '',
        ownerOrganizerID: '',
        ownerOrganizerName: '',
        grantedOrganizerID: '',
        grantedOrganizerName: '',
        alternateOrganizerID: '',
        alternateOrganizerName: '',
        isRepeating: false,
        imageFile: null,
        imagePreviewUrl: null,
        shortTitle: '',
        shortName: '',
        masteredRegionName: selectedLocation.region.name || (nearestCity?.regionName || ''),
        masteredDivisionName: selectedLocation.division.name || (nearestCity?.divisionName || ''),
        masteredCityName: selectedLocation.city.name || (nearestCity?.cityName || ''),
        selectedRegion: selectedLocation.region.name || (nearestCity?.regionName || ''),
        selectedRegionID: selectedLocation.region.id || (nearestCity?.regionID || ''),
      });
      setCurrentTab('basic');
    }
    onClose();
  };

  return (
    <>
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h5" component="h2">
            {editMode ? 'Edit Event' : 'Create Event'}
          </Typography>
          <FormControlLabel
            control={<Switch checked={eventData.isRepeating} onChange={handleToggleRepeating} color="primary" />}
            label="Repeating"
            labelPlacement="start"
          />
        </Box>

        {/* Display Current Location Hierarchy */}
        <Box sx={{ my: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`Region: ${eventData.masteredRegionName || 'Not selected'}`} 
            color="primary" 
            variant={eventData.masteredDivisionName ? "outlined" : "filled"}
            size="small"
          />
          {eventData.masteredDivisionName && (
            <Chip 
              label={`Division: ${eventData.masteredDivisionName}`} 
              color="primary" 
              variant={eventData.masteredCityName ? "outlined" : "filled"}
              size="small"
            />
          )}
          {eventData.masteredCityName && (
            <Chip 
              label={`City: ${eventData.masteredCityName}`} 
              color="primary" 
              variant="filled"
              size="small"
            />
          )}
        </Box>

        {/* Error message */}
        {saveError && (
          <Alert severity="error" sx={{ my: 1 }}>
            {saveError}
          </Alert>
        )}
        
        {/* Success message */}
        {saveSuccess && (
          <Alert severity="success" sx={{ my: 1 }}>
            {editMode ? 'Event updated successfully!' : 'Event created successfully!'}
          </Alert>
        )}

        {/* Tabs for different sections */}
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          aria-label="event details tabs" 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            mb: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTabs-scrollableX': {
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            },
            '& .MuiTabs-scroller': {
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }
          }}
        >
          <Tab label="Basic" value="basic" />
          <Tab label="Image" value="image" />
          <Tab label="Other" value="other" />
          {eventData.isRepeating && <Tab label="Repeating" value="repeating" />}
        </Tabs>

        {/* Render tab content conditionally */}
        {currentTab === 'basic' && <CreateEventDetailsBasic eventData={eventData} setEventData={updateEventData} />}
        {currentTab === 'image' && <CreateEventDetailsImage eventData={eventData} setEventData={updateEventData} />}
        {currentTab === 'other' && <CreateEventDetailsOther eventData={eventData} setEventData={updateEventData} />}
        {currentTab === 'repeating' && (
          <CreateEventDetailsRepeating eventData={eventData} setEventData={updateEventData} />
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={saving || !isFormValid() || (editMode && !hasUnsavedChanges)}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : (editMode ? 'Update Event' : 'Save Event')}
          </Button>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
    
    {/* Validation Dialog */}
    <ValidationDialog
      open={validationDialogOpen}
      onClose={() => setValidationDialogOpen(false)}
      validationErrors={validationErrors}
      onSaveAnyway={() => {
        setValidationDialogOpen(false);
        handleSave(true); // Skip validation when saving anyway
      }}
    />
    </>
  );
};

CreateEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  editMode: PropTypes.bool,
  eventToEdit: PropTypes.object,
  // selectedRegion prop removed - now using GeoLocationContext
};

export default CreateEventModal;
