# Geo-Location Implementation

This document describes the implementation of the unified Geo-Location system in TangoTiempo.

## Overview

The geo-location system provides a way to:
1. Detect the user's location (via IP address or browser geolocation)
2. Find the nearest city in our database
3. Allow users to browse events by region/division/city
4. Show the current location context in the UI
5. Enable regional organizers to create events in their assigned locations

## Architecture

The system uses a parallel approach during this transition phase:

1. **Original Contexts**
   - `RegionsContext` - For region selection
   - `MasteredLocationContext` - For nearest city detection

2. **New Unified Context**
   - `GeoLocationContext` - Combines all location functionality while maintaining backward compatibility

## Components

### GeoLocationContext

This context is the new unified source of truth for location information:

```javascript
// Key state managed by GeoLocationContext
const [userLocation, setUserLocation] = useState({
  latitude: null,
  longitude: null,
  accuracy: null,
  lastUpdated: null,
  ipBased: true
});

const [selectedLocation, setSelectedLocation] = useState({
  country: { id: null, name: null },
  region: { id: null, name: null },
  division: { id: null, name: null },
  city: { id: null, name: null, latitude: null, longitude: null }
});
```

The context provides:
- Current user coordinates
- Selected location in the hierarchy
- Methods for updating and managing location
- Loading and error states
- Display text for current location

### LocationInfo Component

This component displays the current location context in the calendar header:

```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <LocationOnIcon color="primary" fontSize="small" />
  <Typography variant="body2" fontWeight="bold">Location:</Typography>
  
  <Chip label={region.name} size="small" color="primary" />
  <Chip label={division.name} size="small" color="primary" />
  <Chip label={city.name} size="small" color="primary" />
  
  <Chip
    icon={<MyLocationIcon fontSize="small" />}
    label="My Location"
    size="small"
    color="secondary"
    onClick={refreshUserLocation}
  />
</Box>
```

## Integration Points

### 1. Provider Hierarchy

The `GeoLocationProvider` is now placed before the `MasteredLocationProvider` to establish the hierarchical responsibility model:

```jsx
<AuthProvider>
  <RegionsProvider>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RoleProvider>
        <GeoLocationProvider>
          <MasteredLocationProvider>
            <MasteredLocationLogger />
            {children}
          </MasteredLocationProvider>
        </GeoLocationProvider>
      </RoleProvider>
    </LocalizationProvider>
  </RegionsProvider>
</AuthProvider>
```

This provider order ensures that:
1. GeoLocationContext initializes first and has a stable identity
2. MasteredLocationContext can safely use GeoLocationContext's services
3. The data flow is unidirectional, eliminating circular dependencies

### 2. Event Creation

The `CreateEventModal` uses the `GeoLocationContext` first, but falls back to the existing contexts if needed:

```javascript
// In CreateEventModal.js
const { selectedLocation } = useGeoLocation();

// Use mastered location fields from GeoLocationContext first, then fall back
masteredRegionName: selectedLocation.region.name || selectedRegion || (nearestCity?.regionName || ''),
masteredDivisionName: selectedLocation.division.name || selectedDivision || (nearestCity?.divisionName || ''),
masteredCityName: selectedLocation.city.name || selectedCity || (nearestCity?.cityName || ''),
```

## Hierarchical Model & Synchronization

The location system now uses a hierarchical responsibility model with GeoLocationContext as the primary source of truth:

1. **GeoLocationContext as Source of Truth**:
   ```javascript
   // GeoLocationContext provides the authoritative fetchNearestCity implementation
   const fetchNearestCityImpl = useCallback(async (latitude, longitude, maxDistance = 500000) => {
     // Validate coordinates - ensure they're valid numbers
     if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
       console.error('GeoLocationContext: fetchNearestCity - Invalid coordinates', { latitude, longitude });
       // Use fallback coordinates instead of returning
       latitude = 42.3601; // Boston fallback
       longitude = -71.0589;
     }

     // Implementation continues with API calls and fallbacks...
   }, [masteredLocationContext]);
   ```

2. **Initialization from MasteredLocationContext** (one-way dependency):
   ```javascript
   // Initialize from MasteredLocationContext
   useEffect(() => {
     console.log('GeoLocationContext: Checking for nearestCity update', {
       hasNearestCity: !!nearestCity,
       nearestCityName: nearestCity?.cityName
     });

     if (nearestCity) {
       // Update from nearest city if we don't have a selection yet
       if (!selectedLocation.region.id) {
         setSelectedLocation({
           country: { id: nearestCity.countryID, name: nearestCity.countryName },
           // ...
         });
       }
     }
   }, [nearestCity, selectedLocation.region.id]);
   ```

3. **Updating legacy RegionsContext** (backward compatibility):
   ```javascript
   // Update RegionsContext when our selection changes
   useEffect(() => {
     // Skip sync if RegionsContext isn't present or if we don't have location data
     if (!regionsContext || !selectedLocation.region.name) {
       return;
     }

     try {
       // Update the RegionsContext to maintain compatibility
       if (regionsContext.selectedRegion !== selectedLocation.region.name) {
         regionsContext.setSelectedRegion(selectedLocation.region.name);
       }
       // Other synchronization...
     } catch (error) {
       console.error("Error syncing with RegionsContext:", error);
     }
   }, [selectedLocation, regionsContext]);
   ```

4. **Delayed Initialization for Proper Sequence**:
   ```javascript
   // In MasteredLocationContext
   useEffect(() => {
     // Add a small delay before initialization to ensure parent contexts are ready
     const initTimer = setTimeout(() => {
       initializeContext();
     }, 100); // Small delay to ensure proper initialization order

     return () => clearTimeout(initTimer);
   }, []);
   ```

## Future Expansion

This implementation provides a foundation for future enhancements:

1. **Location Persistence**
   - Store user's location preferences in localStorage
   - Sync with user's account settings

2. **Distance-Based Search**
   - Add UI controls for radius-based search
   - Implement backend endpoints using MongoDB geospatial queries

3. **Enhanced Authorization**
   - Link Regional Organizer permissions to specific locations
   - Validate location permissions when creating events

4. **Map Integration**
   - Add map visualization for regions and events
   - Allow location selection via map

## Usage Examples

### Basic Usage
```jsx
import { useGeoLocation } from '@/contexts/GeoLocationContext';

function MyComponent() {
  const { selectedLocation, locationDisplayText } = useGeoLocation();
  
  return (
    <div>
      <h1>Events in {locationDisplayText}</h1>
      {/* Rest of component */}
    </div>
  );
}
```

### Changing Location
```jsx
import { useGeoLocation } from '@/contexts/GeoLocationContext';

function LocationSelector() {
  const { selectLocation } = useGeoLocation();
  
  const handleRegionSelect = (region) => {
    selectLocation({
      region: { id: region.id, name: region.name }
    });
  };
  
  // Component implementation
}
```

### Resetting to User's Location
```jsx
import { useGeoLocation } from '@/contexts/GeoLocationContext';

function ResetButton() {
  const { resetToNearestLocation } = useGeoLocation();
  
  return (
    <Button onClick={resetToNearestLocation}>
      Reset to My Location
    </Button>
  );
}
```