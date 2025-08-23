#!/usr/bin/env node

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
  console.log('=== CHECKING VENUE ACTIVE STATUS ===\n');
  
  // Fetch first page of venues
  const response = await axios.get(`${BE_URL}/api/locations`, {
    params: { appId: APP_ID, page: 1, limit: 20 }
  });
  
  const venues = Array.isArray(response.data) ? response.data : 
                 response.data.locations || response.data.data || [];
  
  console.log(`Fetched ${venues.length} venues from API\n`);
  
  // Check isActive status
  const activeTrue = venues.filter(v => v.isActive === true);
  const activeFalse = venues.filter(v => v.isActive === false);
  const activeUndefined = venues.filter(v => v.isActive === undefined);
  const activeNull = venues.filter(v => v.isActive === null);
  
  console.log('isActive status breakdown:');
  console.log(`  - true: ${activeTrue.length} venues`);
  console.log(`  - false: ${activeFalse.length} venues`);
  console.log(`  - undefined: ${activeUndefined.length} venues`);
  console.log(`  - null: ${activeNull.length} venues`);
  
  console.log('\nSample venues:');
  venues.slice(0, 5).forEach(v => {
    console.log(`  ${v.name}:`);
    console.log(`    isActive: ${v.isActive} (type: ${typeof v.isActive})`);
    console.log(`    isApproved: ${v.isApproved}`);
  });
  
  // Check if we successfully updated them
  console.log('\nVenues we supposedly activated:');
  const venuesToCheck = [
    'EPIC. Q-BALLROOM',
    'Dance Union',
    'Ultimate Tango Studio'
  ];
  
  venuesToCheck.forEach(name => {
    const venue = venues.find(v => v.name === name);
    if (venue) {
      console.log(`  ${name}: isActive=${venue.isActive}`);
    }
  });
}

main().catch(console.error);