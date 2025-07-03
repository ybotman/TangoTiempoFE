export function transformEvents(events) {
  // Only log if no events received (potential error condition)
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.warn("No events to transform or events is not an array");
    return [];
  }

  return events.map((event) => {
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
    if (event.recurrenceRule && event.isRepeating) {
      // For recurring events, use RRULE format
      return {
        ...baseEvent,
        // FullCalendar RRULE plugin expects these specific fields
        rrule: event.recurrenceRule,
        // Use start time from the event for the recurrence pattern
        duration: calculateDuration(event.startDate, event.endDate),
        // Don't include start/end for RRULE events
      };
    } else {
      // For non-recurring events, use standard format
      return {
        ...baseEvent,
        start: event.startDate, // Map 'startDate' to 'start'
        end: event.endDate, // Map 'endDate' to 'end'
      };
    }
  });
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
