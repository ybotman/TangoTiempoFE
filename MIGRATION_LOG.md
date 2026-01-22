# Migration Log: TangoTiempo → Azure Functions

**Agent**: Quinn
**Started**: 2026-01-22
**Status**: COMPLETE (FE Code Migration)

---

## Summary

All FE Client Component API calls now use `apiUrlResolver.js` which switches between:
- `NEXT_PUBLIC_BE_URL` (calendar-be) when `NEXT_PUBLIC_AF_ENABLED=false`
- `NEXT_PUBLIC_AF_URL` (calendar-be-af) when `NEXT_PUBLIC_AF_ENABLED=true`

**To test**: Set `NEXT_PUBLIC_AF_ENABLED=true` in `.env.local`

---

## Files Migrated (Using apiUrlResolver)

### Hooks (11 files)
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

- [ ] MongoDB Atlas IP whitelist updated for localhost
- [ ] Set `NEXT_PUBLIC_AF_ENABLED=true` in .env.local
- [ ] Start Azure Functions: `cd calendar-be-af && func start`
- [ ] Start TangoTiempo: `cd tangotiempo.com && npm run dev`
- [ ] Test: Categories load on homepage
- [ ] Test: Events display on calendar
- [ ] Test: Venues load in dropdowns
- [ ] Test: Organizers display correctly
- [ ] Test: Create event (RO role)
- [ ] Test: Edit event
- [ ] Test: Delete event

---

## Notes

### RA Endpoints
Regional Admin endpoints (`/api/events/ra/*`) are migrated but need verification that AF supports them.

### Parity Reference
All GET endpoint parity verified in `calendar-be-af/.ybotbot/parity-report-2025-12-04.md`

---

**Migration Completed**: 2026-01-22
**Agent**: Quinn
