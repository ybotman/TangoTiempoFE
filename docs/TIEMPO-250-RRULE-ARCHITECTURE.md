# TIEMPO-250: Monthly RRULE Full Fix Architecture

## Branch: `feature/TIEMPO-250-monthly-rrule-full-fix`

## Executive Summary

Re-enable monthly recurrence with comprehensive fixes for US timezone handling, UNTIL/COUNT validation, and BYDAY case sensitivity.

## Current State Analysis

### What's Working
- Weekly RRULE recurrence (FREQ=WEEKLY, BYDAY=MO,TU,WE)
- Venue timezone display (venueStartDisplay, venueEndDisplay, venueTZ, venueAbbr)
- Exclude dates (EXDATE) for recurring events
- Duration calculation for overnight events

### What's Broken/Disabled
1. **Monthly recurrence DISABLED** - Intentionally locked out after TIEMPO-180
2. **UNTIL validation bug** - Regex expects Z suffix but code generates without it
3. **BYDAY case sensitivity** - Monthly parsing converts to lowercase (th) but rrule.js may need uppercase (TH)

### All-Day & Multi-Day Events
- **All-Day**: Partially implemented (placeholders use it, view modal reads it, CREATE doesn't support it)
- **Multi-Day**: Limited support (overnight crossing works, 7-day max enforced)
- **Recommendation**: NOT NEEDED for tango events - defer to future if requested

## Architecture Design

### Phase 1: Fix Validation & Case Sensitivity (LOW RISK)

**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js`

**Fix 1.1**: UNTIL validation regex (line 332)
```javascript
// BEFORE (broken - requires Z suffix):
if (untilMatch && !/^\d{8}T\d{6}Z$/.test(untilMatch[1])) {

// AFTER (accepts both with and without Z):
if (untilMatch && !/^\d{8}T\d{6}Z?$/.test(untilMatch[1])) {
```

**File**: `src/app/utils/transformEvents.js`

**Fix 1.2**: BYDAY case sensitivity for monthly (lines 253-254)
```javascript
// BEFORE (lowercase - may not work with rrule.js):
rruleObj.bysetpos = positionalDays.map(pd => pd.pos);
rruleObj.byweekday = positionalDays.map(pd => pd.day);

// AFTER (uppercase - matches RFC 5545 and rrule.js):
rruleObj.bysetpos = positionalDays.map(pd => pd.pos);
rruleObj.byweekday = positionalDays.map(pd => pd.day.toUpperCase());
```

### Phase 2: Re-Enable Monthly Recurrence (MEDIUM RISK)

**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js`

**Change 2.1**: Remove forced weekly conversion (line 208)
```javascript
// BEFORE:
const initialType = eventData.recurrenceType === 'monthly' ? 'weekly' : (eventData.recurrenceType || 'weekly');

// AFTER:
const initialType = eventData.recurrenceType || 'weekly';
```

**Change 2.2**: Remove early return in handler (lines 268-271)
```javascript
// REMOVE these lines:
if (e.target.value === 'monthly') {
  return;
}
```

**Change 2.3**: Enable monthly MenuItem (line 466)
```javascript
// BEFORE:
<MenuItem value="monthly" disabled>

// AFTER:
<MenuItem value="monthly">
```

**Change 2.4**: Remove/update warning banner (lines 491-495)
- Either remove completely OR change to "Beta" notice

### Phase 3: US Timezone Handling for RRULE (MEDIUM RISK)

**Ensure DTSTART uses venue timezone**:
- DTSTART should NOT have Z suffix (local time)
- FullCalendar + rrule.js handles DST automatically when given local times

**File**: `src/app/utils/transformEvents.js`

Verify `parseRRuleToObject` (line 220):
```javascript
// Current (correct approach):
dtstart: startDate  // Uses venue display time without Z suffix
```

**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js`

Verify `dateToRRuleFormat` (line 286-294):
```javascript
// Current generates without Z suffix (correct for venue local time):
return `${year}${month}${day}T235959`;  // No Z = local time
```

### Phase 4: Edge Case Testing (VALIDATION)

**US Monthly Edge Cases to Test**:
| Pattern | RRULE | Test Date | Expected Result |
|---------|-------|-----------|-----------------|
| 2nd Saturday | FREQ=MONTHLY;BYDAY=2SA | Dec 2025 | Dec 13, 2025 |
| Last Friday | FREQ=MONTHLY;BYDAY=-1FR | Dec 2025 | Dec 26, 2025 |
| 1st Monday | FREQ=MONTHLY;BYDAY=1MO | Dec 2025 | Dec 1, 2025 |
| DST Transition | Weekly across Nov 2/3 2025 | Verify time stays consistent |

**COUNT Mode Tests**:
- Weekly COUNT=4: Should show exactly 4 occurrences
- Monthly COUNT=6: Should show exactly 6 occurrences

**UNTIL Mode Tests**:
- Weekly UNTIL=20251231: Should stop at Dec 31, 2025
- Monthly UNTIL=20260601: Should stop at Jun 1, 2026

## File Changes Summary

| File | Changes | Risk |
|------|---------|------|
| `CreateEventDetailsRepeating.js` | Fix regex, remove disabling code | Low-Medium |
| `transformEvents.js` | Fix BYDAY case, verify DTSTART | Low |
| Tests (if exist) | Add monthly test cases | None |

## Acceptance Criteria

- [ ] Monthly recurrence option enabled in UI
- [ ] 2nd Saturday pattern creates correct RRULE
- [ ] Last Friday pattern creates correct RRULE
- [ ] UNTIL date saves without validation warning
- [ ] COUNT saves correctly
- [ ] Monthly events display on correct days in calendar
- [ ] No console errors for monthly RRULE parsing
- [ ] Weekly recurrence still works (regression check)

## Rollback Plan

If monthly causes issues:
1. Revert MenuItem to `disabled`
2. Re-add early return in handler
3. Monthly was working with weekly as fallback before

## Out of Scope (Deferred)

- All-day event toggle in CREATE modal
- Multi-day festival events (>24 hours)
- International timezone support beyond US
- Individual occurrence modifications (TIEMPO-281)
