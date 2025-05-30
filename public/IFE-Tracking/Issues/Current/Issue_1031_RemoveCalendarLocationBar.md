# Issue: Remove Location Bar from Bottom of Calendar

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue addresses the removal of the redundant Location Information Bar at the bottom of the calendar page. This bar displays the current Region/Division/City with event counts and a "Near Me" button, which is now handled through the main location context modal.

## Details
- **Reported On:** 2024-05-15
- **Reported By:** User
- **Environment:** All Environments
- **Component/Page/API Affected:** Calendar page, LocationInfo component
- **Symptoms:** Redundant location information displayed at the bottom of the calendar

## Steps to Reproduce
1. Navigate to the calendar page
2. Observe the Location Information Bar below the calendar showing Region/Division/City with event counts and a "Near Me" button

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2024-05-15

- [ ] Identify location bar implementation in calendar page
- [ ] Remove the location bar component from the calendar page
- [ ] Test the calendar page to ensure proper functionality without the location bar
- [ ] Verify that location information is still accessible through the main interface
- [ ] Make sure no references to the removed component cause issues

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2024-05-15

- Location Information Bar is implemented in `src/app/calendar/page.js` at lines 186-189
- It uses the `LocationInfo` component from `src/app/components/UI/LocationInfo.js`
- The same location information is now available through the LocationContextModal accessed via the hamburger menu
- No need to keep both interfaces, as they serve the same purpose and might cause confusion

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2024-05-15

- Not started

---

## Investigation
- **Initial Trace:** 
  - Calendar page implements the Location Information Bar in `/src/app/calendar/page.js` lines 186-189
  - The bar is implemented with the `LocationInfo` component from `/src/app/components/UI/LocationInfo.js`
- **Suspected Cause:** 
  - The Location Information Bar is now redundant since location management is handled through the LocationContextModal
  - This is a UI cleanup task to remove duplicate functionality
- **Files to Inspect:** 
  - src/app/calendar/page.js

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** 
  - Remove lines 186-189 from `src/app/calendar/page.js` which render the `LocationInfo` component
  - No other changes needed as the LocationInfo component is not referenced elsewhere in the code
- **Testing:** 
  - Verify the calendar page loads correctly without errors
  - Confirm that location functionality still works through the LocationContextModal

## Resolution Log
- **Commit/Branch:** Not created yet
- **PR:** Not created yet
- **Deployed To:** Not deployed yet
- **Verified By:** Not verified yet

---

> Store under: `/public/IFE-Tracking/Issues/current/Issue_1031_RemoveCalendarLocationBar.md` and move to `/public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles