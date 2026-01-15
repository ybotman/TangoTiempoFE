# MASTER CALENDAR - Dual Frontend Synchronization Strategy

> **READ THIS EVERY SESSION when working on either frontend.**

## Overview

The Master Calendar system has TWO frontend applications sharing ONE backend:

| App | Repository | appId | Port | Domain |
|-----|------------|-------|------|--------|
| **Tango Tiempo** | tangotiempo.com | **1** | 3001 | tangotiempo.com |
| Harmony Junction | harmonyjunction.org | 2 | 3002 | harmonyjunction.org |

**YOU ARE CURRENTLY IN: Tango Tiempo (appId=1)**

## Golden Rules

### Backend (calendar-be) - SHARED
- **ALL changes must work for BOTH apps**
- Use `appId` to differentiate data
- Extend schemas, don't replace (e.g., organizerTypes has BOTH tango and barbershop types)
- Test changes with both appId=1 and appId=2

### Frontend - SEPARATE REPOS
- Can diverge on UI, branding, terminology
- Should stay similar on core technology (React, Next.js, hooks, contexts)
- Major features should be documented for potential porting

---

## Divergence Log

Track what's different between the two frontends.

### Organizer Types (2025-01-13)
| Type | Tango (appId=1) | Harmony (appId=2) |
|------|-----------------|-------------------|
| Primary | isEventOrganizer | isChorus |
| Secondary | isTeacher, isMaestro, isDJ, isOrchestra, isTaxiDancer | isQuartet, isChorusCoach, isQuartetCoach, isJudge, isVocalTeacher |
| Shared | isVendor | isVendor, isRegionalAdmin |

**Files that differ in Harmony Junction:**
- `RegionalOrganizersTypes.js` - Checkbox UI for barbershop types
- `ViewEventDetailsOrganizer.js` - Display chips for barbershop types
- `UserSettingsApply.js` - Create organizer with isChorus=true
- `RegionalOrganizerSelection.js` - Filter by isChorus
- `WhoCanApplyTab.js` - Barbershop role descriptions
- `artists-plus/page.js` - Barbershop role descriptions

---

## Sync Checklist for Major Updates

When making significant changes, use this checklist:

### Backend Change
- [ ] Works with appId=1 (Tango)?
- [ ] Works with appId=2 (Harmony)?
- [ ] Added fields extend schema (not replace)?
- [ ] API endpoints handle both apps?

### Frontend Change
- [ ] Is this app-specific (branding, terminology)? If yes, OK to differ.
- [ ] Is this a core feature? If yes, document for porting.
- [ ] Does it modify shared hooks/contexts? Keep patterns similar.
- [ ] Does it require backend changes? Apply backend rules above.

---

## Technology Stack (Keep in Sync)

Both frontends should use the same:
- React 18+
- Next.js 14+ (App Router)
- Material UI v5+
- Firebase Auth
- Axios for API calls
- Same hook patterns (useEvents, useOrganizers, etc.)
- Same context patterns (AuthContext, GeoLocationContext, etc.)

---

## Porting Features

When a major feature is built in one frontend:

1. Document the feature in this file
2. List affected files
3. Note any backend changes required
4. Mark as "To Port" or "App-Specific"

### Features to Port (from Tango to Harmony)
- None currently

### Features to Port (from Harmony to Tango)
- None currently

### App-Specific Features (no port needed)
- Organizer Types: Different types per app
- Event Categories: Different categories per app
- Branding/Theme: Different colors, logos, images
