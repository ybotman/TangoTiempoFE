#!/usr/bin/env node

/**
 * Script to fix ONLY Mango Studio Rental's missing masteredCityId in PROD
 */

const axios = require('axios');

const PROD_URL = 'https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net';
const APP_ID = '1';

// Boston's mastered IDs
const BOSTON_IDS = {
  masteredCityId: '6751f58a5db435dd8005e46a',
  masteredRegionId: '6751f58a5db435dd8005e45b',
  masteredDivisionId: '6751f58a5db435dd8005e460',
  masteredCountryId: '6751f57e2e74d97609e7dca0'
};

async function main() {
  console.log('=== FIXING MANGO STUDIO RENTAL IN PROD ===\n');
  
  try {
    // Fetch venues to find Mango Studio Rental
    console.log('Finding Mango Studio Rental...');
    const response = await axios.get(`${PROD_URL}/api/venues`, {
      params: { appId: APP_ID, page: 1, limit: 100 }
    });
    
    const venues = response.data.data || [];
    const mango = venues.find(v => v.name === 'Mango Studio Rental');
    
    if (!mango) {
      console.log('❌ Mango Studio Rental not found');
      return;
    }
    
    console.log('Found Mango Studio Rental:');
    console.log(`  ID: ${mango._id}`);
    console.log(`  Current masteredCityId: ${mango.masteredCityId || 'MISSING'}`);
    console.log(`  Location: ${mango.city}, ${mango.state}`);
    console.log(`  Active: ${mango.isActive}`);
    console.log(`  Approved: ${mango.isApproved}`);
    
    if (mango.masteredCityId) {
      console.log('\n✅ Already has masteredCityId - no update needed');
      return;
    }
    
    console.log('\nUpdating with Boston masteredCityId...');
    
    const updateData = {
      ...mango,
      masteredCityId: BOSTON_IDS.masteredCityId,
      masteredRegionId: mango.masteredRegionId || BOSTON_IDS.masteredRegionId,
      masteredDivisionId: mango.masteredDivisionId || BOSTON_IDS.masteredDivisionId,
      masteredCountryId: mango.masteredCountryId || BOSTON_IDS.masteredCountryId,
      appId: APP_ID
    };
    
    const updateResponse = await axios.put(
      `${PROD_URL}/api/venues/${mango._id}`,
      updateData
    );
    
    if (updateResponse.status === 200) {
      console.log('✅ SUCCESS - Mango Studio Rental now has Boston masteredCityId');
      console.log('\nEvent creation should now work for Mango Studio Rental in PROD!');
    } else {
      console.log(`❌ Failed with status ${updateResponse.status}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main().catch(console.error);