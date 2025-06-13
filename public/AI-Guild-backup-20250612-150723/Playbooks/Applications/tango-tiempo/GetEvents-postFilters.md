# Event Filtering Architecture: API & Post-API Filtering

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
* **Consistent Pattern**: Follow established patterns for new filter types