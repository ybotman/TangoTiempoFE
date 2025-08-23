#!/usr/bin/env node

/**
 * Script to fix PROD venues:
 * 1. Fix Mango Studio's missing masteredCityId
 * 2. If approved -> make active
 * 3. If active -> make approved
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
  console.log('=== FIXING PROD VENUES - ACTIVE/APPROVED SYNC ===\n');
  
  try {
    // Fetch all venues
    let allVenues = [];
    let page = 1;
    let hasMore = true;
    
    console.log('Fetching all venues...');
    while (hasMore) {
      const response = await axios.get(`${PROD_URL}/api/venues`, {
        params: { appId: APP_ID, page: page, limit: 50 }
      });
      
      const venues = response.data.data || [];
      allVenues.push(...venues);
      
      const pagination = response.data.pagination;
      if (pagination && pagination.pages > page) {
        page++;
      } else {
        hasMore = false;
      }
      
      if (page > 10) break;
    }
    
    console.log(`Found ${allVenues.length} venues\n`);
    
    // 1. Fix Mango Studio Rental's missing masteredCityId
    console.log('=== FIXING MANGO STUDIO RENTAL ===');
    const mango = allVenues.find(v => v.name === 'Mango Studio Rental');
    if (mango && !mango.masteredCityId) {
      console.log('Updating Mango Studio Rental with Boston masteredCityId...');
      try {
        const updateData = {
          ...mango,
          masteredCityId: BOSTON_IDS.masteredCityId,
          masteredRegionId: mango.masteredRegionId || BOSTON_IDS.masteredRegionId,
          masteredDivisionId: mango.masteredDivisionId || BOSTON_IDS.masteredDivisionId,
          masteredCountryId: mango.masteredCountryId || BOSTON_IDS.masteredCountryId,
          appId: APP_ID
        };
        
        await axios.put(`${PROD_URL}/api/venues/${mango._id}`, updateData);
        console.log('✅ Mango Studio Rental updated with masteredCityId\n');
      } catch (error) {
        console.log(`❌ Failed to update Mango: ${error.message}\n`);
      }
    }
    
    // 2. Find venues that need active/approved sync
    const activeNotApproved = allVenues.filter(v => 
      v.isActive === true && v.isApproved !== true
    );
    
    const approvedNotActive = allVenues.filter(v => 
      v.isApproved === true && v.isActive !== true
    );
    
    // 3. Fix active but not approved (make them approved)
    if (activeNotApproved.length > 0) {
      console.log(`=== MAKING ${activeNotApproved.length} ACTIVE VENUES APPROVED ===`);
      for (const venue of activeNotApproved) {
        console.log(`Approving: ${venue.name}...`);
        try {
          const updateData = {
            ...venue,
            isApproved: true,
            appId: APP_ID
          };
          
          await axios.put(`${PROD_URL}/api/venues/${venue._id}`, updateData);
          console.log(`  ✅ Now approved`);
        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}`);
        }
      }
      console.log('');
    }
    
    // 4. Fix approved but not active (make them active)
    if (approvedNotActive.length > 0) {
      console.log(`=== MAKING ${approvedNotActive.length} APPROVED VENUES ACTIVE ===`);
      for (const venue of approvedNotActive) {
        console.log(`Activating: ${venue.name}...`);
        try {
          const updateData = {
            ...venue,
            isActive: true,
            appId: APP_ID
          };
          
          await axios.put(`${PROD_URL}/api/venues/${venue._id}`, updateData);
          console.log(`  ✅ Now active`);
        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}`);
        }
      }
      console.log('');
    }
    
    console.log('=== SUMMARY ===');
    console.log(`Fixed Mango Studio Rental: Added Boston masteredCityId`);
    console.log(`Made ${activeNotApproved.length} active venues approved`);
    console.log(`Made ${approvedNotActive.length} approved venues active`);
    console.log('\n✅ All approved venues are now active, all active venues are now approved!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);