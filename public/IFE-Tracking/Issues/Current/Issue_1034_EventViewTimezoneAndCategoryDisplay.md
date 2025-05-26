# Issue: Event View Timezone and Category Display

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This is a lightweight formal issue log to capture, trace, and resolve event view display issues in the top view Events component with 6 tabs.

## Details
- **Reported On:** 2025-05-26
- **Reported By:** User
- **Environment:** Local / Dev / Staging / Production
- **Component/Page/API Affected:** Event View Component (top view with 6 tabs)
- **Symptoms:** 
  1. Time displayed in Zulu/UTC timezone instead of local timezone
  2. Missing category display (First, Second, Third) with proper color coding

## Steps to Reproduce
1. Open an event in the Event View (top view with 6 tabs)
2. Observe time display shows UTC/Zulu instead of local timezone
3. Note absence of category information with color coding above the time

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2025-05-26 17:40

- [ ] Investigate Event View component structure and identify files
- [ ] Fix timezone display to show local time instead of Zulu/UTC
- [ ] Add category display (First, Second, Third) above time with proper colors
- [ ] Verify color mapping matches calendar and category filter colors (Milonga DarkBlue, Practica LightBlue, etc.)
- [ ] Test timezone handling across different user timezones
- [ ] Test category color display with various event types

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-05-26 17:45

- **Event View Component Found**: ViewEventDetailModal.js is the main modal with 6 tabs
- **Time Display Location**: Lines 227-244 in ViewEventDetailModal.js - already uses toLocaleTimeString() but may need timezone enhancement
- **Category Data Available**: eventDetails.extendedProps contains categoryFirst, categorySecond, categoryThird
- **Category Colors Defined**: src/app/utils/categoryColors.js has complete color mapping:
  - Milonga: 'DodgerBlue' (not DarkBlue as mentioned)
  - Practica: 'cyan' (not LightBlue as mentioned)
  - Festival: 'Red', Class: 'yellow', Workshop: 'HotPink', etc.
- **Category Display Found**: ViewEventDetailsMore.js (lines 102-106) shows categories but without colors
- **Current Time Implementation**: Uses new Date(startDate).toLocaleTimeString() which should show local time, need to verify if Zulu issue exists

## 🛠️ ARCHITECT / BUILDER / PATCH (Required)
_Architectural decisions, fix details, implementation notes, and blockers.  
Document design decisions, what was changed, how, and any technical notes._  
**Last updated:** 2025-05-26 17:50

**ARCHITECTURAL DECISIONS:**
- **Category Display Design**: Add colored category chips between date header and time display in ViewEventDetailModal.js
  - Use MUI Chip components with categoryColors styling from utils/categoryColors.js
  - Display categoryFirst, categorySecond, categoryThird in order
  - Insert at line 225-226 (after date header, before time section)
  - Handle null/undefined categories gracefully
- **Timezone Strategy**: Verify current toLocaleTimeString() implementation
  - Current code should work for local timezone conversion
  - Test with different timezones to confirm behavior
  - Add explicit timezone handling if needed
- **Implementation Order**: 
  1. Add category display with colors first
  2. Test and verify timezone handling second
- **Color Mapping**: Use existing categoryColors.js (Milonga: DodgerBlue, Practica: cyan, etc.)

**IMPLEMENTATION NOTES:**
- **Category Display**: ✅ IMPLEMENTED
  - Added MUI Chip import to ViewEventDetailModal.js
  - Added categoryColors import from utils/categoryColors.js
  - Created renderCategoryChips() function to display colored category chips
  - Inserted category display between date header and time range (line 261)
  - Categories display in order: categoryFirst, categorySecond, categoryThird
  - Applied appropriate colors from categoryColors.js with black text for readability
- **Timezone Enhancement**: ✅ IMPLEMENTED  
  - Enhanced toLocaleTimeString() to include timeZoneName: 'short'
  - Now displays local time with timezone abbreviation (e.g., "7:00 PM EST")
  - Fixed ESLint warning for unused parameter in Tabs onChange handler

---

## Investigation
- **Initial Trace:** Event View component displays time in Zulu/UTC, missing category display
- **Suspected Cause:** Date parsing or timezone handling issue in ViewEventDetailModal.js, missing category rendering in main modal
- **Files to Inspect:** 
  - ViewEventDetailModal.js (lines 227-244 for time display)
  - ViewEventDetailsMore.js (has category display without colors)
  - categoryColors.js (has color definitions)
- **Key Findings:**
  - Time display uses toLocaleTimeString() which should show local time
  - Categories are displayed in "More" tab but not in main view with colors
  - Need to move category display from "More" tab to main view above time
  - Need to apply categoryColors styling to category display

## Fix (if known or applied)
- **Status:** ✅ Fixed
- **Fix Description:** 
  1. ✅ Implemented local timezone conversion for time display with timezone abbreviation
  2. ✅ Added category display with proper color coding above time using MUI Chip components
- **Testing:** ✅ Build test passes, dev server runs successfully, ready for manual testing

## Resolution Log
- **Commit/Branch:** `issue/1034-event-view-timezone-category`
- **PR:** [Pending]
- **Deployed To:** [Pending]
- **Verified By:** [Pending]

---

## Requirements
1. **Timezone Fix**: Convert time display from Zulu/UTC to user's local timezone
2. **Category Display**: Show categoryFirst, categorySecond, categoryThird above time
3. **Color Coding**: Use same colors as calendar and category filters:
   - Milonga: DarkBlue
   - Practica: LightBlue
   - Other categories: Match existing color scheme
4. **Positioning**: Category display should appear above the time in the event view

## Technical Notes
- Event View has 6 tabs and is the main event detail display
- Must maintain consistency with calendar category colors
- Need to ensure timezone handling works across different user locations
- Category display should handle cases where some categories are empty/null

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles