# calendar-be-af Function Status

> **Last Updated:** 2026-01-29 by Sarah (audit of Fulton's v1.19.0 promotion)

## Deployed (DEVL + TEST)

* `UserLogins.js` - `GET /api/userlogins/firebase/:firebaseId` `# v1.19.0 - DEPLOYED`
* `Events.js` - `GET /api/events`, `GET /events/id/{id}`, `POST /api/events/post`, `PUT /events/{eventId}`, `DELETE /events/{eventId}` `# v1.19.0 - DEPLOYED`
* `EventsRA.js` - `POST /api/events/ra/create`, `PUT /api/events/ra/{eventId}`, `DELETE /api/events/ra/{eventId}` `# v1.19.0 - DEPLOYED`

> If the domain you are working on is listed here, you are expected to use the new function.
> - Document according to the IFE standard
> - Test according to the appropriate level change
> - Notify user that we are migrating to the deployed AF

## WIP

* `Category_Get.js` `# WIP (Accepted)`

> If the domain you are working on is listed here, you are expected to ask if we should use the new function.

## Not Yet Ready

* `Organizer_Get.js` `# Deferred`
* `Organizer_Create.js` `# Deferred`
* `Venue_Get.js` `# Deferred`
* `MasteredLocations_Get.js` `# Deferred - See note below`

### MasteredLocations AF Status (CALBEAF-68)

**Deep FE Audit (2026-01-29):** 33 files analyzed. Most user-facing masteredLocations access disabled.

#### Components that DIRECTLY call `/api/masteredLocations/*` at runtime:

| Component | Endpoints Called | Role Required | Status |
|-----------|-----------------|---------------|--------|
| **VenueModalList** | countries, regions, divisions, cities | Regional Organizer | ACTIVE - cascading dropdowns for venue filtering |
| **LocationAPIContext** | nearestMastered, cities, regions, divisions | N/A (infra) | MOUNTED but does NOT auto-call on page load |
| **MasteredLocationContextDebug** | nearestMastered | Admin | ACTIVE - debug menu only |

#### Components that use mastered DATA but NOT via masteredLocations endpoints:

| Component | How It Gets Mastered Data | Status |
|-----------|--------------------------|--------|
| **VenueModalAdd/Edit/AddWithSearch** | `/api/venues/geocode` (backend does nearest-city lookup) | ACTIVE |
| **CreateEventDetailModal** | GeoLocationContext.selectedLocation | ACTIVE |
| **ViewEventDetailModal/Venue** | Props from event/venue data | ACTIVE |
| **useRAOrganizers** | Passes masteredCityId as filter to `/api/organizers` | ACTIVE |
| **useVenueSelection** | Filters by masteredDivisionId from context | ACTIVE |
| **transformEvents.js** | Pass-through of mastered fields from API response | ACTIVE |

#### Dead code (5 files, safe to remove):
- `useMasteredCities.js` - zero importers
- `LocationLogger.js` - not mounted in Providers
- `LocationContextModal.js` - removed from SidebarDrawer
- `LocationSelector.js` - hardcoded `showLocationSelector=false`
- `MasteredLocationLogger.js` - mounted but empty effect (no-op)

#### Key finding: GeoLocationContext does NOT auto-call masteredLocations
The old "auto-detect nearest mastered city on page load" flow is disabled. The system now uses lat/lng coordinates for event/venue filtering instead of mastered location IDs.

**Conclusion:** Only **VenueModalList** (Regional Organizer users) hits these endpoints at runtime. Priority: MEDIUM - low traffic, RO/RA users only. Verify AF logs before implementing.

## DOMAINS
- events
- categories
- organizers
- venues
- geolocations
- userlogins
- masteredLocations
- tags
- roles
- permissions
