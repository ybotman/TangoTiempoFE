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
      },
    };

    // Check if this is a recurring event with RRULE
    // TEMPORARILY DISABLED: RRULE parser has compatibility issues with FullCalendar v6
    // TODO: Investigate alternative RRULE implementations or wait for plugin update
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
      
      // For recurring events, add defensive handling
      console.warn('RRULE detected but currently disabled due to parser issues:', {
        title: event.title,
        rrule: cleanedRRule,
        startDate: event.startDate
      });
      
      // TEMPORARY: Return as single event with indicator until RRULE parser issue is resolved
      return {
        ...baseEvent,
        start: event.startDate,
        end: event.endDate,
        // Add visual indicator and tooltip
        title: event.title + ' 🔄',
        extendedProps: {
          ...baseEvent.extendedProps,
          isRecurring: true,
          recurrenceRule: cleanedRRule,
        }
      };
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
