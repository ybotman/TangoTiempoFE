# TangoTiempo Context System Analysis

## Overview
TangoTiempo uses React's Context API extensively to manage state across the application. The context system primarily handles authentication, user roles, and location-based functionality. This document focuses on the location-related contexts, which form a complex interdependent system.

## Context Hierarchy

> **Updated 2026-01-29** - Provider order and naming reflects current state

Provider initialization order (from Providers.js):
1. **AuthProvider** - Authentication state
2. **LocalizationProvider** - Date/time localization
3. **RoleProvider** - User role management
4. **LocationAPIProvider** - Pure API data layer (renamed from MasteredLocationContext, no state beyond loading/error)
5. **GeoLocationProvider** - Unified location system (uses LocationAPIProvider for data)
6. **EventDiscoveryProvider** - AI event filtering

Helper components mounted inside providers:
- **MasteredLocationLogger** - No-op (logging removed via TIEMPO-276)
- **UserLocationLoader** - Bridges user data to GeoLocationContext
- **LocationPromptManager** - LocationSelector dialog (hardcoded to never show)
- **MapCenterModalWrapper** - Map-based location picker

**Note:** RegionsProvider has been removed from the provider hierarchy.

## Location Context System Analysis

### Two Location Contexts (as of 2026-01-29)

TangoTiempo now has two active location contexts:

1. **LocationAPIContext** (renamed from MasteredLocationContext)
   - Purpose: Pure API data provider for mastered location services. No state management beyond loading/error.
   - File: `src/app/contexts/LocationAPIContext.js`
   - Exports: `useLocationAPI()` (new name) and `useMasteredLocation()` (compat alias)
   - Functions: `fetchNearestCity`, `fetchCities`, `fetchRegions`, `fetchDivisions`
   - All functions call `/api/masteredLocations/*` endpoints
   - Emits events via LocationEventBus (no circular dependency)

2. **GeoLocationContext**
   - Purpose: Unified location state management
   - Key State:
     - userLocation: User's physical coordinates
     - selectedLocation: Location for filtering content
     - currentLocation, savedLocation, temporaryLocation: Session/preference state
   - Role:
     - Uses `useLocationAPI()` for nearest city lookups
     - Manages map center mode (lat/lng + radius)
     - Single source of truth for location state

**Removed/Dead:**
- **RegionsContext** - Fully removed from provider hierarchy
- **MasteredLocationContext** - Renamed to LocationAPIContext
- **LocationPromptManager** - Mounted but hardcoded to never show LocationSelector
- **MasteredLocationLogger** - Mounted but no-op (logging stripped by TIEMPO-276)

### Circular Dependency - RESOLVED

The circular dependency between GeoLocationContext and MasteredLocationContext has been resolved by refactoring MasteredLocationContext into **LocationAPIContext**, a pure API data provider with no state dependencies on other contexts.

**Current architecture:**
```
LocationAPIProvider (pure API layer, no context dependencies)
  └── GeoLocationProvider (uses useLocationAPI() for data)
        └── Components
```

- **LocationAPIContext** has ZERO imports from other contexts
- **GeoLocationContext** imports `useLocationAPI` (one-way dependency)
- Provider order: LocationAPIProvider wraps GeoLocationProvider
- LocationEventBus handles cross-concern communication without imports

## Implications for Venue Selection

The venue selection system relies on this location context architecture:

1. **useVenueSelection Hook**:
   - Connects venue data with the location context system
   - Depends on GeoLocationContext for the current selected location
   - Filters venues based on location hierarchy (city, division, region)
   - Provides distance calculation for venues based on current center point

2. **VenueSelectionModal**:
   - Requires an initialized GeoLocationContext
   - Checks for `hasSelectedCity` before attempting to load venues
   - Displays appropriate user feedback when location system is not fully initialized

## Architectural Recommendations

1. **Complete the Context Transition**:
   - Finish migrating RegionsContext functionality to GeoLocationContext
   - Remove RegionsContext when no longer needed

2. **Resolve Circular Dependency**:
   - Create a shared utility layer for common location functions
   - Consider merging contexts or more clearly separating responsibilities
   - Design a true hierarchical relationship where one context clearly depends on the other

3. **Standardize Data Formats**:
   - Ensure consistent coordinate storage formats across the app
   - Standardize on a single source of truth for location data
   - Add type validation or TypeScript to prevent format inconsistencies

4. **Improve Initialization Logic**:
   - Add explicit initialization states for better UX during loading
   - Implement progressive enhancement when contexts are partially initialized
   - Reduce redundant API calls during initialization

5. **Enhance Error Resilience**:
   - Expand the fallback systems to handle more edge cases
   - Improve error reporting for location system failures
   - Add recovery mechanisms for when geolocation services fail

## Specific Issues

1. **Coordinate Format Inconsistency**:
   - Some parts of the system use direct latitude/longitude properties
   - Others use GeoJSON format with location.coordinates
   - This inconsistency requires extra parsing and validation

2. **Cascade Loading Effects**:
   - The multi-layered context system creates cascading loading states
   - Users may experience sequential loading indicators
   - Could be improved through parallel data loading strategies

3. **Data Duplication**:
   - Location data is duplicated across contexts
   - Synchronization logic adds complexity and potential for inconsistencies
   - A single source of truth would simplify the architecture

## Conclusion

The TangoTiempo location context system provides robust functionality but with significant complexity. The current implementation successfully manages the circular dependency through creative solutions, but a more fundamental redesign could simplify the architecture and improve maintainability. The recommendations above provide a roadmap for addressing these architectural challenges.