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
    
    // Debug logging removed to reduce console noise
    /*
    if (events.indexOf(event) < 3) {
      console.log(`Event ${event.title}:`, {
        id: event._id,
        venueID: event.venueID,
        venueId: event.venueId,
        locationID: event.locationID,
        resolvedVenueId: venueId,
        isActive: event.isActive
      });
    }
    */
    
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
          start: event.startDate,
          end: event.endDate,
        };
      }
      
      try {
        // Parse RRULE string to FullCalendar v6 object format
        const rruleObj = parseRRuleToObject(cleanedRRule, event.startDate, event.endDate);
        
        //console.log('Parsed RRULE for event:', event.title, rruleObj);
        
        // Return event with rrule object format for FullCalendar
        return {
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
      } catch (error) {
        console.error('Error parsing RRULE, falling back to single event:', error);
        // Fallback to single event with indicator
        return {
          ...baseEvent,
          start: event.startDate,
          end: event.endDate,
          title: event.title,
          extendedProps: {
            ...baseEvent.extendedProps,
            isRecurring: true,
            recurrenceRule: cleanedRRule,
          }
        };
      }
    } else {
      // For non-recurring events, use standard format
      return {
        ...baseEvent,
        start: event.startDate, // Map 'startDate' to 'start'
        end: event.endDate, // Map 'endDate' to 'end'
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
  const parts = rruleString.split(';');
  const rruleObj = {
    // Strip Z suffix to treat as local time instead of UTC
    // This prevents recurring events from shifting to previous day in local timezones
    dtstart: stripTimezoneIndicator(startDate) // Use event's startDate as dtstart without UTC indicator
  };
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    switch(key) {
      case 'FREQ':
        rruleObj.freq = value.toLowerCase();
        break;
      case 'BYDAY':
        // Convert to lowercase array for FullCalendar
        rruleObj.byweekday = value.split(',').map(day => day.toLowerCase());
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
// This makes FullCalendar treat the time as local instead of UTC
function stripTimezoneIndicator(dateString) {
  if (!dateString) return dateString;
  
  // Handle ISO string format with Z suffix
  if (typeof dateString === 'string' && dateString.endsWith('Z')) {
    return dateString.slice(0, -1);
  }
  
  // Handle other timezone indicators like +00:00
  if (typeof dateString === 'string' && /[+-]\d{2}:\d{2}$/.test(dateString)) {
    return dateString.replace(/[+-]\d{2}:\d{2}$/, '');
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
