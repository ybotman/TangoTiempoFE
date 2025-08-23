#!/usr/bin/env node

const fs = require('fs');
const venues = JSON.parse(fs.readFileSync('all_venues.json', 'utf8'));

console.log('=== VENUE FIELD DEMOGRAPHICS ANALYSIS ===\n');
console.log(`Total Venues: ${venues.length}\n`);

// Analyze each field
const fieldStats = {};
const allFields = new Set();

venues.forEach(venue => {
  Object.keys(venue).forEach(field => {
    allFields.add(field);
    if (!fieldStats[field]) {
      fieldStats[field] = {
        filled: 0,
        empty: 0,
        null: 0,
        emptyString: 0,
        examples: new Set()
      };
    }
    
    const value = venue[field];
    if (value === null) {
      fieldStats[field].null++;
      fieldStats[field].empty++;
    } else if (value === '' || value === undefined) {
      fieldStats[field].emptyString++;
      fieldStats[field].empty++;
    } else {
      fieldStats[field].filled++;
      if (fieldStats[field].examples.size < 3) {
        fieldStats[field].examples.add(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
  });
});

// Sort fields by fill rate
const sortedFields = Object.entries(fieldStats)
  .map(([field, stats]) => ({
    field,
    ...stats,
    fillRate: (stats.filled / venues.length * 100).toFixed(1)
  }))
  .sort((a, b) => b.fillRate - a.fillRate);

console.log('FIELD FILL RATES (sorted by completeness):');
console.log('============================================');
sortedFields.forEach(({ field, filled, empty, fillRate, examples }) => {
  const status = fillRate >= 90 ? '✅' : fillRate >= 50 ? '⚠️ ' : '❌';
  console.log(`${status} ${field.padEnd(25)} ${fillRate}% (${filled}/${venues.length})`);
  if (examples.size > 0 && fillRate < 100) {
    console.log(`   Examples: ${Array.from(examples).slice(0, 2).join(', ')}`);
  }
});

// Check critical fields for event creation
console.log('\n=== CRITICAL FIELDS FOR EVENT CREATION ===');
const criticalFields = [
  'name', 
  'shortName',
  'latitude', 
  'longitude', 
  'geolocation',
  'address1', 
  'city', 
  'state',
  'masteredCityId',
  'masteredRegionId',
  'timezone'
];

criticalFields.forEach(field => {
  const stats = fieldStats[field];
  if (stats) {
    const fillRate = (stats.filled / venues.length * 100).toFixed(1);
    const status = fillRate >= 90 ? '✅' : fillRate >= 50 ? '⚠️ ' : '❌';
    console.log(`${status} ${field.padEnd(20)} ${fillRate}% (${stats.filled}/${venues.length})`);
  } else {
    console.log(`❌ ${field.padEnd(20)} MISSING FIELD`);
  }
});

// Find problematic venues
console.log('\n=== PROBLEMATIC VENUES (missing critical fields) ===');
venues.forEach((venue, index) => {
  const problems = [];
  
  if (!venue.name) problems.push('name');
  if (!venue.shortName) problems.push('shortName');
  if (!venue.latitude) problems.push('latitude');
  if (!venue.longitude) problems.push('longitude');
  if (!venue.geolocation) problems.push('geolocation');
  if (!venue.masteredCityId) problems.push('masteredCityId');
  if (!venue.timezone) problems.push('timezone');
  
  if (problems.length > 0) {
    console.log(`\nVenue: ${venue.name || 'UNNAMED'} (ID: ${venue._id})`);
    console.log(`  Missing: ${problems.join(', ')}`);
    console.log(`  City: ${venue.city || 'N/A'}, State: ${venue.state || 'N/A'}`);
  }
});

console.log('\n=== SUMMARY ===');
const venuesWithAllCritical = venues.filter(venue => 
  venue.name && 
  venue.latitude && 
  venue.longitude && 
  venue.masteredCityId &&
  venue.timezone
).length;

console.log(`Venues with all critical fields: ${venuesWithAllCritical}/${venues.length} (${(venuesWithAllCritical/venues.length*100).toFixed(1)}%)`);