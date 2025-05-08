# Issue: GeoLocation and Events Initialization Bugs

## Overview
This issue tracks three related initialization bugs affecting the application: (1) the LocationContextModal displays "No cities with valid coordinates found" despite the API returning valid data, (2) the event transformation process shows warnings about missing data, and (3) the Venue Selection feature is disabled due to missing city data in the GeoLocationContext.

## Details
- **Reported On:** 2025-05-08
- **Reported By:** User
- **Environment:** Local/Development
- **Component/Page/API Affected:** GeoLocationContext, LocationContextModal, useEvents hook, transformEvents utility
- **Symptoms:** 
  - "No cities with valid coordinates found" warning in LocationContextModal
  - "No events to transform or events is not an array" warning in transformEvents.js
  - Venue Selection menu item is disabled in the sidebar
  - Multiple console errors when loading application

## Steps to Reproduce
1. Start the application with `npm run dev`
2. Open developer console to observe the following errors:
   - `LocationContextModal.js:95 No cities with valid coordinates found`
   - `transformEvents.js:4 No events to transform or events is not an array`
3. Navigate to the hamburger menu and observe that the "Select Venue" option is disabled

## Investigation
- **Initial Trace:** The 500 error with events API geolocation parameters has been fixed, but frontend initialization issues persist
- **Suspected Cause:** 
  1. LocationContextModal is not properly processing city data from the API
  2. Events hook is calling transformEvents before data is available
  3. GeoLocationContext is not properly initializing with default city data

- **Files to Inspect:** 
  - `/src/app/components/Modals/misc/LocationContextModal.js` (city coordinates filtering)
  - `/src/app/hooks/useCalendarPage.js` (events transformation timing)
  - `/src/app/contexts/GeoLocationContext.js` (initialization and fallback mechanism)
  - `/src/app/hooks/useMasteredLocations.js` (city data handling)

## Data Flow Analysis
1. **City Coordinates Issue:**
   - API correctly returns cities with coordinates and GeoJSON location fields
   - useMasteredLocations.js code looks correct for processing response
   - LocationContextModal may be filtering too aggressively or not accessing coordinates properly

2. **Events Transformation Issue:**
   - transformEvents function correctly handles empty arrays, null, or undefined inputs
   - Issue occurs because events data isn't available when the function is first called
   - useCalendarPage.js needs better loading state handling

3. **Venue Selection Disabled:**
   - VenueSelectionModal is disabled when `!selectedLocation?.city?.id`
   - GeoLocationContext has fallback code but it's not being triggered properly
   - Initialization ordering or race condition is preventing proper city initialization

## Fix (if known or applied)
- **Status:** 🚧 In Progress

- **Fix Description:** 
  1. For LocationContextModal:
     - Add additional logging to trace the city data structure
     - Ensure coordinates are extracted correctly from GeoJSON location field
     - Add graceful degradation to prevent "No cities" error

  2. For transformEvents:
     - Add conditional check in useCalendarPage to prevent calling transformEvents before data is ready
     - Implement loading state display in calendar page

  3. For GeoLocationContext:
     - Ensure initialization completes with fallback city values
     - Fix potential race conditions in context initialization
     - Add error recovery to prevent disabled UI elements

- **Testing:** 
  - Manual verification with console logging
  - Verify venue selection becomes enabled
  - Confirm all warning messages are resolved

## Resolution Log
- **Commit/Branch:** Not yet created
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: `/public/issues/current/Issue_1008_GeoLocationAndEventsInitializationBugs.md`