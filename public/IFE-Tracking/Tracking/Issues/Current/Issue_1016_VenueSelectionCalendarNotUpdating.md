# Issue 1016: Venue Selection Doesn't Update Calendar View

## Description
When a venue is selected in the venue selection modal, the calendar view doesn't update to filter events based on the selected venue. This makes the venue selection feature seem incomplete or broken, as users expect the calendar to show only events at their chosen venue.

## Problem
The venue selection functionality correctly allows selecting a venue, but this selection doesn't propagate to the calendar view filtering system. After closing the modal with a venue selected, the calendar continues to show all events regardless of venue.

## Steps to Reproduce
1. Open the application and wait for it to fully load
2. Click on the hamburger menu icon
3. Click "Select Venue" option
4. Toggle the "Division Scope" switch to ON (to ensure venues are visible)
5. Select a specific venue from the list or map
6. Click "Select" to confirm the venue selection
7. Observe that the calendar view doesn't change to filter events at only the selected venue

## Expected Behavior
After selecting a venue and confirming, the calendar view should update to show only events taking place at the selected venue. There should be a visual indication that venue filtering is active.

## Technical Details
- The `selectVenue` function in `useVenueSelection.js` does set the selected venue in local state
- The calendar view filtering system doesn't appear to check for a selected venue
- There may be missing connection between venue selection and event filtering mechanisms
- The `selectVenue` function includes a comment: "Could also update global context here if needed"

## Possible Solutions
- Update the `selectVenue` function to propagate selection to a global context
- Modify the calendar view's filtering logic to consider the selected venue
- Add a persistent filter state that includes venue filtering
- Add UI indicators to show when venue filtering is active
- Implement a clear filter button for venue selection

## Priority
High - This affects a core expected functionality of venue selection

## Dependencies
- Depends on venue selection functionality (Issue_1004_SelectVenuesMenuNotWorking.md)
- May relate to calendar filtering system

## Assigned To
Unassigned