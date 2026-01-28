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
**Total Endpoints Required**: ~45 (migration) + ~12 (AF-only)

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

## AF-Only Endpoints (Already Working - Not Part of Migration)

These endpoints call AF directly via `NEXT_PUBLIC_AF_URL`, NOT through the feature flag.
They are already working in production and don't need migration.

### Tracking & Analytics

| Endpoint | FE File(s) | Purpose |
|----------|-----------|---------|
| POST /api/visitor/track | calendar/layout.js | Anonymous visitor tracking |
| POST /api/user/login-track | AuthContext.js | User login event |
| POST /api/user/logout-track | SiteMenuBarUserDrawer.js | User logout event |
| POST /api/user/mapcenter-track | calendar/layout.js | Map center change tracking |

### Map Center Preferences

| Endpoint | FE File(s) | Purpose |
|----------|-----------|---------|
| GET /api/mapcenter | GeoLocationContext.js | Get user's saved map center |
| PUT /api/mapcenter | GeoLocationContext.js | Save user's map center |

### Geolocation Services

| Endpoint | FE File(s) | Purpose |
|----------|-----------|---------|
| POST /api/geo/google-geolocate | trackingHelper.js, geolocationHelper.js | Google geolocation API |
| GET /api/geo/mapbox/reverse | trackingHelper.js | Mapbox reverse geocoding |
| GET /api/geo/bigdatacloud/ip | useGeoLocations.js, GeoComparisonDashboard.js | IP-based geolocation |
| GET /api/geo/abstract/ip | GeoComparisonDashboard.js | Abstract IP geolocation |
| GET /api/geo/ipapico/ip | useServiceHealth.js, GeoComparisonDashboard.js | IPapi.co geolocation |
| GET /api/cloudflare/info | trackingHelper.js, useServiceHealth.js | Cloudflare headers/info |

### Health Checks

| Endpoint | FE File(s) | Purpose |
|----------|-----------|---------|
| GET /api/health/mongodb | useServiceHealth.js | MongoDB connection health |

---

## Environment Variables

### Required for Migration

| Variable | Purpose | Example Values |
|----------|---------|----------------|
| `NEXT_PUBLIC_AF_ENABLED` | Feature flag for BE→AF switch | `true` / `false` |
| `NEXT_PUBLIC_AF_URL` | Azure Functions URL | `http://localhost:7071` (local), `https://calendarbeaf-test.azurewebsites.net` (TEST), `https://calendarbeaf-prod.azurewebsites.net` (PROD) |
| `NEXT_PUBLIC_BE_URL` | Express BE URL (fallback) | `http://localhost:3010` (local), `https://calendarbe-prod-xxx.azurewebsites.net` (PROD) |

### Environment-Specific Settings

| Environment | AF_ENABLED | AF_URL | BE_URL |
|-------------|------------|--------|--------|
| Local Dev | `false` | `http://localhost:7071` | `http://localhost:3010` |
| TEST | `true` (for testing) | `https://calendarbeaf-test.azurewebsites.net` | (not used when AF enabled) |
| PROD | `false` (until validated) | `https://calendarbeaf-prod.azurewebsites.net` | `https://calendarbe-prod-xxx.azurewebsites.net` |

---

## Configuration Considerations

### Authentication

Both BE and AF must handle Firebase authentication tokens the same way:
- FE sends `Authorization: Bearer <firebase-token>` header
- Backend validates token with Firebase Admin SDK
- Returns user info from MongoDB based on Firebase UID

**Verification needed**: Confirm AF validates Firebase tokens identically to BE.

### CORS Configuration

AF must allow requests from:
- `http://localhost:3001` (local FE dev)
- `https://tangotiempo.com` (PROD)
- `https://test.tangotiempo.com` (TEST, if applicable)

**Verification needed**: Confirm AF CORS settings match BE.

### Error Response Format

FE expects consistent error format:
```json
{
  "error": "Error message",
  "message": "Detailed message",
  "statusCode": 400
}
```

**Verification needed**: Confirm AF error responses match BE format.

### Rate Limiting

- BE rate limiting: (document current settings)
- AF rate limiting: (document current settings)

**Verification needed**: Confirm rate limits are comparable.

---

## Database Configuration

Both BE and AF connect to the **same MongoDB Atlas cluster**.

| Aspect | BE | AF |
|--------|----|----|
| Database | Same Atlas cluster | Same Atlas cluster |
| Connection String | Via `MONGODB_URI` env var | Via `MONGODB_URI` env var |
| IP Whitelist | Azure App Service IPs | Azure Functions IPs |

**Action needed**: Ensure MongoDB Atlas IP whitelist includes AF IP ranges.

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

## Path to TEST (2026-01-28)

### What's on `migrate-tt-to-functions` Branch

| Type | Commits | Description |
|------|---------|-------------|
| **Bug Fixes** | `f5ba2c8` | Time reset fix, mobile save button, exclude dates |
| **Migration Code** | `a5c8b30`, `b60e03a`, etc. | apiUrlResolver + 27 files migrated |
| **Documentation** | `d9f0c7b`, `9f624fc` | Full endpoint audit, config docs |

### Two Deployment Options

#### Option 1: Bug Fixes Only (AF_ENABLED=false)
Deploy to TEST but keep using calendar-be (Express):

```
1. Merge migrate-tt-to-functions → TEST
2. Deploy with NEXT_PUBLIC_AF_ENABLED=false
3. Bug fixes go live, migration code is dormant
4. Test AF separately when Fulton confirms readiness
```

**Pros**: Bug fixes to users immediately, no AF risk
**Cons**: Doesn't validate AF in TEST yet

#### Option 2: Bug Fixes + GET Validation (AF_ENABLED=true)
Deploy to TEST and switch to AF for read operations:

```
1. Fulton confirms GET endpoints ready in AF
2. Update MongoDB Atlas IP whitelist for AF
3. Merge migrate-tt-to-functions → TEST
4. Deploy with NEXT_PUBLIC_AF_ENABLED=true
5. Validate all GET operations work
6. Keep POST/PUT/DELETE... (need endpoint-specific routing or full parity)
```

**Pros**: Validates AF in real environment
**Cons**: Requires Fulton confirmation first, higher risk

### Pre-Deployment Checklist (Either Option)

- [ ] Push `migrate-tt-to-functions` to origin
- [ ] Create PR: `migrate-tt-to-functions` → `TEST`
- [ ] Review changes (bug fixes + migration code)
- [ ] Decide AF_ENABLED setting for TEST

### If Choosing Option 2 (AF_ENABLED=true)

Additional requirements before merge:

- [ ] Fulton confirms these GET endpoints exist in AF:
  - [ ] /api/events (list, by ID, summary, count)
  - [ ] /api/categories
  - [ ] /api/roles
  - [ ] /api/venues (list, by ID, geocode, check-proximity)
  - [ ] /api/organizers (list, by ID, by firebase ID)
  - [ ] /api/regions/activeRegions
  - [ ] /api/userlogins/firebase/:id, /all
  - [ ] /api/masteredLocations/* (countries, regions, divisions, cities, nearest)
- [ ] MongoDB Atlas IP whitelist updated for AF
- [ ] AF CORS allows TEST domain
- [ ] AF has same Firebase auth validation as BE

---

## Rollback Plan

### Immediate Rollback (< 5 minutes)

If issues detected after enabling AF:

1. **Update environment variable**:
   ```bash
   # In Azure Portal or deployment config
   NEXT_PUBLIC_AF_ENABLED=false
   ```

2. **Redeploy FE** (or restart if env vars are runtime):
   ```bash
   # Vercel
   vercel --prod

   # Or Azure Static Web Apps
   # Trigger redeployment
   ```

3. **Verify**: Confirm FE is calling BE URLs again

### Partial Rollback

If only specific endpoints fail:

1. Identify failing endpoint(s) from error logs
2. Consider implementing endpoint-specific routing in `apiUrlResolver.js`
3. Route problematic endpoints to BE while keeping others on AF

### Data Integrity

- Both BE and AF use same MongoDB - no data sync needed
- Rollback is purely a routing change
- No data loss expected during rollback

---

## Monitoring & Observability

### During TEST Validation

Monitor these metrics:

1. **AF Function Logs** (Azure Portal → Function App → Monitor)
   - Look for 4xx/5xx errors
   - Check execution times
   - Verify all endpoints are being hit

2. **FE Console Errors** (Browser DevTools)
   - Network tab: Failed requests
   - Console: API error messages

3. **MongoDB Atlas** (Atlas Portal)
   - Connection count (should see AF connections)
   - Query performance
   - Error logs

### Key Metrics to Compare (BE vs AF)

| Metric | How to Measure |
|--------|----------------|
| Response time | Network tab, AF Monitor |
| Error rate | AF logs, FE error tracking |
| Data accuracy | Compare API responses manually |

### Alerts to Set Up

- AF Function failures > 5/minute
- Response time > 3 seconds
- MongoDB connection errors

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
| d9f0c7b | Complete endpoint audit |

---

## Testing Checklist

### Phase 1: GET Endpoints (TEST Environment)
- [ ] MongoDB Atlas IP whitelist includes AF IPs
- [ ] Set `NEXT_PUBLIC_AF_ENABLED=true` in TEST environment
- [ ] AF logs show incoming requests
- [ ] Categories load on homepage
- [ ] Events display on calendar
- [ ] Venues load in dropdowns
- [ ] Organizers display correctly
- [ ] User login/lookup works
- [ ] Mastered locations load (regions, divisions, cities)
- [ ] Region menu populates
- [ ] No console errors in browser
- [ ] Response times comparable to BE

### Phase 2: Write Operations (After GET Validated)
- [ ] Create event (RO role)
- [ ] Create event (RA role)
- [ ] Edit event
- [ ] Delete event
- [ ] Create/edit venue
- [ ] Update organizer profile
- [ ] Image upload works
- [ ] Data persists correctly in MongoDB

### Phase 3: Edge Cases
- [ ] Error handling (invalid data)
- [ ] Authentication failures handled gracefully
- [ ] Rate limiting behaves correctly
- [ ] Concurrent requests work

---

## Action Items

### For Fulton (calendar-be-af)
1. Verify which endpoints from the audit are implemented
2. Implement missing endpoints (especially RA, userlogins, masteredLocations)
3. Update parity report with all endpoints
4. Confirm Firebase auth handling matches BE
5. Confirm CORS settings for FE domains
6. Confirm error response format matches BE

### For Sarah (tangotiempo.com)
1. ✅ Complete endpoint audit (done 2026-01-28)
2. ✅ Document AF-only endpoints (done 2026-01-28)
3. ✅ Document env vars and config (done 2026-01-28)
4. Update this log as endpoints are verified
5. Test GET endpoints when AF is ready

### For El Gotan
1. Decide on TEST deployment timeline
2. Coordinate with Fulton on missing endpoints
3. Ensure MongoDB Atlas IP whitelist is updated
4. Set up monitoring/alerts for TEST

---

## References

- **Parity Report**: `calendar-be-af/.ybotbot/parity-report-2025-12-04.md`
- **Migration Plan**: `tangotiempo.com/MIGRATION_PLAN.md`
- **API Resolver**: `tangotiempo.com/src/app/utils/apiUrlResolver.js`
- **AF Swagger**: `http://localhost:7071/api/docs` (local) or deployed URL

---

**Original Migration**: 2026-01-22 (Quinn)
**Endpoint Audit**: 2026-01-28 (Sarah)
**Full Documentation**: 2026-01-28 (Sarah)
