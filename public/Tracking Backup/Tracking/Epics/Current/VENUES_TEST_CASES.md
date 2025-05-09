# Venue Migration Test Cases

## Overview
This document contains test cases for verifying the successful migration from 'locations' to 'venues' in the frontend codebase. These tests should be executed at each phase of the migration to ensure no functionality is broken.

## Event Creation Tests

### Basic Event Creation
1. Navigate to calendar view
2. Click to create a new event
3. Fill in all basic event details
4. **Select a venue** from dropdown (test search functionality)
5. Save the event
6. Verify event was created successfully with correct venue information

### Event Creation with Venue Fields
1. Create a new event as above
2. Verify that the venue dropdown shows correct venue names
3. Observe network requests during save to verify `venueId`/`venueName` fields are sent
4. Check browser console for any errors or deprecation warnings

### Edge Case: Create Event Without Venue
1. Create a new event
2. Leave venue field empty
3. Complete other required fields
4. Save the event
5. Verify event saves correctly without venue information

## Event Viewing Tests

### Basic Event Viewing
1. Find an existing event on the calendar
2. Click to view event details
3. Verify venue information displays correctly
4. Check that address and other venue details are shown properly

### Existing Events with Location Fields
1. Find an event created before the migration (with `locationID`)
2. View event details
3. Verify venue information displays correctly despite using old data format

### Event Editing
1. Find an existing event
2. Edit the event
3. Change the venue selection
4. Save changes
5. Verify venue data is updated correctly

## Venue Management Tests

### Venue Listing
1. Navigate to venue management area (if applicable)
2. Verify all venues are listed correctly
3. Check filtering and search capabilities

### Add New Venue
1. Add a new venue
2. Fill in all venue details
3. Save the venue
4. Verify new venue appears in lists and can be selected for events

### Edit Venue
1. Select an existing venue
2. Edit venue details
3. Save changes
4. Verify changes are reflected throughout the application

## API Integration Tests

### API Response Format
1. Use browser network tools to inspect API responses
2. Verify format of venue objects in responses
3. Check for both new field names and any backward compatibility fields

### Field Name Consistency
1. Inspect network requests during event creation/editing
2. Verify field names match expected format (venueId/venueName)
3. Check console for any errors or warnings related to field names

## User Interface Tests

### Terminology Consistency
1. Verify all UI elements use "venue" instead of "location" terminology
2. Check form labels, help text, and error messages
3. Ensure user-facing messages are consistent

### Responsive Design
1. Test venue selection and display on various screen sizes
2. Verify mobile experience works correctly

## Error Handling Tests

### Invalid Venue Selection
1. Attempt to select a non-existent or deactivated venue
2. Verify appropriate error handling

### API Failure Scenarios
1. Simulate venue API failures (network tab blocking)
2. Verify application gracefully handles unavailable venue data
3. Check error messages are user-friendly

## Performance Tests

### Venue Dropdown Performance
1. Measure load time for venue dropdown with many venues
2. Test search responsiveness with large venue datasets

## Notes for Testers
- Document any instances where "location" terminology still appears
- Note any console errors or warnings related to venue/location fields
- Report any inconsistencies in field names across the application
- Pay attention to error scenarios and edge cases
