# Location Preferences Architecture

## Overview

The TangoTiempo application uses a dual location system to provide flexibility for both logged-in and anonymous users to filter events by location.

## Two Location Systems

### 1. Permanent Location Preferences (Logged-in Users Only)
- **Component**: `UserSettingsLocationPreferences`
- **Access**: User Settings > Location Prefs tab
- **Storage**: Backend database (`userLogins.localUserInfo.userDefaults`)
- **Persistence**: Saved permanently, loads on every login
- **Purpose**: User's default location for filtering events

#### Data Structure
```javascript
userLogins.localUserInfo.userDefaults = {
  useCenterLocation: true,  // Always true in current implementation
  defaultCenterLocation: {
    lat: 42.3601,
    lng: -71.0589
  },
  defaultZoomRange: 50,  // Miles radius
  masteredCityIds: []    // Legacy city-based filtering (deprecated)
}
```

### 2. Temporary Session Location (All Users)
- **Component**: `MapCenterModal`
- **Access**: Hamburger menu > "Find Events"
- **Storage**: SessionStorage only
- **Persistence**: Current session only
- **Purpose**: Temporary location override without affecting saved preferences

#### Data Structure
```javascript
sessionStorage.currentLocation = {
  lat: 42.3601,
  lng: -71.0589,
  zoomRange: 50
}
```

## Context Architecture

### GeoLocationContext
Central location state management with three key location states:

1. **savedLocation**: Permanent location from backend (logged-in users)
2. **currentLocation**: Active location for current session
3. **selectedLocation**: Legacy city-based selection (being phased out)

### Key Functions

#### saveAndSetLocation(locationData, updateUserData)
- Used by UserSettingsLocationPreferences
- Saves to backend AND updates current session
- Updates both savedLocation and currentLocation

#### setSessionLocation(locationData)
- Used by MapCenterModal
- Updates currentLocation only
- Does NOT save to backend

#### loadUserMapPreferences(userData)
- Called by UserLocationLoader component
- Loads saved preferences from userData into GeoLocationContext
- Only updates currentLocation if not already set

## Component Integration

### UserLocationLoader
Bridge component that:
- Lives in Providers hierarchy
- Watches for userData changes
- Calls loadUserMapPreferences when data is available
- Ensures saved preferences are loaded into context

### Provider Hierarchy
```jsx
<AuthProvider>
  <LocationAPIProvider>
    <GeoLocationProvider>
      <UserLocationLoader />  // Bridges user data to location context
      <MapCenterModalWrapper />
      {children}
    </GeoLocationProvider>
  </LocationAPIProvider>
</AuthProvider>
```

## Data Flow

### Loading Saved Preferences
1. User logs in → AuthContext provides user
2. useUsers hook fetches userData from backend
3. UserLocationLoader detects userData change
4. Calls loadUserMapPreferences(userData)
5. GeoLocationContext updates savedLocation
6. UserSettingsLocationPreferences displays saved values

### Saving New Preferences
1. User sets location in UserSettings > Location Prefs
2. Component calls saveAndSetLocation(location, updateUserData)
3. Updates backend via updateUserData
4. Updates savedLocation and currentLocation in context
5. Saves to sessionStorage for immediate use
6. Emits LOCATION_CHANGED event for app-wide updates

### Setting Temporary Location
1. User opens MapCenterModal via "Find Events"
2. Sets location on map
3. Calls setSessionLocation(location)
4. Updates only currentLocation in context
5. Saves to sessionStorage
6. Does NOT affect savedLocation or backend

## Key Decisions

### Map Center Mode Only
- Removed city-based filtering in favor of map center + radius
- `useCenterLocation` is always true
- Simplifies UX and reduces complexity

### Session Storage Key
- Both systems use same key: `currentLocation`
- This is intentional - temporary location overrides saved location
- On new session, saved location is restored

### Logged-in vs Anonymous Users
- UserSettings only accessible to logged-in users
- MapCenterModal available to all users
- Anonymous users can only set temporary locations

## Migration Notes

### From City-based to Map-based
- Legacy: `masteredCityIds` array for city selection
- Current: `defaultCenterLocation` with lat/lng coordinates
- Both stored in userDefaults for backward compatibility

### Future Considerations
1. Consider removing masteredCityIds from schema
2. Add user preference for default to current location
3. Add "Use My Location" quick action
4. Consider separate sessionStorage keys if needed

## Troubleshooting

### Common Issues

1. **Saved location not displaying**
   - Check if UserLocationLoader is mounted
   - Verify userData is loaded before opening modal
   - Check browser console for loading errors

2. **Temporary overriding permanent**
   - This is expected behavior
   - Clear sessionStorage to revert to saved location
   - Or reload page to trigger fresh load

3. **Location not persisting**
   - Ensure user is logged in for permanent saves
   - Check network tab for API calls to updateUserInfo
   - Verify backend is saving userDefaults correctly

## Related Files

- `/src/app/components/Modals/UserSettings/UserSettingsLocationPreferences.js`
- `/src/app/components/Modals/misc/MapCenterModal.js`
- `/src/app/contexts/GeoLocationContext.js`
- `/src/app/components/UserLocationLoader.js`
- `/src/app/hooks/useUsers.js`

## Version History

- **v1.7.0** (2025-01-05): Clarified dual location system, added UserLocationLoader
- **v1.6.0**: Forced map center mode, deprecated city-based filtering