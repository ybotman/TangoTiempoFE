# Issue 1038: Technical Approach - Custom List 21 Days View

## Overview
This document outlines the technical implementation for creating a custom 21-day list view in the TangoTiempo calendar that starts from today's date.

## Current State Analysis
- Calendar uses FullCalendar v6 with React wrapper
- Current views: `dayGridMonth` and `listMonth`
- List button at line 352 calls `changeView('listMonth')`
- Views configuration at lines 397-406

## Proposed Implementation

### Step 1: Create Custom View Configuration
Add a new custom view `list21Days` to the views configuration:

```javascript
views: {
  list21Days: {
    type: 'list',
    duration: { days: 21 },
    buttonText: '3 Weeks',
    listDayFormat: { weekday: 'long' }
  },
  // existing views...
  listMonth: {
    dayMaxEvents: 'true',
    listDayFormat: { weekday: 'long' }
  },
  dayGridMonth: {
    titleFormat: { year: 'numeric', month: 'long' },
    eventMinHeight: 25
  }
}
```

### Step 2: Update List Button Handler
Modify line 352 to use the new custom view:
```javascript
<IconButton onClick={() => calendarRef.current.getApi().changeView('list21Days')}>
  <ListIcon />
</IconButton>
```

### Step 3: Handle View Detection
Update the `eventDidMount` callback (line 371) to include the new view:
```javascript
if (eventInfo.view.type === 'listMonth' || eventInfo.view.type === 'list') {
  // existing list view styling...
}
```

### Step 4: Update Initial View Logic
Modify `getInitialView` function (lines 70-72) to use new view for mobile:
```javascript
const getInitialView = () => {
  return window.innerWidth >= 768 ? 'dayGridMonth' : 'list21Days';
};
```

### Step 5: Update Resize Handler
Update the resize handler (lines 276-280) to use the new view:
```javascript
calendarApi.changeView('list21Days'); // instead of 'listMonth'
```

## Key Considerations

### Starting from Today
FullCalendar's list views with custom duration automatically start from the current date when using `duration` property. No additional configuration needed.

### Navigation Behavior
- "Previous" button will move back 21 days
- "Next" button will move forward 21 days
- "Today" button will reset to current date

### Title Display
The calendar title will need to show an appropriate date range. This should be handled automatically by FullCalendar.

## Risks and Mitigations

1. **Risk**: Custom view might not be recognized by FullCalendar
   - **Mitigation**: Test thoroughly, fall back to listMonth if needed

2. **Risk**: Event rendering might break with custom duration
   - **Mitigation**: Ensure all event rendering logic handles the new view type

3. **Risk**: Mobile view switching might not work correctly
   - **Mitigation**: Test responsive behavior extensively

## Testing Strategy
1. Verify view shows exactly 21 days starting from today
2. Test navigation buttons (prev/next/today)
3. Verify event rendering matches existing list view
4. Test responsive switching between views
5. Check date range display in calendar header

## Implementation Order
1. Add custom view configuration (low risk)
2. Update button handler (low risk)
3. Test basic functionality
4. Update other references to list view
5. Full testing suite

## Rollback Plan
If issues arise, simply revert the view configuration and button handler to use 'listMonth' again.