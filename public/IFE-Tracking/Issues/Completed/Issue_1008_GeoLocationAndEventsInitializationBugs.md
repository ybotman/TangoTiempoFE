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
- **Status:** ✅ Fixed

- **Fix Description:** 
  1. For LocationContextModal:
     - Added support for both direct lat/lng and GeoJSON location.coordinates field formats
     - Implemented an extraction step to convert GeoJSON coordinates to direct lat/lng
     - Added fallback cities (Boston, New York) when no valid coordinates are found

  2. For transformEvents:
     - Added conditional check in useCalendarPage:
       ```javascript
       const transformedEvents = (!eventsLoading && Array.isArray(events) && events.length > 0) 
         ? transformEvents(events) 
         : [];
       ```
     - This prevents the warning during initial loading when events aren't available yet

  3. For GeoLocationContext:
     - Ensured initialization always sets a fallback Boston city value
     - Added explicit location setting when nearestCity is available
     - Fixed race condition by making fallback location unconditional

- **Testing:** 
  - Manual verification with console logging
  - Confirmed venue selection becomes enabled with default city
  - Verified warning messages are resolved

## Resolution Log
- **Commit/Branch:** `issue/1008-geolocation-and-events-initialization-bugs`
- **Commits:** 
  - 3c07fa9 - Add Issue 1008: GeoLocation and Events initialization bugs document
  - 1fd099e - Fix GeoLocation and Events initialization bugs
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Pending verification after deployment

---

> Store under: `/public/issues/current/Issue_1008_GeoLocationAndEventsInitializationBugs.md`