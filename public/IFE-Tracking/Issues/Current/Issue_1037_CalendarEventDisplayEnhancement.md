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

- [x] ✅ Investigate current event rendering implementation
- [x] ✅ Analyze space constraints for additional organizer text
- [x] ✅ Design layout for organizer short name integration
- [x] ✅ Implement organizer short name display in both calendar views
- [x] ✅ Test layout responsiveness and text overflow handling
- [x] ✅ Verify organizer short name field availability in event data
- [x] ✅ Ensure consistent styling with existing elements
- [x] ✅ Build and test implementation
- [ ] 📋 User testing and verification of visual display
- [ ] 📋 Ready for commit and documentation

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-06-08

🧭 **SCOUT MODE** - 2025-06-08T17:37:00.000Z

**Investigation Complete:**
- Event rendering in `src/app/calendar/page.js` renderEventContent function (lines 106-208)
- Current flex row layout: TimeBlock (variable) + CategoryCircles (~22px) + 4px/8px gaps
- Monthly view more constrained: 0.65rem font, 4px gap, 2px padding
- List view more spacious: 0.75rem font, 8px gap, 4px padding
- CategoryCircles: Fixed width ~22px (8px+6px+6px+margins), flexShrink: 0
- ✅ `ownerOrganizerShortName` field confirmed in event data
- ⚠️ Space constraints require text truncation for organizer names
- ⚠️ Monthly view time block lacks flexShrink: 0 protection

## 🤔 ARCHITECT (Required)
_Design decisions, technical architecture, and implementation strategy._  
**Last updated:** 2025-06-08

🤔 **ARCHITECT MODE** - 2025-06-08T17:38:00.000Z

**Layout Design Solution:**

**Responsive Layout Strategy:**
```
[TimeBlock][CategoryCircles][OrganizerName]
```

**Priority Order (flex-shrink values):**
1. **CategoryCircles**: `flexShrink: 0` (fixed width, never compress)
2. **TimeBlock**: `flexShrink: 0` (essential time info, protect from compression)  
3. **OrganizerName**: `flexShrink: 1` (allow compression, implement truncation)

**Implementation Approach:**

**Monthly View Design:**
- Add organizer with `fontSize: '0.55rem'` (smaller than time)
- Use `maxWidth: '60px'`, `textOverflow: 'ellipsis'`, `overflow: 'hidden'`
- Style: `fontWeight: 'bold'`, `color: '#666'` for distinction

**List View Design:**
- Add organizer with `fontSize: '0.65rem'` (smaller than time)
- Use `maxWidth: '80px'`, `textOverflow: 'ellipsis'`, `overflow: 'hidden'`
- Style: `fontWeight: 'bold'`, `color: '#666'` for distinction

**Flex Layout Enhancements:**
- Ensure TimeBlock has `flexShrink: 0` in both views
- Add organizer as third flex item with controlled width
- Maintain existing gap spacing (4px Monthly, 8px List)

**Data Access:**
- Use `event.extendedProps.ownerOrganizerShortName`
- Fallback to first 8 chars of `ownerOrganizerName` if short name unavailable
- Handle null/undefined cases gracefully

**Styling Consistency:**
- Use consistent color scheme for organizer text
- Ensure sufficient contrast for readability
- Maintain visual hierarchy: Time (primary) → Circles → Organizer (secondary)

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2025-06-08

🧰 **BUILDER MODE** - 2025-06-08T18:16:00.000Z

**Implementation Complete:**

**Changes Made:**
1. **Data Access**: Added organizer short name extraction with fallback logic
   ```javascript
   const organizerShort = event.extendedProps?.ownerOrganizerShortName || 
                          event.extendedProps?.ownerOrganizerName?.substring(0, 8) || 
                          '';
   ```

2. **Monthly View Enhancement**: Added organizer display with constraints
   - Font size: `0.55rem` (smaller than time)
   - Max width: `60px` with ellipsis truncation
   - Color: `#666` for visual distinction
   - Added `flexShrink: 0` to time block for layout protection

3. **List View Enhancement**: Added organizer display with more space
   - Font size: `0.65rem` (smaller than time) 
   - Max width: `80px` with ellipsis truncation
   - Color: `#666` for visual distinction
   - Maintained existing `flexShrink: 0` on time block

**Layout Structure:**
- **Row 1**: TimeBlock + CategoryCircles + OrganizerShortName
- **Row 2**: Event Title (unchanged)

**Build Verification**: ✅ Successful compilation
**Technical Notes**:
- Conditional rendering prevents empty organizer divs
- Defensive coding handles missing organizer data
- Consistent styling between both calendar views
- No breaking changes to existing layout

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