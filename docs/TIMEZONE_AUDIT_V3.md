# Timezone Audit - Complete Component Map (TIEMPO-247)
## Audit Date: 2025-08-17
## Auditor: Scout Mode

---

## Executive Summary

### Critical Finding
**16+ Major Timezone Bugs Across 5 Architectural Layers**

The codebase has systemic timezone issues with `new Date()` usage in 30+ files and missing FullCalendar timezone configuration. Previous attempts failed due to incomplete system mapping and piecemeal fixes.

### Root Cause
- No single source of truth for timezone handling
- Browser timezone conversions throughout codebase
- Missing critical FullCalendar timezone configuration
- Inconsistent date/time formatting approaches

---

## Files Requiring Updates

### 🔴 CRITICAL - Infrastructure Layer (Blocks ALL Events)

#### 1. src/app/calendar/page.js
**Lines with Issues:**
- Line 104-105: `new Date(startDate)` and `new Date(endDate)` for placeholders
- Line 117: `placeholder-${current.toISOString()}` 
- Line 119: `start: new Date(current)`
- Line 134-163: `formatTimeForMonthly()` and `formatTimeForListView()` use Date objects
- Line 511: `const eventDate = new Date(event.start)`
- Line 517: `const placeholderDate = new Date(placeholder.start)`
- Line 677-788: **MISSING** `timeZone` configuration in FullCalendar component
- Line 782, 784: `new Date()` for today/cellDate comparisons

**Fix Strategy:** 
- Add `timeZone="UTC"` to FullCalendar (LINE 681)
- Replace all Date() with string manipulation
- Use venueTimezone utilities for formatting

#### 2. src/app/utils/transformEvents.js
**Lines with Issues:**
- Line 299-309: `calculateDuration()` uses `new Date()` objects

**Fix Strategy:**
- Use string parsing to calculate duration
- Avoid Date objects completely

#### 3. src/app/hooks/useEvents.js
**Lines with Issues:**
- Line 209-211: Default date range using `new Date()`
- Line 212: `toISOString()` for date range
- Line 228: `timestamp: new Date().toISOString()`
- Line 270, 272: `toISOString()` conversions for API params
- Line 610, 843: `expiresAt` calculation with Date math
- Line 711, 714, 720, 723: `toISOString()` for event creation
- Line 936, 938, 944, 946: `toISOString()` for event updates

**Fix Strategy:**
- Keep toISOString() ONLY for API communication
- Never use for display purposes
- Use string manipulation for date ranges

---

### 🟡 HIGH PRIORITY - Display Components

#### 4. src/app/components/Modals/ViewEvents/ViewEventDetailModal.js
**Lines with Issues:**
- Line 323-328: `new Date(startDate).toLocaleDateString()` fallback
- Line 345-346: `new Date(startDate)` and `new Date(endDate)` for time formatting
- Line 437: Delete dialog date display (FIXED in current branch)

**Fix Strategy:**
- Use formatVenueDate() from utilities
- Remove Date() fallbacks

#### 5. src/app/components/Modals/CreateEvents/CreateEventDetailModal.js
**Lines with Issues:**
- Line 40, 42: `dayjs()` creates browser timezone
- Line 121-122: Default times using dayjs in browser timezone
- Line 341-342, 416-417: Date validation with `new Date()`

**Fix Strategy:**
- Configure dayjs with venue timezone
- Or replace with string-based defaults

#### 6. src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js
**Lines with Issues:**
- Line 221-222, 239-240: dayjs date comparisons

**Fix Strategy:**
- Use string comparison or configure dayjs

#### 7. src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js
**Lines with Issues:**
- Line 38, 237, 291: `new Date()` for date parsing
- Line 406: `new Date(trimmed + 'T00:00:00')`
- Line 415: `toISOString().slice(0, -1)`
- Line 481: `toLocaleDateString()` display

**Fix Strategy:**
- Use venue timezone for recurring event dates
- String manipulation for date handling

---

### 🟢 MEDIUM PRIORITY - Supporting Components

#### 8. src/app/components/Modals/ViewEvents/ViewEventDetailsOrganizer.js
**Lines with Issues:**
- Line 59-60, 165, 412, 418: Date display for organizer events

#### 9. src/app/components/Modals/ViewEvents/ViewEventDetailsVenue.js
**Lines with Issues:**
- Line 361, 370: `toLocaleDateString()` for venue dates

#### 10. src/app/components/Modals/ViewEvents/ViewEventDetailsRepeating.js
**Lines with Issues:**
- Line 87, 111, 113, 155: Date parsing and display

#### 11. src/app/components/Modals/ViewEvents/ViewAIEventDetailsTab.js
**Lines with Issues:**
- Line 12-13, 37: Date formatting for AI events

#### 12. src/app/components/Modals/Venues/VenueUpcomingEvents.js
**Lines with Issues:**
- Line 33, 39, 113-114: Date comparisons and display

#### 13. src/app/components/Modals/Venues/VenueModalAdd.js
**Lines with Issues:**
- Line 189: `toISOString()` for override message

---

### ⚪ LOW PRIORITY - Non-Event Components

These components don't affect event display but should be fixed for consistency:

- src/app/explorer/page.js (Lines 91-92, 389)
- src/app/releases/page.js (Lines 31-32)
- src/app/migrated-organizers/page.js (Line 223)
- src/app/organizers/apply/components/tabs/YourStatusTab.js (Line 330)
- src/app/components/Modals/RegionalOrganizers/*.js
- src/app/components/UI/SiteMenuBarUserDrawer.js (Line 113)
- src/app/contexts/GeoLocationContext.js (Line 275)
- src/app/hooks/useActivityLogger.js (Lines 25, 79)
- src/app/utils/EventCreateRules.js (Line 10)

---

## Current Issues Summary

### 1. Browser Timezone Conversions (30+ locations)
Every `new Date()` converts to browser timezone, breaking venue display requirement.

### 2. Missing FullCalendar Configuration (MOST CRITICAL)
```javascript
// MISSING at line 677-788
<FullCalendar
  timeZone="UTC"  // THIS IS MISSING - CAUSES ALL EVENTS TO SHOW IN BROWSER TZ
  ...
/>
```

### 3. Inconsistent Date Formatting
- Some use Date.toLocaleDateString()
- Some use dayjs()
- Some use custom formatters
- No single source of truth

### 4. Event Creation in Wrong Timezone
CreateEventDetailModal uses browser timezone via dayjs(), creating events with wrong times.

### 5. Recurring Events Timezone Issues
RRULE handling doesn't account for venue timezone properly.

---

## Fix Strategy Overview

### Phase 1: Foundation (This Document)
✅ Complete audit of all timezone touchpoints
✅ Document every Date() usage
✅ Create comprehensive fix strategy

### Phase 2: Core Infrastructure
1. Add FullCalendar timezone config (CRITICAL)
2. Fix transformEvents.js completely
3. Fix useEvents.js hook
4. Test core functionality

### Phase 3: Display Components
1. Work through each component systematically
2. Replace all Date() with venueTimezone utilities
3. Test each component individually

### Phase 4: Complex Cases
1. Recurring events with RRULE
2. DST transitions
3. All-day events
4. Multi-day events

### Phase 5: Validation
1. Integration testing
2. Multi-timezone testing
3. Performance validation

---

## Testing Requirements

### For Each Component Fix:
1. Display shows venue time (not browser)
2. Timezone abbreviation visible
3. No Date() conversions for display
4. Fallback works for missing data

### Integration Tests:
1. User in Tokyo views NYC event → Shows NYC time
2. User in London creates LA event → Saves as LA time
3. Recurring event through DST → Maintains venue time

---

## Definition of Done

- [ ] ALL 30+ files updated
- [ ] Zero Date() usage for display purposes
- [ ] FullCalendar configured with timeZone="UTC"
- [ ] All components use venueTimezone.js utilities
- [ ] Integration tests pass
- [ ] No browser timezone leakage

---

## Next Steps

1. **Get Strategic Advisor Review** of this audit
2. **Create test plan** before coding
3. **Begin Phase 2** with infrastructure fixes
4. **Test each fix** before proceeding

---

## CRITICAL NOTES

⚠️ **DO NOT START CODING** until this audit is reviewed and approved
⚠️ **FIX INFRASTRUCTURE FIRST** before any display components  
⚠️ **TEST EACH FIX** individually before moving to next
⚠️ **NO PARTIAL FIXES** - complete each component fully

---

*End of Audit Document*