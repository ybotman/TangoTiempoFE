# TIEMPO-168: Fix GeoLocationContext Initialization Race Condition

## Problem Summary
The `useEvents` hook attempts to fetch events before `GeoLocationContext` has finished initializing, resulting in API calls with `city: null` or `city: "Unknown"`. This causes events to fail loading in local development environment.

## Root Cause Analysis
1. **Provider Order Change**: GeoLocationContext now initializes BEFORE MasteredLocationContext
2. **IP Geolocation Removal**: Simplified initialization exposed the timing dependency
3. **Missing Guard**: useEvents doesn't check if context is ready before fetching

## Implementation Plan

### 1. Update useEvents Hook Import
```javascript
// Add isInitialized to the destructured values
const { 
  userLocation,
  selectedLocation,
  isInitialized  // NEW
} = useGeoLocation();
```

### 2. Modify the useEffect Guard
```javascript
// Current code (line 256-258):
useEffect(() => {
  fetchEvents();
}, [fetchEvents]);

// Updated code:
useEffect(() => {
  // Skip if using context and not initialized
  if (useGeoLocationContext && !isInitialized) {
    console.log('useEvents: Waiting for GeoLocationContext initialization');
    return;
  }
  
  // Additional validation for location data quality
  if (useGeoLocationContext) {
    // Check if we have valid location data
    const hasValidCity = effectiveCity && effectiveCity !== "Unknown";
    const hasValidRegion = effectiveRegion && effectiveRegion !== "Unknown";
    const hasValidCoords = effectiveLat && effectiveLng && 
                          !(effectiveLat === 0 && effectiveLng === 0);
    
    if (!hasValidCity && !hasValidRegion && !hasValidCoords) {
      console.log('useEvents: No valid location data available yet', {
        city: effectiveCity,
        region: effectiveRegion,
        coords: [effectiveLat, effectiveLng]
      });
      return;
    }
  }
  
  fetchEvents();
}, [fetchEvents, isInitialized, useGeoLocationContext]);
```

### 3. Update Dependency Array
Add `isInitialized` to the fetchEvents useCallback dependencies (around line 253).

## Testing Plan
1. Clear browser cache and localStorage
2. Start fresh local dev server
3. Verify console shows "Waiting for GeoLocationContext initialization"
4. Confirm events load after context initializes with Boston
5. Test with explicit location parameters (should bypass guard)
6. Test with `useGeoLocationContext: false` (should bypass guard)

## Backward Compatibility
- Components passing explicit location parameters are unaffected
- Only impacts components relying on GeoLocationContext
- No API changes or breaking changes

## Success Criteria
- Events load successfully in local development
- No premature API calls with null city values
- Console logs show proper initialization sequence
- TEST and PROD environments continue working normally