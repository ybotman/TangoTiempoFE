# RRULE Recurring Events Feature

## Overview
This feature enables users to create recurring events using the RRULE (RFC 5545) standard. Currently in beta for RegionalOrganizer role only.

## Implementation Status

### Phase 1: Data Connection (TIEMPO-171) ✅ COMPLETE
- Connected RRULE UI component to event data model
- Fixed RRULE date format to RFC 5545 standard (YYYYMMDDTHHMMSSZ)
- Added validation for RRULE generation
- Removed excludeDates field (backend doesn't support)

### Phase 2: Calendar Display (TIEMPO-172) 🚧 TODO
- Integrate FullCalendar RRULE plugin
- Display recurring events on calendar

### Phase 3: UI Enablement (TIEMPO-173) 🚧 TODO
- Enable for all user roles
- Complete ViewEventDetailsRepeating component

## Technical Details

### Frontend Components
- **CreateEventDetailsRepeating.js**: UI for creating recurring events
  - Supports Daily, Weekly, Monthly patterns
  - Generates RFC 5545 compliant RRULE strings
  - Validates user input
  - Updates eventData.recurrenceRule

### Backend Support
- Event model has `recurrenceRule` (String) field
- Event model has `isRepeating` (Boolean) field
- API endpoints accept these fields

### RRULE Examples
```
Daily: FREQ=DAILY;UNTIL=20250731T235959Z;
Weekly: FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20250731T235959Z;
Monthly: FREQ=MONTHLY;BYDAY=2TU;COUNT=10;
```

## Usage

### For RegionalOrganizers (Beta)
1. Create new event
2. Toggle "Repeating" switch ON
3. Go to "Repeating" tab
4. Select recurrence pattern
5. Set end date or occurrence count
6. Save event

### Current Limitations
- Only enabled for RegionalOrganizer role
- Backend doesn't expand recurring events yet
- No excludeDates support
- ViewEventDetailsRepeating not implemented

## Testing
1. Log in as RegionalOrganizer
2. Create event with recurrence
3. Check Network tab for `recurrenceRule` in POST payload
4. Verify RRULE format is correct

## Future Work
- Enable FullCalendar RRULE plugin for display
- Implement server-side event expansion
- Enable for all user roles
- Add exclude dates support