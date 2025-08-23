#!/usr/bin/env node

/**
 * Script to find venues with mismatched active/approved status
 */

const axios = require('axios');

const PROD_URL = 'https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net';
const APP_ID = '1';

async function main() {
  console.log('=== ANALYZING ACTIVE vs APPROVED STATUS IN PROD ===\n');
  
  try {
    // Fetch all venues
    let allVenues = [];
    let page = 1;
    let hasMore = true;
    
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
    
    console.log(`Total venues analyzed: ${allVenues.length}\n`);
    
    // Find mismatches
    const activeNotApproved = allVenues.filter(v => 
      v.isActive === true && v.isApproved !== true
    );
    
    const approvedNotActive = allVenues.filter(v => 
      v.isApproved === true && v.isActive !== true
    );
    
    const bothTrue = allVenues.filter(v => 
      v.isActive === true && v.isApproved === true
    );
    
    const bothFalseOrMissing = allVenues.filter(v => 
      v.isActive !== true && v.isApproved !== true
    );
    
    console.log('=== STATUS COMBINATIONS ===');
    console.log(`Active AND Approved: ${bothTrue.length} venues`);
    console.log(`Active but NOT Approved: ${activeNotApproved.length} venues`);
    console.log(`Approved but NOT Active: ${approvedNotActive.length} venues`);
    console.log(`Neither Active nor Approved: ${bothFalseOrMissing.length} venues`);
    
    if (activeNotApproved.length > 0) {
      console.log('\n❌ ACTIVE but NOT APPROVED (Problematic):');
      activeNotApproved.forEach(v => {
        console.log(`  - ${v.name} (${v.city}, ${v.state})`);
        console.log(`    isActive: ${v.isActive}, isApproved: ${v.isApproved}`);
        console.log(`    Has shortName: ${!!v.shortName}`);
      });
    }
    
    if (approvedNotActive.length > 0) {
      console.log('\n⚠️  APPROVED but NOT ACTIVE (Disabled venues):');
      approvedNotActive.forEach(v => {
        console.log(`  - ${v.name} (${v.city}, ${v.state})`);
        console.log(`    isActive: ${v.isActive}, isApproved: ${v.isApproved}`);
      });
    }
    
    console.log('\n=== SUMMARY ===');
    if (activeNotApproved.length > 0) {
      console.log(`⚠️  ${activeNotApproved.length} venues are ACTIVE but NOT APPROVED - these may cause issues!`);
    } else {
      console.log('✅ No venues are active without approval');
    }
    
    if (approvedNotActive.length > 0) {
      console.log(`📝 ${approvedNotActive.length} venues are APPROVED but INACTIVE - these are disabled`);
    } else {
      console.log('✅ All approved venues are active');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);