#!/usr/bin/env node

/**
 * Script to update venues to isActive=true if they have associated events
 * This will help fix the issue where venues with events are incorrectly marked as inactive
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

async function fetchAllEvents() {
  try {
    console.log('Fetching all events from backend...');
    const response = await axios.get(`${BE_URL}/api/events`, {
      params: {
        appId: APP_ID,
        limit: 1000, // Get all events
      }
    });
    
    // Handle different response formats
    const events = Array.isArray(response.data) ? response.data : 
                   response.data.events ? response.data.events : 
                   response.data.data ? response.data.data : [];
    
    console.log(`Found ${events.length} events`);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error.message);
    return [];
  }
}

async function fetchAllVenues() {
  try {
    console.log('Fetching all venues from backend...');
    const allVenues = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(`${BE_URL}/api/locations`, {
        params: {
          appId: APP_ID,
          page: page,
          limit: 50
        }
      });
      
      // Handle different response formats
      const venues = Array.isArray(response.data) ? response.data : 
                     response.data.locations ? response.data.locations : 
                     response.data.data ? response.data.data : [];
      
      if (venues.length > 0) {
        allVenues.push(...venues);
        hasMore = venues.length === 50;
      } else {
        hasMore = false;
      }
      page++;
      
      // Safety check to prevent infinite loop
      if (page > 10) break;
    }
    
    console.log(`Found ${allVenues.length} venues total`);
    return allVenues;
  } catch (error) {
    console.error('Error fetching venues:', error.message);
    return [];
  }
}

async function updateVenueStatus(venueId, isActive) {
  try {
    const response = await axios.patch(`${BE_URL}/api/locations/${venueId}`, {
      isActive: isActive,
      appId: APP_ID
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating venue ${venueId}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('=== UPDATE VENUES WITH EVENTS TO ACTIVE ===\n');
  console.log(`Backend URL: ${BE_URL}`);
  console.log(`App ID: ${APP_ID}\n`);

  // Fetch all events and venues
  const [events, venues] = await Promise.all([
    fetchAllEvents(),
    fetchAllVenues()
  ]);

  if (events.length === 0 || venues.length === 0) {
    console.error('Could not fetch data. Exiting.');
    return;
  }

  // Extract venue IDs from events
  const venueIdsWithEvents = new Set();
  events.forEach(event => {
    // Check multiple possible venue ID fields
    const venueId = event.venueId || event.venueID || event.locationID || event.locationId;
    if (venueId) {
      venueIdsWithEvents.add(venueId);
    }
  });

  console.log(`\nFound ${venueIdsWithEvents.size} unique venues with events\n`);

  // Find venues that have events but are inactive
  const inactiveVenuesWithEvents = venues.filter(venue => 
    venueIdsWithEvents.has(venue._id) && !venue.isActive
  );

  const activeVenuesWithEvents = venues.filter(venue => 
    venueIdsWithEvents.has(venue._id) && venue.isActive
  );

  console.log(`Venues with events:`);
  console.log(`  - Already active: ${activeVenuesWithEvents.length}`);
  console.log(`  - Currently inactive: ${inactiveVenuesWithEvents.length}`);

  if (inactiveVenuesWithEvents.length === 0) {
    console.log('\n✅ All venues with events are already active!');
    return;
  }

  // List venues that need updating
  console.log('\n=== VENUES TO ACTIVATE ===');
  inactiveVenuesWithEvents.forEach(venue => {
    console.log(`  - ${venue.name} (${venue.city}, ${venue.state})`);
  });

  // Ask for confirmation
  console.log(`\nThis will update ${inactiveVenuesWithEvents.length} venues to isActive=true`);
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Update venues
  console.log('Updating venues...\n');
  let successCount = 0;
  let failCount = 0;

  for (const venue of inactiveVenuesWithEvents) {
    console.log(`Updating: ${venue.name}...`);
    const result = await updateVenueStatus(venue._id, true);
    if (result) {
      successCount++;
      console.log(`  ✅ Success`);
    } else {
      failCount++;
      console.log(`  ❌ Failed`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Successfully updated: ${successCount} venues`);
  console.log(`Failed: ${failCount} venues`);
  
  // Also report on venues without events
  const venuesWithoutEvents = venues.filter(venue => 
    !venueIdsWithEvents.has(venue._id)
  );
  console.log(`\nVenues without any events: ${venuesWithoutEvents.length}`);
  
  // Show some examples of venues without events
  if (venuesWithoutEvents.length > 0) {
    console.log('Examples of venues without events:');
    venuesWithoutEvents.slice(0, 5).forEach(venue => {
      console.log(`  - ${venue.name} (${venue.city}, ${venue.state}) - isActive: ${venue.isActive}`);
    });
  }
}

// Run the script
main().catch(console.error);