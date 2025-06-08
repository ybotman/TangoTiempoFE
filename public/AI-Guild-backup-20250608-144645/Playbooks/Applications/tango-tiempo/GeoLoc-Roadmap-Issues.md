# GeoLocation System: Current State & Roadmap

## System Overview
TangoTiempo's geolocation system provides location-based filtering, venue selection, and regional organization functionality. The system is built on several interconnected components that manage location data across the application.

## Core Architecture

### Data Models
1. **Venue**: 
   - Physical address with geolocation coordinates
   - References to mastered locations (masteredCityId, masteredDivisionId, masteredRegionId)
   - Geospatial index for proximity queries

2. **MasteredLocation Hierarchy**:
   - **MasteredCity**: Canonical city data with coordinates
   - **MasteredDivision**: State/province level (e.g., MA, CA)
   - **MasteredRegion**: Regional grouping (e.g., Northeast, Southwest)
   - **Country**: Top-level geographic division

3. **Events**:
   - Reference venues via venueID
   - Inherit geolocation data from venues

### Context Providers
1. **GeoLocationContext**:
   - Manages user's physical location (from IP geolocation)
   - Handles selected location for filtering content
   - Determines available filtering options
   - Acts as the high-level context for location state

2. **MasteredLocationContext**:
   - Provides canonical location data from the backend
   - Maps coordinates to nearest mastered locations
   - Ensures locations match the database structure
   - Supplies validated location IDs for API calls

3. **RegionsContext** (Deprecated):
   - Legacy system for region selection
   - Being phased out in favor of GeoLocationContext
   - Maintained for backward compatibility

## Critical Issues

### 1. Circular Dependencies
- **GeoLocationContext** imports from MasteredLocationContext
- **MasteredLocationContext** imports from GeoLocationContext
- This creates a bootstrapping problem during initialization
- Provider order in Providers.js affects which context initializes first
- Current workaround uses function registration pattern to defer dependency resolution

### 2. Initialization Race Conditions
- Components render before contexts are fully initialized
- Contexts have interdependencies creating timing issues
- Fallback mechanisms trigger inconsistently across components
- No clear loading states or synchronization between contexts
- API rate limiting exacerbates timing issues

### 3. Inconsistent Data Access
- Different components access location data through different paths
- Some use GeoLocationContext directly
- Others use MasteredLocationContext or RegionsContext
- No standardized access pattern across the application
- Data changes in one context don't reliably propagate to others

### 4. Coordinate Format Inconsistency
- Some components use direct latitude/longitude properties
- Others use GeoJSON format with location.coordinates array
- No standardized validation or conversion utilities
- Parsing errors when formats don't match expectations

### 5. UI Manifestations
- **LocationContextModal**: Shows "No cities with valid coordinates"
- **Hamburger Menu**: Shows Detroit instead of Boston
- **Calendar Header**: Shows "City: Boston"
- **Organizer Selection**: Shows "No organizers in Boston" despite data existing
- **SelectInput**: Out-of-range value errors for city ID mismatches
- **Venue Selection**: Disabled due to missing selectedLocation.city.id

## Current Roadmap

### Short-term Fixes (Current Issues)

1. **Issue 1025: Location Context UI Inconsistencies**
   - Add proper error handling with fallbacks
   - Improve debugging capabilities in context
   - Ensure consistent location display across all UI components
   - Status: In Progress

2. **Issue 1026: SelectInput Value Mismatch**
   - Implement validation to prevent out-of-range selections
   - Add error handling for mismatched city IDs
   - Improve dropdown option synchronization with context state
   - Status: In Progress

3. **Issue 1021: Organizer Selection Filter**
   - Enhance useOrganizers hook with localStorage caching
   - Add proper null checks and error handling
   - Implement retry logic for API failures
   - Status: Fixed, awaiting merge

4. **Issue 1004: Select Venues Menu**
   - Fix race condition in venue selection initialization
   - Improve loading state handling in SidebarDrawer
   - Add safeguards for missing city selection
   - Status: Fixed, awaiting merge

### Medium-term Architecture (Epic 5003: Service Layer)

1. **Phase 1: Context Refactoring**
   - Refactor MasteredLocationContext to remove GeoLocationContext dependencies
   - Create a CoordinateUtils module for standardized coordinate handling
   - Enhance GeoLocationContext with better initialization and error handling
   - Add loading states and synchronization between contexts

2. **Phase 2: Service Layer Implementation**
   - Create dedicated services for geolocation and masteredLocation
   - Abstract API calls from context providers
   - Implement consistent caching and error handling
   - Break circular dependencies through service abstraction

3. **Phase 3: Component Updates**
   - Update all components to use GeoLocationContext as single source of truth
   - Implement loading states in each component
   - Standardize fallback behavior across all components
   - Add better user feedback for geolocation issues

4. **Phase 4: RegionsContext Retirement**
   - Migrate all RegionsContext usage to GeoLocationContext
   - Provide compatibility layer for legacy components
   - Remove RegionsContext when no longer needed
   - Complete transition to new hierarchical model

### Long-term Vision

1. **Unified Location API**
   - Standardize all location-related API endpoints
   - Implement consistent parameter naming
   - Add comprehensive validation and error handling
   - Provide better rate limiting protections

2. **Enhanced Geolocation Features**
   - Improve IP-based geolocation accuracy
   - Add user location preferences with persistence
   - Implement better caching strategies
   - Support offline mode with fallback data

3. **UI/UX Improvements**
   - Create consistent location selection experience
   - Add visual map-based selection options
   - Provide clearer feedback during loading/error states
   - Implement progressive enhancement for location features

## Implementation Notes

### Recommended Architectural Approach
1. Create a **LocationService** abstraction that both contexts can import
2. Move all API calls to this service layer
3. Implement a clean observer pattern for state synchronization
4. Standardize coordinate formats through utility functions
5. Add explicit loading states to all location-dependent components

### Potential Risks
1. Breaking changes to existing components
2. Migration complexity for legacy components
3. Temporary inconsistencies during transition
4. API rate limiting during high traffic periods

### Success Metrics
1. No console errors related to location initialization
2. Consistent location display across all UI components
3. Successful initialization even with API failures
4. Smooth user experience when changing locations

## Conclusion
The geolocation system requires significant architectural improvements to resolve current issues and provide a stable foundation for future development. The roadmap outlined above addresses both immediate fixes and long-term architectural goals to create a more robust and maintainable system.