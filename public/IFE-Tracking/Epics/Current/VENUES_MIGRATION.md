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

## Current API Analysis

### Venue Endpoints (Properly Implemented)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/venues` | GET | Get all venues (with pagination) | ✅ Implemented |
| `/api/venues/:id` | GET | Get venue by ID | ✅ Implemented |
| `/api/venues` | POST | Create new venue | ✅ Implemented |
| `/api/venues/:id` | PUT | Update existing venue | ✅ Implemented |
| `/api/venues/:id` | DELETE | Deactivate venue | ✅ Implemented |

### Events Endpoints with Location References

| Endpoint | Method | Location Parameters | Notes |
|----------|--------|---------------------|-------|
| `/api/events` | GET | Uses masteredRegionName, masteredDivisionName, masteredCityName for filtering | Geographical location filtering is correct |
| `/api/events/post` | POST | Uses locationID, locationName | Needs update to venueId, venueName |
| `/api/events/:id` | PUT | Uses locationID, locationName | Needs update to venueId, venueName |

### Legacy Endpoints (None Found)

No direct `/api/locations` endpoints were found in the frontend code. All frontend code appears to already call `/api/venues` endpoints, although it uses legacy locationID/locationName field names.

## Components Requiring Updates

The following components use `locationID`/`locationName` and need to be updated:

1. **Event Creation Components**:
   - `/src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`
   - `/src/app/components/Modals/CreateEvents/CreateEventDetailModal.js`

2. **Event Display Components**:
   - `/src/app/components/Modals/ViewEvents/ViewEventDetailsMore.js` 
   - `/src/app/components/Modals/ViewEvents/ViewEventDetailsLocationOther.js` (needs renaming)

3. **Data Transformation**:
   - `/src/app/utils/transformEvents.js`

4. **API Hooks**:
   - `/src/app/hooks/useLocations.js` (needs to be removed)
   - `/src/app/hooks/useEvents.js` (needs to update event data structure)

## MongoDB Event Schema Update

Current Event Schema:
```javascript
{
  // Other event fields...
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: false,
  },
  locationName: String,
  // ...
}
```

New Event Schema:
```javascript
{
  // Other event fields...
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: false,
  },
  venueName: String,
  // Venue geolocation data
  venueGeolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  // ...
}
```

## Migration Phases

### Phase 1: Backend Updates

**Objective**: Remove locations entirely from the backend.

Tasks:
- ✅ Delete the locations collection (appears to be already completed)
- ✅ Remove any locations API endpoints (appears to be already completed)
- ⬜ Mark all locationID fields in MongoDB as deprecated
- ⬜ Update event schema to use venueId/venueName fields
- ⬜ Modify any backend validation to reject calls using legacy location endpoints
- ⬜ Update any internal references to use venues terminology

Technical considerations:
- Event schema has already been updated to include both locationID and venueId fields
- Backend already uses `/api/venues` instead of `/api/locations`
- Final step is to remove locationID completely and ensure validation only accepts venueId

### Phase 2: Frontend Model & API Updates

**Objective**: Update frontend data models and API integration.

Tasks:
- ⬜ Remove useLocations.js hook entirely
- ⬜ Update getLocationById function to getVenueById in useVenues.js
- ⬜ Update event data structure to use venue terminology
- ⬜ Update transformEvents.js to use venueId/venueName
- ⬜ Update event creation/editing to send venueId/venueName

Affected files:
- `/src/app/hooks/useLocations.js` (remove)
- `/src/app/hooks/useVenues.js` (enhance)
- `/src/app/utils/transformEvents.js` (update)

Implementation Details:
```javascript
// In transformEvents.js, update:
extendedProps: {
  // Change from:
  locationID: event.locationID,
  locationName: event.locationName,
  // To:
  venueId: event.venueId,
  venueName: event.venueName,
}
```

### Phase 3: Component Updates

**Objective**: Update all UI components to reference venues.

Tasks:
- ⬜ Update ViewEventDetailsMore.js to use useVenues and venueId
- ⬜ Rename ViewEventDetailsLocationOther.js to ViewEventDetailsVenueOther.js
- ⬜ Update CreateEventDetailsBasic.js to use venueId/venueName
- ⬜ Update PropTypes definitions in all components
- ⬜ Change UI text from "location" to "venue"

Affected components:
- `/src/app/components/Modals/ViewEvents/ViewEventDetailsMore.js`
- `/src/app/components/Modals/ViewEvents/ViewEventDetailsLocationOther.js`
- `/src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`
- `/src/app/components/Modals/CreateEvents/CreateEventDetailModal.js`

Implementation details:
```javascript
// In CreateEventDetailsBasic.js, update:
// From:
setEventData({
  ...eventData,
  locationID: newValue._id,
  locationName: venueName
});

// To:
setEventData({
  ...eventData,
  venueId: newValue._id,
  venueName: venueName
});
```

### Phase 4: Testing & Validation

**Objective**: Ensure all functionality works correctly with the venue model.

Test cases:
- ⬜ Event creation with venue selection
- ⬜ Event viewing with venue details
- ⬜ Filtering events by region/venue
- ⬜ Organization management related to venues
- ⬜ Edge cases (events without venues, etc.)

Validation criteria:
- ⬜ All events display venue information correctly
- ⬜ Venue selection works in event creation/editing
- ⬜ No references to "location" in UI (except geographic context)
- ⬜ No console errors related to missing location fields

### Phase 5: Cleanup & Documentation

**Objective**: Finalize the migration and document the changes.

Tasks:
- ⬜ Remove any dead code related to locations
- ⬜ Clean up any remaining references in comments
- ⬜ Update documentation to reference venues consistently
- ⬜ Update any diagrams or architecture documents

## Implementation Strategy

Since the site is not yet live, we will take a "clean break" approach:

1. Update the MongoDB Events schema to use venueId/venueName exclusively, removing locationID/locationName
2. Update the backend API to reject any requests using locationID/locationName
3. Update frontend components in logical groups:
   - Data models and transformation first
   - API hooks second
   - UI components third
4. Test thoroughly to ensure all functionality works with the new field names
5. Clean up any remaining references to locationID/locationName

## Success Criteria

- ✅ Backend has no trace of locations collection/API
- ✅ Frontend code exclusively uses venue terminology
- ✅ All components properly display venue information
- ✅ Event creation/editing works with venue selection
- ✅ Code is clean with no references to legacy location terminology
- ✅ Documentation is consistent with new terminology