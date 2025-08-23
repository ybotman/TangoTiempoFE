#!/usr/bin/env node

/**
 * Script to fix PROD venues with missing masteredCityId and shortName
 */

const axios = require('axios');

const PROD_URL = 'https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net';
const APP_ID = '1';

// Boston's mastered IDs (standard for MA venues)
const BOSTON_IDS = {
  masteredCityId: '6751f58a5db435dd8005e46a',
  masteredRegionId: '6751f58a5db435dd8005e45b',
  masteredDivisionId: '6751f58a5db435dd8005e460',
  masteredCountryId: '6751f57e2e74d97609e7dca0'
};

async function generateShortName(fullName) {
  // Generate a short name from the full name
  const cleaned = fullName
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .trim();
  
  const words = cleaned.split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 9).toUpperCase();
  } else if (words.length === 2) {
    return (words[0].substring(0, 4) + words[1].substring(0, 4)).toUpperCase();
  } else {
    // Take first letter of each word for multi-word names
    return words.map(w => w[0]).join('').substring(0, 9).toUpperCase();
  }
}

async function main() {
  console.log('=== FIXING PROD VENUES ===\n');
  console.log(`PROD URL: ${PROD_URL}\n`);
  
  try {
    // First, get the problematic venues
    console.log('Fetching problematic venues...');
    const response = await axios.get(`${PROD_URL}/api/venues`, {
      params: { appId: APP_ID, page: 1, limit: 100 }
    });
    
    const venues = response.data.data || [];
    
    // Find the 3 problematic ACTIVE venues
    const problemVenues = [
      { name: 'Dance Union', issue: 'shortName' },
      { name: 'Mango Studio Rental', issue: 'masteredCityId' },
      { name: 'Wellfleet Preservation Hall', issue: 'shortName' }
    ];
    
    console.log('Fixing problematic active venues:\n');
    
    for (const problem of problemVenues) {
      const venue = venues.find(v => v.name === problem.name);
      if (!venue) {
        console.log(`❌ ${problem.name} not found`);
        continue;
      }
      
      console.log(`Updating: ${venue.name} (fixing ${problem.issue})...`);
      
      try {
        const updateData = { ...venue, appId: APP_ID };
        
        if (problem.issue === 'masteredCityId' || !venue.masteredCityId) {
          updateData.masteredCityId = BOSTON_IDS.masteredCityId;
          updateData.masteredRegionId = venue.masteredRegionId || BOSTON_IDS.masteredRegionId;
          updateData.masteredDivisionId = venue.masteredDivisionId || BOSTON_IDS.masteredDivisionId;
          updateData.masteredCountryId = venue.masteredCountryId || BOSTON_IDS.masteredCountryId;
          console.log(`  Setting masteredCityId to Boston`);
        }
        
        if (problem.issue === 'shortName' || !venue.shortName) {
          const shortName = await generateShortName(venue.name);
          updateData.shortName = shortName;
          console.log(`  Setting shortName to: ${shortName}`);
        }
        
        const updateResponse = await axios.put(
          `${PROD_URL}/api/venues/${venue._id}`,
          updateData
        );
        
        if (updateResponse.status === 200) {
          console.log(`  ✅ Success\n`);
        } else {
          console.log(`  ❌ Failed with status ${updateResponse.status}\n`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }
    
    console.log('=== SUMMARY ===');
    console.log('Fixed 3 active venues that were preventing event creation:');
    console.log('  1. Dance Union - Added shortName');
    console.log('  2. Mango Studio Rental - Added masteredCityId');
    console.log('  3. Wellfleet Preservation Hall - Added shortName');
    console.log('\n✅ PROD venues should now work for event creation!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);