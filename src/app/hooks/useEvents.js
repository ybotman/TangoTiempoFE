import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

/**
 * Unified useEvents hook - handles both geo-based and organizer-based filtering
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.region] - Region name for location filtering
 * @param {string} [options.division] - Division name for location filtering
 * @param {string} [options.city] - City name for location filtering
 * @param {number} [options.lat] - Latitude for geo filtering
 * @param {number} [options.lng] - Longitude for geo filtering
 * @param {Date|string} [options.startDate] - Start date for filtering events
 * @param {Date|string} [options.endDate] - End date for filtering events
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=100] - Number of items per page
 * @returns {Object} Events data, loading state, error state, and refresh function
 */
/**
 * Helper function to sanitize ObjectId fields for MongoDB
 * Converts empty strings to null to prevent CastError in Mongoose
 * 
 * This function fixes a critical issue where empty strings ("") passed for fields 
 * expected to be MongoDB ObjectIds (like categorySecondId, grantedOrganizerID, etc.)
 * would cause Mongoose validation errors. MongoDB ObjectId fields should be either
 * valid ObjectId strings or null, not empty strings.
 *
 * @param {Object} data - The data object containing potential ObjectId fields
 * @returns {Object} - The sanitized data object with empty strings converted to null
 */
function sanitizeObjectIdFields(data) {
  if (!data) return data;
  
  const result = { ...data };
  const objectIdFields = [
    'categoryFirstId',
    'categorySecondId',
    'categoryThirdId',
    'ownerOrganizerID',
    'grantedOrganizerID',
    'alternateOrganizerID',
    'venueId',
    'locationID',
    '_id'
  ];
  
  objectIdFields.forEach(field => {
    // Check if the field exists and is an empty string
    if (result[field] === '') {
      result[field] = null;
    }
  });
  
  return result;
}

export function useEvents({
  region,
  division,
  city,
  lat,
  lng,
  startDate,
  endDate,
  page = 1,
  limit = 100,
  useGeoLocationContext = true // Flag to control whether to use GeoLocationContext
} = {}) {
  const [eventsData, setEventsData] = useState({
    events: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 100,
      pages: 0
    },
    filterType: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, selectedRole } = useContext(AuthContext);
  
  // Extract stable primitive values to prevent infinite loops
  const userId = user?.uid;
  const userOrganizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;
  const userRoles = user?.roles;
  
  // Get location from GeoLocationContext if available
  const geoLocationContext = useGeoLocation();
  
  // Use context values if explicitly provided parameters are missing
  const effectiveRegion = region || (useGeoLocationContext ? geoLocationContext?.selectedLocation?.region?.name : null);
  const effectiveDivision = division || (useGeoLocationContext ? geoLocationContext?.selectedLocation?.division?.name : null);
  const effectiveCity = city || (useGeoLocationContext ? geoLocationContext?.selectedLocation?.city?.name : null);
  
  // Use coordinates from GeoLocationContext if lat/lng not explicitly provided
  const effectiveLat = lat || (useGeoLocationContext && !effectiveRegion && !effectiveDivision && !effectiveCity 
    ? geoLocationContext?.userLocation?.latitude : null);
  const effectiveLng = lng || (useGeoLocationContext && !effectiveRegion && !effectiveDivision && !effectiveCity 
    ? geoLocationContext?.userLocation?.longitude : null);
  
  // Cache key generation commented out to fix ESLint warnings
  // This was previously used for memoizing/deduplicating requests
  // Now we explicitly list all dependencies in the useCallback
  // const cacheKey = JSON.stringify({...});
  
  // Generate default date range if needed
  const getDefaultDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 3, 0); // 3 months
    return { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() };
  };

  const fetchEvents = useCallback(async () => {
    // Log what triggered this fetch
    console.log('useEvents: fetchEvents triggered', {
      trigger: 'dependency change',
      role: selectedRole,
      location: {
        region: effectiveRegion,
        division: effectiveDivision,
        city: effectiveCity
      },
      hasUser: !!user,
      timestamp: new Date().toISOString()
    });
    
    setLoading(true);
    setError(null);

    try {
      // Prepare parameters for the unified endpoint
      const params = {
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
        page,
        limit,
      };

      // Format date parameters
      if (startDate && endDate) {
        // Handle different date formats
        params.start = typeof startDate === 'string' ? startDate :
                      startDate.toISOString ? startDate.toISOString() : startDate;
        params.end = typeof endDate === 'string' ? endDate :
                    endDate.toISOString ? endDate.toISOString() : endDate;
      } else {
        // Use default date range if not provided
        const defaultDates = getDefaultDateRange();
        params.start = defaultDates.start;
        params.end = defaultDates.end;
      }

      // Location-based filtering parameters - using effective values that may come from GeoLocationContext
      if (effectiveRegion) params.masteredRegionName = effectiveRegion;
      if (effectiveDivision) params.masteredDivisionName = effectiveDivision;
      if (effectiveCity) params.masteredCityName = effectiveCity;

      // Geolocation parameters - using effective values that may come from GeoLocationContext
      if (effectiveLat && effectiveLng) {
        params.lat = effectiveLat;
        params.lng = effectiveLng;
      }

      // Log the actual values used for filtering (from direct input or GeoLocationContext)
      console.log('Using location filters:', {
        region: effectiveRegion,
        division: effectiveDivision,
        city: effectiveCity,
        lat: effectiveLat,
        lng: effectiveLng,
        source: useGeoLocationContext && (
          effectiveRegion !== region ||
          effectiveDivision !== division ||
          effectiveCity !== city ||
          effectiveLat !== lat ||
          effectiveLng !== lng
        ) ? 'GeoLocationContext' : 'Direct input'
      });


      // Add user role and organizerId if user is a RegionalOrganizer
      if (userId && selectedRole === 'RegionalOrganizer' && userOrganizerId) {
        params.organizerId = userOrganizerId;
        params.userRole = 'RegionalOrganizer'; // Make sure we're passing the role to the backend
        console.log('Adding RegionalOrganizer filtering with organizerId:', params.organizerId);
      } else if (userId && userRoles?.includes('RegionalOrganizer')) {
        // If user has RO role but we're not using it, explain why
        /* Commented out to reduce console noise
        console.warn('User has RegionalOrganizer role but',
          !selectedRole ? 'selectedRole is not set' :
          selectedRole !== 'RegionalOrganizer' ? `selectedRole is "${selectedRole}" instead of "RegionalOrganizer"` :
          !user.backendInfo?.regionalOrganizerInfo?.organizerId ? 'regionalOrganizerInfo.organizerId is missing' :
          'unknown reason'
        );
        */
      }


      // Call the unified endpoint
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events`, {
        params,
        timeout: 15000, // 15 second timeout
      });

      // Store the response which includes events array and pagination info
      setEventsData(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);

      // Format error message for display
      let errorMessage = 'Failed to fetch events';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      // Keep existing events on error rather than clearing them
      // This provides a better user experience when there are transient network issues
    } finally {
      setLoading(false);
    }
  // All essential dependencies are now explicitly included in the array
  }, [
    // cacheKey is removed as it's redundant with the explicit dependencies
    page,
    limit,
    startDate,
    endDate,
    effectiveRegion,
    effectiveDivision,
    effectiveCity,
    effectiveLat,
    effectiveLng,
    region,
    division,
    city,
    lat,
    lng,
    useGeoLocationContext,
    user,
    selectedRole
    // Removed setState functions to prevent infinite loops
  ]);

  // Fetch events when parameters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { 
    events: eventsData.events || [], 
    pagination: eventsData.pagination || { 
      total: 0, 
      page: 1, 
      limit: 100, 
      pages: 0 
    },
    filterType: eventsData.filterType,
    loading, 
    error, 
    refreshEvents: fetchEvents 
  };
}

// Backward compatibility hook for code still using the old parameter style
export function useEventsLegacy(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd) {
  return useEvents({
    region: selectedRegion,
    division: selectedDivision,
    city: selectedCity,
    startDate: calendarStart,
    endDate: calendarEnd
  });
}

export function useEventOperations() {
  const { user, getIdToken } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);
  
  // Create event
  // BACKEND TODO: RegionalAdmin Support
  // The frontend is sending:
  // - selectedRole: 'RegionalAdmin' 
  // - adminCities: array of city ObjectIds the admin manages
  // 
  // Backend needs to implement:
  // 1. Check if selectedRole === 'RegionalAdmin'
  // 2. Get the event's venueMasteredCityID from the venue
  // 3. Verify venueMasteredCityID is in the adminCities array
  // 4. If true, allow full CRUD operations (create/update/delete)
  // 5. RegionalAdmin should bypass ownerOrganizerID checks for events in their cities
  //
  // Example validation logic:
  // if (req.body.selectedRole === 'RegionalAdmin' && req.body.adminCities) {
  //   const venue = await Venue.findById(event.venueId);
  //   if (req.body.adminCities.includes(venue.masteredCityID.toString())) {
  //     // Allow operation
  //   }
  // }
  const createEvent = async (eventData) => {
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to create events');
      }
      
      // Get a fresh token for the request
      let token;
      try {
        token = await getIdToken(true); // Force refresh
        console.log('Got fresh token for event creation');
      } catch (tokenError) {
        console.error('Failed to get fresh token:', tokenError);
        if (user.token) {
          token = user.token; // Fall back to existing token if available
          console.log('Using existing token for event creation');
        } else {
          throw new Error('Authentication token unavailable');
        }
      }
      
      // Clean up the event data by converting empty strings for ObjectId fields to null
      const cleanedEventData = sanitizeObjectIdFields(eventData);
      
      // Log debugging information
      console.log('Event creation debug info:', {
        selectedRole: selectedRole,
        userId: user?.uid,
        userRoles: user?.roles,
        organizerId: user?.backendInfo?.regionalOrganizerInfo?.organizerId,
        organizerName: user?.backendInfo?.regionalOrganizerInfo?.organizerName,
        hasRORole: user?.roles?.includes('RegionalOrganizer'),
        eventOwnerOrganizerID: cleanedEventData.ownerOrganizerID
      });
      
      // Prepare the event data for submission based on role
      let preparedData;
      
      if (selectedRole === 'RegionalAdmin') {
        // RA endpoint has different requirements - prepare minimal data
        preparedData = {
          title: cleanedEventData.title,
          startDate: cleanedEventData.startDate,
          endDate: cleanedEventData.endDate,
          ownerOrganizerID: cleanedEventData.ownerOrganizerID,
          venueID: cleanedEventData.venueId || cleanedEventData.venueID || cleanedEventData.locationID,
          description: cleanedEventData.description || '',
          cost: cleanedEventData.cost || ''
        };
      } else {
        // RO endpoint uses existing logic
        preparedData = {
          ...cleanedEventData,
          appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
          selectedRole: selectedRole, // Include the user's selected role for backend validation
          // The backend requires ownerOrganizerID specifically - use the user's organizerId if they're a Regional Organizer
          ownerOrganizerID: cleanedEventData.ownerOrganizerID || 
                           (selectedRole === 'RegionalOrganizer' ? user?.backendInfo?.regionalOrganizerInfo?.organizerId : null) ||
                           cleanedEventData.grantedOrganizer,
        // Make sure we use masteredRegionName
        masteredRegionName: cleanedEventData.masteredRegionName || cleanedEventData.selectedRegion,
        // Set default ownerOrganizerName if not provided - use the user's organizer name if they're a Regional Organizer
        ownerOrganizerName: cleanedEventData.ownerOrganizerName || 
                           (selectedRole === 'RegionalOrganizer' ? user?.backendInfo?.regionalOrganizerInfo?.organizerName : null) ||
                           "Event Organizer",
        // Add ownerOrganizerShortName (required by backend) - fallback to shortName field first
        ownerOrganizerShortName: cleanedEventData.ownerOrganizerShortName || cleanedEventData.shortName || cleanedEventData.ownerOrganizerName || "Event Organizer",
        // Set expiresAt to 1 year after endDate
        expiresAt: new Date(new Date(cleanedEventData.endDate).getTime() + 365 * 24 * 60 * 60 * 1000),
        // Include admin cities for RegionalAdmin validation
        adminCities: selectedRole === 'RegionalAdmin' ? 
          (user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || 
           user?.backendInfo?.localAdminInfo?.adminCities) : undefined,
        // Handle both venue and location fields for transitional compatibility
        // If we have venueId/venueName in the event data, use those and also add locationID/locationName for compatibility
        // If we only have locationID/locationName, use those and add venueId/venueName fields
        venueId: cleanedEventData.venueId || cleanedEventData.locationID || null,
        venueName: cleanedEventData.venueName || cleanedEventData.locationName || null,
        locationID: cleanedEventData.locationID || cleanedEventData.venueId || null,
        locationName: cleanedEventData.locationName || cleanedEventData.venueName || null,
        };
      }
      
      // If venue has coordinates, include them in venueGeolocation
      if (eventData.venueLatitude && eventData.venueLongitude) {
        preparedData.venueGeolocation = {
          type: "Point",
          coordinates: [parseFloat(eventData.venueLongitude), parseFloat(eventData.venueLatitude)]
        };
        console.log('Added venue coordinates to venueGeolocation:', preparedData.venueGeolocation);
      } else if (eventData.venueId || eventData.locationID) {
        // We have a venue but no coordinates - need to fetch them
        console.log('Venue selected but coordinates not provided. Attempting to fetch venue data.');
        try {
          // Import the venue service function directly
          const { getVenueById } = await import('@/services/venueService');

          // Get venue data including coordinates
          const venueId = eventData.venueId || eventData.locationID;
          const venueData = await getVenueById(venueId);

          if (venueData && venueData.latitude && venueData.longitude) {
            preparedData.venueGeolocation = {
              type: "Point",
              coordinates: [parseFloat(venueData.longitude), parseFloat(venueData.latitude)]
            };
            console.log('Retrieved and added venue coordinates:', preparedData.venueGeolocation);
          } else {
            console.warn('Could not retrieve venue coordinates for venue ID:', venueId);
            // Fallback to empty coordinates array to prevent schema validation error
            preparedData.venueGeolocation = {
              type: "Point",
              coordinates: [0, 0]
            };
          }
        } catch (venueError) {
          console.error('Error fetching venue data:', venueError);
          // Fallback to empty coordinates array to prevent schema validation error
          preparedData.venueGeolocation = {
            type: "Point",
            coordinates: [0, 0]
          };
        }
      }

      // Ensure mastered location fields are included
      if (!preparedData.masteredRegionName && preparedData.selectedRegion) {
        preparedData.masteredRegionName = preparedData.selectedRegion;
      }

      // Handle image upload if an image file is present
      if (preparedData.imageFile) {
        try {
          console.log('Image upload requested, token status:', {
            hasToken: !!token,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
            tokenLength: token?.length,
            fileSize: preparedData.imageFile.size,
            fileName: preparedData.imageFile.name
          });
          
          // Import the upload function dynamically to avoid issues with SSR
          const { uploadEventImage } = await import('@/utils/uploadEventImages');
          
          // Upload the image and get the URLs (primary and fallback)
          // Pass the fresh auth token for authentication
          const uploadResult = await uploadEventImage(preparedData.imageFile, token);
          
          // Store the image URL in the event data
          preparedData.eventImage = uploadResult.imageUrl;
          preparedData.fallbackImageUrl = uploadResult.fallbackUrl || '/TangoQuestion.jpg';
          
          // Remove the file object from the data being sent to the API
          delete preparedData.imageFile;
          delete preparedData.imagePreviewUrl;
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // Continue without the image if upload fails
        }
      }

      // Convert dayjs objects to ISO strings
      if (preparedData.startDate) {
        if (typeof preparedData.startDate.toISOString === 'function') {
          preparedData.startDate = preparedData.startDate.toISOString();
        } else if (preparedData.startDate.isValid && preparedData.startDate.isValid()) {
          // Handle dayjs objects
          preparedData.startDate = preparedData.startDate.toISOString();
        }
      }
      
      if (preparedData.endDate) {
        if (typeof preparedData.endDate.toISOString === 'function') {
          preparedData.endDate = preparedData.endDate.toISOString();
        } else if (preparedData.endDate.isValid && preparedData.endDate.isValid()) {
          // Handle dayjs objects
          preparedData.endDate = preparedData.endDate.toISOString();
        }
      }

      // Validate required fields for RA endpoint
      if (selectedRole === 'RegionalAdmin') {
        if (!preparedData.ownerOrganizerID) {
          throw new Error('RegionalAdmin must specify an ownerOrganizerID for the event');
        }
        if (!preparedData.venueID) {
          throw new Error('RegionalAdmin must specify a venueID for the event');
        }
      }

      // Log the data being sent
      console.log('Submitting event data to API:', preparedData);

      // Set authorization header with the fresh token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log('Sending event creation request with auth token');
      // Route to appropriate endpoint based on selected role
      const endpoint = selectedRole === 'RegionalAdmin' 
        ? `${process.env.NEXT_PUBLIC_BE_URL}/api/events/ra/create`
        : `${process.env.NEXT_PUBLIC_BE_URL}/api/events/post`;
      
      console.log(`Creating event via ${selectedRole === 'RegionalAdmin' ? 'RA' : 'RO'} endpoint: ${endpoint}`);
      const response = await axios.post(endpoint, preparedData, config);
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Enhance error message based on response
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || error.message;
        throw new Error(`Server error: ${message}`);
      }
      
      throw error;
    }
  };

  // Update event
  const updateEvent = async (eventId, eventData) => {
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to update events');
      }
      
      // Get a fresh token for the request
      let token;
      try {
        token = await getIdToken(true); // Force refresh
        console.log('Got fresh token for event update');
      } catch (tokenError) {
        console.error('Failed to get fresh token:', tokenError);
        if (user.token) {
          token = user.token; // Fall back to existing token if available
          console.log('Using existing token for event update');
        } else {
          throw new Error('Authentication token unavailable');
        }
      }
      
      // Prepare the event data for submission
      // Clean up the event data by converting empty strings for ObjectId fields to null
      const cleanedEventData = sanitizeObjectIdFields(eventData);
      
      const preparedData = {
        ...cleanedEventData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
        selectedRole: selectedRole, // Include the user's selected role for backend validation
        // Include admin cities for RegionalAdmin validation
        adminCities: selectedRole === 'RegionalAdmin' ? 
          (user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || 
           user?.backendInfo?.localAdminInfo?.adminCities) : undefined,
        // Handle both venue and location fields for transitional compatibility
        // If we have venueId/venueName in the event data, use those and also add locationID/locationName for compatibility
        // If we only have locationID/locationName, use those and add venueId/venueName fields
        venueId: cleanedEventData.venueId || cleanedEventData.locationID || null,
        venueName: cleanedEventData.venueName || cleanedEventData.locationName || null,
        locationID: cleanedEventData.locationID || cleanedEventData.venueId || null,
        locationName: cleanedEventData.locationName || cleanedEventData.venueName || null,
        // Add required fields that might be missing in update
        masteredRegionName: cleanedEventData.masteredRegionName || cleanedEventData.selectedRegion,
        // Set default ownerOrganizerName if not provided - use the user's organizer name if they're a Regional Organizer
        ownerOrganizerName: cleanedEventData.ownerOrganizerName || 
                           (selectedRole === 'RegionalOrganizer' ? user?.backendInfo?.regionalOrganizerInfo?.organizerName : null) ||
                           "Event Organizer",
        // Add ownerOrganizerShortName (required by backend) - fallback to shortName field first
        ownerOrganizerShortName: cleanedEventData.ownerOrganizerShortName || cleanedEventData.shortName || cleanedEventData.ownerOrganizerName || "Event Organizer",
        // Set expiresAt to 1 year after endDate
        expiresAt: new Date(new Date(cleanedEventData.endDate).getTime() + 365 * 24 * 60 * 60 * 1000),
      };
      
      // If venue has coordinates, include them in venueGeolocation
      if (eventData.venueLatitude && eventData.venueLongitude) {
        preparedData.venueGeolocation = {
          type: "Point",
          coordinates: [parseFloat(eventData.venueLongitude), parseFloat(eventData.venueLatitude)]
        };
        console.log('Added venue coordinates to venueGeolocation for update:', preparedData.venueGeolocation);
      } else if (eventData.venueId || eventData.locationID) {
        // We have a venue but no coordinates - need to fetch them
        console.log('Venue selected but coordinates not provided for update. Attempting to fetch venue data.');
        try {
          // Import the venue service function directly
          const { getVenueById } = await import('@/services/venueService');

          // Get venue data including coordinates
          const venueId = eventData.venueId || eventData.locationID;
          const venueData = await getVenueById(venueId);

          if (venueData && venueData.latitude && venueData.longitude) {
            preparedData.venueGeolocation = {
              type: "Point",
              coordinates: [parseFloat(venueData.longitude), parseFloat(venueData.latitude)]
            };
            console.log('Retrieved and added venue coordinates for update:', preparedData.venueGeolocation);
          } else {
            console.warn('Could not retrieve venue coordinates for update, venue ID:', venueId);
            // Fallback to empty coordinates array to prevent schema validation error
            preparedData.venueGeolocation = {
              type: "Point",
              coordinates: [0, 0]
            };
          }
        } catch (venueError) {
          console.error('Error fetching venue data for update:', venueError);
          // Fallback to empty coordinates array to prevent schema validation error
          preparedData.venueGeolocation = {
            type: "Point",
            coordinates: [0, 0]
          };
        }
      }
      
      // Ensure mastered location fields are included
      if (!preparedData.masteredRegionName && preparedData.selectedRegion) {
        preparedData.masteredRegionName = preparedData.selectedRegion;
      }
      
      // Convert dayjs objects to ISO strings
      if (preparedData.startDate) {
        if (typeof preparedData.startDate.toISOString === 'function') {
          preparedData.startDate = preparedData.startDate.toISOString();
        } else if (preparedData.startDate.isValid && preparedData.startDate.isValid()) {
          preparedData.startDate = preparedData.startDate.toISOString();
        }
      }
      
      if (preparedData.endDate) {
        if (typeof preparedData.endDate.toISOString === 'function') {
          preparedData.endDate = preparedData.endDate.toISOString();
        } else if (preparedData.endDate.isValid && preparedData.endDate.isValid()) {
          preparedData.endDate = preparedData.endDate.toISOString();
        }
      }
      
      // Set authorization header with the fresh token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log('Updating event:', eventId, preparedData);
      
      // Route to appropriate endpoint based on selected role
      const endpoint = selectedRole === 'RegionalAdmin' 
        ? `${process.env.NEXT_PUBLIC_BE_URL}/api/events/ra/${eventId}`
        : `${process.env.NEXT_PUBLIC_BE_URL}/api/events/${eventId}?appId=${process.env.NEXT_PUBLIC_APPLICATION_ID}`;
      
      console.log(`Updating event via ${selectedRole === 'RegionalAdmin' ? 'RA' : 'RO'} endpoint: ${endpoint}`);
      const response = await axios.put(endpoint, preparedData, config);
      
      console.log('Event updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      
      // Enhance error message based on response
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || error.message;
        throw new Error(`Server error: ${message}`);
      }
      
      throw error;
    }
  };
  
  // Delete event
  const deleteEvent = async (eventId) => {
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to delete events');
      }
      
      // Get a fresh token for the request
      let token;
      try {
        token = await getIdToken(true); // Force refresh
        console.log('Got fresh token for event deletion');
      } catch (tokenError) {
        console.error('Failed to get fresh token:', tokenError);
        if (user.token) {
          token = user.token; // Fall back to existing token if available
          console.log('Using existing token for event deletion');
        } else {
          throw new Error('Authentication token unavailable');
        }
      }
      
      // Set authorization header with the fresh token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log('Deleting event:', eventId);
      
      // Build query parameters including role information
      const queryParams = new URLSearchParams({
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
        selectedRole: selectedRole
      });
      
      // Add adminCities for RegionalAdmin
      const adminCities = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || 
                         user?.backendInfo?.localAdminInfo?.adminCities;
      if (selectedRole === 'RegionalAdmin' && adminCities) {
        queryParams.append('adminCities', adminCities.join(','));
      }
      
      // Route to appropriate endpoint based on selected role
      const endpoint = selectedRole === 'RegionalAdmin' 
        ? `${process.env.NEXT_PUBLIC_BE_URL}/api/events/ra/${eventId}`
        : `${process.env.NEXT_PUBLIC_BE_URL}/api/events/${eventId}?${queryParams.toString()}`;
      
      console.log(`Deleting event via ${selectedRole === 'RegionalAdmin' ? 'RA' : 'RO'} endpoint: ${endpoint}`);
      const response = await axios.delete(endpoint, config);
      
      console.log('Event deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      
      // Enhance error message based on response
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || error.message;
        throw new Error(`Server error: ${message}`);
      }
      
      throw error;
    }
  };
  
  // Get event by ID
  const getEventById = async (eventId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/id/${eventId}?appId=${process.env.NEXT_PUBLIC_APPLICATION_ID}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  };

  return { createEvent, updateEvent, deleteEvent, getEventById };
}
