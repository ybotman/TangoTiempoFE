#!/usr/bin/env node

// Test script to verify which venues cause 400 errors
const venues = require('./all_venues.json');

console.log('=== VENUE VALIDATION TEST ===\n');

// Group venues by status
const activeVenues = venues.filter(v => v.isActive === true);
const inactiveVenues = venues.filter(v => v.isActive === false);

console.log(`Active venues: ${activeVenues.length}`);
console.log(`Inactive venues: ${inactiveVenues.length}\n`);

// Check for potential issues
console.log('POTENTIAL ISSUES:\n');

// Check inactive venues with missing fields
const problematicInactive = inactiveVenues.filter(v => 
  !v.shortName || !v.masteredCityId || !v.isApproved
);

console.log(`Inactive venues with missing critical fields: ${problematicInactive.length}`);
problematicInactive.slice(0, 5).forEach(v => {
  console.log(`  - ${v.name}`);
  console.log(`    isActive: ${v.isActive}, isApproved: ${v.isApproved}, shortName: ${v.shortName || 'MISSING'}`);
});

// Check active venues with missing fields
const problematicActive = activeVenues.filter(v => 
  !v.shortName || !v.masteredCityId
);

console.log(`\nActive venues with missing fields: ${problematicActive.length}`);
problematicActive.forEach(v => {
  console.log(`  - ${v.name}`);
  console.log(`    shortName: ${v.shortName || 'MISSING'}, masteredCityId: ${v.masteredCityId || 'MISSING'}`);
});

// Test venues for manual testing
console.log('\n=== RECOMMENDED TEST VENUES ===\n');
console.log('1. GOOD: EPIC. Q-BALLROOM (active, has shortName)');
console.log('2. TEST: Dance Union (active, NO shortName)');
console.log('3. TEST: (Maine) Maine Ballroom Dance (inactive, NO shortName, NO isApproved)');

// Check what combinations exist
console.log('\n=== VENUE STATUS COMBINATIONS ===\n');
const combinations = {};
venues.forEach(v => {
  const key = `active:${v.isActive}_approved:${v.isApproved}_hasShortName:${!!v.shortName}`;
  if (!combinations[key]) {
    combinations[key] = { count: 0, examples: [] };
  }
  combinations[key].count++;
  if (combinations[key].examples.length < 2) {
    combinations[key].examples.push(v.name);
  }
});

Object.entries(combinations).forEach(([key, data]) => {
  console.log(`${key}: ${data.count} venues`);
  console.log(`  Examples: ${data.examples.join(', ')}`);
});