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