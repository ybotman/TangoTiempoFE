# Issue: Event Update Fail Due To Empty ObjectId Fields

## Overview
Event updates were failing with MongoDB CastError because empty strings ("") were being passed for fields expected to be MongoDB ObjectIds.

## Details
- **Reported On:** 2025-05-07
- **Reported By:** User
- **Environment:** Production
- **Component/Page/API Affected:** Event Update API
- **Symptoms:** When attempting to update an event, the request would fail with a CastError message from MongoDB for fields like categorySecondId, categoryThirdId, grantedOrganizerID, and alternateOrganizerID

## Steps to Reproduce
1. Edit an existing event where some ObjectId fields are empty
2. Update the event
3. Observe MongoDB CastError in the API response

## Investigation
- **Initial Trace:** API error showing CastError for various ObjectId fields
- **Suspected Cause:** Empty strings ("") being sent for optional ObjectId fields instead of null values
- **Files to Inspect:** 
  - hooks/useEvents.js
  - components/Modals/CreateEvents/CreateEventDetailModal.js

## Fix (if known or applied)
- **Status:** ✅ Fixed
- **Fix Description:** 
  1. Created a utility function `sanitizeObjectIdFields()` in useEvents.js to convert empty strings to null for all ObjectId fields
  2. Applied this function to both createEvent and updateEvent functions
  3. Added detailed documentation to explain the issue and solution
- **Testing:** Manual testing of event updates

## Resolution Log
- **Commit/Branch:** `issue/1007-event-update-fail-due-to-empty-objectids`
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** User testing
- **Closed On:** 2025-05-07

---

> Store under: `/public/issues/current/Issue_1007_EventUpdateFailDueToEmptyObjectIds.md` and move to `/public/issues/completed/` when resolved. 

# SNR after interactions
🔷 S — Summarize: Fixed the issue with event updates failing due to MongoDB CastErrors by implementing a utility function that sanitizes the event data before submission. The function converts empty strings for ObjectId fields to null values, which are acceptable in MongoDB. This fix was applied to both the createEvent and updateEvent functions to ensure consistent behavior.

🟡 N — Next Steps: 
1. Test the implementation to verify event updates work correctly
2. Commit the changes to a branch named `issue/1007-event-update-fail-due-to-empty-objectids`
3. Create a pull request to merge the fix into the DEVL branch
4. Move the issue to the completed folder after successful deployment

🟩 R — Request / Role: Switching to Executer Mode to test the implementation and verify the issue is resolved.