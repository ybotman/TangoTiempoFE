# Event Filter Fields: Geo Location

This document summarizes all event fields used for geo-location-based filtering on the opening page of the TangoTiempo calendar.

## API-Level Filtering Fields
- `masteredCityId` (ObjectId): Mastered city identifier
- `masteredDivisionId` (ObjectId): Mastered division (state) identifier
- `masteredRegionId` (ObjectId): Mastered region identifier
- `masteredCityName` (String): Mastered city name (legacy/compat)
- `masteredRegionName` (String): Mastered region name (legacy/compat)
- `venueId` (ObjectId/String): Venue identifier
- `lat` (Number): Latitude (for proximity search)
- `lng` (Number): Longitude (for proximity search)
- `radius` (Number): Search radius (miles/km)

## Event Object Fields (transformed/used in UI)
- `venueId`, `venueID`, `locationID` (String/ObjectId): Venue/location identifiers (various formats for compatibility)
- `venueName`, `locationName` (String): Venue/location names
- `masteredCityName`, `masteredDivisionName`, `masteredRegionName` (String): Hierarchical location names

## Notes
- Filtering can be performed by both ID and name for backward compatibility.
- Venue-based and mastered city/division/region-based filtering are supported.
- Proximity search uses latitude/longitude and radius.

---
See also: `public/AI-Guild/Playbooks/Applications/MasterCalendar/Geolocation System and Events.md` and `src/app/hooks/useEvents.js` for implementation details.
