# Merge to TEST - January 28, 2025

## Overview
Merging unified location state implementation from DEVL to TEST branch.

## Key Changes

### 1. Unified Location State Architecture
- Implemented `currentLocation`/`savedLocation` pattern in GeoLocationContext
- Single source of truth for location state management
- Removed all references to `temporaryLocation`

### 2. MapCenterModal Integration
- Added new MapCenterModal component for session-only location setting
- Uses `setSessionLocation()` to update current location without backend persistence
- Available for both logged-in and non-logged users
- Integrated into Providers for centralized rendering

### 3. UserSettings Location Preferences Update
- Updated to use `saveAndSetLocation()` for persistent backend updates
- Saves to backend AND updates current location in one operation
- Removed non-logged user code path (they use MapCenterModal instead)
- No longer triggers page reload - uses reactive updates

### 4. useEvents Hook Refactoring
- Updated to access `currentLocation` from GeoLocationContext
- Simplified `resolveLocationParameters()` function
- Removed complex priority logic
- Fixed dependency arrays to properly track location changes

### 5. Event-Driven Architecture
- Location changes emit events via LocationEventBus
- Calendar automatically refreshes when location changes
- No page reloads needed - all updates are reactive
- Session persistence via sessionStorage

## Files Modified

### Core Context Changes
- `src/app/contexts/GeoLocationContext.js` - Added unified location state management
- `src/app/components/Providers.js` - Added MapCenterModal integration

### Component Updates
- `src/app/components/Modals/misc/MapCenterModal.js` - New modal for SET location
- `src/app/components/Modals/UserSettings/UserSettingsLocationPreferences.js` - Updated for SAVE location
- `src/app/components/Modals/UserSettings/UserSettingsModal.js` - Integration updates

### Hook Updates
- `src/app/hooks/useEvents.js` - Refactored to use currentLocation
- `src/app/hooks/useCalendarPage.js` - Enable GeoLocationContext
- `src/app/hooks/useUsers.js` - Support for location preferences

### UI Updates
- `src/app/calendar/page.js` - MapCenterModal prompt for non-logged users
- `src/app/components/UI/SidebarDrawer.js` - Modal integration
- `src/app/components/UI/SiteHeader.js` - Location display updates

### Utility Updates
- `src/app/utils/LocationEventBus.js` - Added LOCATION_CHANGED event
- `src/app/utils/UserSettingsEvent.js` - New event system for UserSettings modal

### Documentation
- `CONTEXT-ARCHITECTURE.md` - New context architecture documentation
- `DATA-LOADING-ARCHITECTURE.md` - Data loading patterns documentation

## Testing Checklist

### Non-Logged User Flow
- [ ] Calendar prompts for location when no location set
- [ ] MapCenterModal opens for SET location
- [ ] Location persists for session
- [ ] Calendar updates without page reload
- [ ] Session survives page refresh

### Logged-In User Flow
- [ ] UserSettings opens for location preferences
- [ ] Location saves to backend
- [ ] Current location updates immediately
- [ ] Calendar refreshes automatically
- [ ] Saved location loads on next login

### Location Override
- [ ] MapCenterModal SETs temporary location
- [ ] Temporary location overrides saved preferences
- [ ] Both modals update same currentLocation
- [ ] No conflicts between SET and SAVE operations

## Deployment Notes

1. No database migrations required
2. No backend API changes required
3. Fully backward compatible with existing user data
4. Session storage used for persistence

## Rollback Plan

If issues are encountered:
1. Revert to previous TEST commit
2. User location preferences remain intact
3. No data migration needed

## Version
Updated package.json to version 1.6.3