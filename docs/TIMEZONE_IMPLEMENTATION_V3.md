# Venue Timezone Implementation Design v3
## TIEMPO-246: Complete Implementation Strategy
## Date: 2025-08-17
## Branch: feature/TIEMPO-246-venue-timezone-v3

---

## Mission Statement

**Display ALL event times in the VENUE's local timezone, NOT the browser's timezone**

### Success Criteria
- User in Tokyo viewing NYC event sees "7:00 PM EDT" 
- NOT "8:00 AM JST" (browser conversion)
- NOT "8:00 AM" (missing timezone)

---

## Architecture Design

### 1. Data Flow

```
Backend (CALBE-43)          Frontend (TIEMPO-246)
       ↓                            ↓
Provides display object     Never uses Date() for display
       ↓                            ↓
{                           venueTimezone.js utilities
  displayStartTime,                 ↓
  displayEndTime,           String manipulation only
  timezoneAbbr,                    ↓
  venueTimezone             Display: "7:00 PM EDT"
}
```

### 2. Key Design Principles

1. **Single Source of Truth**: `venueTimezone.js` utilities handle ALL timezone display
2. **No Date() Objects**: String manipulation only for display times
3. **UTC for Storage**: Backend times stored in UTC, display times pre-calculated
4. **Fallback Strategy**: UTC display for events without venue timezone data

### 3. Component Hierarchy

```
FullCalendar (timeZone="UTC")
     ↓
transformEvents.js (no Date())
     ↓
Event Display Components
     ↓
venueTimezone.js utilities
```

---

## Implementation Phases

### ✅ Phase 1: Foundation & Audit (COMPLETE)
- Mapped 30+ files with timezone issues
- Identified 16 major bugs
- Created comprehensive audit document
- **Deliverable**: `docs/TIMEZONE_AUDIT_V3.md`

### ✅ Phase 2: Core Infrastructure (COMPLETE)
Fixed 3 critical infrastructure components:

1. **FullCalendar Configuration**
   ```javascript
   // Line 681 in calendar/page.js
   <FullCalendar
     timeZone="UTC"  // CRITICAL: Prevents browser conversion
     ...
   />
   ```

2. **calculateDuration() Function**
   ```javascript
   // transformEvents.js - String-based calculation
   function calculateDuration(startDate, endDate) {
     // No Date() objects - string parsing only
   }
   ```

3. **useEvents.js Hook**
   - Preserved toISOString() for API communication
   - Identified real issue in CreateEventDetailModal

### 🔄 Phase 3: Display Components (IN PROGRESS)
Priority order for fixes:

1. **CreateEventDetailModal.js** - Events created in browser TZ
2. **ViewEventDetailModal.js** - Date() in fallbacks
3. **calendar/page.js** - Placeholder generation
4. **CreateEventDetailsRepeating.js** - Recurring events
5. Supporting components

### ⏳ Phase 4: Complex Cases (PENDING)
- Recurring events with RRULE
- DST transitions
- All-day events
- Multi-day events

### ⏳ Phase 5: Validation (PENDING)
- Integration testing
- Multi-timezone testing
- Performance validation

---

## Technical Implementation Details

### venueTimezone.js Utilities

```javascript
// Core utilities for venue timezone display
export function formatVenueTime(timeString, timezoneAbbr)
export function formatVenueTimeRange(startTime, endTime, timezoneAbbr)
export function getEventDisplayTimes(event)
export function formatVenueDate(dateString)
export function shouldUseVenueTimezone(event)
```

### Critical Functions

1. **NO Date() Constructor**
   ```javascript
   // ❌ WRONG
   new Date(startDate).toLocaleDateString()
   
   // ✅ CORRECT
   formatVenueDate(startDate)
   ```

2. **String Manipulation Only**
   ```javascript
   // Parse time without Date object
   const [datePart, timePart] = timeString.split('T');
   const [hour, minute] = timePart.split(':');
   ```

3. **Timezone Display**
   ```javascript
   // Always show venue timezone
   `${displayHour}:${minute} ${ampm} ${timezoneAbbr}`
   ```

---

## Known Issues & Solutions

### Issue 1: FullCalendar Missing Config
**Solution**: Added `timeZone="UTC"` (Phase 2 ✅)

### Issue 2: Date() Throughout Codebase
**Solution**: Systematic replacement with utilities (Phase 3)

### Issue 3: Event Creation in Browser TZ
**Solution**: Fix CreateEventDetailModal dayjs usage (Phase 3)

### Issue 4: Recurring Events
**Solution**: RRULE handling with venue timezone (Phase 4)

---

## Testing Strategy

### Unit Tests (Per Component)
1. Display shows venue time
2. Timezone abbreviation visible
3. No Date() conversions
4. Fallback works

### Integration Tests
1. **Tokyo → NYC Test**
   - User timezone: Asia/Tokyo
   - Event venue: America/New_York
   - Must display: "7:00 PM EDT"

2. **DST Transition Test**
   - Event during DST change
   - Maintains venue time

3. **Recurring Event Test**
   - Weekly event through DST
   - Each occurrence shows correct venue time

---

## Progress Tracking

| Phase | Status | Completion | JIRA |
|-------|--------|------------|------|
| Phase 1 | ✅ Complete | 100% | TIEMPO-247 |
| Phase 2 | ✅ Complete | 100% | TIEMPO-248 |
| Phase 3 | 🔄 In Progress | 0% | TIEMPO-249 |
| Phase 4 | ⏳ Pending | 0% | TIEMPO-250 |
| Phase 5 | ⏳ Pending | 0% | TIEMPO-251 |

### Bug Fix Progress: 3/16 (19%)
- ✅ FullCalendar config
- ✅ calculateDuration()
- ✅ useEvents.js (partial)
- ⏳ 13 more to fix

---

## Migration Strategy

### Backward Compatibility
- Events with `hasVenueTimezone: true` use venue display
- Events without fallback to UTC display
- No data migration required

### Rollout Plan
1. Deploy with feature flag
2. Test with subset of users
3. Monitor for timezone issues
4. Full rollout

---

## Success Metrics

1. **Zero browser timezone conversions**
2. **All 16 bugs fixed**
3. **Consistent timezone display**
4. **Performance maintained** (<200ms)
5. **Works globally** (any user TZ → any venue TZ)

---

## Key Files Reference

### Core Infrastructure
- `src/app/calendar/page.js` - FullCalendar component
- `src/app/utils/transformEvents.js` - Event transformation
- `src/app/hooks/useEvents.js` - Event data hook

### Utilities
- `src/app/utils/venueTimezone.js` - Timezone utilities

### Display Components
- `src/app/components/Modals/ViewEvents/ViewEventDetailModal.js`
- `src/app/components/Modals/CreateEvents/CreateEventDetailModal.js`
- Additional 28+ files (see TIMEZONE_AUDIT_V3.md)

---

## Lessons from Failed Attempts

### Attempt 1 Failed Because:
- Created stripTimezoneIndicator() that converted TO browser timezone
- Incomplete implementation
- Never found FullCalendar config issue

### Attempt 2 Failed Because:
- Only fixed 3 of 16 bugs
- Didn't follow systematic approach
- Stopped before completing infrastructure

### This Attempt Will Succeed Because:
- Complete audit before coding
- Phased approach with validation
- Strategic advisor oversight
- Test at each phase

---

## Next Immediate Actions

1. **Test Phase 2** - Verify Tokyo → NYC display
2. **Begin Phase 3** - Fix CreateEventDetailModal
3. **Update JIRA** - Document progress in TIEMPO-249

---

*Document prepared by: Barney (AI Agent)*
*Reviewed by: Widget (Strategic Advisor)*
*Mission: Display events in venue timezone only*