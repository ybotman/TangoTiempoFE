// Add this to CreateEventDetailsBasic.js temporarily to debug:

console.log('=== VENUE DEBUG ===');
console.log('selectedLocation:', selectedLocation);
console.log('Venues count:', venues?.length);
console.log('First venue:', venues?.[0]?.venueName);

// Check what params are being sent
if (window.location.pathname.includes('calendar')) {
  // Monitor network requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[0]?.includes('/api/venues')) {
      console.log('VENUE API CALL:', args[0]);
    }
    return originalFetch.apply(this, args);
  };
}
