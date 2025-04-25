# Venues Migration Plan

## Overview

This document outlines the plan to transition from the legacy "Locations" concept to a fully venue-based system in TangoTiempo. This migration will standardize terminology, improve data models, and reduce confusion between geographic locations (regions/divisions/cities) and physical venues.

## Background

Currently, the system uses several overlapping concepts:

1. **Locations**: The legacy concept for physical places where events are held (deprecated)
2. **Venues**: The correct concept for physical places with addresses where events occur
3. **GeoLocations**: Geographic hierarchy (regions/divisions/cities) for organizing data
4. **MasteredLocations**: Reference data that standardizes regions/divisions/cities

The transition to venues has partially begun but needs to be completed before launch.

## Goals

- Completely remove the locations collection/API from the backend
- Update all frontend components to reference venues instead of locations
- Standardize field names across the system (venueId/venueName instead of locationID/locationName)
- Ensure proper linking between venues and geoLocations
- Create a clean, consistent data model for the system

## Non-Goals

- Changing the GeoLocation system (this is a separate concept with its own migration path)
- Massive UI redesign (this is focused on backend/data model alignment)
- Changing core event functionality beyond updating venue references

## Migration Phases

### Phase 1: Backend Updates

**Objective**: Remove locations entirely from the backend.

Tasks:
- Delete the locations collection
- Remove any locations API endpoints
- Update event schema to use venueId/venueName fields
- Modify any backend validation to reject calls using legacy location endpoints
- Ensure venues API provides all required functionality
- Update any internal references to use venues terminology

Technical considerations:
- Event schema changes might require database migration
- API contracts will need to be updated
- Validation rules need to be updated for the new field names

### Phase 2: Frontend Model & API Updates

**Objective**: Update frontend data models and API integration.

Tasks:
- Remove useLocations.js hook entirely
- Ensure useVenues.js has all required functionality
- Update event data structure to use venue terminology
- Modify API calls to use venue endpoints
- Update transformEvents.js and other transformation logic

Affected files:
- `/src/app/hooks/useLocations.js` (remove)
- `/src/app/hooks/useVenues.js` (enhance)
- `/src/app/utils/transformEvents.js` (update)
- Any service/API call files referencing locations

### Phase 3: Component Updates

**Objective**: Update all UI components to reference venues.

Tasks:
- Update all component files referencing locations
- Rename components with "Location" in their name
- Update PropTypes definitions
- Change UI text from "location" to "venue"

Affected components:
- `/src/app/components/Modals/ViewEvents/ViewEventDetailsMore.js`
- `/src/app/components/Modals/ViewEvents/ViewEventDetailsLocationOther.js`
- `/src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`
- Any other components referencing locationID/locationName

### Phase 4: Testing & Validation

**Objective**: Ensure all functionality works correctly with the venue model.

Test cases:
- Event creation with venue selection
- Event viewing with venue details
- Filtering events by region/venue
- Organization management related to venues
- Edge cases (events without venues, etc.)

Validation criteria:
- All events display venue information correctly
- Venue selection works in event creation/editing
- No references to "location" in UI (except geographic context)
- No console errors related to missing location fields

### Phase 5: Cleanup & Documentation

**Objective**: Finalize the migration and document the changes.

Tasks:
- Remove any dead code related to locations
- Clean up any remaining references in comments
- Update documentation to reference venues consistently
- Update any diagrams or architecture documents

## Technical Specifics

### Data Model Changes

**Current Event Model**:
```javascript
{
  // Other event fields...
  locationID: String,  // References the venue
  locationName: String,
  // ...
}
```

**New Event Model**:
```javascript
{
  // Other event fields...
  venueId: String,     // References the venue
  venueName: String,
  // ...
}
```

### API Endpoint Changes

**Current Endpoints**:
- No direct `/locations` endpoint (already using `/venues`)
- Events model includes `locationID` and `locationName`

**New Endpoints**:
- Exclusively use `/venues` endpoints
- Events model uses `venueId` and `venueName`

### Key Component Changes

1. **ViewEventDetailsMore.js**
   - Change from `useLocations` to `useVenues`
   - Update property references from `locationID` to `venueId`

2. **CreateEventDetailsBasic.js**
   - Already using `useVenues`
   - Update form field bindings to use `venueId`/`venueName`

3. **transformEvents.js**
   - Update mapping to use venue terminology

4. **ViewEventDetailsLocationOther.js**
   - Rename to `ViewEventDetailsVenueOther.js`
   - Update all internal references

## Implementation Strategy

Since the site is not yet live, we can take a "clean break" approach:

1. Start with backend changes to force frontend updates
2. Update in logical groups (models first, then API, then UI)
3. Remove compatibility layers immediately rather than maintaining them
4. No feature branches needed - implement directly in development

## Success Criteria

- ✅ Backend has no trace of locations collection/API
- ✅ Frontend code exclusively uses venue terminology
- ✅ All components properly display venue information
- ✅ Event creation/editing works with venue selection
- ✅ Code is clean with no references to legacy location terminology
- ✅ Documentation is consistent with new terminology

## Future Considerations

- Enhance the venue-geoLocation connection for better filtering
- Improve venue selection UI with map integration
- Add distance-based venue filtering using coordinates