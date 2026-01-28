# Migration Log: TangoTiempo → Azure Functions

**Agent**: Quinn (original), Sarah (endpoint audit 2026-01-28)
**Started**: 2026-01-22
**Status**: FE Code Migration COMPLETE | Endpoint Parity IN PROGRESS

---

## Summary

All FE Client Component API calls now use `apiUrlResolver.js` which switches between:
- `NEXT_PUBLIC_BE_URL` (calendar-be) when `NEXT_PUBLIC_AF_ENABLED=false`
- `NEXT_PUBLIC_AF_URL` (calendar-be-af) when `NEXT_PUBLIC_AF_ENABLED=true`

**To test**: Set `NEXT_PUBLIC_AF_ENABLED=true` in `.env.local`

---

## Complete Endpoint Audit (2026-01-28)

**Audited by**: Sarah (TangoTiempo FE Agent)
**Total Endpoints Required**: ~45

### Phase 1: GET Endpoints (Read-Only) - FOR TEST VALIDATION

These can be tested first with minimal risk.

| Endpoint | FE File(s) | AF Status | Parity Verified |
|----------|-----------|-----------|-----------------|
| GET /api/events | useEvents.js | EXISTS | YES |
| GET /api/events/summary | explorer/page.js | ? | NO |
| GET /api/events/id/:eventId | useEvents.js | EXISTS | YES |
| GET /api/events/count | useMigratedOrganizers.js | ? | NO |
| GET /api/categories | useCategories.js | EXISTS | YES |
| GET /api/roles | useRoles.js | EXISTS | YES |
| GET /api/venues | useVenues.js, venueService.js | EXISTS | YES |
| GET /api/venues/:venueId | useVenues.js, venueService.js | EXISTS | YES |
| GET /api/venues/geocode | VenueModalAdd.js, VenueModalEdit.js | ? | NO |
| GET /api/venues/check-proximity | VenueModalAdd.js | ? | NO |
| GET /api/organizers | useOrganizers.js, useUserLogins.js | EXISTS | YES |
| GET /api/organizers/:organizerId | useOrganizers.js | EXISTS | YES |
| GET /api/organizers/firebase/:fbId | useOrganizers.js | ? | NO |
| GET /api/regions/activeRegions | RegionMenu.js | ? | NO |
| GET /api/userlogins/firebase/:fbId | AuthContext.js, useUsers.js | ? | NO |
| GET /api/userlogins/all | useUserLogins.js, useMigratedOrganizers.js | ? | NO |
| GET /api/masteredLocations/countries | useMasteredLocations.js, useMasteredCities.js | ? | NO |
| GET /api/masteredLocations/regions | LocationAPIContext.js, useMasteredLocations.js | ? | NO |
| GET /api/masteredLocations/divisions | LocationAPIContext.js, useMasteredLocations.js | ? | NO |
| GET /api/masteredLocations/cities | LocationAPIContext.js, useMasteredLocations.js | ? | NO |
| GET /api/masteredLocations/nearestMastered | LocationAPIContext.js, useMasteredLocations.js | ? | NO |
| GET /api/health (or /health for BE) | useBackendHealth.js | EXISTS | YES |

### Phase 2: POST Endpoints (Create)

| Endpoint | FE File(s) | AF Status | Parity Verified |
|----------|-----------|-----------|-----------------|
| POST /api/events (AF) or /api/events/post (BE) | useEvents.js | EXISTS | ? |
| POST /api/events/ra/create | useEvents.js (RA role) | ? | NO |
| POST /api/events/upload-image | uploadEventImages.js | ? | NO |
| POST /api/venues | useVenues.js, venueService.js | EXISTS | ? |
| POST /api/venues/check-proximity | VenueModalAddWithSearch.js | ? | NO |
| POST /api/organizers | useOrganizers.js | ? | NO |
| POST /api/organizers/generate-sas-token | useImages.js | ? | NO |
| POST /api/userlogins/ | AuthContext.js | ? | NO |
| POST /api/userlogins/activate-organizer | CreateEventDetailModal.js | ? | NO |
| POST /api/frontend-logs | useActivityLogger.js | ? | NO |
| POST /api/frontend-logs/batch | useActivityLogger.js | ? | NO |

### Phase 3: PUT Endpoints (Update)

| Endpoint | FE File(s) | AF Status | Parity Verified |
|----------|-----------|-----------|-----------------|
| PUT /api/events/:eventId | useEvents.js | EXISTS | ? |
| PUT /api/events/ra/:eventId | useEvents.js (RA role) | ? | NO |
| PUT /api/venues/:id | useVenues.js, venueService.js | EXISTS | ? |
| PUT /api/organizers/:organizerId | useOrganizers.js | ? | NO |
| PUT /api/userlogins/updateUserInfo | useUserLogins.js, useUsers.js | ? | NO |
| PUT /api/userlogins/:fbId/roles | useUserLogins.js | ? | NO |

### Phase 4: DELETE Endpoints

| Endpoint | FE File(s) | AF Status | Parity Verified |
|----------|-----------|-----------|-----------------|
| DELETE /api/events/:eventId | useEvents.js | EXISTS | ? |
| DELETE /api/events/ra/:eventId | useEvents.js (RA role) | ? | NO |
| DELETE /api/venues/:id | useVenues.js, venueService.js | EXISTS | ? |

---

## Endpoint Status Legend

- **EXISTS**: Confirmed in AF codebase
- **?**: Unknown - needs Fulton to verify
- **NO**: Not implemented in AF
- **Parity Verified YES**: Tested in parity-report-2025-12-04.md
- **Parity Verified NO**: Not yet tested

---

## TEST Deployment Strategy

### Option A: GET-Only TEST (Recommended First Step)

1. Enable AF for GET endpoints only
2. Keep POST/PUT/DELETE pointing to BE
3. Validate read operations work correctly
4. Low risk - no data modifications

### Option B: Full AF Switch

1. All endpoints switch to AF at once
2. Higher risk but simpler configuration
3. Requires all endpoints implemented and tested

**Decision**: Start with Option A - GET-only validation in TEST

---

## Files Migrated (Using apiUrlResolver)

### Hooks (14 files)
- useCategories.js
- useRoles.js
- useVenues.js
- useOrganizers.js
- useEvents.js (includes RA endpoints)
- useUsers.js
- useMasteredLocations.js
- useMasteredCities.js
- useUserLogins.js
- useRAOrganizers.js
- useBackendHealth.js
- useImages.js
- useActivityLogger.js
- useMigratedOrganizers.js

### Services (1 file)
- venueService.js

### Contexts (2 files)
- AuthContext.js
- LocationAPIContext.js

### Utils (1 file)
- uploadEventImages.js

### Components (10 files)
- VenueModalAdd.js
- VenueModalEdit.js
- VenueModalAddWithSearch.js
- VenueUpcomingEvents.js
- VenueGeocodeModal.js
- RegionalOrganizersSettings.js
- RegionalOrganizersDelegated.js
- RegionMenu.js
- CreateEventDetailModal.js
- ViewEventDetailsOrganizer.js

### Pages (1 file)
- explorer/page.js

---

## Files NOT Migrated (By Design)

### Server Components (SSR - use env directly)
- event/[id]/page.js - Social sharing/SEO page
- organizers/[slug]/page.js - Organizer profile page

### Health Check Hooks (Check both backends)
- useServiceHealth.js - Intentionally checks BE and AF separately

### API Routes (Server-side)
- api/health/version/route.js

### Debug Components
- EnvVariablesDebug.js - Shows raw env vars

---

## Commits

| Commit | Description |
|--------|-------------|
| 0b7b6df | Phase 0 + categories |
| ce165ad | roles |
| 6f6e7c8 | core hooks/services |
| fb74e8a | migration log update |
| 362234e | additional hooks |
| 350b011 | more hooks |
| 493edde | contexts and utils |
| 6e4d35d | components |
| b60e03a | pages and modals |

---

## Testing Checklist

### Phase 1: GET Endpoints (TEST Environment)
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Set `NEXT_PUBLIC_AF_ENABLED=true` in TEST environment
- [ ] Categories load on homepage
- [ ] Events display on calendar
- [ ] Venues load in dropdowns
- [ ] Organizers display correctly
- [ ] User login/lookup works
- [ ] Mastered locations load (regions, divisions, cities)
- [ ] Region menu populates

### Phase 2: Write Operations (After GET Validated)
- [ ] Create event (RO role)
- [ ] Create event (RA role)
- [ ] Edit event
- [ ] Delete event
- [ ] Create/edit venue
- [ ] Update organizer profile
- [ ] Image upload works

---

## Action Items

### For Fulton (calendar-be-af)
1. Verify which endpoints from the audit are implemented
2. Implement missing endpoints (especially RA, userlogins, masteredLocations)
3. Update parity report with all endpoints

### For Sarah (tangotiempo.com)
1. ✅ Complete endpoint audit (done 2026-01-28)
2. Update this log as endpoints are verified
3. Test GET endpoints when AF is ready

### For El Gotan
1. Decide on TEST deployment timeline
2. Coordinate with Fulton on missing endpoints

---

## References

- **Parity Report**: `calendar-be-af/.ybotbot/parity-report-2025-12-04.md`
- **Migration Plan**: `tangotiempo.com/MIGRATION_PLAN.md`
- **API Resolver**: `tangotiempo.com/src/app/utils/apiUrlResolver.js`

---

**Original Migration**: 2026-01-22 (Quinn)
**Endpoint Audit**: 2026-01-28 (Sarah)
