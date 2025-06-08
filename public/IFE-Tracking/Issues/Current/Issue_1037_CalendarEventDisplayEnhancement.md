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
- [x] ✅ User testing and verification of visual display
- [x] ✅ Ready for commit and documentation
- [x] ✅ Testing passed - approved by user
- [x] ✅ Implementation complete and verified
- [x] ✅ Add shortTitle to first row layout
- [x] ✅ Adjust font sizes: larger first row, smaller second row
- [x] ✅ Update layout: TimeBlock + CircleBlock + OrganizerShortName + shortTitle → title
- [x] ✅ Implement 4-element Row 1 with space optimization
- [x] ✅ Font size inversion: Row 1 larger (0.65-0.8rem), Row 2 smaller (0.65-0.7rem)
- [x] ✅ Build verification successful
- [ ] 📋 User testing and verification of enhanced display

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-06-08

🧭 **SCOUT MODE** - 2025-06-08T17:37:00.000Z (Updated: 2025-06-08T18:25:00.000Z)

**Investigation Complete:**
- Event rendering in `src/app/calendar/page.js` renderEventContent function (lines 106-208)
- Current Row 1 layout: TimeBlock (~40-50px) + CategoryCircles (~22px) + OrganizerShort (60px/80px)
- Monthly view constraints: 0.65rem time, 0.55rem organizer, 4px gap, 2px padding
- List view spacious: 0.75rem time, 0.65rem organizer, 8px gap, 4px padding
- Row 2 currently: Title (0.75rem) - larger than Row 1 elements
- ✅ `shortTitle` field confirmed available in event data
- ⚠️ Space critical: Adding 4th element to Row 1 requires aggressive truncation
- ⚠️ Font size inversion needed: Row 1 larger, Row 2 smaller

## 🤔 ARCHITECT (Required)
_Design decisions, technical architecture, and implementation strategy._  
**Last updated:** 2025-06-08

🤔 **ARCHITECT MODE** - 2025-06-08T17:38:00.000Z (Enhanced: 2025-06-08T18:26:00.000Z)

**Enhanced Layout Design Solution:**

**New 4-Element Layout Strategy:**
```
Row 1: [TimeBlock][CategoryCircles][OrganizerName][shortTitle] (LARGER FONTS)
Row 2: [title] (SMALLER FONT)
```

**Priority Order (flex-shrink values):**
1. **CategoryCircles**: `flexShrink: 0` (fixed width, never compress)
2. **TimeBlock**: `flexShrink: 0` (essential time info, protect from compression)  
3. **OrganizerName**: `flexShrink: 1` (allow moderate compression)
4. **shortTitle**: `flexShrink: 2` (most aggressive compression, primary truncation target)

**Font Size Strategy (Inverted):**
**Row 1 Enhancement (Larger):**
- Monthly: Increase from 0.55-0.65rem → 0.7-0.75rem range
- List: Increase from 0.65-0.75rem → 0.8-0.85rem range

**Row 2 Reduction (Smaller):**
- Monthly: Reduce from 0.75rem → 0.65rem
- List: Reduce from 0.75rem → 0.7rem

**Space-Optimized Implementation:**

**Monthly View Design (Ultra-Constrained):**
- TimeBlock: `fontSize: '0.7rem'`, `flexShrink: 0`
- CategoryCircles: Fixed width ~22px
- OrganizerName: `fontSize: '0.65rem'`, `maxWidth: '45px'` (reduced)
- shortTitle: `fontSize: '0.65rem'`, `maxWidth: '50px'`, `flexShrink: 2`
- Gap reduced: `3px` (from 4px)

**List View Design (More Space):**
- TimeBlock: `fontSize: '0.8rem'`, `flexShrink: 0`
- CategoryCircles: Fixed width ~22px  
- OrganizerName: `fontSize: '0.75rem'`, `maxWidth: '60px'`
- shortTitle: `fontSize: '0.75rem'`, `maxWidth: '80px'`, `flexShrink: 2`
- Gap maintained: `8px`

**Data Access Strategy:**
```javascript
const organizerShort = event.extendedProps?.ownerOrganizerShortName || 
                      event.extendedProps?.ownerOrganizerName?.substring(0, 8) || '';
const eventShortTitle = event.extendedProps?.shortTitle || 
                       event.title?.substring(0, 15) || '';
```

**Responsive Truncation Rules:**
- OrganizerName: Ellipsis after maxWidth
- shortTitle: Ellipsis after maxWidth, highest compression priority
- Row 2 title: Becomes secondary, smaller display

**Visual Hierarchy (Enhanced):**
1. **Row 1**: Primary information display (larger, bold)
2. **Row 2**: Supporting information (smaller, secondary)

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2025-06-08

🧰 **BUILDER MODE** - 2025-06-08T18:35:00.000Z (Enhanced Implementation)

**Enhanced 4-Element Implementation Complete:**

**Changes Made:**
1. **Enhanced Data Access**: Added shortTitle extraction with fallbacks
   ```javascript
   const organizerShort = event.extendedProps?.ownerOrganizerShortName || 
                          event.extendedProps?.ownerOrganizerName?.substring(0, 8) || '';
   const eventShortTitle = event.extendedProps?.shortTitle || 
                          event.title?.substring(0, 15) || '';
   ```

2. **Monthly View Enhancement (4-Element + Font Inversion)**:
   - **Row 1**: TimeBlock (0.7rem) + CategoryCircles + OrganizerShort (0.65rem, 45px) + shortTitle (0.65rem, 50px)
   - **Row 2**: Title (0.65rem, reduced from 0.75rem, color: #555)
   - Gap reduced to `3px` for space optimization
   - shortTitle has `flexShrink: 2` for aggressive compression

3. **List View Enhancement (4-Element + Font Inversion)**:
   - **Row 1**: TimeBlock (0.8rem) + CategoryCircles + OrganizerShort (0.75rem, 60px) + shortTitle (0.75rem, 80px)
   - **Row 2**: Title (0.7rem, reduced from 0.75rem, color: #555)
   - Gap maintained at `8px`
   - shortTitle has `flexShrink: 2` for primary compression

**New Layout Structure:**
- **Row 1**: TimeBlock + CategoryCircles + OrganizerShortName + **shortTitle** (LARGER FONTS)
- **Row 2**: Event Title (SMALLER FONT)

**Font Size Inversion Achieved**:
- Row 1 fonts increased: 0.65-0.8rem range
- Row 2 font decreased: 0.65-0.7rem range
- Visual hierarchy inverted as requested

**Build Verification**: ✅ Successful compilation
**Technical Notes**:
- 4-element Row 1 with aggressive space management
- Defensive coding handles missing shortTitle data
- Color differentiation: shortTitle (#444), organizer (#666), title (#555)
- Flex-shrink priorities manage space pressure effectively

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
- **Status:** 🔄 **REOPENED** - Enhancement request for shortTitle addition
- **Fix Description:** 
  - Modify renderEventContent function to include ownerOrganizerShortName in first row
  - Ensure responsive layout handles text overflow appropriately
  - Maintain consistent styling with existing time and category elements
- **Testing:** 
  - Verify display in both Monthly and List views
  - Test with various organizer name lengths
  - Confirm no layout breaking on small screens

## Resolution Log
- **Previous Commits:** ✅ Committed to DEVL branch (commits: 0ba168d, 4a6fa57)
- **Deployed To:** ✅ TEST and PROD branches
- **Issue Status:** 🔄 **REOPENED** - Enhancement request
- **Enhancement Request:** Add shortTitle to Row 1, adjust font sizes
- **New Layout:** TimeBlock + CircleBlock + OrganizerShortName + shortTitle → title (smaller)

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1037_CalendarEventDisplayEnhancement.md` and move to `/public/IFE-Tracking/Issues/completed/` when resolved.

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles