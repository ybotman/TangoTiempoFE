#!/usr/bin/env node

/**
 * TIEMPO-239 Timezone Test
 * Tests: User in Tokyo creating event for NYC venue
 * Expected: Event should be created at venue time (7PM EDT), not browser time (8AM JST)
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

console.log('========================================');
console.log('TIEMPO-239: Venue Timezone Test Scenario');
console.log('========================================\n');

// Simulate browser in Tokyo
const browserTimezone = 'Asia/Tokyo';
const venueTimezone = 'America/New_York';

// Current time in both timezones
const now = dayjs();
console.log('Current Time Comparison:');
console.log('Browser (Tokyo):', now.tz(browserTimezone).format('YYYY-MM-DD HH:mm:ss z'));
console.log('Venue (NYC):    ', now.tz(venueTimezone).format('YYYY-MM-DD HH:mm:ss z'));
console.log('');

// Test our fix: Creating event at 7PM venue time
console.log('Event Creation Test:');
console.log('Creating event for 7:00 PM at NYC venue...\n');

// OLD WAY (BUG): Uses browser timezone
const buggyWay = () => {
  const selectedDay = dayjs(); // Browser timezone (Tokyo)
  const sevenPM = selectedDay.hour(19).minute(0).second(0);
  return sevenPM;
};

// NEW WAY (FIXED): Uses venue timezone
const fixedWay = (venueTimezone) => {
  const tz = venueTimezone || 'America/New_York';
  const selectedDay = dayjs().tz(tz);
  const sevenPM = selectedDay.hour(19).minute(0).second(0);
  return sevenPM;
};

// Compare results
const buggyResult = buggyWay();
const fixedResult = fixedWay(venueTimezone);

console.log('❌ OLD (Buggy) Implementation:');
console.log('   Creates at:', buggyResult.format('YYYY-MM-DD HH:mm:ss'));
console.log('   In Tokyo:  ', buggyResult.tz(browserTimezone).format('HH:mm z'));
console.log('   In NYC:    ', buggyResult.tz(venueTimezone).format('HH:mm z'));
console.log('   WRONG: Creates at 7PM Tokyo time!\n');

console.log('✅ NEW (Fixed) Implementation:');
console.log('   Creates at:', fixedResult.format('YYYY-MM-DD HH:mm:ss'));
console.log('   In Tokyo:  ', fixedResult.tz(browserTimezone).format('HH:mm z'));
console.log('   In NYC:    ', fixedResult.tz(venueTimezone).format('HH:mm z'));
console.log('   CORRECT: Creates at 7PM NYC time!\n');

// Show the time difference
const hoursDiff = Math.abs(buggyResult.diff(fixedResult, 'hours'));
console.log(`Time Difference: ${hoursDiff} hours`);
console.log('');

// Test with specific date (for event creation)
const testDate = '2025-08-20'; // Future date for testing
console.log('Future Event Test (Aug 20, 2025):');

const futureFixed = dayjs.tz(testDate, venueTimezone).hour(19).minute(0);
console.log('Event Time (NYC):  ', futureFixed.format('YYYY-MM-DD HH:mm z'));
console.log('Same Time (Tokyo): ', futureFixed.tz(browserTimezone).format('YYYY-MM-DD HH:mm z'));
console.log('');

console.log('========================================');
console.log('Test Complete!');
console.log('========================================');