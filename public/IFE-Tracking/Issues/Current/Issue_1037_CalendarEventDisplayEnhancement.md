# Issue: Enhance Calendar Event Display with Organizer Short Name

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue addresses enhancing the calendar event display to include organizer short name information in the first row alongside existing time and category information. This will improve user experience by providing immediate organizer identification without requiring additional clicks.

## Details
- **Reported On:** 2025-06-08
- **Reported By:** User
- **Environment:** All Environments
- **Component/Page/API Affected:** Calendar page, event rendering
- **Enhancement Type:** UI/UX Improvement

## Current vs Desired Layout

### Current Layout:
**Row 1**: TimeBlock + CategoryCircles  
**Row 2**: Event Title

### Desired Layout:
**Row 1**: TimeBlock + CategoryCircles + ownerOrganizerShortName  
**Row 2**: Event Title (unchanged)

## Field Mapping from Event JSON
- **TimeBlock**: `startDate`/`endDate` → formatted time range
- **CategoryCircles**: `categoryFirst`, `categorySecond`, `categoryThird` 
- **ownerOrganizerShortName**: "MILONGASAL", "ULTIMATETA", etc.
- **title**: Full event title (remains on row 2)

## Steps to Reproduce Current Behavior
1. Navigate to the calendar page
2. Observe event display in both Monthly and List views
3. Note that organizer information is not visible without clicking the event

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2025-06-08

🏃 **KANBAN MODE** - 2025-06-08T17:32:00.000Z

- [ ] 📋 Investigate current event rendering implementation
- [ ] 📋 Analyze space constraints for additional organizer text
- [ ] 📋 Design layout for organizer short name integration
- [ ] 📋 Implement organizer short name display in both calendar views
- [ ] 📋 Test layout responsiveness and text overflow handling
- [ ] 📋 Verify organizer short name field availability in event data
- [ ] 📋 Ensure consistent styling with existing elements
- [ ] 📋 Build and test implementation

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-06-08

- Event rendering handled in `src/app/calendar/page.js` in `renderEventContent` function
- Current layout uses flexDirection: 'column' with time+circles in first div, title in second div
- Both Monthly and List views have similar 2-row structure but different styling
- Event data includes `ownerOrganizerShortName` field (confirmed from JSON sample)
- Need to assess space constraints for additional text in first row

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2025-06-08

- Not started

---

## Investigation
- **Target Files:** 
  - `src/app/calendar/page.js` - renderEventContent function (lines ~106-208)
- **Data Source:** 
  - Event objects contain `ownerOrganizerShortName` field
- **Layout Impact:** 
  - Need to modify first row flex layout to accommodate additional text
  - Consider text truncation for long organizer names
- **Views Affected:** 
  - Monthly view (dayGridMonth)
  - List view (listMonth)

## Implementation Plan
- **Phase 1:** Scout current implementation and space analysis
- **Phase 2:** Design responsive layout for organizer name integration  
- **Phase 3:** Implement changes in both calendar views
- **Phase 4:** Test and refine layout for different screen sizes

## Fix (if known or applied)
- **Status:** 🚧 **OPEN** - Ready for investigation
- **Fix Description:** 
  - Modify renderEventContent function to include ownerOrganizerShortName in first row
  - Ensure responsive layout handles text overflow appropriately
  - Maintain consistent styling with existing time and category elements
- **Testing:** 
  - Verify display in both Monthly and List views
  - Test with various organizer name lengths
  - Confirm no layout breaking on small screens

## Resolution Log
- **Commit/Branch:** Not created yet
- **PR:** Not created yet
- **Deployed To:** Not deployed yet
- **Verified By:** Not verified yet

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1037_CalendarEventDisplayEnhancement.md` and move to `/public/IFE-Tracking/Issues/completed/` when resolved.

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles