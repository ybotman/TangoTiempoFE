# TangoTiempo.com Event & Geolocation System (README)

## Overview
TangoTiempo.com (TT.com) provides a national calendar of Argentine tango events, built with precision geographic tagging and flexible event filtering. This system is centered on two location models: `Venue` (the physical address of the event) and the `Mastered Location Hierarchy` (City > Division > Region > Country), which supports broad search queries, normalized filtering, and geographic distance calculations.

This README outlines the data structure, usage, and event filtering strategy for TT.com's geolocation-aware calendar system.

---

## Core Concepts

### 1. Events
Every Event in TT.com has the following required attributes:
- **title**: The name of the event
- **startDate** and **endDate**: When the event begins and ends
- **venueID**: A reference to a `Venue` where the event takes place

Additional attributes may include multiple organizers, categories, featured flags, and geolocation-based filtering metadata. Events also contain:
- `isActive`: Whether the event is currently visible
- `categoryFirstId`, `categorySecondId`, `categoryThirdId`: For fine-grained event classification

### 2. Venue
Each venue represents a physical place, like a dance studio or event hall. Key fields:
- **name**, **address1**, **city**, **state**, **zip**
- **geolocation**: `{ type: "Point", coordinates: [longitude, latitude] }`
- **masteredCityId**, **masteredDivisionId**, **masteredRegionId**

Venues include a geospatial index and are always assigned to a mastered city (either explicitly or via proximity detection).

### 3. Mastered Location Hierarchy
This hierarchy is a curated set of normalized cities and regions for standardizing geographic categorization.
- `masteredCity`: includes geolocation and references a `masteredDivision`
- `masteredDivision`: contains U.S. state abbreviations and links to `masteredRegion`
- `masteredRegion`: groups multiple divisions (e.g., Northeast)

All mastered locations are indexed and can be queried independently or in combination.

### 4. Deprecated `Location` Model
The legacy `Location` model has been fully deprecated. Event references to `locationID` are now redirected to `venueID`, and all filtering logic is migrated to use `Venue` and `MasteredLocation` collections. Migration and compatibility APIs remain for legacy support, but are tagged with `deprecationNotice`.

---

## Filtering & Search Options
Event filtering in TT.com supports flexible combinations of:

### A. Venue-Based Filtering
- Search by specific `venueID`
- Search by `geolocation` proximity using `$near` queries
- Example use: `GET /api/events?lat=42.35&lng=-71.05&radius=20km`

### B. Mastered Location-Based Filtering
- Search by ObjectId: `masteredCityId`, `masteredDivisionId`, `masteredRegionId`
- Search by canonical names: `masteredCityName`, `masteredRegionName`
- Combines well with geolocation fallback

### C. Combined Filtering
Filters can be composed:
- Venue proximity + Region
- Organizer + City
- Category + Date Range + City

---

## Primary API Endpoints

### Events
- `GET /api/events/` — full event search with advanced filtering (location, category, organizer, dates, etc.)
- `GET /api/events/all` — fetch all events for an appId
- `POST /api/events/post` — create a new event
- `PUT /api/events/:id` — update an event
- `DELETE /api/events/:id` — remove an event
- `GET /api/events/byMasteredLocations` — retrieve events by region/division/city name
- `GET /api/events/byRegionAndCategory` — filter by masteredRegion and category

### Venues
- `GET /api/venues/` — search for venues by name, region, or city
- `POST /api/venues/` — create a new venue (with auto-city association)
- `GET /api/venues/nearest-city` — find nearest mastered city for lat/lng

### Mastered Locations
- `GET /api/masteredLocations/regions` — list of regions
- `GET /api/masteredLocations/divisions` — list of divisions by region
- `GET /api/masteredLocations/cities` — cities by division
- `GET /api/masteredLocations/nearestMastered` — nearest mastered city to lat/lng

### Deprecated
- `GET /api/locations/` — legacy API mapped internally to `venues`

---

## Notes on Implementation
- All venue entries must include `latitude`, `longitude`, and an address.
- All geolocation fields are indexed using MongoDB's `2dsphere` indexes.
- New venue creation includes automatic duplicate detection within 100 meters.
- When a new venue is added, if `masteredCityId` is not provided, the system finds the nearest mastered city using `$near` and assigns the full hierarchy (division, region, country).
- Filtering logic in `/api/events/` supports both backward-compatible name filters and forward-compatible ObjectId filters.

---

## Summary
TT.com's geolocation system merges precision and abstraction: precision via physical venue coordinates, and abstraction via the normalized mastered region system. Every event is both place-specific and region-aware. This dual structure supports flexible calendar filtering, venue clustering, geospatial relevance sorting, and scalable geographic search across thousands of entries per year.

By transitioning from deprecated `Location` models to `Venue`-driven and mastered city hierarchy-based filtering, the TT.com platform ensures long-term flexibility, speed, and clarity in data architecture.


Summary finds for the staut
  1. The LocationContextModal component is fetching cities with coordinates through the useMasteredLocations hook
  2. I've confirmed that the cities API endpoint returns data with latitude/longitude coordinates
  3. The modal includes proper CSS imports for Leaflet and uses dynamic imports for map components
  4. The component has a guard to filter out cities without coordinates
  5. The modal includes debug logging to track what's happening during rendering
