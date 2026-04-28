// TIEMPO-239: Import venue timezone utilities for proper display
import { getEventDisplayTimes } from './venueTimezone';

export function transformEvents(events) {
  // Only log if no events received (potential error condition)
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.warn("No events to transform or events is not an array");
    return [];
  }
  
  // Debug: Check first few events for venue timezone data
  const debugEvents = events.slice(0, 3);
  debugEvents.forEach(event => {
    if (event.shortTitle?.includes('VIDA') || event.title?.includes('Practica')) {
      // TIEMPO-276: Security cleanup - removed backend event logging
      /*
        title: event.title,
        shortTitle: event.shortTitle,
        venueStartDisplay: event.venueStartDisplay,
        venueEndDisplay: event.venueEndDisplay,
        venueAbbr: event.venueAbbr,
        startDate: event.startDate,
        endDate: event.endDate
      */
    }
  });

  return events.map((event) => {
    try {
      // Create standardized venue references
      // Handle both old locationID/locationName and new venueID/venueId/venueName formats
      const venueId = event.venueID || event.venueId || event.locationID || null;
      const venueName = event.venueName || event.locationName || null;
      
      // TIEMPO-239: Get proper display times from event
      const displayTimes = getEventDisplayTimes(event);
      const useVenueTime = displayTimes.hasVenueTimezone;
    
    // For FullCalendar RRULE plugin, we need to handle recurring events differently
    const baseEvent = {
      title: event.title, // Use the 'title' field from the API
      extendedProps: {
        // Any additional data
        _id: event._id,
        description: event.description,
        standardsTitle: event.standardsTitle,
        categoryFirst: event.categoryFirst,
        categorySecond: event.categorySecond,
        categoryThird: event.categoryThird,
        eventImage: event.eventImage,
        // TIEMPO-264: Remove default fallback image - show empty space instead
        fallbackImageUrl: event.fallbackImageUrl || null,
        // Include both old and new field names during transition
        locationID: venueId,  // Legacy format - keep for compatibility
        locationName: venueName,  // Legacy format - keep for compatibility
        venueId: venueId,  // New standardized field - lowercase id
        venueID: venueId,  // New standardized field - uppercase ID for API compatibility
        venueName: venueName,  // New standardized field
        cost: event.cost,
        masteredRegionName: event.masteredRegionName,
        masteredDivisionName: event.masteredDivisionName,
        masteredCityName: event.masteredCityName,
        // Store the backend's masteredCityId directly - can be either object or string
        masteredCityId: event.masteredCityId, // For RA permission checks
        venueMasteredCityID: event.venueMasteredCityID, // TIEMPO-195: Add missing field for single-city RAs
        venueMasteredCityId: event.venueMasteredCityId, // Lowercase variant
        active: event.active || event.isActive, // Legacy field
        isActive: event.isActive || event.active, // Current field
        canceled: event.canceled || event.isCanceled,
        isCanceled: event.isCanceled || event.canceled, // Current field
        recurrenceRule: event.recurrenceRule,
        ownerOrganizerID: event.ownerOrganizerID,
        grantedOrganizerID: event.grantedOrganizerID,
        alternateOrganizerID: event.alternateOrganizerID,
        ownerOrganizerName: event.ownerOrganizerName,
        featured: event.featured || event.isFeatured,
        isFeatured: event.isFeatured || event.featured,
        featuredImage: event.featuredImage || null,
        expiresAt: event.expiresAt,
        tmpCreator: event.tmpCreator,
        tmpVenueId: event.tmpVenueId,
        tmpEventOrgId: event.tmpEventOrgId,
        tmpMix: event.tmpMix,
        // Add shortTitle and ownerOrganizerShortName for calendar display
        shortTitle: event.shortTitle || event.shortName || '',
        ownerOrganizerShortName: event.ownerOrganizerShortName || event.shortName || '',
        // TIEMPO-408 / CALBEAF-109: beginner classification fields
        forBeginners: event.forBeginners === true,
        beginnerFriendly: event.beginnerFriendly === true,
        travelWorthy: event.travelWorthy === true,
        // Add AI event detection
        isDiscovered: event.isDiscovered || false,
        // AI discovery metadata - source URL and discovery date
        sourceLink: event.source || null,
        discoverySource: event.discoverySource || null,
        discoveryDate: event.discoveredFirstDate || null,
        eventDescription: event.description || null,
        // AI discovered hosts and venue geolocation for map display
        discoveredHosts: event.discoveredHosts || null,
        venueGeolocation: event.venueGeolocation || null,
        venueCityName: event.venueCityName || null,
        // Add isRepeating flag
        isRepeating: event.isRepeating || false,
        // Add excludedDates for edit mode
        excludedDates: event.excludedDates || [],
        // TIEMPO-362: Add instanceOverrides for recurring event modifications
        instanceOverrides: event.instanceOverrides || [],
        // TIEMPO-239: Add venue timezone display information
        display: event.display || null,
        displayStartTime: displayTimes.startTime,
        displayEndTime: displayTimes.endTime,
        venueTimezone: displayTimes.timezone,
        timezoneAbbr: displayTimes.timezoneAbbr,
        isDST: displayTimes.isDST,
        hasVenueTimezone: displayTimes.hasVenueTimezone,
        // TIEMPO-252: Pass through NEW venue timezone fields from backend
        venueStartDisplay: event.venueStartDisplay || null,
        venueEndDisplay: event.venueEndDisplay || null,
        venueTZ: event.venueTZ || null,
        venueAbbr: event.venueAbbr || null,
        // TIEMPO-445: use length check so an empty [] doesn't shadow a populated array
        features:   (event.features?.length   ? event.features   : event.spotlights) || [],
        spotlights: (event.spotlights?.length ? event.spotlights : event.features)   || [],
      },
    };

    // Check if this is a recurring event with RRULE
    if (event.recurrenceRule && event.isRepeating) {
      // Clean the RRULE string to remove trailing semicolons
      let cleanedRRule = event.recurrenceRule.trim();
      
      // Remove trailing semicolon if present
      if (cleanedRRule.endsWith(';')) {
        cleanedRRule = cleanedRRule.slice(0, -1);
      }
      
      // Also remove any empty properties (consecutive semicolons)
      cleanedRRule = cleanedRRule.replace(/;;+/g, ';');
      
      // Validate that we have a valid RRULE
      if (!cleanedRRule || !cleanedRRule.includes('FREQ=')) {
        console.warn('Invalid RRULE detected, skipping recurring event:', event.recurrenceRule);
        // Return as a regular event instead
        return {
          ...baseEvent,
          // TIEMPO-239: Use venue display times if available
          start: useVenueTime ? displayTimes.startTime : event.startDate,
          end: useVenueTime ? displayTimes.endTime : event.endDate,
        };
      }
      
      try {
        // Parse RRULE string to FullCalendar v6 object format
        // TIEMPO-239: Pass venue times if available for RRULE parsing
        const startForRRule = useVenueTime ? displayTimes.startTime : event.startDate;

        // Ensure we have a valid start date for RRULE parsing
        if (!startForRRule) {
          console.warn('No valid start date for recurring event, skipping:', event.title);
          return {
            ...baseEvent,
            start: event.startDate,
            end: event.endDate,
          };
        }

        const rruleObj = parseRRuleToObject(cleanedRRule, startForRRule);
        
        
        // Create the event object
        const recurringEvent = {
          ...baseEvent,
          rrule: rruleObj,
          // duration is calculated from start to end time
          duration: calculateDuration(event.startDate, event.endDate),
          // Keep original title (icon will be handled in display)
          title: event.title,
          extendedProps: {
            ...baseEvent.extendedProps,
            isRecurring: true,
            recurrenceRule: cleanedRRule,
            excludedDates: event.excludedDates || [],
            // TIEMPO-362: Ensure instanceOverrides is included
            instanceOverrides: event.instanceOverrides || [],
          }
        };
        
        // Add exdate if there are excluded dates
        // TIEMPO-362: exdate must use SAME format as dtstart (venue local time, no Z suffix)
        // rrule.js compares dtstart and exdate as strings - they must match format exactly
        if (event.excludedDates && Array.isArray(event.excludedDates) && event.excludedDates.length > 0 && startForRRule) {
          // Extract time from dtstart (which is already in venue local time format)
          // dtstart format: "2026-05-06T19:00:00" (no Z suffix = venue local time)
          const dtstartStr = typeof startForRRule === 'string' ? startForRRule : '';
          const timePart = dtstartStr.includes('T') ? dtstartStr.split('T')[1] : '19:00:00';
          // Remove any Z suffix or timezone offset from the time part
          const eventStartTime = timePart.replace('Z', '').split('+')[0].split('-')[0];

          // Transform each excluded date to match dtstart format exactly
          const validExdates = event.excludedDates
            .filter(excludedDate => excludedDate && typeof excludedDate === 'string')
            .map(excludedDate => {
              // Get just the date part (YYYY-MM-DD)
              const excludedDateOnly = excludedDate.includes('T') ? excludedDate.split('T')[0] : excludedDate;
              // Combine with event start time (no Z suffix = venue local time)
              const exdateWithTime = `${excludedDateOnly}T${eventStartTime}`;
              // Validate the date is parseable
              const dateObj = new Date(exdateWithTime);
              return isNaN(dateObj.getTime()) ? null : exdateWithTime;
            })
            .filter(exdate => exdate !== null);

          if (validExdates.length > 0) {
            recurringEvent.exdate = validExdates;
          }
        }
        
        return recurringEvent;
      } catch (error) {
        console.error('Error parsing RRULE, falling back to single event:', error, 'for event:', event.title);
        console.error('Failed RRULE was:', cleanedRRule);
        // Fallback to single event with indicator
        return {
          ...baseEvent,
          // TIEMPO-239: Use venue display times if available
          start: useVenueTime ? displayTimes.startTime : event.startDate,
          end: useVenueTime ? displayTimes.endTime : event.endDate,
          title: event.title + ' (⚠️ Recurring)',
          extendedProps: {
            ...baseEvent.extendedProps,
            isRecurring: true,
            recurrenceRule: cleanedRRule,
            parsingError: true
          }
        };
      }
    } else {
      // For non-recurring events, use standard format
      return {
        ...baseEvent,
        // TIEMPO-239: Use venue display times if available, fallback to UTC
        start: useVenueTime ? displayTimes.startTime : event.startDate,
        end: useVenueTime ? displayTimes.endTime : event.endDate
      };
    }
    } catch (error) {
      console.error('Error transforming event:', error, 'Event:', event);
      // Return null for failed transformations, will be filtered out
      return null;
    }
  }).filter(event => event !== null); // Filter out any failed transformations
}

// Parse RRULE string to FullCalendar v6 object format
// TIEMPO-250: dtstart uses venue local time (no Z suffix) for proper DST handling
// This allows rrule.js to maintain consistent local time across DST boundaries
function parseRRuleToObject(rruleString, startDate) {
  // First pass: get frequency
  let frequency = null;

  try {
    const parts = rruleString.split(';');

    const rruleObj = {
      // TIEMPO-239/250: Use venue time directly (no Z suffix = local time)
      // rrule.js will handle DST transitions correctly with local time format
      dtstart: startDate
    };
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key === 'FREQ') {
      frequency = value.toLowerCase();
    }
  });

  parts.forEach(part => {
    const [key, value] = part.split('=');
    switch(key) {
      case 'FREQ':
        rruleObj.freq = value.toLowerCase();
        break;
      case 'BYDAY':
        // Handle differently based on frequency
        if (frequency === 'monthly') {
          // For monthly, keep the original format (e.g., '2TH', '-1MO')
          // FullCalendar's rrule plugin expects this format for monthly patterns
          rruleObj.byweekday = value.split(',');
          // Also add bysetpos and byweekday separately for FullCalendar
          // This helps with certain RRULE parsers that expect split format
          const positionalDays = value.split(',').map(item => {
            const match = item.match(/^([+-]?\d+)([A-Z]{2})$/);
            if (match) {
              return { pos: parseInt(match[1]), day: match[2].toLowerCase() };
            }
            return null;
          }).filter(Boolean);
          
          if (positionalDays.length > 0) {
            // TIEMPO-250: Some RRULE parsers need these separated
            // Use UPPERCASE day codes for RFC 5545 compliance and rrule.js compatibility
            rruleObj.bysetpos = positionalDays.map(pd => pd.pos);
            rruleObj.byweekday = positionalDays.map(pd => pd.day.toUpperCase());
          }
        } else {
          // For weekly, convert to lowercase array
          rruleObj.byweekday = value.split(',').map(day => day.toLowerCase());
          // Converting to lowercase for FullCalendar compatibility
        }
        break;
      case 'UNTIL': {
        // Convert RRULE date format to ISO format
        const isoDate = convertRRuleDateToISO(value);
        // TIEMPO-239: Use date as-is for venue times
        rruleObj.until = isoDate;
        break;
      }
      case 'COUNT':
        rruleObj.count = parseInt(value);
        break;
      case 'INTERVAL':
        rruleObj.interval = parseInt(value);
        break;
    }
  });
  
  return rruleObj;
  } catch (error) {
    console.error('Error parsing RRULE:', rruleString, error);
    // Return a basic object to prevent crashes
    // For monthly rules that fail, return a simple non-recurring format
    if (frequency === 'monthly') {
      console.warn('Monthly RRULE failed to parse, falling back to single event');
      return {
        freq: 'daily',
        count: 1,
        // TIEMPO-239: Use date as-is\n        dtstart: startDate
      };
    }
    return {
      freq: 'weekly',
      // TIEMPO-239: Use date as-is
      dtstart: startDate
    };
  }
}

// Convert RRULE date format (YYYYMMDDTHHMMSSZ) to ISO format
function convertRRuleDateToISO(rruleDate) {
  // Handle the YYYYMMDDTHHMMSSZ format
  if (rruleDate.length >= 15) {
    const year = rruleDate.substring(0, 4);
    const month = rruleDate.substring(4, 6);
    const day = rruleDate.substring(6, 8);
    const hour = rruleDate.substring(9, 11);
    const minute = rruleDate.substring(11, 13);
    const second = rruleDate.substring(13, 15);
    
    // Return without Z suffix to treat as local time
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }
  return rruleDate; // Return as-is if format doesn't match
}

// TIEMPO-239: stripTimezoneIndicator function REMOVED
// This function was converting to browser timezone - the opposite of our mission.
// Events now display in venue timezone using the display object from backend.

// TIEMPO-239: Calculate duration using string manipulation to avoid timezone conversion
function calculateDuration(startDate, endDate) {
  // Parse time strings without Date objects to avoid timezone issues
  // Format: "2025-06-28T19:30:00" or "2025-06-28T19:30:00.000Z"
  const getTimeInMinutes = (dateStr) => {
    const timePart = dateStr.split('T')[1];
    if (!timePart) return 0;
    
    const [hours, minutes] = timePart.split(':');
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };
  
  const startMinutes = getTimeInMinutes(startDate);
  const endMinutes = getTimeInMinutes(endDate);
  
  // Calculate duration (handle day boundary if end < start)
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60; // Add 24 hours if crossing midnight
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  // Return duration in format "HH:MM"
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/*

  regionName: { type: String, required: true },
  regionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Regions",
    required: true,
  },
  },


  recurrenceRule: { type: String, required: false },
  tmpEventOrgId: { type: String, required: false },
  tmpUrl: { type: String, required: false },

});
*/
