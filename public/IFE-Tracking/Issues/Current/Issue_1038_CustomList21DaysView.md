# Issue 1038: Custom List 21 Days View

## Status: 🚧 In Progress

## Details
- **Date Reported**: 2025-01-08
- **Reporter**: User
- **Environment**: DEVL
- **Component**: Calendar View (src/app/calendar/page.js)

## Description
The current list view button shows a full month starting from the 1st of the month. User wants to modify the second calendar view button to create a custom list view that:
- Starts on today's date (not the 1st of the month)
- Shows 21 days forward
- Uses only the listPlugin
- Labels the custom view as "3 Weeks"
- Replaces the current listMonth view

## Investigation
Current implementation findings:
1. Calendar uses FullCalendar library with dayGridPlugin and listPlugin
2. Two view buttons exist: dayGridMonth and listMonth
3. The list button (line 352) uses `changeView('listMonth')`
4. Views configuration (lines 397-406) only configures listMonth and dayGridMonth
5. No custom list views are currently defined

FullCalendar documentation research shows:
- Custom views can be created using the `views` configuration
- Custom views can specify `type: 'list'` and `duration` properties
- The `duration` property can be set to specific day counts

## Proposed Solution
1. Create a custom view named `list21Days` in the views configuration
2. Set it to type 'list' with duration of 21 days
3. Update the list button to use the new custom view
4. Ensure the view starts from today's date

## Implementation Plan
Step 1: Add custom view configuration to start from today
Step 2: Extend to 21 days duration
Step 3: Update button label if needed

## Fix
⏳ Pending

## Testing
- [ ] Verify list view starts from today's date
- [ ] Confirm exactly 21 days are shown
- [ ] Check that view updates correctly when navigating
- [ ] Ensure event rendering works properly in custom view
- [ ] Test on mobile and desktop viewports

## Resolution
⏳ Pending