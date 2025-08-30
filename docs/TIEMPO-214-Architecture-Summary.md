# TIEMPO-214: Location Context Architecture Summary

**Generated**: 2025-01-26T18:45:00Z  
**JIRA Ticket**: [TIEMPO-214](https://hdtsllc.atlassian.net/browse/TIEMPO-214)  
**Status**: In Review  
**Implementation**: Complete (~100%)

## Executive Summary

Successfully refactored the location context system from `MasteredLocationContext` to `LocationAPIContext`, implementing a clean event-driven architecture that eliminates circular dependencies and provides clear separation of concerns.

## Architecture Overview

### Three-Context Separation

```
┌─────────────────────────────────────┐
│     LocationAPIContext (Pure)       │
│   - API calls only                  │
│   - No state management             │
│   - Emits location data events     │
└─────────────────────────────────────┘
                    ↓
        LocationEventBus (Singleton)
                    ↓
┌─────────────────────────────────────┐
│      GeoLocationContext             │
│   - All location state              │
│   - User preferences                │
│   - Location selection logic        │
│   - Subscribes to location events  │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│     EventDiscoveryContext           │
│   - Event filters (AI, etc)         │
│   - Discovery preferences           │
│   - No location management          │
└─────────────────────────────────────┘
```

## User Features & Persistent State

### EventDiscoveryContext Storage
Stored in `localUserInfo.userDefaults` via `useUsers` hook:

```javascript
{
  searchSettings: {
    includeAiGenerated: boolean    // AI-generated event recommendations toggle
  },
  eventDiscoveryFilters: {
    categories: string[],          // Selected event categories
    venues: string[],              // Selected venue filters
    organizers: string[],          // Selected organizer filters
    searchTerm: string             // Free text search term
  }
}
```

**Features**:
- Auto-save with 2-second debounce
- Persists to user profile via PUT `/api/userlogins/updateUserInfo`
- Loads preferences on user authentication

### GeoLocationContext State Management
In-memory state (not persisted in this implementation):

```javascript
{
  userLocation: {
    latitude: number,
    longitude: number,
    accuracy: number,
    lastUpdated: Date
  },
  selectedLocation: {
    country: { id: string, name: string },
    region: { id: string, name: string },
    division: { id: string, name: string },
    city: { 
      id: string, 
      name: string, 
      latitude: number, 
      longitude: number 
    }
  },
  locationData: {
    cities: City[],
    regions: Region[],
    divisions: Division[]
  }
}
```

**Features**:
- Browser geolocation API integration
- IP-based fallback location
- Hierarchical location selection
- Cached location data for performance

### LocationAPIContext Capabilities
Pure API provider with no persistent state:

- `fetchNearestCity(lat, lng, maxDistance)`
- `fetchCities(divisionId)`
- `fetchRegions()`
- `fetchDivisions(regionId)`

All methods emit events via LocationEventBus after successful API calls.

## Event-Driven Communication

### LocationEventBus Events

```javascript
LOCATION_EVENTS = {
  // API data events
  NEAREST_CITY_FETCHED: 'nearestCityFetched',
  CITIES_FETCHED: 'citiesFetched',
  REGIONS_FETCHED: 'regionsFetched',
  DIVISIONS_FETCHED: 'divisionsFetched',
  
  // User interaction events
  LOCATION_SELECTED: 'locationSelected',
  LOCATION_CLEARED: 'locationCleared',
  
  // Error events
  LOCATION_ERROR: 'locationError',
  API_ERROR: 'apiError',
  
  // State change events
  LOCATION_CHANGED: 'locationChanged',
  USER_LOCATION_UPDATED: 'userLocationUpdated',
  
  // Loading states
  LOADING_STARTED: 'loadingStarted',
  LOADING_COMPLETED: 'loadingCompleted'
}
```

## Key Technical Improvements

### 1. Eliminated Circular Dependencies
- **Before**: Direct imports between contexts caused circular references
- **After**: Event-driven pub/sub pattern with no direct dependencies

### 2. Simplified useEvents Hook
- **Before**: ~60 lines of complex conditional logic
- **After**: ~25 lines with clean `resolveLocationParameters()` helper

### 3. Clear Separation of Concerns
- **LocationAPIContext**: Pure data fetching
- **GeoLocationContext**: Location state management
- **EventDiscoveryContext**: Event discovery preferences

### 4. Performance Optimizations
- Debounced auto-save (2 seconds)
- Event bus prevents unnecessary re-renders
- Cached location data reduces API calls

## API Integration

### User Preferences Endpoint
```
PUT /api/userlogins/updateUserInfo
```

**Request Body**:
```javascript
{
  firebaseUserId: string,
  appId: string,
  localUserInfo: {
    userDefaults: {
      searchSettings: {...},
      eventDiscoveryFilters: {...}
    }
  }
}
```

### Location API Endpoints
- `GET /api/masteredLocations/nearestMastered`
- `GET /api/masteredLocations/cities`
- `GET /api/masteredLocations/divisions`
- `GET /api/masteredLocations/regions`

## Testing Infrastructure

### Testing Infrastructure
- EventDiscoveryContext has built-in auto-save with 2-second debounce
- Preferences persist via useUsers hook
- Event bus provides real-time communication between contexts

### Test Scenarios Covered
1. AI filter toggle and persistence
2. Multiple filter selection
3. Manual save operation
4. Persistence verification
5. Event bus communication

## Files Modified

### Core Context Files
- `/src/app/contexts/LocationAPIContext.js` - Renamed from MasteredLocationContext
- `/src/app/contexts/GeoLocationContext.js` - Refactored for event subscriptions
- `/src/app/contexts/EventDiscoveryContext.js` - Added API integration

### Supporting Files
- `/src/app/utils/LocationEventBus.js` - New event bus singleton
- `/src/app/hooks/useEvents.js` - Simplified with helper function

### Component Updates
- `LocationSelector.js` - Updated to use new context names
- `Providers.js` - Updated provider hierarchy
- Various components updated for new import paths

## Future Considerations

### Potential Enhancements
1. **Persist GeoLocationContext state** - Save selected location preferences
2. **Add more event filters** - Date ranges, price ranges, distance radius
3. **Implement caching strategy** - Redis/local storage for location data
4. **Add unit tests** - Jest tests for event bus and contexts
5. **Performance monitoring** - Track event bus performance with many listeners

### Known Limitations
1. Location preferences (selected city) not persisted
2. No offline support for location data
3. Event bus has no built-in error recovery
4. Test coverage limited to manual testing

## Deployment Notes

- No database migrations required
- Backward compatible with existing user data
- Feature flag not required - seamless upgrade
- Monitor event bus memory usage in production

---

**Implementation by**: Ybot (AI-GUILD Agent)  
**Review Status**: Ready for QA Testing  
**Next Steps**: Deploy to TEST environment for validation