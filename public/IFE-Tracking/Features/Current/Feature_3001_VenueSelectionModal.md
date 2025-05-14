# Feature 3001: Venue Selection Modal

## Summary
A new Venue Selection Modal that allows users to select specific venues for events after a MasteredCity has been chosen. The modal displays venues as points on a map with filtering capabilities, enabling users to precisely locate and select venues within a specified radius of their chosen city.

## Motivation
- Enhance event search precision by allowing users to filter by specific venues
- Provide geographic context to event locations through visual map representation
- Allow users to discover venues by location rather than just by name
- Complete the location hierarchy selection from Country/Region/Division/City down to specific Venue

## Scope
- **In-Scope:** 
  - New menu item "Select Venue" next to/below "Select Nearest City" (grayed out when no MasteredCity is selected)
  - Map-based venue selection modal with Leaflet
  - Venue display as points on a map centered on selected MasteredCity
  - Radius-based venue filtering (default ~200 miles)
  - Venue type filtering (Milonga, Practica, Class)
  - Scope switch to expand search to Division level
  - Zoom/pan capabilities

- **Out-of-Scope:** 
  - Creating or editing venues (separate feature)
  - Street-level directions to venues
  - Integration with third-party mapping services beyond Leaflet
  - Full-text venue search (separate feature)

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | New modal with Leaflet map, venue points, filtering controls, and scope switch |
| API        | Consumes `/api/venues` endpoint with geo-filtering parameters |
| Backend    | Uses existing venue data model with GeoJSON points |
| Integration | Leaflet.js with React-Leaflet (dynamic import, no SSR) |

## Design
Visual workflow to be added:
1. User selects MasteredCity in LocationContextModal
2. "Select Venue" menu item becomes active (no longer grayed out)
3. User clicks on "Select Venue" menu item
4. Venue Selection Modal opens centered on MasteredCity coordinates
5. Venues displayed as points within default radius
6. User can filter, zoom, pan, and select a venue

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ✅ Complete    | Add "Select Venue" menu item        | 2025-04-25    |
| ✅ Complete    | Implement conditional enabling based on MasteredCity | 2025-04-25 |
| ✅ Complete    | Create VenueSelectionModal component | 2025-04-25    |
| ✅ Complete    | Implement Leaflet map integration    | 2025-04-25    |
| ✅ Complete    | Add venue point display on map       | 2025-04-25    |
| ✅ Complete    | Add venue type filtering controls    | 2025-04-25    |
| ✅ Complete    | Create scope switch (City/Division)  | 2025-04-25    |
| ✅ Complete    | Connect to venue API endpoint        | 2025-04-25    |
| ✅ Complete    | Add custom useVenueSelection hook    | 2025-04-25    |
| ✅ Complete    | Add user interactions (select venue) | 2025-04-25    |
| ✅ Complete    | Add empty state messaging            | 2025-04-25    |
| ✅ Complete    | Implement radius-based filtering     | 2025-04-25    |
| ✅ Complete    | Fix build errors                     | 2025-04-25    |
| ✅ Complete    | Write unit tests                     | 2025-04-25    |
| ⏳ Pending      | Write Cypress tests (future sprint)  | 2025-04-25    |

## Rollback Plan
- Disable venue selection feature by reverting code
- Revert to previous location selection flow
- Remove venue filter from event queries

## Dependencies
- LocationContextModal must be functioning correctly
- Venue data with proper geo coordinates must exist in database
- `/api/venues` endpoint must support geo-filtering
- Leaflet.js and React-Leaflet libraries

## Linked Issues / Docs
- LocationContextModal implementation
- GeoLocationContext for managing selected locations
- Venue data model documentation

## Owner
Tango Tiempo Dev Team

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-04-25 |
| First Dev | 2025-04-25 |
| Review    | TBD        |
| Completed | TBD        |