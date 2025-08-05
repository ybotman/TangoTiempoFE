# Context Providers

This directory contains React Context providers that manage global application state.

## AuthContext
Manages user authentication state and Firebase auth operations.

## RoleContext  
Manages user role selection (Dancer, Event Organizer, etc.) and role-specific features.

## GeoLocationContext

Manages all location-related state and operations for the application.

### Key Features
- Dual location system (permanent saved vs temporary session)
- Integration with LocationAPIContext for data fetching
- Event-based updates via LocationEventBus
- Support for both logged-in and anonymous users

### State Management

#### Location States
- **savedLocation**: Permanent location from backend (logged-in users only)
- **currentLocation**: Active location for current session (all users)
- **selectedLocation**: Legacy city-based selection (deprecated)
- **userLocation**: Browser geolocation (if available)

#### Modal States
- **mapCenterModalOpen**: Controls MapCenterModal visibility

### Key Functions

#### For Permanent Saves (Logged-in Users)
- `saveAndSetLocation(locationData, updateUserData)`: Save to backend and set as current
- `loadUserMapPreferences(userData)`: Load saved preferences from userData

#### For Temporary Session (All Users)
- `setSessionLocation(locationData)`: Set temporary location for session only
- `openMapCenterModal()`: Open the map center selection modal

#### Location Operations
- `fetchNearestCity(lat, lng)`: Find nearest city to coordinates
- `refreshUserLocation()`: Get browser geolocation
- `selectLocation(location)`: Set selected city (legacy)
- `clearLocation()`: Clear selected location

### Usage

```jsx
import { useGeoLocation } from '@/contexts/GeoLocationContext';

function MyComponent() {
  const { 
    currentLocation,
    savedLocation,
    saveAndSetLocation,
    openMapCenterModal 
  } = useGeoLocation();
  
  // Use location for filtering
  const filterRadius = currentLocation.zoomRange || 50;
  const centerLat = currentLocation.lat;
  const centerLng = currentLocation.lng;
}
```

### Integration with UserLocationLoader

The `UserLocationLoader` component bridges user data with GeoLocationContext:
- Automatically loads saved preferences when userData is available
- Ensures logged-in users see their saved location preferences
- Must be mounted inside both AuthProvider and GeoLocationProvider

## LocationAPIContext
Provides API functions for fetching location data (cities, regions, etc.).

## EventDiscoveryContext
Manages event discovery and featured event highlighting.

## Best Practices

1. Always use the provided hooks (useAuth, useGeoLocation, etc.)
2. Don't access context directly with useContext
3. Handle loading and error states appropriately
4. Use event bus for cross-context communication when needed