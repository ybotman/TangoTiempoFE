# TIEMPO-105: Set default MasteredLocationContext to Boston on startup

## Issue Summary
Set the default MasteredLocationContext to Boston (Northeast/New England/United States) when the calendar loads, instead of relying on geolocation or showing empty state. This ensures users always see events on initial load.

## Solution Implemented
Modified the `initializeContext` function in MasteredLocationContext.js to:
1. Skip IP geolocation attempt entirely
2. Immediately set Boston as the default location
3. Mark it as `isDefault: true` rather than `isFallback: true`
4. Still preload cities and regions for the location selector

## Benefits
- **Instant content display** - Users see events immediately on page load
- **Better performance** - No 3-second timeout waiting for geolocation
- **Reduced API calls** - No IP geolocation requests on every page load
- **Consistent experience** - All users start with Boston view
- **Simpler code path** - Less error handling and edge cases

## Changes Made
- File: `src/app/contexts/MasteredLocationContext.js`
- Replaced geolocation attempt (lines 373-492) with direct Boston assignment
- Kept cities/regions preloading for UI functionality
- Updated console logs to reflect new behavior

## Testing Notes
- Verify calendar loads with Boston events immediately
- Confirm location selector still allows changing cities
- Check that no geolocation errors appear in console
- Test on both desktop and mobile devices

## Related Issues
- TIEMPO-106: Reduce excessive console logging (created as follow-up)