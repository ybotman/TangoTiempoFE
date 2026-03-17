import React, { useEffect, useState, useContext } from 'react';
import { Modal, Box, Typography, Button, Tabs, Tab, Switch, FormControlLabel, Alert, CircularProgress, Tooltip } from '@mui/material';
import CreateEventDetailsBasic from './CreateEventDetailsBasic';
import CreateEventDetailsImage from './CreateEventDetailsImage';
import CreateEventDetailsOther from './CreateEventDetailsOther';
import CreateEventDetailsRepeating, { parseRRuleToUIFields } from './CreateEventDetailsRepeating';
import CreateEventDetailsOverrideImages from './CreateEventDetailsOverrideImages';
import ValidationDialog from './ValidationDialog';
// import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useEventOperations } from '@/hooks/useEvents';
import { useOrganizers } from '@/hooks/useOrganizers';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { validateEventCategoryRules } from '@/utils/eventCategoryValidation'; // TIEMPO-291

// TIEMPO-246: Configure dayjs for venue timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  maxHeight: '90vh',
  // Use flex layout to keep buttons visible at bottom
  display: 'flex',
  flexDirection: 'column',
  // Mobile safe area padding for devices with home indicator
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
};

const CreateEventModal = ({ open, onClose, selectedDate, editMode = false, eventToEdit = null }) => {
  // Removed unused loading from LocationAPI
  const { selectedLocation } = useGeoLocation();
  const { user, getIdToken, selectedRole } = useContext(AuthContext);
  const { organizer, fetchOrganizerById } = useOrganizers();
  const [currentTab, setCurrentTab] = useState('basic');
  
  // TIEMPO-246: Helper function to get default start time in VENUE timezone
  const getDefaultStartTime = (date, venueTimezone) => {
    // Use venue timezone if available, fallback to NYC
    const tz = venueTimezone || 'America/New_York';
    
    // Create date in venue timezone, not browser timezone
    const selectedDay = date ? dayjs.tz(date, tz) : dayjs.tz(undefined, tz);
    const sevenPM = selectedDay.hour(19).minute(0).second(0);
    const now = dayjs.tz(undefined, tz);
    
    // If current time is past 7pm in venue timezone, use tomorrow at 7pm
    if (now.isAfter(sevenPM)) {
      return sevenPM.add(1, 'day');
    }
    return sevenPM;
  };
  
  // Helper function to get initial event data for CREATE mode
  const getInitialEventData = (date, location, city, venueTimezone) => {
    const startDate = getDefaultStartTime(date, venueTimezone);
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
      isCanceled: false,
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
      // TIEMPO-246: Venue timezone for proper event creation
      venueTimezone: venueTimezone || null,
      venueTimezoneAbbr: null,
      // ID field
      _id: null
    };
  };
  
  // Initialize event data with helper function
  const [eventData, setEventData] = useState(() =>
    getInitialEventData(selectedDate, selectedLocation, null, null)
  );

  // Track if user has manually modified the time fields
  const [hasUserModifiedTime, setHasUserModifiedTime] = useState(false);

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

        // TIEMPO-362: Check if this is a multi-day event (festival, marathon)
        // Multi-day events cannot be repeating - force isRepeating=false and reset tab
        // NOTE: Events crossing midnight (8pm-1am) are NOT multi-day, just single evening events
        const durationHours = endDate.diff(startDate, 'hour');
        const isMultiDay = durationHours > 24;
        if (isMultiDay && eventToEdit.isRepeating) {
          // Reset tab to basic if it was on repeating
          setCurrentTab('basic');
        }
        
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
          ownerOrganizerShortName: eventToEdit.ownerOrganizerShortName || '',
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
          masteredRegionName: eventToEdit.masteredRegionName || selectedLocation.region.name || '',
          masteredDivisionName: eventToEdit.masteredDivisionName || selectedLocation.division.name || '',
          masteredCityName: eventToEdit.masteredCityName || selectedLocation.city.name || '',
          
          // Legacy fields for backward compatibility
          selectedRegion: eventToEdit.selectedRegion || selectedLocation.region.name || '',
          selectedRegionID: eventToEdit.selectedRegionID || selectedLocation.region.id || '',
          
          // Repeating event settings
          // TIEMPO-362: Force isRepeating=false for multi-day events (festivals, marathons)
          isRepeating: isMultiDay ? false : (eventToEdit.isRepeating || false),
          recurrenceRule: isMultiDay ? '' : (eventToEdit.recurrenceRule || ''),
          
          // Cancellation status
          isCanceled: eventToEdit.isCanceled || false,
          
          // Maintain the original ID for updates
          _id: eventToEdit._id || null
        });
        
        // If this is a recurring event, parse the RRULE to populate the repeating fields
        if (eventToEdit.recurrenceRule) {
          const recurrenceFields = parseRRuleToUIFields(eventToEdit.recurrenceRule, eventToEdit);
          setEventData(prevData => ({
            ...prevData,
            ...recurrenceFields
          }));
        }
        
        setHasUnsavedChanges(false); // Reset unsaved changes for edit mode
        setHasUserModifiedTime(true); // In edit mode, treat times as user-set (don't auto-recalculate)

        // Validate Regional Admin city access for edit mode
        if (selectedRole === 'RegionalAdmin') {
          const raAllowedCities = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || [];
          // Check multiple possible field names for city ID
          // Also check venue object for city information
          // Extract city ID - handle both object and string formats from backend
          const eventCityId = eventToEdit.masteredCityId?._id || 
                             eventToEdit.masteredCityId || 
                             eventToEdit.venueMasteredCityID ||  // Add missing field from TIEMPO-195
                             eventToEdit.venueMasteredCityId ||  // Add lowercase variant
                             eventToEdit.venue?.masteredCityId?._id ||
                             eventToEdit.venue?.masteredCityId ||
                             eventToEdit.venueInfo?.masteredCityId?._id ||
                             eventToEdit.venueInfo?.masteredCityId;
          
          // Check if RA has access to this city
          // Handle both string IDs and object formats in raAllowedCities
          const hasAccess = eventCityId && raAllowedCities.some(city => {
            if (typeof city === 'string') {
              return city === eventCityId;
            } else if (city && typeof city === 'object') {
              return city._id === eventCityId || city.id === eventCityId;
            }
            return false;
          });
          
          // Enhanced debug logging to diagnose field issues
          // TIEMPO-276: Security cleanup - removed console.log for RA Edit Validation
          
          if (!hasAccess) {
            setSaveError('You do not have permission to edit events in this city. This event is outside your assigned regions.');
            // Prevent the modal from being usable
            setEventData(getInitialEventData(selectedDate, selectedLocation, null, null));
            return;
          }
        }
      } else {
        // Create mode - reset all fields to initial values
        const initialData = getInitialEventData(selectedDate, selectedLocation, null, null);
        setEventData(initialData);
        setHasUnsavedChanges(false); // Reset unsaved changes for create mode
        setHasUserModifiedTime(false); // Reset time modification flag for create mode
      }

      // Log current location for debugging
      // TIEMPO-276: Security cleanup - removed logging
    }
    // getInitialEventData is defined inline but its deps (selectedDate, selectedLocation) are in this array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedLocation, selectedDate, editMode, eventToEdit, selectedRole, user]);

  // Fetch organizer data when modal is open in create mode and user is RO
  useEffect(() => {
    if (open && !editMode && user?.backendInfo?.regionalOrganizerInfo?.organizerId) {
      fetchOrganizerById(user.backendInfo.regionalOrganizerInfo.organizerId);
    }
  }, [open, editMode, user, fetchOrganizerById]);

  // Check if event is multi-day (long event like marathon/encuentro)
  // NOTE: Events that cross midnight (8pm-1am) are NOT multi-day — they're single evening events
  // A true multi-day event spans 24+ hours (e.g., Friday 7pm to Sunday 10pm)
  const isMultiDayEvent = (() => {
    if (!eventData.startDate || !eventData.endDate) return false;
    const startMs = eventData.startDate.valueOf ? eventData.startDate.valueOf() : new Date(eventData.startDate).getTime();
    const endMs = eventData.endDate.valueOf ? eventData.endDate.valueOf() : new Date(eventData.endDate).getTime();
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);
    // Multi-day = more than 24 hours (festivals, marathons spanning multiple days)
    return durationHours > 24;
  })();

  // Validate current tab when isRepeating changes
  useEffect(() => {
    // If we're on the repeating tab but isRepeating is false, switch to basic
    if (currentTab === 'repeating' && !eventData.isRepeating) {
      setCurrentTab('basic');
    }
  }, [eventData.isRepeating, currentTab]);

  // Disable repeating if event becomes multi-day
  useEffect(() => {
    if (isMultiDayEvent && eventData.isRepeating) {
      setEventData(prev => ({ ...prev, isRepeating: false }));
      if (currentTab === 'repeating') {
        setCurrentTab('basic');
      }
    }
  }, [isMultiDayEvent, eventData.isRepeating, currentTab]);

  // TIEMPO-246: Recalculate event times when venue timezone changes
  // Only recalculate if user hasn't manually modified the time fields
  useEffect(() => {
    if (!editMode && eventData.venueTimezone && open && !hasUserModifiedTime) {
      // Only recalculate if venue timezone has changed, we're in create mode,
      // and user hasn't manually touched the time fields
      const newStartDate = getDefaultStartTime(selectedDate, eventData.venueTimezone);
      const newEndDate = newStartDate.add(3, 'hour');

      setEventData(prev => ({
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate
      }));
    }
  }, [eventData.venueTimezone, editMode, selectedDate, open, hasUserModifiedTime]);

  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [categoryValidationErrors, setCategoryValidationErrors] = useState([]); // TIEMPO-291
  const [dateValidationErrors, setDateValidationErrors] = useState([]); // Date validation errors

  // TIEMPO-291: Validate category rules whenever dates or categories change
  // Only re-run when specific eventData fields change, not the whole object (avoids infinite loop)
  useEffect(() => {
    if (eventData.startDate && eventData.endDate && eventData.categoryFirst) {
      const validation = validateEventCategoryRules(eventData, selectedRole);
      setCategoryValidationErrors(validation.errors);
    } else {
      setCategoryValidationErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData.startDate, eventData.endDate, eventData.categoryFirst, eventData.categorySecond, eventData.categoryThird, selectedRole]);

  // Validate dates whenever they change
  useEffect(() => {
    const errors = [];

    if (eventData.startDate && (!eventData.startDate.isValid || !eventData.startDate.isValid())) {
      errors.push('Start date is invalid. Please select a valid date.');
    }

    if (eventData.endDate && (!eventData.endDate.isValid || !eventData.endDate.isValid())) {
      errors.push('End date is invalid. Please select a valid date.');
    }

    if (eventData.startDate && eventData.endDate &&
        eventData.startDate.isValid && eventData.startDate.isValid() &&
        eventData.endDate.isValid && eventData.endDate.isValid() &&
        eventData.endDate.isBefore(eventData.startDate)) {
      errors.push('End date cannot be before start date.');
    }

    setDateValidationErrors(errors);
  }, [eventData.startDate, eventData.endDate]);

  // Import event operations hook
  const { createEvent, updateEvent } = useEventOperations();

  // Check if all required fields are filled
  const isFormValid = () => {
    // Check for invalid dates first
    const datesValid = !!(
      eventData.startDate &&
      eventData.endDate &&
      eventData.startDate.isValid &&
      eventData.startDate.isValid() &&
      eventData.endDate.isValid &&
      eventData.endDate.isValid() &&
      !eventData.endDate.isBefore(eventData.startDate)
    );

    // Basic validation for all events
    const basicValidation = !!(
      eventData.title?.trim() &&
      (eventData.shortTitle?.trim() || eventData.shortName?.trim()) &&
      datesValid &&
      eventData.categoryFirstId &&
      eventData.venueId &&
      eventData.description?.trim()
    );

    // TIEMPO-291: Check category validation (blocks save for RegionalOrganizer)
    const categoryValid = categoryValidationErrors.length === 0;

    // Check date validation (blocks save when dates are invalid)
    const dateValid = dateValidationErrors.length === 0;

    // If not a repeating event, basic validation + category validation + date validation is enough
    if (!eventData.isRepeating) {
      return basicValidation && categoryValid && dateValid;
    }

    // Additional validation for repeating events
    const hasRecurrenceType = eventData.recurrenceType && eventData.recurrenceType !== '';
    
    // Check if required days are selected based on recurrence type
    let hasRecurrenceDays = true;
    if (eventData.recurrenceType === 'weekly') {
      hasRecurrenceDays = eventData.recurrenceDays && eventData.recurrenceDays.length > 0;
    } else if (eventData.recurrenceType === 'monthly') {
      // For monthly, both day of week AND week position must be selected
      hasRecurrenceDays = (
        eventData.monthlyDays && eventData.monthlyDays.length > 0 &&
        eventData.monthlyWeeks && eventData.monthlyWeeks.length > 0
      );
    }

    // Check end conditions
    let hasValidEndCondition = false;
    if (eventData.useEndDate) {
      // Check if end date is provided and not more than 1 year out
      if (eventData.recurrenceEndDate) {
        const endDate = new Date(eventData.recurrenceEndDate);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        hasValidEndCondition = endDate <= oneYearFromNow;
      }
    } else {
      // Check count limits
      const count = parseInt(eventData.recurrenceCount);
      if (!isNaN(count)) {
        if (eventData.recurrenceType === 'daily') {
          hasValidEndCondition = count <= 8;
        } else if (eventData.recurrenceType === 'weekly') {
          hasValidEndCondition = count <= 53;
        } else if (eventData.recurrenceType === 'monthly') {
          hasValidEndCondition = count <= 12;
        }
      }
    }

    return basicValidation && categoryValid && dateValid && hasRecurrenceType && hasRecurrenceDays && hasValidEndCondition;
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
    } else if (!eventData.startDate.isValid || !eventData.startDate.isValid()) {
      errors.push({ field: 'Start Date', message: 'Start date is invalid. Please select a valid date.', required: true });
    }

    if (!eventData.endDate) {
      errors.push({ field: 'End Date', message: 'Event end date is required', required: true });
    } else if (!eventData.endDate.isValid || !eventData.endDate.isValid()) {
      errors.push({ field: 'End Date', message: 'End date is invalid. Please select a valid date.', required: true });
    }

    // Check if end date is before start date (only if both dates are valid)
    if (eventData.startDate && eventData.endDate &&
        eventData.startDate.isValid && eventData.startDate.isValid() &&
        eventData.endDate.isValid && eventData.endDate.isValid()) {
      if (eventData.endDate.isBefore(eventData.startDate)) {
        errors.push({ field: 'End Date', message: 'End date cannot be before start date', required: true });
      }
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
    
    // Validate recurring event settings
    if (eventData.isRepeating) {
      if (!eventData.recurrenceType) {
        errors.push({ field: 'Recurrence', message: 'Please select a recurrence type', required: true });
      }
      
      if (eventData.recurrenceType === 'weekly' && (!eventData.recurrenceDays || eventData.recurrenceDays.length === 0)) {
        errors.push({ field: 'Recurrence Days', message: 'Please select at least one day for weekly recurrence', required: true });
      }
      
      // Validate end conditions
      if (eventData.useEndDate) {
        if (!eventData.recurrenceEndDate) {
          errors.push({ field: 'End Date', message: 'Please specify when the recurring events should end', required: true });
        } else {
          const endDate = new Date(eventData.recurrenceEndDate);
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          if (endDate > oneYearFromNow) {
            errors.push({ field: 'End Date', message: 'Recurring events cannot be scheduled more than 1 year in advance', required: true });
          }
        }
      } else {
        if (!eventData.recurrenceCount) {
          errors.push({ field: 'Occurrences', message: 'Please specify how many times the event should repeat', required: true });
        } else {
          const count = parseInt(eventData.recurrenceCount);
          if (eventData.recurrenceType === 'daily' && count > 8) {
            errors.push({ field: 'Occurrences', message: 'Daily events cannot repeat more than 8 times', required: true });
          } else if (eventData.recurrenceType === 'weekly' && count > 53) {
            errors.push({ field: 'Occurrences', message: 'Weekly events cannot repeat more than 53 times', required: true });
          } else if (eventData.recurrenceType === 'monthly' && count > 12) {
            errors.push({ field: 'Occurrences', message: 'Monthly events cannot repeat more than 12 times', required: true });
          }
        }
      }
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
      
      // Check if user can create events (RegionalOrganizer or RegionalAdmin)
      const selectedRole = user.backendInfo?.selectedRole || '';
      const isRegionalOrganizer = user.backendInfo?.regionalOrganizerInfo?.organizerId;
      const isRegionalAdmin = selectedRole === 'RegionalAdmin' && 
                             user.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds?.length > 0;
      
      // Only require region for non-RO/RA users
      if (!eventData.masteredRegionName && !isRegionalOrganizer && !isRegionalAdmin) {
        throw new Error('Region is required');
      }

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

        // TIEMPO-284: Fetch organizer data for profile validation
        // Frontend fix: Don't expect shortName/description in regionalOrganizerInfo
        let hasCompletedProfile = false;
        let missingFields = [];

        if (orgInfo?.organizerId) {
          try {
            // TIEMPO-284: Fetch organizer data directly via API
            const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
            const response = await axios.get(
              `${getApiBaseUrl()}/api/organizers/${orgInfo.organizerId}`,
              { params: { appId } }
            );
            const organizerData = response.data;

            // Check profile completion from organizer collection
            const hasValidShortName = organizerData?.shortName &&
                                     organizerData.shortName.trim() !== '' &&
                                     organizerData.shortName !== 'CHANGE';
            const hasValidDescription = organizerData?.description &&
                                       organizerData.description.trim() !== '';

            // Combine checks
            hasCompletedProfile = orgInfo.isEnabled && hasValidShortName && hasValidDescription;

            if (!hasCompletedProfile) {
              // Build specific error messages
              if (!orgInfo.isEnabled) {
                missingFields.push('Profile not enabled by admin');
              }
              if (!hasValidShortName) {
                if (organizerData?.shortName === 'CHANGE') {
                  missingFields.push('Short Name (still set to default "CHANGE")');
                } else {
                  missingFields.push('Short Name');
                }
              }
              if (!hasValidDescription) {
                missingFields.push('Description');
              }
            }
          } catch (error) {
            console.error('Failed to fetch organizer profile:', error);
            throw new Error('Unable to verify organizer profile. Please try again.');
          }
        } else {
          throw new Error('No organizer profile found. Please contact an administrator.');
        }

        if (!hasCompletedProfile) {
          throw new Error(`Your organizer profile is incomplete. Please complete the following in Event Organizer Settings: ${missingFields.join(', ')}`);
        }
        
        // TIEMPO-271: Only check isActive and isApproved after profile is complete
        // isEnabled should only be true when RO completes profile requirements
        const requiredFlagsEnabled = orgInfo.isActive && orgInfo.isApproved;
        
        if (!requiredFlagsEnabled) {
        console.warn('Checking regionalOrganizerInfo flags...');
        
        // TIEMPO-271: Only auto-enable isActive if needed
        // Do NOT auto-enable isEnabled - that requires profile completion
        if (!orgInfo.isActive) {
          try {
            // Get fresh token for authorization
            const token = await getIdToken(true);
            
            // Call API to activate only isActive flag
            const response = await axios.post(
              `${getApiBaseUrl()}/api/userlogins/activate-organizer`,
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
                `${getApiBaseUrl()}/api/userlogins/firebase/${user.uid}`,
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
        
        // TIEMPO-271: Check if isEnabled is false - means profile incomplete
        if (!orgInfo.isEnabled) {
          throw new Error('Please complete your Regional Organizer profile before creating events. You must accept the Rules of Engagement, provide an organizer short name, and add a description.');
        }
      }
      }
      
      // TIEMPO-362: Check if event is multi-day (marathon/festival spanning multiple days)
      // Multi-day events should NOT be repeating - they're single events with long duration
      // NOTE: Events crossing midnight (8pm-1am) are NOT multi-day, just single evening events
      const isMultiDay = (() => {
        if (!eventData.startDate || !eventData.endDate) return false;
        const startMs = eventData.startDate.valueOf ? eventData.startDate.valueOf() : new Date(eventData.startDate).getTime();
        const endMs = eventData.endDate.valueOf ? eventData.endDate.valueOf() : new Date(eventData.endDate).getTime();
        const durationHours = (endMs - startMs) / (1000 * 60 * 60);
        // Multi-day = more than 24 hours (festivals, marathons spanning multiple days)
        return durationHours > 24;
      })();

      // Apply defaults for optional fields
      const eventDataWithDefaults = {
        ...eventData,
        // TIEMPO-362: Force isRepeating=false for multi-day events (festivals, marathons)
        isRepeating: isMultiDay ? false : eventData.isRepeating,
        recurrenceRule: isMultiDay ? null : eventData.recurrenceRule,
        masteredRegionName: eventData.masteredRegionName || (user?.backendInfo?.localUserInfo?.userDefaults?.region?.name || 'Default Region'),
        categoryFirst: eventData.categoryFirst || 'Other',
        selectedRole: selectedRole, // Add selectedRole for backend validation
        adminCities: isRegionalAdmin ? user.backendInfo.localAdminInfo.allowedAdminMasteredCityIds : undefined,
        description: eventData.description || '',
        // Set organizer info if not already set (for create mode)
        ownerOrganizerID: eventData.ownerOrganizerID || (isRegionalOrganizer ? user.backendInfo.regionalOrganizerInfo.organizerId : ''),
        ownerOrganizerName: eventData.ownerOrganizerName || (isRegionalOrganizer ? user.backendInfo.regionalOrganizerInfo.organizerName : ''),
        ownerOrganizerShortName: eventData.ownerOrganizerShortName || (isRegionalOrganizer ? user.backendInfo.regionalOrganizerInfo.organizerShortName : '')
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
// TIEMPO-276: Security cleanup - removed logging
        await createEvent(eventDataWithDefaults);
// TIEMPO-276: Security cleanup - removed logging
        setSaveSuccess(true);
        setHasUnsavedChanges(false);

        // TIEMPO-302: Close immediately to prevent flash of old values
        // Parent component will refresh the calendar data
        setSaveSuccess(false);
        onClose();
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
    // If turning off repeating and we're on the repeating tab, go back to basic
    if (eventData.isRepeating && currentTab === 'repeating') {
      setCurrentTab('basic');
    }
    setHasUnsavedChanges(true);
  };

  // Wrapper for setEventData to track changes
  const updateEventData = (newData) => {
    setEventData(newData);
    setHasUnsavedChanges(true);
  };

  // Handle modal close - clear form data
  const handleClose = () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges) {
      if (!window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        return;
      }
    }

    // Always clear success/error states when closing
    setSaveSuccess(false);
    setSaveError(null);
    setHasUnsavedChanges(false);

    // Reset form to initial state when closing (only in create mode)
    if (!editMode) {
      setEventData({
        title: '',
        description: '',
        startDate: getDefaultStartTime(null, null),
        endDate: getDefaultStartTime(null, null).add(3, 'hour'),
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
        masteredRegionName: selectedLocation.region.name || '',
        masteredDivisionName: selectedLocation.division.name || '',
        masteredCityName: selectedLocation.city.name || '',
        selectedRegion: selectedLocation.region.name || '',
        selectedRegionID: selectedLocation.region.id || '',
      });
      setCurrentTab('basic');
    }
    onClose();
  };

  return (
    <>
    <Modal open={open} onClose={handleClose} data-testid="create-event-modal">
      <Box sx={modalStyle}>
        {/* Header - fixed at top */}
        <Box sx={{ p: 3, pb: 1, flexShrink: 0 }}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h5" component="h2">
            {editMode ? 'Edit Event' : 'Create Event'}
          </Typography>
          <Tooltip title={
            isMultiDayEvent
              ? "Multi-day events (marathons, encuentros) cannot repeat"
              : (selectedRole === 'RegionalOrganizer' || selectedRole === 'RegionalAdmin'
                ? "Enable recurring events"
                : "Repeating events feature coming in July 2025")
          }>
            <span>
              <FormControlLabel
                control={<Switch
                  checked={eventData.isRepeating}
                  onChange={handleToggleRepeating}
                  color="primary"
                  disabled={isMultiDayEvent || (selectedRole !== 'RegionalOrganizer' && selectedRole !== 'RegionalAdmin')}
                />}
                label="Repeating"
                labelPlacement="start"
                disabled={isMultiDayEvent || (selectedRole !== 'RegionalOrganizer' && selectedRole !== 'RegionalAdmin')}
              />
            </span>
          </Tooltip>
        </Box>
        </Box>

        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3 }}>

        {/* Error message */}
        {saveError && (
          <Alert severity="error" sx={{ my: 1 }}>
            {saveError}
          </Alert>
        )}

        {/* Date validation errors */}
        {dateValidationErrors.length > 0 && (
          <Alert severity="error" sx={{ my: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Date Validation Error:
            </Typography>
            {dateValidationErrors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

        {/* TIEMPO-291: Category validation errors */}
        {categoryValidationErrors.length > 0 && (
          <Alert severity="error" sx={{ my: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Category Validation Error:
            </Typography>
            {categoryValidationErrors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Success message */}
        {saveSuccess && (
          <Alert severity="success" sx={{ my: 1 }}>
            {editMode ? 'Event updated successfully!' : 'Event created successfully!'}
          </Alert>
        )}

        {/* Block content if RA doesn't have permission */}
        {saveError && saveError.includes('permission') && selectedRole === 'RegionalAdmin' ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can only edit events in your assigned cities.
            </Typography>
            <Button onClick={handleClose} sx={{ mt: 2 }} variant="contained">
              Cancel
            </Button>
          </Box>
        ) : (
        <>
        {/* Tabs for different sections */}
        {/* TIEMPO-362: Use computed tab value to prevent MUI error when Repeating tab doesn't exist */}
        <Tabs
          value={(currentTab === 'repeating' && !eventData.isRepeating) ? 'basic' : currentTab}
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
          {eventData.isRepeating && (
            <Tab 
              label="Repeating" 
              value="repeating" 
              sx={{ 
                color: eventData.isRepeating ? 'error.main' : 'inherit',
                '&.Mui-selected': {
                  color: 'error.main'
                }
              }}
            />
          )}
          <Tab label="Image" value="image" />
          {eventData.isRepeating && editMode && (
            <Tab label="Override Images" value="overrideImages" />
          )}
          <Tab label="Other" value="other" />
        </Tabs>

        {/* Render tab content conditionally */}
        {currentTab === 'basic' && <CreateEventDetailsBasic eventData={eventData} setEventData={updateEventData} editMode={editMode} organizer={organizer} onTimeModified={() => setHasUserModifiedTime(true)} />}
        {currentTab === 'repeating' && eventData.isRepeating && (
          <CreateEventDetailsRepeating eventData={eventData} setEventData={updateEventData} />
        )}
        {currentTab === 'image' && <CreateEventDetailsImage eventData={eventData} setEventData={updateEventData} />}
        {currentTab === 'overrideImages' && eventData.isRepeating && (
          <CreateEventDetailsOverrideImages eventData={eventData} setEventData={updateEventData} />
        )}
        {currentTab === 'other' && <CreateEventDetailsOther eventData={eventData} setEventData={updateEventData} />}
        </>
        )}
        </Box>

        {/* Sticky footer with buttons - always visible */}
        <Box
          sx={{
            p: 2,
            px: 3,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            // Extra padding for mobile safe area
            pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', sm: 2 }
          }}
        >
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={saving || !isFormValid()}
            startIcon={saving && <CircularProgress size={20} />}
            sx={{ flex: 1, minHeight: 48 }}
          >
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : (editMode ? 'UPDATE' : 'Save Event')}
          </Button>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="secondary"
            sx={{ minHeight: 48 }}
          >
            Cancel
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
