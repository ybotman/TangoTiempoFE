# Issue: Event Insert Fail Due to a Malformed VenueGeolocation

## Overview
This is a lightweight formal issue log to capture, trace, and resolve a specific bug. It is stored in the `/public/issues/current/` folder and moved to `/public/issues/completed/` upon resolution.

## Details
- **Reported On:** 2025-05-07
- **Reported By:** User
- **Environment:** Production
- **Component/Page/API Affected:** Event Creation API
- **Symptoms:** Event creation fails when submitting due to a malformed venueGeolocation field

## Steps to Reproduce
1. Select a venue for a new event
2. Complete event details
3. Submit the event
4. Observe API error response related to venueGeolocation

## Investigation
- **Initial Trace:** API error response shows: `Can't extract geo keys: ... venueGeolocation: { type: "Point" }, ... Point must be an array or object, instead got type missing`
- **Suspected Cause:** The venueGeolocation object is missing the required coordinates array. It only has `{ type: "Point" }` but needs `{ type: "Point", coordinates: [longitude, latitude] }`
- **Files to Inspect:** 
  - Components/Modals/CreateEvents/CreateEventDetailModal.js
  - hooks/useEvents.js
  - utils/transformEvents.js

## Fix (if known or applied)
- **Status:** ✅ Fixed
- **Fix Description:** Fixed event creation by ensuring venueGeolocation is properly structured with both `type` and `coordinates` array:
  1. Updated CreateEventDetailsBasic.js to capture venue coordinates when a venue is selected
  2. Enhanced useEvents.js createEvent function to:
     - Use venue coordinates if available in the event data
     - Fetch venue data if needed to get coordinates
     - Fallback to [0,0] coordinates if venue data couldn't be retrieved
  3. Applied the same fix to the updateEvent function for consistency
- **Testing:** Manual verification of event creation with venue selection

## Resolution Log
- **Commit/Branch:** `issue/1005-event-insert-fail-due-to-malformed-venue-geolocation`
- **PR:** TBD
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: `/public/issues/current/Issue_1005_EventInsertFailDueToMalformedVenueGeolocation.md` and move to `/public/issues/completed/` when resolved. 

# SNR after interactions
🔷 S — Summarize: Implemented the fix for the malformed venueGeolocation issue. The problem was in the event creation code where the venueGeolocation object was missing the required coordinates array. We've updated both the CreateEventDetailsBasic.js component to capture venue coordinates during selection and the useEvents.js hook to properly structure the venueGeolocation object for API submission.

🟡 N — Next Steps: 
1. Commit changes to the issue branch
2. Test the implementation to confirm that events can be created with venues
3. Create a pull request to merge the changes into DEVL
4. Move the issue to the completed folder after successful merge

🟩 R — Request / Role: Switch to Executer Mode to test the implementation and verify that the issue is resolved.