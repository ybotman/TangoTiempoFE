// Test script for Search Box API functionality
// Run with: node test-searchbox.mjs

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Boston coordinates (approximate downtown)
const BOSTON_LNG = -71.0589;
const BOSTON_LAT = 42.3601;

async function searchWithSearchBox(query, proximity = null) {
  console.log(`\n🔍 Searching (Search Box API): "${query}"`);
  if (proximity) {
    console.log(`   Near: ${proximity.lat}, ${proximity.lng}`);
  }

  let url = `https://api.mapbox.com/search/searchbox/v1/forward`;
  url += `?q=${encodeURIComponent(query)}`;
  url += `&access_token=${MAPBOX_TOKEN}`;
  url += `&limit=10`;
  url += `&country=us`;

  if (proximity) {
    url += `&proximity=${proximity.lng},${proximity.lat}`;
  }

  try {
    const response = await axios.get(url);

    if (response.data.features && response.data.features.length > 0) {
      console.log(`   ✅ Found ${response.data.features.length} results:\n`);

      response.data.features.forEach((feature, index) => {
        const props = feature.properties || {};
        const name = props.name || props.name_preferred || feature.text || 'Unknown';
        const address = props.address_line1 || props.address || '';
        const city = props.address_level2 || '';
        const state = props.address_level1 || '';
        const full = props.full_address || feature.place_name || '';
        const type = props.feature_type || feature.place_type?.[0] || 'unknown';
        const category = props.poi_category || props.category || '';

        console.log(`   ${index + 1}. ${name}`);
        if (address) console.log(`      Address: ${address}`);
        if (city || state) console.log(`      Location: ${city}${city && state ? ', ' : ''}${state}`);
        console.log(`      Full: ${full}`);
        console.log(`      Type: ${type}${category ? `, Category: ${category}` : ''}`);
        if (feature.geometry?.coordinates) {
          console.log(`      Coords: ${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}`);
        }
        console.log('');
      });
    } else {
      console.log('   ❌ No results found');
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function runTests() {
  console.log('=' .repeat(80));
  console.log('SEARCH BOX API TESTING - Boston Area Dance Studios');
  console.log('=' .repeat(80));

  const bostonProximity = { lat: BOSTON_LAT, lng: BOSTON_LNG };

  // Test dance studios
  await searchWithSearchBox('Ultimate Tango Medford', bostonProximity);
  await searchWithSearchBox('Ultimate Tango', bostonProximity);
  await searchWithSearchBox('Arthur Murray Dance Studio Boston', bostonProximity);
  await searchWithSearchBox('Arthur Murray Dance Studio', bostonProximity);
  await searchWithSearchBox('dance studio Boston', bostonProximity);

  // Test landmarks
  console.log('\n' + '=' .repeat(80));
  console.log('LANDMARK SEARCH TESTING');
  console.log('=' .repeat(80));

  await searchWithSearchBox('Boston City Hall', bostonProximity);
  await searchWithSearchBox('Prudential Tower', bostonProximity);
  await searchWithSearchBox('Faneuil Hall', bostonProximity);
  await searchWithSearchBox('John Hancock Tower', bostonProximity);
}

// Run the tests
runTests().then(() => {
  console.log('\n✅ Testing complete');
}).catch(err => {
  console.error('Testing failed:', err);
});