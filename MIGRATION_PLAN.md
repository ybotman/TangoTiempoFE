# TangoTiempo Migration: calendar-be → calendar-be-af

**Agent**: Quinn (Migration Specialist)
**Created**: 2026-01-22
**Branch FE**: `migrate-tt-to-functions`
**Branch AF**: `migrate-tt-to-functions`

## Overview

Migrate TangoTiempo frontend from calling calendar-be (Express) to calendar-be-af (Azure Functions), preserving exact current behavior.

## Architecture

```
CURRENT:
TangoTiempo → NEXT_PUBLIC_BE_URL (localhost:3010) → calendar-be (Express)

TARGET:
TangoTiempo → NEXT_PUBLIC_AF_URL (localhost:7071) → calendar-be-af (Azure Functions)
```

## Existing Infrastructure

- Feature flag: `NEXT_PUBLIC_AF_ENABLED` (currently `false`)
- AF URL: `NEXT_PUBLIC_AF_URL=http://localhost:7071`
- AF Functions already exist for most endpoints

## Endpoint Inventory

### FE Hooks/Services → BE Endpoints

| FE File | BE Endpoint | AF Function | Status |
|---------|-------------|-------------|--------|
| useEvents.js | GET /api/events | Events.js (GET) | EXISTS |
| useEvents.js | GET /api/events/id/:id | Events.js (GET by ID) | EXISTS |
| useEvents.js | POST /api/events/post | Events.js (POST) | EXISTS |
| useEvents.js | PUT /api/events/:id | Events.js (PUT) | EXISTS |
| useEvents.js | DELETE /api/events/:id | Events.js (DELETE) | EXISTS |
| useEvents.js | POST /api/events/ra/create | Events.js (RA) | CHECK |
| useEvents.js | PUT /api/events/ra/:id | Events.js (RA) | CHECK |
| useEvents.js | DELETE /api/events/ra/:id | Events.js (RA) | CHECK |
| venueService.js | GET /api/venues | Venues.js | EXISTS |
| venueService.js | GET /api/venues/:id | Venues.js | EXISTS |
| venueService.js | POST /api/venues | Venues.js | EXISTS |
| venueService.js | PUT /api/venues/:id | Venues.js | EXISTS |
| venueService.js | DELETE /api/venues/:id | Venues.js | EXISTS |
| useOrganizers.js | GET /api/organizers | Organizers.js | EXISTS |
| useCategories.js | GET /api/categories | Categories.js | EXISTS |
| useRoles.js | GET /api/roles | Roles.js | EXISTS |
| useServiceHealth.js | GET /api/health/* | Health_*.js | EXISTS |
| useGeoLocations.js | Various geo endpoints | Geo.js | EXISTS |

## Migration Order

### Phase 1: Read-Only GET Endpoints (Lowest Risk)
1. GET /api/categories
2. GET /api/roles
3. GET /api/health/*
4. GET /api/venues
5. GET /api/organizers
6. GET /api/events

### Phase 2: Write Endpoints (POST)
7. POST /api/events/post
8. POST /api/venues

### Phase 3: Update Endpoints (PUT)
9. PUT /api/events/:id
10. PUT /api/venues/:id

### Phase 4: Delete Endpoints (DELETE)
11. DELETE /api/events/:id
12. DELETE /api/venues/:id

### Phase 5: Special Endpoints (RA, Geo, etc.)
13. RA event endpoints
14. Geo endpoints
15. User tracking endpoints

## Strategy

### Option A: Feature Flag Switch (Recommended)
- Keep AF_ENABLED flag
- Create URL resolver utility
- Update each hook to use resolver
- Toggle flag to switch all at once

### Option B: Per-Endpoint Migration
- Update each hook individually
- No central flag needed
- More surgical but more changes

**Decision**: Use Option A - create a central API URL resolver that respects the AF_ENABLED flag.

## Files to Create/Modify

### New Files
- `src/utils/apiUrlResolver.js` - Central URL resolver

### Modified Files (per endpoint)
- Each hook/service updated to use resolver

## Testing Strategy

1. Run AF locally: `cd calendar-be-af && func start`
2. Run TT locally: `cd tangotiempo.com && npm run dev`
3. Set `NEXT_PUBLIC_AF_ENABLED=true` in .env.local
4. Test each endpoint via UI
5. Compare responses between BE and AF

## Commit Convention

```
feat(migrate): [METHOD] /api/endpoint - switch to Azure Functions

- Update [file] to use AF endpoint
- Verified parity with calendar-be
- Tested: [test description]

CALBEAF-XX
```
