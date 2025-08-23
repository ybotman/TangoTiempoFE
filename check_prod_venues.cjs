#!/usr/bin/env node

/**
 * Script to check PROD venues for missing masteredCityId
 */

const axios = require('axios');

const PROD_URL = 'https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net';
const APP_ID = '1'; // Assuming same app ID

async function main() {
  console.log('=== CHECKING PROD VENUES FOR MISSING MASTERED CITY IDS ===\n');
  console.log(`PROD URL: ${PROD_URL}\n`);
  
  try {
    // Fetch all venues from PROD (with pagination)
    let allVenues = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(`${PROD_URL}/api/venues`, {
        params: { appId: APP_ID, page: page, limit: 50 }
      });
      
      const venues = response.data.data || [];
      allVenues.push(...venues);
      
      // Check if there are more pages
      const pagination = response.data.pagination;
      if (pagination && pagination.pages > page) {
        page++;
      } else {
        hasMore = false;
      }
      
      // Safety check
      if (page > 20) break;
    }
    
    console.log(`\nFound ${allVenues.length} total venues in PROD\n`);
    
    // Check for missing fields
    const missingCityId = allVenues.filter(v => !v.masteredCityId);
    const missingRegionId = allVenues.filter(v => !v.masteredRegionId);
    const missingShortName = allVenues.filter(v => !v.shortName);
    const inactiveVenues = allVenues.filter(v => v.isActive !== true);
    const unapprovedVenues = allVenues.filter(v => v.isApproved !== true);
    
    console.log('=== FIELD ANALYSIS ===');
    console.log(`Missing masteredCityId: ${missingCityId.length} venues`);
    console.log(`Missing masteredRegionId: ${missingRegionId.length} venues`);
    console.log(`Missing shortName: ${missingShortName.length} venues`);
    console.log(`Inactive venues: ${inactiveVenues.length} venues`);
    console.log(`Unapproved venues: ${unapprovedVenues.length} venues`);
    
    if (missingCityId.length > 0) {
      console.log('\n=== VENUES MISSING MASTERED CITY ID ===');
      missingCityId.forEach(v => {
        console.log(`  - ${v.name} (${v.city}, ${v.state})`);
        console.log(`    ID: ${v._id}`);
        console.log(`    Active: ${v.isActive}, Approved: ${v.isApproved}`);
      });
    } else {
      console.log('\n✅ All venues have masteredCityId!');
    }
    
    if (missingShortName.length > 0) {
      console.log('\n=== VENUES MISSING SHORT NAME ===');
      missingShortName.slice(0, 10).forEach(v => {
        console.log(`  - ${v.name} (${v.city}, ${v.state})`);
      });
      if (missingShortName.length > 10) {
        console.log(`  ... and ${missingShortName.length - 10} more`);
      }
    }
    
    // Check active venues that might fail event creation
    const problematicActiveVenues = allVenues.filter(v => 
      v.isActive === true && (!v.masteredCityId || !v.shortName)
    );
    
    if (problematicActiveVenues.length > 0) {
      console.log('\n⚠️  ACTIVE VENUES THAT WILL FAIL EVENT CREATION:');
      problematicActiveVenues.forEach(v => {
        console.log(`  - ${v.name} (${v.city}, ${v.state})`);
        console.log(`    Missing: ${!v.masteredCityId ? 'masteredCityId ' : ''}${!v.shortName ? 'shortName' : ''}`);
      });
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total venues in PROD: ${allVenues.length}`);
    console.log(`Venues ready for events: ${allVenues.filter(v => v.isActive && v.masteredCityId && v.shortName).length}`);
    console.log(`Problematic active venues: ${problematicActiveVenues.length}`);
    
  } catch (error) {
    console.error('Error fetching PROD venues:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

main().catch(console.error);