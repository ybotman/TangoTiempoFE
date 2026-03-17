# TIEMPO-362: Instance Overrides for Recurring Events

**Author**: Sarah (TangoTiempo Agent)
**Date**: 2026-03-16
**Status**: DRAFT - Awaiting Approval
**JIRA Epic**: TIEMPO-350 (Recurring Event Instance Overrides)
**JIRA Backend**: TIEMPO-362 (Fulton - Schema & API)
**JIRA Frontend**: TBD (Sarah - UI/UX)
**Related**: TIEMPO-250 (RRULE), TIEMPO-281 (deferred)

---

## Executive Summary

Enable single-instance modifications to recurring events. Users can:
- **Cancel** a specific occurrence (e.g., "No milonga on March 25th")
- **Modify** a specific occurrence (e.g., "Guest DJ on April 8th", "Different venue on May 2nd")

**Architecture Decision**: Uses **embedded `instanceOverrides[]` array** in master event document (per TIEMPO-362 spec). Backend expansion applies overrides during RRULE expansion.

---

## Table of Contents

1. [User Stories](#user-stories)
2. [UI/UX Design](#uiux-design)
3. [Data Model](#data-model)
4. [Backend API Changes](#backend-api-changes)
5. [GET Events Behavior](#get-events-behavior)
6. [Timezone/DST Handling](#timezonedst-handling)
7. [Frontend Implementation](#frontend-implementation)
8. [Migration & Backward Compatibility](#migration--backward-compatibility)
9. [Testing Plan](#testing-plan)
10. [Implementation Phases](#implementation-phases)

---

## User Stories

### US-1: Cancel Single Occurrence
> As an organizer, I want to cancel a single date of my weekly milonga (e.g., holiday closure) without canceling the entire series.

### US-2: Modify Occurrence Description
> As an organizer, I want to add a note to a specific occurrence (e.g., "Live orchestra tonight!") without changing all occurrences.

### US-3: Change DJ for One Night
> As an organizer, I want to assign a guest DJ to one specific occurrence without changing the regular DJ assignment.

### US-4: Different Time One Night
> As an organizer, I want to change the start time for a specific occurrence (e.g., "Starting early on NYE").

### US-5: View Occurrence Status
> As a dancer, I want to see when a recurring event has exceptions (modified or canceled dates).

---

## UI/UX Design

### Current State (As-Is)
```
User clicks recurring event occurrence
        ↓
ViewEventDetailModal opens
        ↓
Shows master event data (same for ALL occurrences)
        ↓
[Edit] → Edits ALL occurrences
[Delete] → Deletes ENTIRE series
```

### Target State (To-Be)

#### Flow 1: Click on Recurring Event Occurrence

```
User clicks recurring event occurrence (e.g., March 25th instance)
        ↓
┌────────────────────────────────────────────────────────┐
│  ViewEventDetailModal                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🔄 Weekly Milonga at Club Tango                  │  │
│  │ THIS OCCURRENCE: Tuesday, March 25, 2026         │  │
│  │ 8:00 PM - 11:30 PM                               │  │
│  │                                                  │  │
│  │ [📅 See All Dates]  [ℹ️ Series Info]            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Tabs: [Basic] [Venue] [Organizer] [🔄 Repeating]     │
│                                                        │
│  ┌─ Actions ─────────────────────────────────────────┐ │
│  │  [Edit This Date ▾]  [Share]  [Delete ▾]          │ │
│  │       │                            │               │ │
│  │       ↓                            ↓               │ │
│  │  ┌──────────────┐            ┌──────────────┐      │ │
│  │  │ Edit This    │            │ Cancel This  │      │ │
│  │  │ Occurrence   │            │ Occurrence   │      │ │
│  │  ├──────────────┤            ├──────────────┤      │ │
│  │  │ Edit All     │            │ Delete       │      │ │
│  │  │ Occurrences  │            │ Entire Series│      │ │
│  │  └──────────────┘            └──────────────┘      │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

#### Flow 2: Cancel This Occurrence (Quick Action)

```
User selects "Cancel This Occurrence"
        ↓
┌─────────────────────────────────────────┐
│  Cancel Occurrence                       │
│                                         │
│  Are you sure you want to cancel:       │
│  Weekly Milonga at Club Tango           │
│  on Tuesday, March 25, 2026?            │
│                                         │
│  ○ Just cancel (no message)             │
│  ● Add cancellation reason:             │
│    ┌────────────────────────────────┐   │
│    │ Closed for Easter holiday      │   │
│    └────────────────────────────────┘   │
│                                         │
│  [Cancel] [Confirm Cancellation]        │
└─────────────────────────────────────────┘
        ↓
Backend: Add date to excludedDates + store cancellation reason
Calendar: Shows crossed-out event with "CANCELED" badge (optional)
```

#### Flow 3: Edit This Occurrence

```
User selects "Edit This Occurrence"
        ↓
┌─────────────────────────────────────────────────────────┐
│  Edit Occurrence: March 25, 2026                        │
│                                                         │
│  ⚠️ These changes apply ONLY to this date.              │
│     To edit all dates, choose "Edit All Occurrences"    │
│                                                         │
│  ┌─ What's different this date? ──────────────────────┐ │
│  │                                                     │ │
│  │  Description Override:                              │ │
│  │  ┌───────────────────────────────────────────────┐  │ │
│  │  │ Live orchestra featuring Sexteto Milonguero!  │  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  │  Time Change:  □ Different time this date          │ │
│  │                ┌────────┐ to ┌────────┐            │ │
│  │                │ 7:30pm │    │ 12:00am│            │ │
│  │                └────────┘    └────────┘            │ │
│  │                                                     │ │
│  │  DJ Override:  □ Different DJ this date            │ │
│  │                [Select DJ ▾]                        │ │
│  │                                                     │ │
│  │  Venue Change: □ Different venue this date         │ │
│  │                [Select Venue ▾]                     │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  [Cancel] [Save This Occurrence]                        │
└─────────────────────────────────────────────────────────┘
        ↓
Backend: Create exception record OR update existing exception
Calendar: Shows event with "MODIFIED" indicator
```

#### Flow 4: View Modified Occurrence

When an occurrence has modifications, the calendar and modal show it:

```
Calendar View:
┌─────────────────────────────────────────┐
│  Tuesday, March 25                      │
│  ┌────────────────────────────────────┐ │
│  │ 8:00pm  Weekly Milonga 🔄 ⚡       │ │  ← ⚡ indicates modification
│  │         "Live orchestra tonight!"  │ │  ← Override description shown
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘

ViewEventDetailModal for this occurrence:
┌─────────────────────────────────────────┐
│  Weekly Milonga at Club Tango 🔄 ⚡     │
│  THIS DATE: Tuesday, March 25           │
│                                         │
│  ┌─ THIS OCCURRENCE ──────────────────┐ │
│  │ ⚡ Modified from regular schedule  │ │
│  │                                    │ │
│  │ Special Note:                      │ │
│  │ "Live orchestra tonight!"          │ │
│  │                                    │ │
│  │ DJ: Guest - Carlos Gardel Jr.      │ │
│  │ (Regular: DJ Tango)                │ │
│  └────────────────────────────────────┘ │
│                                         │
│  [Edit This Date] [Revert to Regular]   │
└─────────────────────────────────────────┘
```

---

## Data Model (Per TIEMPO-362)

**Approach**: Embedded `instanceOverrides[]` array in master event document.

This was chosen for:
- Single document = atomic updates
- No orphaned exception events
- Simpler query pattern
- `expandRecurringEvent.js` applies overrides during expansion

### Schema (from TIEMPO-362)

```javascript
// events collection - master recurring event with overrides
{
  _id: ObjectId("abc123"),
  title: "Weekly Milonga at Club Tango",
  startDate: ISODate("2026-01-07T20:00:00Z"),
  endDate: ISODate("2026-01-08T00:30:00Z"),
  recurrenceRule: "FREQ=WEEKLY;BYDAY=TU;UNTIL=20261231T235959",
  isRepeating: true,

  // EXISTING: Simple date exclusions (used by FullCalendar EXDATE)
  excludedDates: [
    ISODate("2026-03-25T00:00:00Z"),
    ISODate("2026-12-24T00:00:00Z")
  ],

  // NEW: Instance-level overrides
  instanceOverrides: [
    {
      instanceKey: ISODate("2026-04-08T20:00:00Z"),  // Original occurrence datetime (venue TZ)
      overrideType: "modify",                         // "modify" | "cancel" | "restore"
      patch: {
        // Only changed fields
        notes: "Live orchestra featuring Sexteto Milonguero!",
        djId: ObjectId("guestDJ123"),
        djName: "Carlos Gardel Jr.",
        startDate: ISODate("2026-04-08T19:30:00Z"),  // Earlier start
        endDate: ISODate("2026-04-09T00:00:00Z")
      },
      modifiedBy: ObjectId("user456"),
      modifiedAt: ISODate("2026-03-15T10:00:00Z")
    },
    {
      instanceKey: ISODate("2026-03-25T20:00:00Z"),
      overrideType: "cancel",
      patch: {
        isCanceled: true,
        notes: "Closed for Easter holiday"
      },
      modifiedBy: ObjectId("user456"),
      modifiedAt: ISODate("2026-03-10T14:00:00Z")
    }
  ],

  // existing fields...
  venueID: ObjectId("venue123"),
  ownerOrganizerID: ObjectId("org456"),
  appId: 1
}
```

### Patch Fields (What Can Be Overridden)

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Override event title |
| `djId` | ObjectId | Different DJ for this date |
| `djName` | String | DJ name (denormalized) |
| `notes` | String | Special notes for this occurrence |
| `startDate` | Date | Different start time |
| `endDate` | Date | Different end time |
| `venueID` | ObjectId | Different venue |
| `cost` | String | Different pricing |
| `isCanceled` | Boolean | Mark as canceled |

### Key Design Points

1. **instanceKey** uses venue timezone datetime (not UTC) — matches RRULE expansion
2. **patch** only contains changed fields — empty fields inherit from master
3. **overrideType** distinguishes: `modify` (change fields), `cancel` (skip occurrence), `restore` (remove override)
4. **Audit trail** via `modifiedBy` and `modifiedAt`

---

## Backend API Changes (Per TIEMPO-362)

### New Endpoints (calendar-be-af - Fulton)

#### 1. Create/Update Override
```
POST /api/events/:eventId/override

Request:
{
  "instanceKey": "2026-04-08T20:00:00",  // Venue TZ datetime
  "overrideType": "modify",               // "modify" | "cancel" | "restore"
  "patch": {
    "notes": "Live orchestra tonight!",
    "djId": "guestDJ123",
    "djName": "Carlos Gardel Jr.",
    "startDate": "2026-04-08T19:30:00Z"
  }
}

Response:
{
  "success": true,
  "event": { ... updated event with instanceOverrides ... }
}

Backend Actions:
1. Validate eventId is a recurring event
2. Validate instanceKey matches a valid RRULE occurrence
3. Upsert override in instanceOverrides[] (update if exists, add if not)
4. Return updated event
```

#### 2. Delete Override (Restore to Regular)
```
DELETE /api/events/:eventId/override/:instanceKey

Response:
{
  "success": true,
  "message": "Occurrence restored to regular schedule"
}

Backend Actions:
1. Remove override from instanceOverrides[] where instanceKey matches
2. Return updated event
```

#### 3. List All Overrides for Series
```
GET /api/events/:eventId/overrides

Response:
{
  "overrides": [
    {
      "instanceKey": "2026-04-08T20:00:00",
      "overrideType": "modify",
      "patch": { ... },
      "modifiedBy": "user456",
      "modifiedAt": "2026-03-15T10:00:00Z"
    },
    ...
  ]
}
```

### Modified: expandRecurringEvent.js

Per TIEMPO-362, update expansion logic:

```javascript
function expandRecurringEvent(event, queryStart, queryEnd, venueTimezone) {
  // 1. Expand RRULE to occurrences
  const occurrences = expandRRule(event, queryStart, queryEnd);

  // 2. Apply overrides to each occurrence
  return occurrences.map(occurrence => {
    const override = event.instanceOverrides?.find(
      ov => isSameInstance(ov.instanceKey, occurrence.startDate, venueTimezone)
    );

    if (!override) {
      // Regular occurrence - no changes
      return { ...occurrence, _hasOverride: false };
    }

    if (override.overrideType === 'cancel') {
      // Canceled - skip OR include with flag (configurable)
      return {
        ...occurrence,
        _hasOverride: true,
        _overrideType: 'cancel',
        _isCanceled: true,
        notes: override.patch.notes  // Cancellation reason
      };
    }

    if (override.overrideType === 'modify') {
      // Modified - merge patch fields
      return {
        ...occurrence,
        ...override.patch,           // Apply overrides
        _hasOverride: true,
        _overrideType: 'modify'
      };
    }

    return occurrence;
  });
}
```

### GET /api/events Behavior

**Current**: Returns master recurring events (single doc per series), frontend expands

**With Overrides**: Two options for handling:

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Backend expansion** | FE gets ready-to-display data, overrides pre-applied | More backend compute, larger response | Better for calendar view |
| **Frontend expansion** | Keeps current pattern, smaller response | FE must apply overrides, more complex | Better for edit forms |

**Proposed**: Add `expand=true` query param
- `expand=false` (default): Current behavior, master events only
- `expand=true`: Backend expands and applies overrides

```
GET /api/events?startDate=2026-03-01&endDate=2026-03-31&expand=true&includeCanceled=false

Response:
{
  "events": [
    // Regular occurrence
    {
      "title": "Weekly Milonga",
      "startDate": "2026-03-04T20:00:00Z",
      "_isExpandedOccurrence": true,
      "_masterEventId": "abc123",
      "_hasOverride": false
    },
    // Modified occurrence
    {
      "title": "Weekly Milonga",
      "notes": "Live orchestra tonight!",
      "djName": "Carlos Gardel Jr.",
      "startDate": "2026-03-11T19:30:00Z",  // Override time
      "_isExpandedOccurrence": true,
      "_masterEventId": "abc123",
      "_hasOverride": true,
      "_overrideType": "modify"
    }
  ]
}
```

---

## GET Events Behavior

### Query Logic (Backend Expansion Approach)

```javascript
// In Events.js GET handler

async function getEventsWithExceptions(query, startDate, endDate) {
  // 1. Get non-recurring events in date range
  const regularEvents = await Event.find({
    ...query,
    isRepeating: { $ne: true },
    startDate: { $gte: startDate, $lte: endDate }
  });

  // 2. Get all recurring events (regardless of date)
  const recurringEvents = await Event.find({
    ...query,
    isRepeating: true,
    recurrenceRule: { $exists: true, $ne: '' }
  });

  // 3. Expand recurring events into occurrences
  const expandedOccurrences = [];
  for (const event of recurringEvents) {
    const occurrences = expandRRule(event, startDate, endDate);

    // Filter out excluded dates
    const filtered = occurrences.filter(occ =>
      !event.excludedDates?.some(ex => isSameDay(ex, occ.date))
    );

    expandedOccurrences.push(...filtered);
  }

  // 4. Get exception events in date range
  const exceptionEvents = await Event.find({
    ...query,
    isException: true,
    originalDate: { $gte: startDate, $lte: endDate }
  });

  // 5. Merge exceptions with occurrences
  const merged = mergeExceptionsIntoOccurrences(expandedOccurrences, exceptionEvents);

  // 6. Combine and sort
  return [...regularEvents, ...merged].sort((a, b) =>
    new Date(a.startDate) - new Date(b.startDate)
  );
}
```

### Frontend Handling

```javascript
// In transformEvents.js

function transformEvents(events) {
  return events.map(event => {
    const baseEvent = createBaseEvent(event);

    // Handle exception events
    if (event.isException) {
      return {
        ...baseEvent,
        className: 'event-exception',
        extendedProps: {
          ...baseEvent.extendedProps,
          isException: true,
          exceptionType: event.exceptionType,
          parentEventId: event.parentEventId,
          originalDate: event.originalDate
        }
      };
    }

    // Handle canceled occurrences (if included in response)
    if (event._isCanceled) {
      return {
        ...baseEvent,
        className: 'event-canceled',
        display: 'background',  // Or 'none' to hide completely
        extendedProps: {
          ...baseEvent.extendedProps,
          isCanceled: true,
          cancellationReason: event._cancellationReason
        }
      };
    }

    // Regular occurrence
    return baseEvent;
  });
}
```

---

## Timezone/DST Handling

### Critical Considerations

1. **Occurrence identification must use DATE only, not datetime**
   - Store `originalDate` as date-only or midnight UTC
   - Avoids DST ambiguity

2. **RRULE expansion respects venue timezone**
   - Existing implementation already handles this
   - Uses `venueTimezone` from event/venue

3. **Exception event times are absolute**
   - Store actual UTC start/end times
   - No RRULE interpretation needed for exceptions

### DST Edge Cases

```javascript
// Example: Weekly Tuesday event at 8pm in New York

// Regular Tuesday (EST - Winter)
// RRULE generates: 2026-01-07T20:00 EST = 2026-01-08T01:00Z

// After DST Spring Forward (EDT - Summer)
// RRULE generates: 2026-04-07T20:00 EDT = 2026-04-08T00:00Z

// Exception for April 7th stores absolute time:
{
  originalDate: "2026-04-07",  // Date-only identifies occurrence
  startDate: ISODate("2026-04-07T23:30:00Z"),  // 7:30pm EDT
}
```

### Implementation Rules

| Scenario | Storage Format | Notes |
|----------|----------------|-------|
| `originalDate` | `YYYY-MM-DD` or midnight UTC | Date-only, no time component |
| `excludedDates[]` | Midnight UTC for each date | Date-only comparison |
| Exception `startDate` | Full UTC datetime | Actual event start |
| RRULE `UNTIL` | Local time without Z | Venue timezone applies |

### Code Example (Backend)

```javascript
// Validate occurrence date matches a valid RRULE instance
function isValidOccurrenceDate(event, targetDate, venueTimezone) {
  const rule = RRule.fromString(event.recurrenceRule);

  // Get all occurrences (or within reasonable range)
  const startOfDay = moment.tz(targetDate, venueTimezone).startOf('day');
  const endOfDay = moment.tz(targetDate, venueTimezone).endOf('day');

  const occurrences = rule.between(
    startOfDay.toDate(),
    endOfDay.toDate(),
    true
  );

  return occurrences.length > 0;
}
```

---

## Frontend Implementation

### Component Changes

#### 1. ViewEventDetailModal.js

```javascript
// NEW: Import repeating tab
import ViewEventDetailsRepeating from './ViewEventDetailsRepeating';

// NEW: Track which occurrence was clicked
const [occurrenceDate, setOccurrenceDate] = useState(null);

// MODIFIED: handleOpen receives occurrence context
const handleOpen = (event) => {
  // Extract occurrence date from FullCalendar event
  if (event._instance?.range?.start) {
    setOccurrenceDate(event._instance.range.start);
  }
  // ... existing logic
};

// NEW: Add Repeating tab for recurring events
{eventDetails?.extendedProps?.isRecurring && (
  <Tab label="🔄 Repeating" value="repeating" />
)}

// NEW: Action dropdown for recurring events
{eventDetails?.extendedProps?.isRecurring && canEditEvent && (
  <OccurrenceActionMenu
    event={eventDetails}
    occurrenceDate={occurrenceDate}
    onCancelOccurrence={handleCancelOccurrence}
    onEditOccurrence={handleEditOccurrence}
    onEditSeries={handleEditClick}
  />
)}
```

#### 2. NEW: OccurrenceActionMenu.js

```javascript
// Dropdown menu for occurrence-specific actions

const OccurrenceActionMenu = ({ event, occurrenceDate, ...handlers }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Button onClick={(e) => setAnchorEl(e.currentTarget)}>
        Actions ▾
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)}>
        <MenuItem onClick={handlers.onEditOccurrence}>
          ✏️ Edit This Date Only
        </MenuItem>
        <MenuItem onClick={handlers.onEditSeries}>
          📝 Edit All Dates
        </MenuItem>
        <Divider />
        <MenuItem onClick={handlers.onCancelOccurrence}>
          ❌ Cancel This Date
        </MenuItem>
        <MenuItem onClick={handlers.onDeleteSeries}>
          🗑️ Delete Entire Series
        </MenuItem>
      </Menu>
    </>
  );
};
```

#### 3. NEW: EditOccurrenceModal.js

Simplified edit modal for single occurrence overrides:

```javascript
const EditOccurrenceModal = ({ open, parentEvent, occurrenceDate, onSave, onClose }) => {
  const [overrides, setOverrides] = useState({
    description: '',
    startTime: null,
    endTime: null,
    djOrganizerId: null,
    venueId: null
  });

  const handleSave = async () => {
    // Only send non-empty overrides
    const payload = Object.fromEntries(
      Object.entries(overrides).filter(([_, v]) => v != null && v !== '')
    );

    await createException(parentEvent._id, occurrenceDate, payload);
    onSave();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Typography variant="h6">
        Edit: {format(occurrenceDate, 'EEEE, MMMM d, yyyy')}
      </Typography>

      <Alert severity="info">
        Changes apply ONLY to this date. Regular schedule is unchanged.
      </Alert>

      <TextField
        label="Special description for this date"
        value={overrides.description}
        onChange={(e) => setOverrides({ ...overrides, description: e.target.value })}
        multiline
        rows={2}
      />

      <FormControlLabel
        control={<Checkbox checked={overrides.startTime != null} />}
        label="Different time this date"
      />
      {overrides.startTime != null && (
        <TimePickers value={overrides.startTime} onChange={...} />
      )}

      <FormControlLabel
        control={<Checkbox checked={overrides.djOrganizerId != null} />}
        label="Different DJ this date"
      />
      {overrides.djOrganizerId != null && (
        <DJSelector value={overrides.djOrganizerId} onChange={...} />
      )}

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save This Date
        </Button>
      </DialogActions>
    </Modal>
  );
};
```

#### 4. NEW: CancelOccurrenceDialog.js

```javascript
const CancelOccurrenceDialog = ({ open, event, occurrenceDate, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cancel This Occurrence?</DialogTitle>
      <DialogContent>
        <Typography>
          Cancel <strong>{event.title}</strong> on{' '}
          <strong>{format(occurrenceDate, 'EEEE, MMMM d, yyyy')}</strong>?
        </Typography>

        <TextField
          label="Reason (optional - shown to users)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Holiday closure"
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Keep Event</Button>
        <Button
          onClick={() => onConfirm(reason)}
          color="error"
          variant="contained"
        >
          Cancel This Date
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## Migration & Backward Compatibility

### Database Migration

No migration required for existing events:
- `excludedDates` already exists and is used
- New fields (`exceptionDates`, `isException`, `parentEventId`, `originalDate`) default to null/undefined
- Exception events are additive (new documents)

### API Compatibility

| Endpoint | Change | Backward Compatible? |
|----------|--------|---------------------|
| GET /api/events | Add `expand` query param | YES - default to current behavior |
| POST /api/events | No change | YES |
| PUT /api/events | No change | YES |
| POST /api/events/:id/cancel-occurrence | NEW endpoint | YES - additive |
| POST /api/events/:id/exception | NEW endpoint | YES - additive |

### Frontend Compatibility

- Existing events display normally
- Exception handling is additive
- No breaking changes to event data structure

---

## Testing Plan

### Unit Tests (Backend)

| Test Case | Expected Result |
|-----------|-----------------|
| Cancel occurrence on valid RRULE date | excludedDates updated, 200 OK |
| Cancel occurrence on invalid date | 400 Bad Request |
| Create exception on valid date | New exception event created |
| Create exception on already-excepted date | Exception updated (not duplicated) |
| Revert exception | Exception deleted, exceptionDates updated |
| Query events with exceptions | Exceptions merged into response |

### Integration Tests (E2E)

| Scenario | Steps | Expected |
|----------|-------|----------|
| Cancel weekly occurrence | Create weekly event → Cancel 1 date → Query events | Date missing from expansion |
| Modify occurrence | Create weekly → Edit 1 date description → View date | Shows override description |
| Revert modification | Modify → Revert → View | Shows original description |
| DST boundary | Weekly event → Modify date crossing DST → View times | Correct times displayed |

### Manual Testing Checklist

- [ ] Click on recurring event occurrence
- [ ] Modal shows correct occurrence date
- [ ] "Cancel This Date" workflow completes
- [ ] "Edit This Date" modal opens with correct date
- [ ] Save exception → calendar shows modification indicator
- [ ] Canceled date no longer appears in calendar
- [ ] Edit All Dates still works (no regression)
- [ ] Delete Series still works (no regression)

---

## Implementation Phases

### Phase 1: Cancel Occurrence (EXDATE Enhancement)
**Scope**: Add "Cancel This Date" to UI, store reason
**Backend**: New endpoint `POST /api/events/:id/cancel-occurrence`
**Frontend**: CancelOccurrenceDialog, OccurrenceActionMenu
**Risk**: LOW - enhances existing excludedDates functionality
**Estimate**: 1-2 days

### Phase 2: Schema & Backend for Exceptions
**Scope**: Exception event model, create/update/delete endpoints
**Backend**: New Event fields, new endpoints, modified GET
**Frontend**: None (backend only)
**Risk**: MEDIUM - new data model
**Estimate**: 2-3 days

### Phase 3: Edit Occurrence UI
**Scope**: EditOccurrenceModal, occurrence context tracking
**Frontend**: New modal, ViewEventDetailModal changes
**Backend**: Uses Phase 2 endpoints
**Risk**: MEDIUM - UI complexity
**Estimate**: 2-3 days

### Phase 4: Display & Polish
**Scope**: Visual indicators, exception badges, "Revert" action
**Frontend**: CSS, icons, additional UI refinements
**Backend**: None
**Risk**: LOW
**Estimate**: 1-2 days

### Total Estimate: 6-10 days of development

---

## Open Questions

1. **Show canceled dates in calendar?**
   - Option A: Hide completely (current behavior with excludedDates)
   - Option B: Show crossed-out/grayed with "CANCELED" label

2. **Inheritance for exceptions:**
   - Should exception events copy ALL parent fields?
   - Or only store overrides and inherit dynamically?

3. **Search behavior:**
   - Should exception descriptions be searchable?
   - Should cancellation reasons appear in search?

4. **Voice/TangoVoice integration:**
   - Should VoiceEvents API return exceptions?
   - How to announce "this week's milonga is canceled"?

---

## Coordination Required

### Message to Fulton (Backend - calendar-be-af)

```
Subject: TIEMPO-362 - Instance Overrides - Backend Design Review

Hi Fulton,

Please review the backend section of docs/TIEMPO-362-INSTANCE-OVERRIDES-ARCHITECTURE.md

Key decisions needed:
1. Option A (separate exception events) vs Option B (embedded)?
2. Backend expansion (Option 2A) vs frontend expansion (Option 2B)?
3. Review proposed endpoints and schema changes

Once approved, I can MSG you the detailed API specs for implementation.

- Sarah
```

---

*Document created by Sarah (TangoTiempo Agent) for TIEMPO-362*
