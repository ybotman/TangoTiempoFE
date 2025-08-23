#!/usr/bin/env node

/**
 * Script to fix venues with missing masteredCityId
 * Sets them to Boston since they're in the MA area
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

// Boston's mastered IDs (from working venues)
const BOSTON_IDS = {
  masteredCityId: '6751f58a5db435dd8005e46a',
  masteredRegionId: '6751f58a5db435dd8005e45b',
  masteredDivisionId: '6751f58a5db435dd8005e460',
  masteredCountryId: '6751f57e2e74d97609e7dca0'
};

async function main() {
  console.log('=== FIXING VENUES WITH MISSING MASTERED CITY IDS ===\n');
  
  // Fetch all venues
  console.log('Fetching venues...');
  const response = await axios.get(`${BE_URL}/api/venues`, {
    params: { appId: APP_ID, page: 1, limit: 100 }
  });
  
  const venues = response.data.data || [];
  console.log(`Found ${venues.length} venues\n`);
  
  // Find venues with missing masteredCityId
  const venuesMissingCityId = venues.filter(v => !v.masteredCityId);
  
  console.log(`Found ${venuesMissingCityId.length} venues with missing masteredCityId:\n`);
  venuesMissingCityId.forEach(v => {
    console.log(`  - ${v.name} (${v.city}, ${v.state})`);
  });
  
  if (venuesMissingCityId.length === 0) {
    console.log('✅ All venues have masteredCityId!');
    return;
  }
  
  console.log('\nUpdating venues with Boston mastered IDs...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const venue of venuesMissingCityId) {
    try {
      console.log(`Updating: ${venue.name}...`);
      
      // Update with all mastered IDs
      const updateData = {
        ...venue,
        masteredCityId: BOSTON_IDS.masteredCityId,
        masteredRegionId: venue.masteredRegionId || BOSTON_IDS.masteredRegionId,
        masteredDivisionId: venue.masteredDivisionId || BOSTON_IDS.masteredDivisionId,
        masteredCountryId: venue.masteredCountryId || BOSTON_IDS.masteredCountryId,
        appId: APP_ID
      };
      
      const response = await axios.put(`${BE_URL}/api/venues/${venue._id}`, updateData);
      
      if (response.status === 200) {
        successCount++;
        console.log(`  ✅ Success - Added Boston masteredCityId`);
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
  console.log(`Successfully updated: ${successCount} venues`);
  console.log(`Failed: ${failCount} venues`);
  
  if (successCount > 0) {
    console.log('\n✅ Venues updated with Boston masteredCityId!');
    console.log('Event creation should now work for these venues.');
  }
}

main().catch(console.error);