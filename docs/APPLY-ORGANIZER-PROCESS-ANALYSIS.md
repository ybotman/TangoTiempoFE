# Apply to Organizer Process - Deep Dive Analysis

**Created**: 2026-03-05
**Author**: Sarah (TangoTiempo Agent)
**Status**: Recommendations for Review

---

## Executive Summary

The current "Apply to be an Organizer" process has **6 manual steps** with significant friction points. Ybotman's vision is a **fully automated process** where anyone with auth can immediately become a Regional Organizer (RO) and post events.

This document analyzes the current state, identifies problems, and recommends a phased approach that includes:
1. Simplifying the current MongoDB flow
2. Adding a "Quick Post" path
3. Elevating user data to Firestore for cross-app SSO
4. PWA offline support

---

## Current State Summary

### The Flow Today (6 Steps)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. CREATE ACCOUNT  │  2. APPLY  │  3. TERMS  │  4. AUTO  │  5. PROFILE │  6. ENABLE │
│     (Firebase)      │  (Click)   │   (ROE)    │ APPROVE   │   (Setup)   │  (Toggle)  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        ↓
                    Creates Organizer record with isEnabled: FALSE
                                        ↓
                    Must manually toggle "Enable Profile" to go live
```

### Data Lives in TWO MongoDB Collections

| Collection | What It Stores | Key Fields |
|------------|----------------|------------|
| `userlogins` | User's RO status | `regionalOrganizerInfo.{organizerId, isApproved, isEnabled}` |
| `organizers` | Organizer profile | `{shortName, description, isEnabled, wantRender, organizerTypes}` |

### Mandatory Requirements Before Activation

1. ROE Terms accepted
2. Organizer Name (7+ chars, not "New Organizer")
3. Short Name (3-12 chars, **unique**, no "Tango")
4. Description (min 1 char)
5. Manual toggle: `isEnabled = true`

### Key Files

| File | Purpose |
|------|---------|
| `/organizers/apply/page.js` | Page wrapper, metadata |
| `OrganizerApplicationPortal.js` | Main UI container with 2 tabs |
| `ApplicationFormTab.js` | Apply flow with stepper |
| `WhoCanApplyTab.js` | Accordion list of 10 roles |
| `UserSettingsApply.js` | **Core logic** - creates organizer, manages flow |
| `UserSettingApplyROTerms.js` | Terms acceptance modal |
| `RegionalOrganizersModal.js` | Settings orchestrator (4 tabs) |
| `RegionalOrganizersStatus.js` | Dashboard with checklist |
| `RegionalOrganizersSettings.js` | Profile config (name, description) |
| `/hooks/useOrganizers.js` | CRUD for organizers collection |
| `/hooks/useUsers.js` | CRUD for userlogins collection |

---

## Problems with Current Process

| Issue | Impact | Severity |
|-------|--------|----------|
| **5 manual steps after signup** | Friction loses users | HIGH |
| **Dual data storage** (userlogins + organizers) | Sync issues, confusion | MEDIUM |
| **shortName uniqueness** | 409 errors frustrate users | MEDIUM |
| **isEnabled requires manual toggle** | Users don't know to do this | HIGH |
| **No "just let me post events" path** | Over-engineered for simple use case | HIGH |
| **9 of 10 artist types "Coming Soon"** | UI shows incomplete features | LOW |

---

## Vision: Fully Automated RO Process

**Goal**: Anyone with auth → immediately can post events

### Proposed New Flow (2 Steps)

```
┌────────────────────────────────────────────────────────────┐
│  1. LOGIN (Firebase)  │  2. POST EVENT (Auto-creates RO)  │
└────────────────────────────────────────────────────────────┘
```

**How it works:**
1. User logs in (existing Firebase auth)
2. User clicks "Add Event"
3. System auto-checks: Has RO record?
   - **NO** → Auto-create with defaults, show quick terms checkbox
   - **YES** → Proceed to event form
4. User posts event. Done.

### Data Changes Needed

| Current | New | Rationale |
|---------|-----|-----------|
| `shortName` required, unique | Auto-generate from displayName + random suffix | Remove friction |
| `description` required | Optional, default to empty | Remove friction |
| Manual `isEnabled` toggle | Auto-enable on first event | Remove friction |
| Separate ROE modal | Inline checkbox on event form | Reduce clicks |
| 9 "Coming Soon" types | Hide until ready OR remove | Clean UI |

---

## Firebase/Firestore Migration Strategy

### Current Architecture

```
Firebase Auth (login) ──→ MongoDB userlogins (profile/prefs)
                                    ↓
                          MongoDB organizers (RO data)
```

### Future Architecture (Cross-App SSO)

```
Firebase Auth (login) ──→ Firestore users/{uid}/ (elevated user profile)
       ↓                           ↓
   All 5 Tango Apps            app-specific prefs
       ↓
   MongoDB (events, venues, etc.) ← stays for transactional data
```

### What Moves to Firestore (Elevated Login)

| Data | Current Location | Future Location | Why Move? |
|------|------------------|-----------------|-----------|
| `displayName`, `email`, `photoURL` | Firebase Auth | Firestore `users/{uid}/profile` | Cross-app SSO |
| `homeRegion`, `preferences` | MongoDB `userlogins` | Firestore `users/{uid}/apps/tangotiempo/` | Real-time sync |
| `isApproved` (RO terms) | MongoDB | Firestore `users/{uid}/apps/tangotiempo/organizer` | Per-app RO status |
| `organizerId` reference | MongoDB | Firestore | Link to MongoDB organizer record |

### What Stays in MongoDB

| Data | Why Stay? |
|------|-----------|
| `organizers` collection | Complex queries, indexes, event relationships |
| `events` collection | Transactional, needs ACID |
| `venues` collection | Geo-queries, aggregations |

### Migration Path

```
Phase 1: Keep MongoDB as source of truth
Phase 2: Add Firestore as read cache for user prefs
Phase 3: Write-through to Firestore for real-time
Phase 4: Firestore becomes source for user prefs, MongoDB for organizers/events
```

---

## PWA Considerations

### Offline Event Creation
- Cache event form locally
- Queue submissions when offline
- Sync when back online

### RO Auto-Creation for PWA
- Must work offline-first
- Firestore offline persistence helps here
- MongoDB calls need online connectivity

### Recommended Approach

```
PWA Event Form → Firestore (offline OK) → Cloud Function → MongoDB
                     ↑
         Auto-create RO in Firestore if needed
```

---

## Implementation Recommendations

### Phase 1: Simplify Current Flow (MongoDB only)
**Effort: Small | Impact: High**

1. **Remove shortName requirement** — auto-generate
2. **Remove description requirement** — make optional
3. **Auto-enable on creation** — no manual toggle
4. **Inline terms checkbox** — not separate modal
5. **Hide "Coming Soon" artist types** — cleaner UI

**Files to Modify:**
- `UserSettingsApply.js` — Remove shortName/description validation, auto-enable
- `ApplicationFormTab.js` — Simplify to 2-step or remove entirely
- `RegionalOrganizersStatus.js` — Remove mandatory checks for shortName/description
- `WhoCanApplyTab.js` — Hide "Coming Soon" types or show only active
- `UserSettingApplyROTerms.js` — Convert to inline checkbox component

### Phase 2: Add "Quick Post" Path
**Effort: Medium | Impact: High**

1. **New endpoint**: `POST /api/events` that auto-creates RO
2. **Logic**: If no RO exists, create minimal one inline
3. **UI**: "Add Event" button visible to all logged-in users

**New Files Needed:**
- `src/hooks/useOrganizers.js` — Add `createOrganizerMinimal()` for quick creation
- `src/components/Events/QuickEventCreate.js` — Streamlined event form with auto-RO

**Backend (Fulton) Changes:**
- `POST /api/events` — Auto-create organizer if none exists
- `POST /api/organizers` — Accept minimal data, auto-generate shortName

### Phase 3: Firestore User Elevation
**Effort: Large | Impact: Medium (cross-app benefit)**

1. **Create Firestore structure**: `users/{uid}/profile`, `users/{uid}/apps/tangotiempo/`
2. **Migrate user prefs** on login (read MongoDB, write Firestore)
3. **Read from Firestore** for UI, fallback to MongoDB
4. **Cloud Functions** sync Firestore ↔ MongoDB

**New Files Needed:**
- `src/hooks/useFirestoreUser.js` — Firestore user prefs
- `src/contexts/FirestoreContext.js` — Firestore provider

**Backend (Fulton) Changes:**
- New: `/api/userlogins/elevate` — Sync to Firestore

### Phase 4: PWA Offline Support
**Effort: Large | Impact: High for mobile**

1. **Service worker** caches event form
2. **IndexedDB** queues offline submissions
3. **Background sync** posts when online
4. **Firestore offline** for user prefs

---

## Cross-Project Dependencies

| Project | Owner | Required Changes |
|---------|-------|------------------|
| tangotiempo.com | Sarah | Frontend simplification, Firestore integration |
| calendar-be-af | Fulton | Auto-RO creation endpoint, minimal organizer support |
| harmonyjunction.org | Cord | Same changes for appId=2 (after TT proves pattern) |
| MasterCalendar | Quinn | Coordinate timing, ensure consistency |

---

## Open Questions

1. **Firestore project**: Use existing `tangotiempo-257ff` or create new shared project?
2. **Terms acceptance**: Keep ROE modal or convert to simple checkbox?
3. **shortName**: Still need it for URLs/SEO, or can we use MongoDB ObjectId?
4. **Artist types**: Remove "Coming Soon" or hide until ready?
5. **PWA timeline**: Is this blocking Phase 1-2, or parallel?

---

## Next Steps

1. Review this analysis with Quinn (coordinator) and Gotan (overseer)
2. Create JIRA tickets for phased implementation
3. Decide which phase to start with
4. MSG to Fulton for backend changes needed

---

*Document created by Sarah (TangoTiempo Agent) on 2026-03-05*
