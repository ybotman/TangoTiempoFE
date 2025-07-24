export function transformEvents(events) {
  // Only log if no events received (potential error condition)
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.warn("No events to transform or events is not an array");
    return [];
  }

  return events.map((event) => {
    try {
      // Create standardized venue references
      // Handle both old locationID/locationName and new venueID/venueId/venueName formats
      const venueId = event.venueID || event.venueId || event.locationID || null;
      const venueName = event.venueName || event.locationName || null;
    
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
        fallbackImageUrl: event.fallbackImageUrl || '/TangoQuestion.jpg',
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
        expiresAt: event.expiresAt,
        tmpCreator: event.tmpCreator,
        tmpVenueId: event.tmpVenueId,
        tmpEventOrgId: event.tmpEventOrgId,
        tmpMix: event.tmpMix,
        // Add shortTitle and ownerOrganizerShortName for calendar display
        shortTitle: event.shortTitle || event.shortName || '',
        ownerOrganizerShortName: event.ownerOrganizerShortName || event.shortName || '',
        // Add AI event detection
        isDiscovered: event.isDiscovered || false,
        // Add isRepeating flag
        isRepeating: event.isRepeating || false,
        // Add excludedDates for edit mode
        excludedDates: event.excludedDates || [],
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
          start: stripTimezoneIndicator(event.startDate),
          end: stripTimezoneIndicator(event.endDate),
        };
      }
      
      try {
        // Parse RRULE string to FullCalendar v6 object format
        const rruleObj = parseRRuleToObject(cleanedRRule, event.startDate, event.endDate);
        
        
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
          }
        };
        
        // Add exdate if there are excluded dates
        if (event.excludedDates && Array.isArray(event.excludedDates) && event.excludedDates.length > 0) {
          // Extract time from the event's start date
          const eventStartTime = event.startDate.split('T')[1]; // Gets "23:00:00.000Z"
          
          // Transform each excluded date to match the event's start time
          recurringEvent.exdate = event.excludedDates.map(excludedDate => {
            const excludedDateOnly = excludedDate.split('T')[0]; // Gets "2025-10-10"
            // Combine excluded date with event's start time
            const exdateWithTime = `${excludedDateOnly}T${eventStartTime}`;
            return stripTimezoneIndicator(exdateWithTime);
          });
          
          // Excluded dates processed and added to event
        }
        
        return recurringEvent;
      } catch (error) {
        console.error('Error parsing RRULE, falling back to single event:', error, 'for event:', event.title);
        console.error('Failed RRULE was:', cleanedRRule);
        // Fallback to single event with indicator
        return {
          ...baseEvent,
          start: stripTimezoneIndicator(event.startDate),
          end: stripTimezoneIndicator(event.endDate),
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
        start: stripTimezoneIndicator(event.startDate), // Map 'startDate' to 'start'
        end: stripTimezoneIndicator(event.endDate), // Map 'endDate' to 'end'
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
function parseRRuleToObject(rruleString, startDate, endDate) {
  try {
    const parts = rruleString.split(';');
    
    const rruleObj = {
      // Strip Z suffix to treat as local time instead of UTC
      // This prevents recurring events from shifting to previous day in local timezones
      dtstart: stripTimezoneIndicator(startDate) // Use event's startDate as dtstart without UTC indicator
    };
  
  // First pass: get frequency
  let frequency = null;
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
            // Some RRULE parsers need these separated
            rruleObj.bysetpos = positionalDays.map(pd => pd.pos);
            rruleObj.byweekday = positionalDays.map(pd => pd.day);
          }
        } else {
          // For weekly, convert to lowercase array
          rruleObj.byweekday = value.split(',').map(day => day.toLowerCase());
          // Converting to lowercase for FullCalendar compatibility
        }
        break;
      case 'UNTIL':
        // Convert RRULE date format to ISO format and strip timezone
        const isoDate = convertRRuleDateToISO(value);
        rruleObj.until = stripTimezoneIndicator(isoDate);
        break;
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
        dtstart: stripTimezoneIndicator(startDate)
      };
    }
    return {
      freq: 'weekly',
      dtstart: stripTimezoneIndicator(startDate)
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

// Strip timezone indicator (Z suffix) from date strings
// Convert UTC date to local time and format as ISO string without timezone indicator
// This makes FullCalendar treat the time as the actual local time equivalent
function stripTimezoneIndicator(dateString) {
  if (!dateString) return dateString;
  
  // Handle ISO string format with Z suffix (UTC)
  if (typeof dateString === 'string' && dateString.endsWith('Z')) {
    const utcDate = new Date(dateString);
    // Get the local time equivalent by using the local timezone offset
    const localISOString = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000)).toISOString();
    // Remove the Z suffix to get local time format
    return localISOString.slice(0, -1);
  }
  
  // Handle other timezone indicators like +00:00
  if (typeof dateString === 'string' && /[+-]\d{2}:\d{2}$/.test(dateString)) {
    const utcDate = new Date(dateString);
    const localISOString = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000)).toISOString();
    return localISOString.slice(0, -1);
  }
  
  return dateString;
}

// Helper function to calculate event duration for recurring events
function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end - start;
  
  // Convert to hours and minutes
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
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
