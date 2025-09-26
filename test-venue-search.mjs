// Test script for venue search functionality
// Run with: node test-venue-search.mjs

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Boston coordinates (approximate downtown)
const BOSTON_LNG = -71.0589;
const BOSTON_LAT = 42.3601;

async function searchVenue(query, proximity = null) {
  console.log(`\n🔍 Searching for: "${query}"`);
  if (proximity) {
    console.log(`   Near: ${proximity.lat}, ${proximity.lng}`);
  }

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
  url += `?access_token=${MAPBOX_TOKEN}`;
  url += `&limit=10`;
  url += `&country=us`;

  if (proximity) {
    url += `&proximity=${proximity.lng},${proximity.lat}`;
  }

  try {
    const response = await axios.get(url);

    if (response.data.features && response.data.features.length > 0) {
      console.log(`   Found ${response.data.features.length} results:\n`);

      response.data.features.forEach((feature, index) => {
        const name = feature.properties?.name || feature.text || 'Unknown';
        const address = feature.properties?.address || '';
        const place_name = feature.place_name || '';
        const type = feature.place_type?.[0] || 'unknown';
        const category = feature.properties?.category || '';

        console.log(`   ${index + 1}. ${name}`);
        if (address) console.log(`      Address: ${address}`);
        console.log(`      Full: ${place_name}`);
        console.log(`      Type: ${type}${category ? `, Category: ${category}` : ''}`);
        console.log(`      Relevance: ${(feature.relevance * 100).toFixed(0)}%`);
        console.log('');
      });
    } else {
      console.log('   ❌ No results found');
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('=' .repeat(80));
  console.log('VENUE SEARCH TESTING - Boston Area Dance Studios');
  console.log('=' .repeat(80));

  const bostonProximity = { lat: BOSTON_LAT, lng: BOSTON_LNG };

  // Test 1: Ultimate Tango (Medford)
  await searchVenue('Ultimate Tango Medford', bostonProximity);

  // Test 2: Ultimate Tango without city
  await searchVenue('Ultimate Tango', bostonProximity);

  // Test 3: Arthur Murray Dance Studios
  await searchVenue('Arthur Murray Dance Studio Boston', bostonProximity);

  // Test 4: Arthur Murray without city
  await searchVenue('Arthur Murray Dance', bostonProximity);

  // Test 5: Generic dance studio search
  await searchVenue('dance studio', bostonProximity);

  // Test 6: Landmarks we discussed
  console.log('\n' + '=' .repeat(80));
  console.log('LANDMARK SEARCH TESTING');
  console.log('=' .repeat(80));

  await searchVenue('Boston City Hall', bostonProximity);
  await searchVenue('Prudential Tower Boston', bostonProximity);
  await searchVenue('Faneuil Hall', bostonProximity);
}

// Run the tests
runTests().then(() => {
  console.log('\n✅ Testing complete');
}).catch(err => {
  console.error('Testing failed:', err);
});