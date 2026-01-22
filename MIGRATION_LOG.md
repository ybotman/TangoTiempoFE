# Migration Log: TangoTiempo → Azure Functions

**Agent**: Quinn
**Started**: 2026-01-22
**Status**: IN PROGRESS

---

## Endpoint Migration Checklist

| # | Endpoint | Method | FE File | AF Status | FE Status | Commit (AF) | Commit (FE) | Notes |
|---|----------|--------|---------|-----------|-----------|-------------|-------------|-------|
| 1 | /api/categories | GET | useCategories.js | EXISTS | DONE | - | 0b7b6df | Parity verified 2025-12-04 |
| 2 | /api/roles | GET | useRoles.js | EXISTS | DONE | - | ce165ad | Parity verified 2025-12-04 |
| 3 | /api/health | GET | useServiceHealth.js | EXISTS | SKIP | - | - | Already uses AF_URL directly |
| 4 | /api/venues | GET | useVenues.js | EXISTS | DONE | - | 6f6e7c8 | Parity verified 2025-12-04 |
| 5 | /api/venues/:id | GET | venueService.js | EXISTS | DONE | - | 6f6e7c8 | Parity verified 2025-12-04 |
| 6 | /api/organizers | GET | useOrganizers.js | EXISTS | DONE | - | 6f6e7c8 | Parity verified 2025-12-04 |
| 7 | /api/events | GET | useEvents.js | EXISTS | DONE | - | 6f6e7c8 | Parity verified 2025-12-04 |
| 8 | /api/events/id/:id | GET | useEvents.js | EXISTS | DONE | - | 6f6e7c8 | |
| 9 | /api/events/post | POST | useEvents.js | EXISTS | DONE | - | 6f6e7c8 | |
| 10 | /api/venues | POST | venueService.js | EXISTS | DONE | - | 6f6e7c8 | |
| 11 | /api/events/:id | PUT | useEvents.js | EXISTS | DONE | - | 6f6e7c8 | |
| 12 | /api/venues/:id | PUT | venueService.js | EXISTS | DONE | - | 6f6e7c8 | |
| 13 | /api/events/:id | DELETE | useEvents.js | EXISTS | DONE | - | 6f6e7c8 | |
| 14 | /api/venues/:id | DELETE | venueService.js | EXISTS | DONE | - | 6f6e7c8 | |
| 15 | /api/events/ra/* | POST/PUT/DELETE | useEvents.js | CHECK | DONE | - | 6f6e7c8 | RA endpoints - verify AF support |
| 16 | /api/organizers/:id | GET | useOrganizers.js | EXISTS | DONE | - | 6f6e7c8 | |
| 17 | /api/organizers | POST | useOrganizers.js | EXISTS | DONE | - | 6f6e7c8 | |
| 18 | /api/organizers/:id | PUT | useOrganizers.js | EXISTS | DONE | - | 6f6e7c8 | |

---

## Session Log

### 2026-01-22 - Phase 0: Discovery & Planning

**Quinn**: Created migration plan and log. Key findings:
- 49 files in TT make API calls to calendar-be
- Azure Functions already exist for most endpoints
- Feature flag `NEXT_PUBLIC_AF_ENABLED` already exists
- Existing parity report (2025-12-04) confirms all GET endpoints PASS
- Will create central URL resolver for clean migration

### 2026-01-22 - Phase 1: Core Migrations Complete

**Quinn**: Migrated all major hooks and services:

1. Created `src/utils/apiUrlResolver.js` - Central BE/AF URL resolver
2. Migrated `useCategories.js` - commit 0b7b6df
3. Migrated `useRoles.js` - commit ce165ad
4. Migrated `useVenues.js` - commit 6f6e7c8
5. Migrated `useOrganizers.js` - commit 6f6e7c8
6. Migrated `useEvents.js` - commit 6f6e7c8
7. Migrated `venueService.js` - commit 6f6e7c8

**Status**: Core endpoint migration complete. Toggle `NEXT_PUBLIC_AF_ENABLED=true` to test.

**Blocked**: MongoDB connection (ECONNRESET) - IP whitelist needs update on Atlas

**Remaining**:
- Find and migrate any other files using NEXT_PUBLIC_BE_URL
- Test with AF enabled
- Verify RA endpoints work with AF

---

## Team Communications

| Date | From | To | Subject | Status |
|------|------|-----|---------|--------|
| 2026-01-22 | Quinn | Sarah, Ben, Fulton | Migration kickoff | SENT |
| 2026-01-22 | Quinn | Sarah, Fulton | Core migration complete | PENDING |

