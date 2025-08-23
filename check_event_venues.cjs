#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

// Read .env.local file manually
let BE_URL = 'http://localhost:3010';
let APP_ID = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_BE_URL=')) {
      BE_URL = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_APPLICATION_ID=')) {
      APP_ID = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.log('Could not read .env.local, using defaults');
}

async function main() {
  // Fetch a few events to examine their venue structure
  const response = await axios.get(`${BE_URL}/api/events`, {
    params: { appId: APP_ID, limit: 5 }
  });
  
  const events = Array.isArray(response.data) ? response.data : 
                 response.data.events || response.data.data || [];
  
  console.log('=== EXAMINING EVENT VENUE STRUCTURE ===\n');
  
  events.slice(0, 3).forEach((event, idx) => {
    console.log(`Event ${idx + 1}: ${event.name || event.title || 'Unnamed'}`);
    console.log('  Venue fields:');
    console.log('    venueId:', typeof event.venueId, JSON.stringify(event.venueId));
    console.log('    venueID:', typeof event.venueID, JSON.stringify(event.venueID));
    console.log('    locationID:', typeof event.locationID, JSON.stringify(event.locationID));
    console.log('    locationId:', typeof event.locationId, JSON.stringify(event.locationId));
    console.log('    venueName:', event.venueName);
    console.log('    locationName:', event.locationName);
    console.log('');
  });
  
  // Now check if venues are stored as objects with _id
  const firstEvent = events[0];
  if (firstEvent) {
    const venueData = firstEvent.venueId || firstEvent.venueID || firstEvent.locationID;
    if (venueData && typeof venueData === 'object') {
      console.log('Venue is stored as object. Extracting _id...');
      const venueId = venueData._id || venueData.id;
      console.log('Extracted venue ID:', venueId);
      
      // Try to fetch this venue
      if (venueId) {
        try {
          const venueResponse = await axios.get(`${BE_URL}/api/locations/${venueId}`, {
            params: { appId: APP_ID }
          });
          console.log('\nVenue found in system:');
          console.log('  Name:', venueResponse.data.name);
          console.log('  isActive:', venueResponse.data.isActive);
        } catch (error) {
          console.log('\nVenue not found in system:', error.message);
        }
      }
    }
  }
}

main().catch(console.error);