# Migration Log: TangoTiempo → Azure Functions

**Agent**: Quinn
**Started**: 2026-01-22
**Status**: IN PROGRESS

---

## Endpoint Migration Checklist

| # | Endpoint | Method | FE File | AF Status | FE Status | Commit (AF) | Commit (FE) | Notes |
|---|----------|--------|---------|-----------|-----------|-------------|-------------|-------|
| 1 | /api/categories | GET | useCategories.js | PENDING | PENDING | - | - | |
| 2 | /api/roles | GET | useRoles.js | PENDING | PENDING | - | - | |
| 3 | /api/health | GET | useServiceHealth.js | PENDING | PENDING | - | - | |
| 4 | /api/venues | GET | useVenues.js | PENDING | PENDING | - | - | |
| 5 | /api/venues/:id | GET | venueService.js | PENDING | PENDING | - | - | |
| 6 | /api/organizers | GET | useOrganizers.js | PENDING | PENDING | - | - | |
| 7 | /api/events | GET | useEvents.js | PENDING | PENDING | - | - | |
| 8 | /api/events/id/:id | GET | useEvents.js | PENDING | PENDING | - | - | |
| 9 | /api/events/post | POST | useEvents.js | PENDING | PENDING | - | - | |
| 10 | /api/venues | POST | venueService.js | PENDING | PENDING | - | - | |
| 11 | /api/events/:id | PUT | useEvents.js | PENDING | PENDING | - | - | |
| 12 | /api/venues/:id | PUT | venueService.js | PENDING | PENDING | - | - | |
| 13 | /api/events/:id | DELETE | useEvents.js | PENDING | PENDING | - | - | |
| 14 | /api/venues/:id | DELETE | venueService.js | PENDING | PENDING | - | - | |

---

## Session Log

### 2026-01-22 - Phase 0: Discovery & Planning

**Quinn**: Created migration plan and log. Key findings:
- 49 files in TT make API calls to calendar-be
- Azure Functions already exist for most endpoints
- Feature flag `NEXT_PUBLIC_AF_ENABLED` already exists
- Will create central URL resolver for clean migration

**Next**: Create `apiUrlResolver.js` utility, start with GET /api/categories

---

## Team Communications

| Date | From | To | Subject | Status |
|------|------|-----|---------|--------|
| 2026-01-22 | Quinn | Sarah, Ben, Fulton | Migration kickoff | SENT |

