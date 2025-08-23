#!/usr/bin/env node

/**
 * Quick fix for PROD venues - smaller batches
 */

const axios = require('axios');

const PROD_URL = 'https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net';
const APP_ID = '1';

const BOSTON_IDS = {
  masteredCityId: '6751f58a5db435dd8005e46a',
  masteredRegionId: '6751f58a5db435dd8005e45b',
  masteredDivisionId: '6751f58a5db435dd8005e460',
  masteredCountryId: '6751f57e2e74d97609e7dca0'
};

async function updateVenue(venue, updates) {
  try {
    const updateData = {
      ...venue,
      ...updates,
      appId: APP_ID
    };
    
    const response = await axios.put(
      `${PROD_URL}/api/venues/${venue._id}`,
      updateData,
      { timeout: 10000 } // 10 second timeout
    );
    
    return response.status === 200;
  } catch (error) {
    console.log(`  ❌ ${venue.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== QUICK FIX FOR PROD VENUES ===\n');
  
  try {
    // Fetch venues
    console.log('Fetching venues...');
    const response = await axios.get(`${PROD_URL}/api/venues`, {
      params: { appId: APP_ID, page: 1, limit: 100 }
    });
    
    const venues = response.data.data || [];
    console.log(`Found ${venues.length} venues\n`);
    
    // 1. Fix Mango first
    const mango = venues.find(v => v.name === 'Mango Studio Rental');
    if (mango && !mango.masteredCityId) {
      console.log('Fixing Mango Studio Rental...');
      const success = await updateVenue(mango, {
        masteredCityId: BOSTON_IDS.masteredCityId,
        masteredRegionId: BOSTON_IDS.masteredRegionId,
        masteredDivisionId: BOSTON_IDS.masteredDivisionId,
        masteredCountryId: BOSTON_IDS.masteredCountryId
      });
      console.log(success ? '✅ Mango fixed\n' : '❌ Mango failed\n');
    }
    
    // 2. Fix active but not approved (4 venues)
    console.log('Fixing ACTIVE but NOT APPROVED venues:');
    const activeNotApproved = [
      'Allston Abbey',
      'Cambridge Central Rock Gym',
      'FARKAS HALL',
      'St. James Episcopal Church'
    ];
    
    for (const name of activeNotApproved) {
      const venue = venues.find(v => v.name.includes(name));
      if (venue) {
        console.log(`  Approving ${venue.name}...`);
        const success = await updateVenue(venue, { isApproved: true });
        console.log(success ? '    ✅' : '    ❌');
      }
    }
    
    console.log('\nFixing APPROVED but NOT ACTIVE venues:');
    // Just do first 5 to avoid timeout
    const approvedNotActive = venues.filter(v => 
      v.isApproved === true && v.isActive !== true
    ).slice(0, 5);
    
    for (const venue of approvedNotActive) {
      console.log(`  Activating ${venue.name}...`);
      const success = await updateVenue(venue, { isActive: true });
      console.log(success ? '    ✅' : '    ❌');
    }
    
    console.log('\n✅ Quick fixes applied!');
    console.log('Run again to process more approved venues that need activation.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);