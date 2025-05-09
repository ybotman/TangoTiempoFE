# GeoLocation Context Implementation Roadmap

## Current Status

The GeoLocationContext has been implemented as the primary source of truth in a hierarchical responsibility model. It now operates as the core of our location system with MasteredLocationContext as a pure data provider. The implementation involves:

1. ✅ Context creation and provider component (GeoLocationContext.js)
2. ✅ LocationInfo component showing current location with event counts
3. ✅ Integration with city selection in LocationContextModal
4. ✅ Connection with event filtering in useCalendarPage
5. ✅ Robust error handling and fallback mechanisms for geolocation services
6. ✅ Resolution of circular dependencies between contexts
7. ✅ Standardized coordinate format handling across the application
8. ✅ Improved initialization sequence with timing controls

## Migration Plan

The GeoLocationContext is designed to gradually replace functionality in the older contexts while maintaining backward compatibility. This roadmap outlines the steps to complete the transition:

### Phase 1: Hierarchical Implementation (Completed)

- ✅ Maintain RegionsContext for backward compatibility
- ✅ Refactor MasteredLocationContext to be a pure data provider
- ✅ Make GeoLocationContext the authoritative source of truth for location state
- ✅ Implement hierarchical responsibility model with unidirectional data flow
- ✅ Fix circular dependencies and race conditions in initialization sequence
- ✅ Add robust error handling and fallbacks for all API calls

### Phase 2: Feature Enhancement (Next)

- ⬜ Add distance-based filtering capabilities to GeoLocationContext
- ⬜ Implement a more user-friendly location selection UI using the new context
- ⬜ Enhance the LocationInfo component with more interactive features
- ⬜ Add more robust caching mechanisms for location data
- ⬜ Improve performance by optimizing API calls and data management

### Phase 3: Migration

- ⬜ Move all location-dependent components to use GeoLocationContext
- ⬜ Update event creation and editing to use the new context exclusively
- ⬜ Refactor the calendar page to rely only on GeoLocationContext
- ⬜ Ensure all user preferences related to location use the new system

### Phase 4: Cleanup

- ⬜ Deprecate functions in RegionsContext and MasteredLocationContext
- ⬜ Add migration helpers for any external code using the old contexts
- ⬜ Eventually remove dependencies on the old contexts
- ⬜ Complete documentation for the new GeoLocationContext system

## Component Status

| Component | Status | Notes |
|-----------|--------|-------|
| GeoLocationContext | ✅ Implemented | Core context and provider |
| LocationInfo | ✅ Implemented | Shows location hierarchy with counts |
| LocationContextModal | ✅ Integrated | Updates GeoLocationContext on city selection |
| useCalendarPage | ✅ Integrated | Uses GeoLocationContext for event filtering |
| ipapi.co Integration | ⚠️ Fixed | Added caching and error handling for API |
| useEvents | ✅ Updated | Enhanced to work with GeoLocationContext |
| Event Create Modal | ⬜ Pending | Needs to use GeoLocationContext exclusively |
| Distance Filtering | ⬜ Planned | Future enhancement |

## Technical Decisions

1. **IP-Based Geolocation Only**: Using ipapi.co for location detection without requiring browser permissions
2. **Caching Strategy**: Implemented session storage with a one-hour expiry to reduce API calls
3. **Hierarchical Responsibility Model**: Unidirectional data flow from GeoLocationContext to other contexts
4. **Fault Tolerance**: Comprehensive fallback mechanisms with progressive enhancement
5. **Performance**: Optimized initialization sequence with timing controls to prevent race conditions
6. **Coordinate Normalization**: Standardized handling of different coordinate formats (direct properties and GeoJSON)
7. **Error Recovery**: Progressive fallbacks that maintain functionality even when multiple services fail

## Known Issues

1. ✅ Rate limiting with ipapi.co - Fixed with caching and fallbacks
2. ✅ Error in LocationInfo component - Fixed conditional hook usage
3. ✅ Server-side rendering issues with sessionStorage - Fixed with browser detection
4. ✅ Circular dependencies between contexts - Resolved with hierarchical model
5. ✅ Fallback mechanism refinement - Implemented comprehensive fallbacks with progressive enhancement
6. ⬜ Hamburger menu location display - Still shows Detroit instead of actual location (tracked in Issue 1011)
7. ⬜ Inconsistent UI updates during initialization - Could improve loading indicators and synchronization
8. ⬜ RegionsContext still used in some places - Need to complete migration to GeoLocationContext

## Next Steps

1. Fix remaining location-related issues (Issue 1011, 1013)
2. Complete Phase 2 feature enhancements:
   - Implement distance-based filtering for events
   - Add location-based preferences to user settings
   - Enhance the map UI for location selection
3. Continue migration of all components to use GeoLocationContext exclusively
4. Complete removal of RegionsContext when all functionality is migrated
5. Finalize documentation across the codebase for the new hierarchical model