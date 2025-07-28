import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useUsers } from '@/hooks/useUsers';
import { useEventDiscovery } from '@/contexts/EventDiscoveryContext';

/**
 * Helper function to resolve location parameters based on various sources
 * @param {Object} options Configuration object
 * @returns {Object} Resolved location parameters
 */
function resolveLocationParameters(options) {
  const {
    explicitParams = {},
    userDefaults = null,
    geoLocationContext = null,
    temporaryLocation = null,
    useLocationPreferences = false,
    useGeoLocationContext = false
  } = options;

  // Priority 1: Explicit parameters always win
  if (explicitParams.region || explicitParams.division || explicitParams.city || 
      explicitParams.lat || explicitParams.lng) {
    return {
      region: explicitParams.region,
      division: explicitParams.division,
      city: explicitParams.city,
      lat: explicitParams.lat,
      lng: explicitParams.lng,
      cityIds: null,
      source: 'explicit'
    };
  }

  // Priority 2: Temporary location ALWAYS overrides when set (both logged and non-logged users)
  if (temporaryLocation && temporaryLocation.centerLocation) {
    return {
      region: null,
      division: null,
      city: null,
      lat: temporaryLocation.centerLocation.lat,
      lng: temporaryLocation.centerLocation.lng,
      cityIds: null,
      zoomRange: temporaryLocation.zoomRange,
      source: 'temporaryLocation'
    };
  }

  // Priority 3: User preferences if enabled
  if (useLocationPreferences && userDefaults) {
    // FORCE MAP CENTER MODE
    if (userDefaults.defaultCenterLocation) {
      // Map center mode
      const lat = userDefaults.defaultCenterLocation.lat || 
                  userDefaults.defaultCenterLocation.latitude;
      const lng = userDefaults.defaultCenterLocation.lng || 
                  userDefaults.defaultCenterLocation.longitude;
      
      return {
        region: null,
        division: null,
        city: null,
        lat,
        lng,
        cityIds: null,
        source: 'userPreferences-map'
      };
    } else if (userDefaults.masteredCityIds?.length > 0) {
      // Multi-city mode
      return {
        region: null,
        division: null,
        city: null,
        lat: null,
        lng: null,
        cityIds: userDefaults.masteredCityIds,
        source: 'userPreferences-cities'
      };
    }
  }

  // Priority 3: GeoLocationContext if enabled
  if (useGeoLocationContext && geoLocationContext) {
    const location = geoLocationContext.selectedLocation;
    if (location?.region || location?.division || location?.city) {
      return {
        region: location.region?.name,
        division: location.division?.name,
        city: location.city?.name,
        lat: null,
        lng: null,
        cityIds: null,
        source: 'geoContext-location'
      };
    } else if (geoLocationContext.userLocation) {
      return {
        region: null,
        division: null,
        city: null,
        lat: geoLocationContext.userLocation.latitude,
        lng: geoLocationContext.userLocation.longitude,
        cityIds: null,
        source: 'geoContext-userLocation'
      };
    }
  }

  // Priority 4: Default (no location)
  return {
    region: null,
    division: null,
    city: null,
    lat: null,
    lng: null,
    cityIds: null,
    source: 'none'
  };
}

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
 * @param {boolean} [options.useLocationPreferences=false] - Use saved user location preferences
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
  useGeoLocationContext = true, // Flag to control whether to use GeoLocationContext
  useLocationPreferences = false // Flag to use saved user preferences
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
  const [noLocationSelected, setNoLocationSelected] = useState(false);
  const { user, selectedRole } = useContext(AuthContext);
  
  // Refs for smarter logging
  const lastLoggedLocation = useRef(null);
  const lastFetchTimestamp = useRef(null);
  const hasLoggedWaiting = useRef({});
  
  // Extract stable primitive values to prevent infinite loops
  const userId = user?.uid;
  const userOrganizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;
  const userRoles = user?.roles;
  
  // Always call the hook to satisfy React's rules
  const { userData } = useUsers();
  // Only use the data if useLocationPreferences is true
  const userDefaults = useLocationPreferences ? userData?.localUserInfo?.userDefaults : null;
  
  // Get location from GeoLocationContext if available
  // Note: We must call the hook to satisfy React's rules, but we'll only use its data if useGeoLocationContext is true
  const geoLocationContext = useGeoLocation();
  const { isInitialized, temporaryLocation } = geoLocationContext || {};
  
  // Get EventDiscovery context for AI filter settings
  const eventDiscoveryContext = useEventDiscovery();
  const { state: eventDiscoveryState } = eventDiscoveryContext || {};
  const includeAiGenerated = eventDiscoveryState?.filters?.aiRecommendations || 
                             userData?.localUserInfo?.userDefaults?.searchSettings?.includeAiGenerated || 
                             false;
  
  // Use the helper function to resolve location parameters
  const locationParams = resolveLocationParameters({
    explicitParams: { region, division, city, lat, lng },
    userDefaults,
    geoLocationContext,
    temporaryLocation,
    useLocationPreferences,
    useGeoLocationContext
  });

  // Extract resolved values
  const effectiveRegion = locationParams.region;
  const effectiveDivision = locationParams.division;
  const effectiveCity = locationParams.city;
  const effectiveLat = locationParams.lat;
  const effectiveLng = locationParams.lng;
  const effectiveCityIds = locationParams.cityIds;
  const effectiveZoomRange = locationParams.zoomRange;

  // Log location source if it changed
  if (lastLoggedLocation.current !== locationParams.source) {
    console.log(`useEvents: Using location from ${locationParams.source}`, {
      region: effectiveRegion,
      division: effectiveDivision,
      city: effectiveCity,
      lat: effectiveLat,
      lng: effectiveLng,
      cityIds: effectiveCityIds
    });
    lastLoggedLocation.current = locationParams.source;
  }
  
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
    // Rate limit logging to once every 5 seconds
    const now = Date.now();
    if (!lastFetchTimestamp.current || now - lastFetchTimestamp.current > 5000) {
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
      lastFetchTimestamp.current = now;
    }
    
    // Check if we have any location parameters at all
    if (!effectiveRegion && !effectiveDivision && !effectiveCity && 
        !effectiveLat && !effectiveLng && (!effectiveCityIds || effectiveCityIds.length === 0)) {
      console.log('useEvents: No location selected, skipping event fetch');
      setEventsData({
        events: [],
        pagination: {
          total: 0,
          page: 1,
          limit: limit,
          pages: 0
        },
        filterType: null
      });
      setLoading(false);
      setNoLocationSelected(true);
      return;
    }
    
    // Clear the no location flag if we have location parameters
    setNoLocationSelected(false);

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

      // Handle multi-city filtering if city IDs are provided
      if (effectiveCityIds && effectiveCityIds.length > 0) {
        // Use the new cityIds parameter that Tom implemented
        params.cityIds = effectiveCityIds;
        console.log('Using multi-city filtering with cityIds:', effectiveCityIds);
      } else {
        // Location-based filtering parameters - using effective values that may come from GeoLocationContext
        if (effectiveRegion) params.masteredRegionName = effectiveRegion;
        if (effectiveDivision) params.masteredDivisionName = effectiveDivision;
        if (effectiveCity) params.masteredCityName = effectiveCity;
      }

      // Geolocation parameters - using effective values that may come from GeoLocationContext
      if (effectiveLat && effectiveLng) {
        params.lat = effectiveLat;
        params.lng = effectiveLng;
        // Add enhanced geo search parameters when using coordinates
        // FORCE MAP CENTER MODE
        // Check for temporaryLocation OR user preferences with map center
        if (temporaryLocation || (useLocationPreferences && userDefaults?.defaultCenterLocation)) {
          params.useGeoSearch = true;
          // Convert defaultZoomRange (miles) to km for the API
          // Use effectiveZoomRange if available (from temporary location), otherwise userDefaults
          const radiusInMiles = effectiveZoomRange || userDefaults?.defaultZoomRange || 50;
          params.radius = `${Math.round(radiusInMiles * 1.60934)}km`;
          params.sortByDistance = true;
        }
      }

      // Add AI discovered events filter
      if (includeAiGenerated) {
        params.includeAiGenerated = true;
      }

      // Log the actual values used for filtering (from direct input or GeoLocationContext)
      console.log('Using location filters:', {
        cityIds: effectiveCityIds,
        region: effectiveRegion,
        division: effectiveDivision,
        city: effectiveCity,
        lat: effectiveLat,
        lng: effectiveLng,
        useGeoSearch: params.useGeoSearch,
        radius: params.radius,
        source: useLocationPreferences ? 'User Preferences' :
                useGeoLocationContext && (
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


      // Log API call details only in development and only for unique requests
      if (process.env.NODE_ENV === 'development') {
        const requestKey = JSON.stringify({ cityIds: params.cityIds, start: params.start, end: params.end });
        if (lastLoggedLocation.current !== `api:${requestKey}`) {
          console.log('useEvents: API Request:', {
            url: `${process.env.NEXT_PUBLIC_BE_URL}/api/events`,
            params
          });
          lastLoggedLocation.current = `api:${requestKey}`;
        }
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
    effectiveCityIds,
    region,
    division,
    city,
    lat,
    lng,
    useGeoLocationContext,
    useLocationPreferences,
    userDefaults,
    // Use stable primitive values instead of user object to prevent infinite loops
    userId,
    userOrganizerId,
    userRoles,
    selectedRole,
    isInitialized,
    includeAiGenerated
    // Removed setState functions to prevent infinite loops
  ]);

  // Fetch events when parameters change
  useEffect(() => {
    // Skip if using location preferences but user data not loaded yet
    if (useLocationPreferences && !userDefaults && user) {
      if (!hasLoggedWaiting.current.userPrefs) {
        console.log('useEvents: Waiting for user preferences to load');
        hasLoggedWaiting.current.userPrefs = true;
      }
      return;
    }
    
    // Skip if explicitly using GeoLocationContext but it's not initialized yet
    // This should only apply when we're actually using the context as our location source
    if (useGeoLocationContext && !useLocationPreferences && !isInitialized) {
      if (!hasLoggedWaiting.current.geoInit) {
        console.log('useEvents: Waiting for GeoLocationContext initialization');
        hasLoggedWaiting.current.geoInit = true;
      }
      return;
    }
    
    // Additional validation for location data quality when using GeoLocationContext
    if (useGeoLocationContext && !useLocationPreferences) {
      // Check if we have valid location data from context
      const hasValidCity = effectiveCity && effectiveCity !== "Unknown";
      const hasValidRegion = effectiveRegion && effectiveRegion !== "Unknown";
      const hasValidCoords = effectiveLat && effectiveLng && 
                            !(effectiveLat === 0 && effectiveLng === 0);
      
      if (!hasValidCity && !hasValidRegion && !hasValidCoords) {
        if (!hasLoggedWaiting.current.noLocationData) {
          console.log('useEvents: No valid location data available from GeoLocationContext', {
            city: effectiveCity,
            region: effectiveRegion,
            coords: [effectiveLat, effectiveLng]
          });
          hasLoggedWaiting.current.noLocationData = true;
        }
        return;
      }
    }
    
    // Check if we have valid location data when using preferences
    if (useLocationPreferences && userDefaults) {
      const hasValidCities = effectiveCityIds && effectiveCityIds.length > 0;
      const hasValidMapCenter = effectiveLat && effectiveLng && 
                               !(effectiveLat === 0 && effectiveLng === 0);
      
      if (!hasValidCities && !hasValidMapCenter) {
        if (!hasLoggedWaiting.current.noPreferences) {
          console.log('useEvents: No valid location preferences set', {
            cityIds: effectiveCityIds,
            mapCenter: [effectiveLat, effectiveLng],
            useCenterLocation: true // FORCED TO TRUE
          });
          hasLoggedWaiting.current.noPreferences = true;
        }
        return;
      }
    }
    
    fetchEvents();
  }, [fetchEvents, isInitialized, useGeoLocationContext, useLocationPreferences, userDefaults, user, effectiveCity, effectiveRegion, effectiveLat, effectiveLng, effectiveCityIds, includeAiGenerated, temporaryLocation]);

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
    noLocationSelected,
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
  // - allowedAdminMasteredCityIds: array of city ObjectIds the admin manages
  // 
  // Backend needs to implement:
  // 1. Check if selectedRole === 'RegionalAdmin'
  // 2. Get the event's masteredCityId from the venue
  // 3. Verify masteredCityId is in the allowedAdminMasteredCityIds array
  // 4. If true, allow full CRUD operations (create/update/delete)
  // 5. RegionalAdmin should bypass ownerOrganizerID checks for events in their cities
  //
  // Example validation logic:
  // if (req.body.selectedRole === 'RegionalAdmin' && req.body.allowedAdminMasteredCityIds) {
  //   const venue = await Venue.findById(event.venueId);
  //   if (req.body.allowedAdminMasteredCityIds.includes(venue.masteredCityID.toString())) {
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
          cost: cleanedEventData.cost || '',
          // Include recurring event fields if present
          recurrenceRule: cleanedEventData.recurrenceRule || undefined,
          excludedDates: cleanedEventData.excludedDates || undefined
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
        allowedAdminMasteredCityIds: selectedRole === 'RegionalAdmin' ? 
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

      // Clean up fields that shouldn't be sent to backend
      delete preparedData.excludeDates; // Remove the typo field (without 'd')
      delete preparedData.excludeDatesString; // Remove the UI-only string field
      // Ensure we only have excludedDates (with 'd')
      
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
      console.log('PreparedData being sent:', JSON.stringify(preparedData, null, 2));
      const response = await axios.post(endpoint, preparedData, config);
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
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
          cost: cleanedEventData.cost || '',
          // Include auth fields for RA validation
          selectedRole: 'RegionalAdmin',
          allowedAdminMasteredCityIds: user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || 
                                      user?.backendInfo?.localAdminInfo?.adminCities
        };
      } else {
        // RO endpoint uses full data structure
        preparedData = {
          ...cleanedEventData,
          appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
          selectedRole: selectedRole, // Include the user's selected role for backend validation
          // Include admin cities for RegionalAdmin validation
          allowedAdminMasteredCityIds: selectedRole === 'RegionalAdmin' ? 
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
      }
      
      // Clean up fields that shouldn't be sent to backend
      delete preparedData.excludeDates; // Remove the typo field (without 'd')
      delete preparedData.excludeDatesString; // Remove the UI-only string field
      // Ensure we only have excludedDates (with 'd')
      
      // Only add venue geolocation and mastered location fields for RO updates
      if (selectedRole !== 'RegionalAdmin') {
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
      }
      
      // Handle image upload if an image file is present
      if (preparedData.imageFile) {
        try {
          console.log('Image upload requested for update, token status:', {
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
          console.error('Error uploading image during update:', imageError);
          // Continue without the image if upload fails
        }
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
      
      console.log('Updating event:', eventId, 'as role:', selectedRole);
      console.log('Prepared data for update:', JSON.stringify(preparedData, null, 2));
      
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
      
      // Add allowedAdminMasteredCityIds for RegionalAdmin
      const adminCities = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || 
                         user?.backendInfo?.localAdminInfo?.adminCities;
      if (selectedRole === 'RegionalAdmin' && adminCities) {
        queryParams.append('allowedAdminMasteredCityIds', adminCities.join(','));
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
