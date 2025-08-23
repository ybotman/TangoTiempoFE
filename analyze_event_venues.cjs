#!/usr/bin/env node

/**
 * Script to analyze which venues are used by events and their status
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
  console.log('=== ANALYZING EVENT VENUES ===\n');
  
  // Fetch events
  console.log('Fetching events...');
  const eventsResponse = await axios.get(`${BE_URL}/api/events`, {
    params: { appId: APP_ID, limit: 1000 }
  });
  
  const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : 
                 eventsResponse.data.events || eventsResponse.data.data || [];
  
  console.log(`Found ${events.length} events\n`);
  
  // Fetch ALL venues with pagination
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
      console.log(`  Page ${page}: ${venues.length} venues`);
      hasMore = venues.length === 50;
    } else {
      hasMore = false;
    }
    page++;
    
    if (page > 10) break; // Safety
  }
  
  const venues = allVenues;
  
  console.log(`Found ${venues.length} venues in system\n`);
  
  // Create venue lookup map
  const venueMap = {};
  venues.forEach(v => {
    venueMap[v._id] = v;
  });
  
  // Analyze events
  const venueUsage = {};
  const missingVenueIds = new Set();
  const eventsWithoutVenue = [];
  
  events.forEach(event => {
    // Handle both object and string venue IDs
    let venueId = event.venueId || event.venueID || event.locationID || event.locationId;
    
    // If venue is stored as an object (populated), extract the _id
    if (venueId && typeof venueId === 'object') {
      venueId = venueId._id || venueId.id;
    }
    
    if (!venueId) {
      eventsWithoutVenue.push(event);
      return;
    }
    
    if (venueMap[venueId]) {
      // Venue exists in our system
      if (!venueUsage[venueId]) {
        venueUsage[venueId] = {
          venue: venueMap[venueId],
          eventCount: 0,
          eventNames: []
        };
      }
      venueUsage[venueId].eventCount++;
      if (venueUsage[venueId].eventNames.length < 3) {
        venueUsage[venueId].eventNames.push(event.name || event.title || 'Unnamed Event');
      }
    } else {
      // Venue doesn't exist in our system
      missingVenueIds.add(venueId);
    }
  });
  
  // Report findings
  console.log('=== VENUE USAGE ANALYSIS ===\n');
  
  // Active venues with events
  const activeVenuesWithEvents = Object.values(venueUsage).filter(v => v.venue.isActive);
  console.log(`Active venues with events: ${activeVenuesWithEvents.length}`);
  activeVenuesWithEvents.slice(0, 5).forEach(item => {
    console.log(`  - ${item.venue.name} (${item.eventCount} events)`);
    console.log(`    Location: ${item.venue.city}, ${item.venue.state}`);
    console.log(`    Example events: ${item.eventNames.join(', ')}`);
  });
  
  console.log('');
  
  // Inactive venues with events
  const inactiveVenuesWithEvents = Object.values(venueUsage).filter(v => !v.venue.isActive);
  console.log(`Inactive venues with events: ${inactiveVenuesWithEvents.length}`);
  inactiveVenuesWithEvents.forEach(item => {
    console.log(`  - ${item.venue.name} (${item.eventCount} events) ⚠️`);
    console.log(`    Location: ${item.venue.city}, ${item.venue.state}`);
    console.log(`    Example events: ${item.eventNames.join(', ')}`);
  });
  
  console.log('');
  
  // Venues without any events
  const venuesWithoutEvents = venues.filter(v => !venueUsage[v._id]);
  console.log(`Venues without any events: ${venuesWithoutEvents.length}`);
  venuesWithoutEvents.slice(0, 5).forEach(v => {
    console.log(`  - ${v.name} (${v.city}, ${v.state}) - isActive: ${v.isActive}`);
  });
  
  console.log('');
  
  // Missing venues
  console.log(`Events referencing non-existent venues: ${missingVenueIds.size} unique venue IDs`);
  if (missingVenueIds.size > 0) {
    console.log('  Sample missing venue IDs:');
    Array.from(missingVenueIds).slice(0, 5).forEach(id => {
      console.log(`    - ${id}`);
    });
  }
  
  console.log('');
  console.log(`Events without any venue: ${eventsWithoutVenue.length}`);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total events: ${events.length}`);
  console.log(`Total venues in system: ${venues.length}`);
  console.log(`  - Active: ${venues.filter(v => v.isActive).length}`);
  console.log(`  - Inactive: ${venues.filter(v => !v.isActive).length}`);
  console.log(`Venues actually used by events: ${Object.keys(venueUsage).length}`);
  console.log(`Events with missing venues: ${missingVenueIds.size > 0 ? missingVenueIds.size + ' venue IDs not found' : 'None'}`);
  
  // Recommendation
  if (inactiveVenuesWithEvents.length > 0) {
    console.log('\n⚠️  RECOMMENDATION:');
    console.log(`Activate ${inactiveVenuesWithEvents.length} inactive venues that have events`);
    console.log('Run: node update_venues_with_events.cjs --force to update them');
  }
}

main().catch(console.error);