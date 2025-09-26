// Test script specifically for Ultimate Tango searches
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const BOSTON_LNG = -71.0589;
const BOSTON_LAT = 42.3601;

async function searchWithSearchBox(query) {
  console.log(`\n🔍 Searching: "${query}"`);

  let url = `https://api.mapbox.com/search/searchbox/v1/forward`;
  url += `?q=${encodeURIComponent(query)}`;
  url += `&access_token=${MAPBOX_TOKEN}`;
  url += `&limit=10`;
  url += `&country=us`;
  url += `&proximity=${BOSTON_LNG},${BOSTON_LAT}`;

  try {
    const response = await axios.get(url);

    if (response.data.features && response.data.features.length > 0) {
      console.log(`   ✅ Found ${response.data.features.length} results:`);

      response.data.features.forEach((feature, index) => {
        const props = feature.properties || {};
        const name = props.name || props.name_preferred || feature.text || 'Unknown';
        const address = props.address_line1 || props.address || '';
        const city = props.address_level2 || '';
        const full = props.full_address || feature.place_name || '';
        const category = props.poi_category || props.category || '';

        console.log(`\n   ${index + 1}. ${name}`);
        if (address) console.log(`      Address: ${address}`);
        if (city) console.log(`      City: ${city}`);
        console.log(`      Full: ${full}`);
        if (category) console.log(`      Category: ${category}`);
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
  console.log('ULTIMATE TANGO SEARCH TESTS');
  console.log('=' .repeat(80));

  // Try different search variations
  await searchWithSearchBox('Ultimate Tango');
  await searchWithSearchBox('Ultimate Tango Malden');
  await searchWithSearchBox('Ultimate Tango Medford');
  await searchWithSearchBox('349 Washington Street Malden');
  await searchWithSearchBox('Ultimate Tango School');
  await searchWithSearchBox('Ultimate Tango Dance');
  await searchWithSearchBox('tango malden');
  await searchWithSearchBox('tango medford');
}

runTests().then(() => {
  console.log('\n✅ Testing complete');
}).catch(err => {
  console.error('Testing failed:', err);
});