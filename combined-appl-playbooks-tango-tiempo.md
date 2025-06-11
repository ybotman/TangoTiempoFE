# TangoTiempo.com

**TangoTiempo** is the United States’ first fully dedicated Argentine Tango event calendar. It provides a centralized, intuitive, and mobile-friendly interface for dancers, organizers, and tango communities to post, find, and interact with tango events.

## Short cut name is often just 
* TT or
* TT.com

---

## 🌐 Live Site

> [https://tangotiempo.com](https://tangotiempo.com)

---

## 📐 Architecture Overview

- **Frontend:**  
  - Built with **Next.js 15** (App Router) and **React 19+**  
  - Styled using **MUI (Material-UI v6+)**  
  - SSR + CSR hybrid setup for fast loading and SEO
- **Backend API:**  
  - Node.js (v20) + Express (served separately)
  - Hosted on Azure App Service
- **Database:**  
  - MongoDB Atlas (GeoJSON support for venue search)
- **Auth & Hosting:**  
  - Firebase Authentication (Organizers & Admin roles)
  - Cloudflare for CDN and domain management
- **CI/CD:**  
  - GitHub Actions for automated builds and deployments
- **Analytics:**  
  - Vercel Analytics + Google Analytics integration

---

## 📦 Folder Structure (Frontend)

```shell
src/
├── app/               # Next.js app router directory
│   ├── layout.js      # Root layout
│   └── page.jsx       # Landing page
├── components/        # Shared components (UI, forms, context)
├── firebase/          # Firebase client config & helpers
├── hooks/             # Custom React hooks
├── lib/               # API utilities, constants, helper funcs
├── styles/            # Global styles, MUI theme
├── public/            # Static assets (favicon, images)
└── types/             # PropTypes & shared JS types


⸻

🔐 Roles & Permissions
	•	Named User (NU):
	•	Can favorite organizers, get event notifications (tiered), and see banners
	•	Organizer:
	•	Manages events (CRUD), venue linking, ad campaigns
	•	Regional Organizer (RO):
	•	Approves new organizers/venues for their region
	•	Admin (via CalOps):
	•	Full control (CRUD for events, orgs, venues, banners)

⸻

📊 Feature Highlights
	•	📅 Advanced Calendar Filtering: by location, category, date
	•	📍 Venue Geolocation & Mapping
	•	🔔 Tiered Notification System: based on favorite orgs + region
	•	🖼️ Banner Ad Campaigns: organizers can run and target
	•	🔒 Secure Firebase Auth: role-based content access
	•	🧪 Cypress E2E Testing (Planned)
	•	⚙️ Admin Tool (CalOps): separate admin dashboard for ops

⸻

🚀 Getting Started (Local Dev)

# Frontend
cd tangotiempo.com
npm install
npm run dev

Dependencies:
	•	Node 20+
	•	MongoDB URI (set in .env.local)
	•	Firebase API keys (set in .env.local)

⸻

🧪 Testing

Cypress integration for:
	•	Event views
	•	Organizer auth flow
	•	API fetch validation (frontend and backend)

⸻

📝 Environment Variables (.env.local)

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api


⸻

🤝 Contributing

Pull requests welcome! Use feature branches and ensure PropTypes and tests are in place.

⸻

🛡️ License

© 2025 TangoTiempo.com – All Rights Reserve# TangoTiempo Context System Analysis

## Overview
TangoTiempo uses React's Context API extensively to manage state across the application. The context system primarily handles authentication, user roles, and location-based functionality. This document focuses on the location-related contexts, which form a complex interdependent system.

## Context Hierarchy

Provider initialization order (from Providers.js):
1. **AuthProvider** - Authentication state
2. **RegionsProvider** - Legacy location system (being deprecated)
3. **LocalizationProvider** - Date/time localization 
4. **RoleProvider** - User role management
5. **GeoLocationProvider** - Unified location system (→ now initializes BEFORE MasteredLocationProvider)
6. **MasteredLocationProvider** - Canonical location data from backend

## Location Context System Analysis

### Three Interrelated Location Contexts

TangoTiempo has three contexts for location management:

1. **GeoLocationContext**
   - Purpose: A unified location system that handles both the user's actual geographic location AND the selected location for filtering content
   - Key State:
     - userLocation: The user's actual physical coordinates (from IP-based geolocation)
     - selectedLocation: The location for filtering content (city, division, region structure)
   - Role:
     - Acts as the high-level context that both stores the user's physical location
     - Manages the selected filtering location (which may be different from where the user is)
     - Gradually replacing RegionsContext with more modern functionality

2. **MasteredLocationContext**
   - Purpose: Provides canonical location data from the backend database
   - Key State:
     - nearestCity: The nearest canonical city to the user's location with complete hierarchy info
   - Role:
     - Ensures locations match the canonical database structure
     - Provides authoritative location data that matches backend records
     - Supplies validated location IDs needed for API calls

3. **RegionsContext** (Deprecated)
   - Purpose: Legacy system for region selection
   - Key State:
     - selectedRegion, selectedDivision, selectedCity
     - selectedRegionID
   - Role:
     - Being phased out in favor of GeoLocationContext
     - Maintained for backward compatibility with older components

### The Circular Dependency Problem

A critical architectural issue exists between GeoLocationContext and MasteredLocationContext:

```
GeoLocationContext ←→ MasteredLocationContext
```

- **GeoLocationContext** imports `useMasteredLocation` from MasteredLocationContext
- **MasteredLocationContext** imports `useGeoLocation` from GeoLocationContext

This creates a bootstrapping problem during initialization.

### Current Solution

The circular dependency is currently managed through several mechanisms:

1. **Provider Order Change**:
   - GeoLocationProvider now initializes before MasteredLocationProvider
   - This allows GeoLocationContext to have a stable identity before MasteredLocationContext tries to use it

2. **Function Registration Pattern**:
   - GeoLocationContext defines a `registerMasteredLocationFunctions` method
   - MasteredLocationContext calls this method after initialization to register its capabilities
   - This allows deferred dependency resolution

3. **Standalone Implementation**:
   - GeoLocationContext includes its own `fetchNearestCityImpl` function
   - This provides fallback functionality when MasteredLocationContext isn't fully initialized

4. **Null Handling**:
   - Both contexts handle null values from each other
   - Default values and fallbacks are provided for when dependencies aren't yet available

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

The TangoTiempo location context system provides robust functionality but with significant complexity. The current implementation successfully manages the circular dependency through creative solutions, but a more fundamental redesign could simplify the architecture and improve maintainability. The recommendations above provide a roadmap for addressing these architectural challenges.# GeoLocation System: Current State & Roadmap

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
The geolocation system requires significant architectural improvements to resolve current issues and provide a stable foundation for future development. The roadmap outlined above addresses both immediate fixes and long-term architectural goals to create a more robust and maintainable system.# Event Filtering Architecture: API & Post-API Filtering

## Overview

TangoTiempo's event display system uses a multi-stage filtering approach combining backend API filtering with frontend post-processing. This document outlines how event data flows through the system, from initial API requests to final display in the calendar.

## Event Data Flow

1. **API Request**: Initial filter parameters sent to `/api/events` endpoint
2. **Data Transformation**: API response standardized for frontend use
3. **Post-API Filtering**: Client-side filtering based on user selections
4. **Calendar Rendering**: FullCalendar displays filtered events

## API-Level Filtering (Primary)

Events are initially filtered at the API level using query parameters:

* **Date Range** (handled by FullCalendar):
  * `start`: Beginning of date range
  * `limit`: Maximum events to return (default 100)

* **Location Hierarchy** (from GeoLocationContext):
  * `masteredRegionId` / `masteredRegionName`: Region filtering
  * `masteredDivisionId`: Division (state) filtering
  * `masteredCityId` / `masteredCityName`: City filtering
  * `venueId`: Specific venue filtering

* **Geolocation** (for proximity search):
  * `lat`: Latitude coordinate
  * `lng`: Longitude coordinate 
  * `radius`: Search radius in miles/km

* **Additional Filters**:
  * `appId`: Application identifier
  * `organizerId`: Filter by specific organizer
  * `isActive`: Show only active events

## Post-API Filtering (Secondary)

After API results return, client-side filtering provides additional refinement:

* **Category Filtering**:
  * Primary, secondary, and tertiary categories
  * Multi-select capability
  * UI controls in the PostFilter component

* **Organizer Filtering** (Implemented; Needs UI Improvement):
  * Filter by selected organizers
  * Implemented in usePostFilter hook
  * UI being improved in current issues

* **Venue Filtering** (Planned):
  * Selection of specific venues from map
  * Implementation planned in Epic 5003

* **Tags Filtering** (Future Feature):
  * Tag-based filtering capability
  * Not yet implemented

## Key Components

### Data Fetching
* **useEvents Hook**: Primary hook for fetching events with API parameters
* **eventService** (Planned): Will abstract API calls in the service layer

### Data Processing  
* **transformEvents Utility**: Standardizes API responses
* **usePostFilter Hook**: Manages client-side filtering logic

### UI Components
* **PostFilter Component**: UI for selecting category filters
* **OrganizerSelection Component**: UI for filtering by organizers (being refined)
* **VenueSelection Component**: UI for venue filtering (in development)

## Technical Implementation

### API Request Logic
```javascript
// Conceptual example - actual implementation may vary
const fetchEvents = async () => {
  // Location parameters from GeoLocationContext
  const locationParams = selectedLocation ? {
    masteredCityId: selectedLocation.cityId,
    masteredDivisionId: selectedLocation.divisionId,
    masteredRegionId: selectedLocation.regionId
  } : {};
  
  // Date parameters from FullCalendar
  const dateParams = {
    start: calendarApi.view.activeStart.toISOString(),
    end: calendarApi.view.activeEnd.toISOString()
  };
  
  // Combined parameters
  const requestParams = {
    appId: 1,
    limit: 200,
    ...locationParams,
    ...dateParams
  };
  
  // API call
  const response = await fetch('/api/events?' + new URLSearchParams(requestParams));
  return await response.json();
};
```

### Post-API Filtering Logic
```javascript
// Conceptual example - actual implementation may vary
const applyPostFilters = (events) => {
  return events.filter(event => 
    // Category filtering
    (selectedCategories.length === 0 || 
     selectedCategories.includes(event.categoryFirst) ||
     selectedCategories.includes(event.categorySecond) ||
     selectedCategories.includes(event.categoryThird)) &&
    
    // Organizer filtering (if enabled)
    (!filterByOrganizer || 
     selectedOrganizers.includes(event.organizerId)) &&
     
    // Venue filtering (if enabled)
    (!filterByVenue ||
     selectedVenues.includes(event.venueId))
  );
};
```

## Optimization Strategies

* **Cached API Results**: Responses stored in localStorage with timestamp
* **Batched Updates**: Filter changes trigger batched API requests
* **Deferred Processing**: Large datasets process in chunks for UI responsiveness
* **Field Normalization**: Handles inconsistent field naming (venueID vs venueId)

## Current Development Focus

* **Service Layer Migration**: Moving API logic to dedicated services
* **Organizer Filtering UI**: Improving the organizer selection experience
* **Venue Selection**: Implementing venue filtering via map interface
* **Performance Optimization**: Reducing unnecessary API calls with better caching

## Best Practices for Development

* **API Filters First**: Always prefer API filtering over client-side for performance
* **Combined Filtering**: Design for combination of multiple filter types
* **Progressive Loading**: Implement loading indicators for slow API responses
* **Error Resilience**: Provide fallbacks when filtering services fail
* **Consistent Pattern**: Follow established patterns for new filter types# IP Geolocation System - Architectural Overview

 ## System Architecture

  TangoTiempo uses a backend-proxied approach for IP-based geolocation that enhances reliability and security:

  1. Client-side Request: The frontend makes calls to /api/firebase/geo/ip endpoint rather than directly to external services
  2. Backend Proxy: Server intercepts these requests and forwards them to ipapi.co
  3. Response Handling: Server processes the response, adds caching headers, and provides fallbacks when needed

  ### Key Features
  - Rate Limit Protection: Server handles rate limits and provides fallback coordinates
  - Caching: 1-hour cache headers reduce redundant external API calls
  - Error Resilience: Fallback coordinates (US center: 39.8283, -98.5795) when service fails
  - Privacy Enhancement: Client code doesn't directly access third-party services
  - Identification: Uses custom User-Agent ('TangoTiempo/1.0') for tracking and compliance

  ### Implementation Approach
  The system follows a layered approach:
  1. Frontend hooks and contexts request location data
  2. Backend proxy handles external service communication
  3. Multi-level fallbacks ensure location functionality despite service issues
  4. Session-based caching prevents repeated hits during rate limiting periods

  ### Alternative Services
  While ipapi.co is the current active service, the system maintains credentials for alternatives:
  - IPSTACK: Alternative geolocation provider (credentials present but not actively used)
  - AbstractAPI: Secondary geolocation option (credentials present but not actively used)

  This architecture provides flexibility to switch providers without frontend code changes.
  ### Implementation Considerations
  - Service Selection: When choosing between services, consider rate limits, accuracy, and response format compatibility
  - Error Handling: Always implement robust error handling and fallbacks for geolocation services
  - Caching Strategy: Implement session-based and HTTP caching to reduce API calls
  - Privacy Compliance: Ensure geolocation usage complies with privacy regulations (GDPR, CCPA)
  - Coordinates Format: Standardize coordinate format (latitude/longitude) throughout the application

 ### Maintenance Guidelines
  - Periodically review rate limits and service performance
  - Monitor for changes in API response formats
  - Consider implementing a service rotation strategy for high-traffic periods
  - Maintain alternative service credentials for rapid switching if needed



## A receent Q and A about current state of the IP location

  ### 1. Where is your FE getting and loading this data?
    - Your frontend gets location data from two main sources:
        - useGeoLocations hook (src/app/hooks/useGeoLocations.js) makes the initial call to /api/firebase/geo/ip
      - This hook is used by GeoLocationContext (src/app/contexts/GeoLocationContext.js), which manages the user's location
  ### 2. Is this information being managed in any contexts?
    - Yes, this information is managed in multiple contexts:
        - GeoLocationContext: Stores user's actual location and selected location for filtering
      - MasteredLocationContext: Uses the coordinates to fetch the nearest canonical city from the backend
      - RegionsContext (deprecated): Still syncs with location data but being phased out
  ### 3. Is this info available in the hamburger debug modals?
    - Yes, based on references in the code, this information should be visible in:
        - GeoLocationContextDebug.js (src/app/components/Modals/Debug/GeoLocationContextDebug.js)
      - MasteredLocationContextDebug.js (src/app/components/Modals/Debug/MasteredLocationContextDebug.js)
      - The debug modals should show coordinates, selected locations, and context state

 ### The geolocation data flows in this sequence:
  1. useGeoLocations hook fetches raw coordinates from the proxy API
  2. GeoLocationContext receives these coordinates and initializes user location
  3. MasteredLocationContext uses these coordinates to fetch the nearest city
  4. Both contexts provide this data to the rest of the application, including debug modals
# TangoTiempo Service Layer Architecture

## Overview

The service layer architecture is a fundamental design pattern that separates data access and API communication from UI components and state management. In TangoTiempo, services act as the bridge between the frontend application and backend APIs, providing a consistent interface for data operations while abstracting away implementation details.

This playbook describes the current state and future direction of TangoTiempo's service layer as part of Epic 5003: Service Layer Architecture.

## Core Principles

* **Single Responsibility**: Each service handles one domain area (events, venues, auth, etc.)
* **Abstraction**: Services hide implementation details of API communication
* **Consistency**: All services follow the same patterns and error handling approaches
* **Testability**: Services are designed for easy unit testing and mocking
* **Resilience**: Services implement retry logic, timeouts, and graceful error handling

## Service Types

### Current Services

* **VenueService**: Handles venue data operations (currently the most complete service implementation)
  * Retrieves venue data filtered by location
  * Provides venue lookup by ID
  * Calculates proximity to user location

### Planned Services (Epic 5003)

* **Phase 1: Foundation & Core Services**
  * **EventService**: Event retrieval and filtering
  * **ServiceUtils**: Shared functionality across services

* **Phase 2: Location & Authentication Services**
  * **GeoLocationService**: User location operations
  * **MasteredLocationService**: Canonical location data operations
  * **AuthService**: Firebase authentication operations

* **Phase 3: User & Organizer Services**
  * **UserService**: User profile and preferences management
  * **OrganizerService**: Organizer data operations

* **Phase 4: Utility & Support Services**
  * **ImageService**: Image handling operations
  * **AnalyticsService**: User behavior tracking
  * **LoggingService**: Application logging
  * **NotificationService**: User notifications

## Standard Service Pattern

Each service follows a consistent structure:

* **Isolated Responsibility**: Focus on a specific domain
* **API Abstraction**: Hide endpoint details and request formatting
* **Error Handling**: Consistent error management and logging
* **Caching**: Data caching where appropriate
* **TypeScript Types**: Complete interface definitions
* **Documentation**: JSDoc comments for all functions

## Benefits of Service Layer

* **Resolves Circular Dependencies**: By extracting API calls from contexts
* **Simplifies Testing**: Pure functions are easier to test than complex hooks
* **Improves Maintainability**: Changes to API structure affect only service files
* **Ensures Consistency**: Standardizes API interactions across the application
* **Enhances Reusability**: Services can be used by multiple components and hooks

## Service Integration with Hooks and Contexts

Services are designed to be consumed by React hooks and context providers, which then expose data to components:

* **Hooks** manage component-level state and call services when needed
* **Contexts** utilize services to provide application-wide state
* **Components** consume hooks and contexts, never services directly

This layered approach creates clear separation of concerns:

1. **Component Layer**: UI rendering and user interaction
2. **Hook/Context Layer**: State management and component integration
3. **Service Layer**: Data fetching and API communication
4. **API Layer**: Backend endpoints

## Epic 5003: Service Layer Architecture

Epic 5003 is implementing a comprehensive service layer throughout TangoTiempo, with the following objectives:

### Current State

* Initial implementation of venueService.js provides pattern for other services
* Most API calls still embedded within hooks
* Circular dependencies exist between contexts
* Inconsistent error handling across the application

### Target State

* Complete service layer covering all API interactions
* Hooks and contexts refactored to use service layer
* Resolved circular dependencies
* Consistent error handling and caching strategy
* Comprehensive test coverage for services

### Implementation Phases

1. **Phase 1: Foundation & Core Services**
   * Establish service pattern with eventService and refined venueService
   * Implement serviceUtils for shared functionality
   * Update core hooks to use these services

2. **Phase 2: Location & Authentication Services**
   * Implement geoLocationService and masteredLocationService
   * Create authService for Firebase operations
   * Resolve circular dependencies between contexts

3. **Phase 3: User & Organizer Services**
   * Implement userService and organizerService
   * Add caching for frequently used data
   * Update related hooks and contexts

4. **Phase 4: Utility & Support Services**
   * Add remaining utility services
   * Implement logging and analytics
   * Ensure consistent patterns across all services

5. **Phase 5: Testing & Documentation**
   * Add unit tests for all services
   * Create comprehensive documentation
   * Implement test mocks for services

## Best Practices for Using Services

* **Never Call Services Directly from Components**: Always use hooks or contexts as intermediaries
* **Follow Established Patterns**: When creating new services, refer to existing implementations
* **Handle Loading States**: Account for async operations in UI
* **Implement Error Handling**: Handle service errors gracefully at the UI level
* **Use Types**: Leverage TypeScript types provided by services

## Example Service Implementation

Here's a conceptual example of a service structure (actual implementation details may vary):

```
src/
└── services/
    ├── serviceUtils.js      # Shared utilities
    ├── eventService.js      # Event operations
    ├── venueService.js      # Venue operations
    ├── geoLocationService.js # Location operations
    ├── authService.js       # Authentication
    ├── userService.js       # User operations
    └── index.js             # Service barrel file
```

## Benefits of the Service Layer Architecture

* **Maintainability**: Changes to backend APIs only require updates to service files
* **Testability**: Services can be tested in isolation from UI components
* **Consistency**: Standardized approach to API communication and error handling
* **Performance**: Centralized implementation of caching and request optimization
* **Developer Experience**: Clear separation of concerns and patterns

## Current Status (May 2025)

Epic 5003 is in the initial planning stage, with focus on establishing patterns and implementing core services. The service layer architecture is a key part of TangoTiempo's ongoing architectural improvements, alongside efforts to resolve circular dependencies and standardize state management.