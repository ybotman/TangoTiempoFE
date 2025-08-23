#!/usr/bin/env node

/**
 * Script to activate all venues that have associated events
 */

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
  console.log('=== ACTIVATING VENUES WITH EVENTS ===\n');
  
  // Fetch events
  console.log('Fetching events...');
  const eventsResponse = await axios.get(`${BE_URL}/api/events`, {
    params: { appId: APP_ID, limit: 1000 }
  });
  
  const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : 
                 eventsResponse.data.events || eventsResponse.data.data || [];
  
  console.log(`Found ${events.length} events\n`);
  
  // Fetch ALL venues
  console.log('Fetching ALL venues...');
  const allVenues = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const venuesResponse = await axios.get(`${BE_URL}/api/locations`, {
      params: { appId: APP_ID, page: page, limit: 50 }
    });
    
    const venues = Array.isArray(venuesResponse.data) ? venuesResponse.data : 
                   venuesResponse.data.locations || venuesResponse.data.data || [];
    
    if (venues.length > 0) {
      allVenues.push(...venues);
      hasMore = venues.length === 50;
    } else {
      hasMore = false;
    }
    page++;
    if (page > 10) break;
  }
  
  console.log(`Found ${allVenues.length} venues\n`);
  
  // Find venues used by events
  const venueIdsWithEvents = new Set();
  
  events.forEach(event => {
    let venueId = event.venueId || event.venueID || event.locationID || event.locationId;
    
    // If venue is stored as object, extract _id
    if (venueId && typeof venueId === 'object') {
      venueId = venueId._id || venueId.id;
    }
    
    if (venueId) {
      venueIdsWithEvents.add(venueId);
    }
  });
  
  console.log(`Found ${venueIdsWithEvents.size} unique venues with events\n`);
  
  // Find venues that need activation
  const venuesToActivate = allVenues.filter(venue => 
    venueIdsWithEvents.has(venue._id) && venue.isActive !== true
  );
  
  if (venuesToActivate.length === 0) {
    console.log('✅ All venues with events are already active!');
    return;
  }
  
  console.log(`Found ${venuesToActivate.length} venues with events that need activation:\n`);
  venuesToActivate.forEach(venue => {
    console.log(`  - ${venue.name} (${venue.city}, ${venue.state})`);
  });
  
  console.log('\nActivating venues...\n');
  
  // Update each venue
  let successCount = 0;
  let failCount = 0;
  
  for (const venue of venuesToActivate) {
    try {
      console.log(`Activating: ${venue.name}...`);
      
      const response = await axios.put(`${BE_URL}/api/locations/${venue._id}`, {
        ...venue,
        isActive: true,
        appId: APP_ID
      });
      
      if (response.status === 200) {
        successCount++;
        console.log(`  ✅ Success`);
      } else {
        failCount++;
        console.log(`  ❌ Failed with status ${response.status}`);
      }
    } catch (error) {
      failCount++;
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Successfully activated: ${successCount} venues`);
  console.log(`Failed: ${failCount} venues`);
  
  if (successCount > 0) {
    console.log('\n✅ Venues have been activated! Event creation should now work for these venues.');
  }
}

main().catch(console.error);