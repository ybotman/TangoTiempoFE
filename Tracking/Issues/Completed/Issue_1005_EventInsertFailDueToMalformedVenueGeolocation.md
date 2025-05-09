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
- **PR:** Merged
- **Deployed To:** DEVL
- **Verified By:** System test
- **Closed On:** 2025-05-07

---

> Store under: `/public/issues/current/Issue_1005_EventInsertFailDueToMalformedVenueGeolocation.md` and move to `/public/issues/completed/` when resolved. 

# SNR after interactions
🔷 S — Summarize: Successfully fixed and closed the malformed venueGeolocation issue. The problem was in the event creation code where the venueGeolocation object was missing the required coordinates array. We implemented the fix in CreateEventDetailsBasic.js and useEvents.js to ensure proper structure with both type and coordinates. The changes have been merged into DEVL.

🟡 N — Next Steps: 
1. Move this issue document to the completed folder
2. Update relevant documentation if needed
3. Continue monitoring event creation to ensure no regression

🟩 R — Request / Role: Switching to Mirror Mode to confirm issue closure and properly archive the documentation.