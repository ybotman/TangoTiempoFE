// Debug script to analyze CORAZON event on the 24th
// This will help understand why eventVenueMasteredCityID is null for single-city RAs

console.log(`
==================================================
DEBUGGING CORAZON EVENT - TIEMPO-187
==================================================

To use this script:
1. Open the calendar in your browser
2. Open DevTools Console
3. After events load, paste and run this script
4. Look for events by CORAZON on the 24th

==================================================
`);

// Function to analyze events
function analyzeCorazonEvents() {
  // Get all events from FullCalendar
  const calendar = document.querySelector('.fc')._fcApi;
  if (!calendar) {
    console.error('FullCalendar not found!');
    return;
  }

  const allEvents = calendar.getEvents();
  console.log(`Total events loaded: ${allEvents.length}`);

  // Filter for CORAZON events
  const corazonEvents = allEvents.filter(event => 
    event.extendedProps?.ownerOrganizerName?.toLowerCase().includes('corazon') ||
    event.title?.toLowerCase().includes('corazon')
  );

  console.log(`\\nFound ${corazonEvents.length} CORAZON events`);

  // Look specifically for events on the 24th
  const events24th = corazonEvents.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.getDate() === 24;
  });

  console.log(`\\nCORAZON events on the 24th: ${events24th.length}`);

  // Analyze each event
  events24th.forEach((event, index) => {
    console.log(`\\n--- CORAZON Event ${index + 1} on the 24th ---`);
    console.log('Title:', event.title);
    console.log('Date:', event.start);
    console.log('Event ID:', event.extendedProps._id);
    
    // Check venueMasteredCityID
    console.log('\\nCity ID Analysis:');
    console.log('venueMasteredCityID:', event.extendedProps.venueMasteredCityID);
    console.log('masteredCityName:', event.extendedProps.masteredCityName);
    
    // Check venue info
    console.log('\\nVenue Info:');
    console.log('venueId:', event.extendedProps.venueId);
    console.log('venueName:', event.extendedProps.venueName);
    console.log('locationID:', event.extendedProps.locationID);
    console.log('locationName:', event.extendedProps.locationName);
    
    // Check organizer info
    console.log('\\nOrganizer Info:');
    console.log('ownerOrganizerID:', event.extendedProps.ownerOrganizerID);
    console.log('ownerOrganizerName:', event.extendedProps.ownerOrganizerName);
    
    // Check all extended props
    console.log('\\nAll Extended Props Keys:', Object.keys(event.extendedProps));
  });

  // Also check the raw API response if available
  console.log(`\\n\\nTo check raw API response:`);
  console.log(`1. Look in Network tab for /api/events call`);
  console.log(`2. Find CORAZON events in the response`);
  console.log(`3. Check the masteredCityId field structure`);
}

// Run the analysis
analyzeCorazonEvents();

// Additional helper to check a specific event by ID
window.checkEventById = function(eventId) {
  const calendar = document.querySelector('.fc')._fcApi;
  const event = calendar.getEventById(eventId);
  
  if (event) {
    console.log('\\n=== Event Details ===');
    console.log('Full event object:', event);
    console.log('Extended props:', event.extendedProps);
    console.log('venueMasteredCityID:', event.extendedProps.venueMasteredCityID);
  } else {
    console.log('Event not found with ID:', eventId);
  }
};

console.log('\\nHelper function available: checkEventById("event_id_here")');