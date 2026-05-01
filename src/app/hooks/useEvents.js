// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useUsers } from '@/hooks/useUsers';
import { useEventDiscovery } from '@/contexts/EventDiscoveryContext';
import { dedupeFetch } from '@/utils/dedupeFetch';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

/**
 * Helper function to resolve location parameters based on various sources
 * @param {Object} options Configuration object
 * @returns {Object} Resolved location parameters
 */
function resolveLocationParameters(options) {
  const {
    explicitParams = {},
    currentLocation = null,
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

  // Priority 2: Current location (single source of truth)
  if (currentLocation && currentLocation.lat && currentLocation.lng) {
    return {
      region: null,
      division: null,
      city: null,
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      cityIds: null,
      zoomRange: currentLocation.zoomRange,
      source: 'currentLocation'
    };
  }

  // Priority 3: Fallback - no location set
  return {
    region: null,
    division: null,
    city: null,
    lat: null,
    lng: null,
    cityIds: null,
    zoomRange: null,
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
    'venueID',
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
  useLocationPreferences = false, // Flag to use saved user preferences
  view, // TIEMPO-446: 'main' | 'beginner' | undefined — passed to ?view= BE param
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
  const { isInitialized, currentLocation } = geoLocationContext || {};
  
  // Get EventDiscovery context for AI filter settings
  const eventDiscoveryContext = useEventDiscovery();
  const { state: eventDiscoveryState } = eventDiscoveryContext || {};
  const includeAiGenerated = eventDiscoveryState?.filters?.aiRecommendations || 
                             userData?.localUserInfo?.userDefaults?.searchSettings?.includeAiGenerated || 
                             false;
  
  // Use the helper function to resolve location parameters
  const locationParams = resolveLocationParameters({
    explicitParams: { region, division, city, lat, lng },
    currentLocation: useGeoLocationContext ? currentLocation : null,
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

// TIEMPO-276: Security cleanup - removed logging
  // Track location changes silently
  lastLoggedLocation.current = locationParams.source;
  
  // Cache key generation commented out to fix ESLint warnings
  // This was previously used for memoizing/deduplicating requests
  // Now we explicitly list all dependencies in the useCallback
  // const cacheKey = JSON.stringify({...});
  
  // Generate default date range if needed
  const getDefaultDateRange = () => {
    // TIEMPO-246: Use ISO strings without Date() for timezone independence
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Calculate start of current month
    const startMonth = String(month + 1).padStart(2, '0');
    const startOfMonth = `${year}-${startMonth}-01T00:00:00.000Z`;
    
    // Calculate end of 3 months from now
    const endMonth = month + 3;
    const endYear = year + Math.floor(endMonth / 12);
    const endMonthNormalized = endMonth % 12;
    // Get last day of that month
    const lastDay = new Date(endYear, endMonthNormalized + 1, 0).getDate();
    const endMonthStr = String(endMonthNormalized + 1).padStart(2, '0');
    const endOfMonth = `${endYear}-${endMonthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;
    
    return { start: startOfMonth, end: endOfMonth };
  };

  const fetchEvents = useCallback(async () => {
// TIEMPO-276: Security cleanup - removed logging
    // Track fetch timing silently
    const now = Date.now();
    lastFetchTimestamp.current = now;
    
    // Check if we have any location parameters at all
    if (!effectiveRegion && !effectiveDivision && !effectiveCity && 
        !effectiveLat && !effectiveLng && (!effectiveCityIds || effectiveCityIds.length === 0)) {
// TIEMPO-276: Security cleanup - removed logging
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
        // TIEMPO-446: view=main excludes organizer-explicit forBeginner events;
        // view=beginner returns only forBeginner events. Undefined = no filter.
        ...(view && { view }),
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
// TIEMPO-276: Security cleanup - removed logging
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
        // Check for currentLocation (single source of truth)
        if (currentLocation?.lat && currentLocation?.lng) {
          params.useGeoSearch = true;
          // Convert zoomRange (miles) to km for the API
          // Use context value or fallback to 200 miles
          const radiusInMiles = effectiveZoomRange || 200;
          params.radius = `${Math.round(radiusInMiles * 1.60934)}km`;
          params.sortByDistance = true;
        }
      }

      // Add AI discovered events filter
      if (includeAiGenerated) {
        params.includeAiGenerated = true;
      }

      // Add user role and organizerId if user is a RegionalOrganizer
      if (userId && selectedRole === 'RegionalOrganizer' && userOrganizerId) {
        params.organizerId = userOrganizerId;
        params.userRole = 'RegionalOrganizer'; // Make sure we're passing the role to the backend
// TIEMPO-276: Security cleanup - removed logging
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


// TIEMPO-276: Security cleanup - removed logging

      // Call the unified endpoint
      // TIEMPO-257: Use dedupeFetch to prevent duplicate event calls
      const response = await dedupeFetch(`${getApiBaseUrl()}/api/events`, {
        params,
        timeout: 15000, // 15 second timeout
      });

      // Store the response which includes events array and pagination info
      setEventsData(response.data);

      // TIEMPO-382: Only warn if approaching/hitting limit (avoid noise)
      const returnedCount = response.data?.events?.length || 0;
      const requestedLimit = params.limit;
      const totalAvailable = response.data?.pagination?.total || returnedCount;

      if (returnedCount === requestedLimit && totalAvailable > requestedLimit) {
        console.error(`🚨 EVENT LIMIT HIT: Returned ${returnedCount}/${totalAvailable} events. Limit of ${requestedLimit} is truncating results!`);
      } else if (returnedCount >= requestedLimit * 0.9) {
        console.warn(`⚠️ EVENT LIMIT WARNING: Returned ${returnedCount}/${totalAvailable} events (${Math.round(returnedCount/requestedLimit*100)}% of ${requestedLimit} limit)`);
      }
      // Normal fetches don't log to reduce console noise
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
    effectiveZoomRange,
    // Use stable primitive values instead of user object to prevent infinite loops
    userId,
    userOrganizerId,
    userRoles,
    selectedRole,
    includeAiGenerated,
    currentLocation,
    view, // TIEMPO-446
    // Removed config options and setState functions to prevent infinite loops
  ]);

  // Fetch events when parameters change
  useEffect(() => {
    // Skip if using location preferences but user data not loaded yet
    // UNLESS GeoLocationContext has valid currentLocation (from Azure Functions mapCenter)
    if (useLocationPreferences && !userDefaults && user) {
      // Check if GeoLocationContext has valid location from mapCenter
      const hasValidCurrentLocation = currentLocation?.lat && currentLocation?.lng &&
                                      !(currentLocation.lat === 0 && currentLocation.lng === 0);
      if (!hasValidCurrentLocation) {
        if (!hasLoggedWaiting.current.userPrefs) {
// TIEMPO-276: Security cleanup - removed logging
          hasLoggedWaiting.current.userPrefs = true;
        }
        return;
      }
      // Fall through - use GeoLocationContext's currentLocation instead
    }

    // Skip if explicitly using GeoLocationContext but it's not initialized yet
    // This should only apply when we're actually using the context as our location source
    if (useGeoLocationContext && !useLocationPreferences && !isInitialized) {
      if (!hasLoggedWaiting.current.geoInit) {
// TIEMPO-276: Security cleanup - removed logging
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
// TIEMPO-276: Security cleanup - removed logging
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
// TIEMPO-276: Security cleanup - removed logging
          hasLoggedWaiting.current.noPreferences = true;
        }
        return;
      }
    }
    
    fetchEvents();
  }, [fetchEvents, isInitialized, useGeoLocationContext, useLocationPreferences, userDefaults, user, effectiveCity, effectiveRegion, effectiveLat, effectiveLng, effectiveCityIds, includeAiGenerated, currentLocation]);

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

      // FIELD-NAMING-HYGIENE Phase A Entity #1 — Venue normalization
      // Form state has both venueId (canonical) and locationID (legacy WP-era).
      // BE response/validator paths use venueID (uppercase, mongoose-style).
      // Normalize all three at the boundary so downstream consumers don't trip
      // on case-mismatch (RegionalAdmin event-create bug 2026-05-01).
      // See MasterCalendar/docs/FIELD-NAMING-HYGIENE.md
      if (eventData) {
        const _vid = eventData.venueID || eventData.venueId || eventData.locationID;
        if (_vid) {
          eventData.venueID = _vid;
          eventData.venueId = _vid;
          eventData.locationID = _vid;
        }
      }
      
      // Get a fresh token for the request
      let token;
      try {
        token = await getIdToken(true); // Force refresh
// TIEMPO-276: Security cleanup - removed logging
      } catch (tokenError) {
        console.error('Failed to get fresh token:', tokenError);
        if (user.token) {
          token = user.token; // Fall back to existing token if available
// TIEMPO-276: Security cleanup - removed logging
        } else {
          throw new Error('Authentication token unavailable');
        }
      }
      
      // Clean up the event data by converting empty strings for ObjectId fields to null
      const cleanedEventData = sanitizeObjectIdFields(eventData);
      
// TIEMPO-276: Security cleanup - removed logging
      
      // Prepare the event data for submission based on role
      let preparedData;
      
      if (selectedRole === 'RegionalAdmin') {
        // RA payload — spread cleanedEventData (same pattern as RO) so categories,
        // isRepeating, recurrence config, forBeginners, etc. ALL propagate. The
        // earlier hand-listed "minimal" payload silently dropped categoryFirst/Id
        // and isRepeating, which caused PROD events to save without category and
        // recurring rules to be ignored (PROD bug 2026-05-01).
        preparedData = {
          ...cleanedEventData,
          // Required RA fields with safe fallbacks
          shortTitle: cleanedEventData.shortTitle || cleanedEventData.shortName || '',
          description: cleanedEventData.description || '',
          cost: cleanedEventData.cost || '',
          // RA-specific spotlight/features normalization (TIEMPO-388)
          features: cleanedEventData.features || cleanedEventData.spotlights || [],
          spotlights: cleanedEventData.spotlights || cleanedEventData.features || [],
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
        // TIEMPO-245: Include shortTitle field (21 chars max)
        shortTitle: cleanedEventData.shortTitle || cleanedEventData.shortName || '',
        // Set expiresAt to 1 year after endDate
        expiresAt: new Date(new Date(cleanedEventData.endDate).getTime() + 365 * 24 * 60 * 60 * 1000),
        // Include admin cities for RegionalAdmin validation
        allowedAdminMasteredCityIds: selectedRole === 'RegionalAdmin' ?
          (user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds ||
           user?.backendInfo?.localAdminInfo?.adminCities) : undefined,
        // Standardized venue field - use venueID only
        venueID: cleanedEventData.venueID,
        // TIEMPO-388: Explicitly include spotlights/features for non-repeating events
        features: cleanedEventData.features || cleanedEventData.spotlights || [],
        spotlights: cleanedEventData.spotlights || cleanedEventData.features || [],
        };
      }

      // TIEMPO-388: Debug logging for spotlights
      if (preparedData.features?.length > 0 || preparedData.spotlights?.length > 0) {
        console.log('🎯 TIEMPO-388: Creating event with spotlights:', {
          features: preparedData.features,
          spotlights: preparedData.spotlights
        });
      }

      // If venue has coordinates, include them in venueGeolocation
      if (eventData.venueLatitude && eventData.venueLongitude) {
        preparedData.venueGeolocation = {
          type: "Point",
          coordinates: [parseFloat(eventData.venueLongitude), parseFloat(eventData.venueLatitude)]
        };
// TIEMPO-276: Security cleanup - removed logging
      } else if (eventData.venueID) {
        // We have a venue but no coordinates - need to fetch them
        try {
          const { getVenueById } = await import('@/services/venueService');
          const venueData = await getVenueById(eventData.venueID);

          if (venueData && venueData.latitude && venueData.longitude) {
            preparedData.venueGeolocation = {
              type: "Point",
              coordinates: [parseFloat(venueData.longitude), parseFloat(venueData.latitude)]
            };
          } else {
            console.warn('Could not retrieve venue coordinates for venueID:', eventData.venueID);
            preparedData.venueGeolocation = {
              type: "Point",
              coordinates: [0, 0]
            };
          }
        } catch (venueError) {
          console.error('Error fetching venue data:', venueError);
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
// TIEMPO-276: Security cleanup - removed logging
          
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

// TIEMPO-276: Security cleanup - removed logging

      // Set authorization header with the fresh token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
// TIEMPO-276: Security cleanup - removed logging
      // Route to appropriate endpoint based on selected role
      const endpoint = selectedRole === 'RegionalAdmin' 
        ? `${getApiBaseUrl()}/api/events/ra/create`
        : `${getApiBaseUrl()}/api/events/post`;
      
// TIEMPO-276: Security cleanup - removed logging
      const response = await axios.post(endpoint, preparedData, config);
// TIEMPO-276: Security cleanup - removed logging
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

      // FIELD-NAMING-HYGIENE Phase A Entity #1 — Venue normalization (mirrors createEvent).
      // See MasterCalendar/docs/FIELD-NAMING-HYGIENE.md
      if (eventData) {
        const _vid = eventData.venueID || eventData.venueId || eventData.locationID;
        if (_vid) {
          eventData.venueID = _vid;
          eventData.venueId = _vid;
          eventData.locationID = _vid;
        }
      }
      
      // Get a fresh token for the request
      let token;
      try {
        token = await getIdToken(true); // Force refresh
// TIEMPO-276: Security cleanup - removed logging
      } catch (tokenError) {
        console.error('Failed to get fresh token:', tokenError);
        if (user.token) {
          token = user.token; // Fall back to existing token if available
// TIEMPO-276: Security cleanup - removed logging
        } else {
          throw new Error('Authentication token unavailable');
        }
      }
      
      // Prepare the event data for submission
      // Clean up the event data by converting empty strings for ObjectId fields to null
      const cleanedEventData = sanitizeObjectIdFields(eventData);
      
      let preparedData;
      
      if (selectedRole === 'RegionalAdmin') {
        // RA payload — spread cleanedEventData (same pattern as RO) so categories,
        // isRepeating, recurrence config, forBeginners, etc. propagate on UPDATE.
        // Hand-listed minimal payload was silently dropping fields user edited
        // (PROD bug 2026-05-01: category + RRULE not saving on RA event update).
        preparedData = {
          ...cleanedEventData,
          shortTitle: cleanedEventData.shortTitle || cleanedEventData.shortName || '',
          description: cleanedEventData.description || '',
          cost: cleanedEventData.cost || '',
          // Auth fields for RA BE validation
          selectedRole: 'RegionalAdmin',
          allowedAdminMasteredCityIds: user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds ||
                                      user?.backendInfo?.localAdminInfo?.adminCities,
          // RA-specific spotlight/features normalization (TIEMPO-388)
          features: cleanedEventData.features || cleanedEventData.spotlights || [],
          spotlights: cleanedEventData.spotlights || cleanedEventData.features || [],
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
          // Standardized venue field - use venueID only
          venueID: cleanedEventData.venueID,
          // Add required fields that might be missing in update
          masteredRegionName: cleanedEventData.masteredRegionName || cleanedEventData.selectedRegion,
          // Set default ownerOrganizerName if not provided - use the user's organizer name if they're a Regional Organizer
          ownerOrganizerName: cleanedEventData.ownerOrganizerName || 
                             (selectedRole === 'RegionalOrganizer' ? user?.backendInfo?.regionalOrganizerInfo?.organizerName : null) ||
                             "Event Organizer",
          // Add ownerOrganizerShortName (required by backend) - fallback to shortName field first
          ownerOrganizerShortName: cleanedEventData.ownerOrganizerShortName || cleanedEventData.shortName || cleanedEventData.ownerOrganizerName || "Event Organizer",
          // TIEMPO-245: Include shortTitle field (21 chars max)
          shortTitle: cleanedEventData.shortTitle || cleanedEventData.shortName || '',
          // Set expiresAt to 1 year after endDate
          expiresAt: new Date(new Date(cleanedEventData.endDate).getTime() + 365 * 24 * 60 * 60 * 1000),
          // TIEMPO-388: Explicitly include spotlights/features for non-repeating events
          features: cleanedEventData.features || cleanedEventData.spotlights || [],
          spotlights: cleanedEventData.spotlights || cleanedEventData.features || [],
        };
      }

      // TIEMPO-388: Debug logging for spotlights
      if (preparedData.features?.length > 0 || preparedData.spotlights?.length > 0) {
        console.log('🎯 TIEMPO-388: Sending spotlights to backend:', {
          features: preparedData.features,
          spotlights: preparedData.spotlights
        });
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
        } else if (eventData.venueID) {
          // We have a venue but no coordinates - need to fetch them
          try {
            const { getVenueById } = await import('@/services/venueService');
            const venueData = await getVenueById(eventData.venueID);

            if (venueData && venueData.latitude && venueData.longitude) {
              preparedData.venueGeolocation = {
                type: "Point",
                coordinates: [parseFloat(venueData.longitude), parseFloat(venueData.latitude)]
              };
            } else {
              console.warn('Could not retrieve venue coordinates for venueID:', eventData.venueID);
              preparedData.venueGeolocation = {
                type: "Point",
                coordinates: [0, 0]
              };
            }
          } catch (venueError) {
            console.error('Error fetching venue data for update:', venueError);
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
// TIEMPO-276: Security cleanup - removed logging
          
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
      
// TIEMPO-276: Security cleanup - removed logging
      
      // Route to appropriate endpoint based on selected role
      const endpoint = selectedRole === 'RegionalAdmin' 
        ? `${getApiBaseUrl()}/api/events/ra/${eventId}`
        : `${getApiBaseUrl()}/api/events/${eventId}?appId=${process.env.NEXT_PUBLIC_APPLICATION_ID}`;
      
// TIEMPO-276: Security cleanup - removed logging
      const response = await axios.put(endpoint, preparedData, config);
      
// TIEMPO-276: Security cleanup - removed logging
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
// TIEMPO-276: Security cleanup - removed logging
      } catch (tokenError) {
        console.error('Failed to get fresh token:', tokenError);
        if (user.token) {
          token = user.token; // Fall back to existing token if available
// TIEMPO-276: Security cleanup - removed logging
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
      
// TIEMPO-276: Security cleanup - removed logging
      
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
        ? `${getApiBaseUrl()}/api/events/ra/${eventId}`
        : `${getApiBaseUrl()}/api/events/${eventId}?${queryParams.toString()}`;
      
// TIEMPO-276: Security cleanup - removed logging
      const response = await axios.delete(endpoint, config);
      
// TIEMPO-276: Security cleanup - removed logging
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
        `${getApiBaseUrl()}/api/events/id/${eventId}?appId=${process.env.NEXT_PUBLIC_APPLICATION_ID}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  };

  return { createEvent, updateEvent, deleteEvent, getEventById };
}
