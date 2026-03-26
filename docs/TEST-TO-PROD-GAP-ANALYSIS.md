# TEST → PROD Gap Analysis & Test Plan

**Date**: 2026-03-25
**Analyst**: Sarah
**Gap**: 68 commits, v1.19.21 → v1.20.35

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Commits in Gap | 68 |
| Files Changed | 53 |
| Lines Added | ~9,400 |
| Lines Removed | ~1,100 |
| Primary Tickets | TIEMPO-362, TIEMPO-388 |
| Risk Level | **MEDIUM-HIGH** (T1 changes present) |

---

## Feature Areas by Tier

### TIER 1 — CORE (App breaks if broken)

| # | Feature | Files | Risk | Test Priority |
|---|---------|-------|------|---------------|
| T1.1 | Calendar page loads | `calendar/page.js` | **HIGH** | 🔴 CRITICAL |
| T1.2 | Events display on calendar | `transformEvents.js`, `calendar/page.js` | **HIGH** | 🔴 CRITICAL |
| T1.3 | Boston calendar loads | `calendar/boston/page.js` | **HIGH** | 🔴 CRITICAL |
| T1.4 | Basic navigation | All | MEDIUM | 🔴 CRITICAL |

**T1 Changes in Gap**:
- Calendar views heavily modified (+500 lines in page.js)
- transformEvents.js modified (spotlights/features)
- Boston page.js heavily modified (+400 lines)

---

### TIER 2 — SECONDARY (Degraded experience)

| # | Feature | Files | Risk | Test Priority |
|---|---------|-------|------|---------------|
| T2.1 | GeoLocation/City Selection | `GeoLocationContext.js` | **HIGH** | 🟠 HIGH |
| T2.2 | Welcome Modal (first visit) | `WelcomeModal.js` | MEDIUM | 🟠 HIGH |
| T2.3 | User Drawer (login sidebar) | `SiteMenuBarUserDrawer.js` | LOW | 🟡 MEDIUM |
| T2.4 | Hamburger Menu | `SidebarDrawer.js` | LOW | 🟡 MEDIUM |
| T2.5 | Site Header / Pill | `SiteHeader.js` | **HIGH** | 🟠 HIGH |

**T2 Changes in Gap**:
- GeoLocationContext.js MAJOR refactor (251 line changes) - ROBUST pill city fix
- WelcomeModal.js +114 lines - geolocation flow changes
- SiteHeader.js -105 lines - simplified

---

### TIER 3 — TERTIARY (App still usable)

| # | Feature | Files | Risk | Test Priority |
|---|---------|-------|------|---------------|
| T3.1 | Spotlights (DJ/Instructor/Performer) | Multiple | MEDIUM | 🟡 MEDIUM |
| T3.2 | Instance Overrides (recurring events) | Multiple | MEDIUM | 🟡 MEDIUM |
| T3.3 | Cancel Occurrence | `EditOccurrenceModal.js` | MEDIUM | 🟡 MEDIUM |
| T3.4 | Event CRUD | `CreateEventDetailModal.js` | MEDIUM | 🟡 MEDIUM |
| T3.5 | New Pages (/tango, /venue/[id]) | New files | LOW | 🟢 LOW |
| T3.6 | Sitemap | `sitemap.js` | LOW | 🟢 LOW |
| T3.7 | Messages Placeholder | UI only | LOW | 🟢 LOW |

---

## Detailed Test Plan

### PHASE 1: T1 CORE Tests (MUST PASS)

#### T1.1 — Main Calendar Loads
```
URL: https://test.tangotiempo.com/calendar
```

| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 1.1.1 | Navigate to /calendar | Page loads without error | ☐ |
| 1.1.2 | Wait 3 seconds | Calendar grid renders | ☐ |
| 1.1.3 | Check console | No red errors | ☐ |
| 1.1.4 | Events visible | At least some events appear | ☐ |

#### T1.2 — Events Display Correctly
```
URL: https://test.tangotiempo.com/calendar
```

| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 1.2.1 | View monthly calendar | Events show with time + title | ☐ |
| 1.2.2 | Switch to list view | Events show in list format | ☐ |
| 1.2.3 | Click an event | Modal opens with event details | ☐ |
| 1.2.4 | Close modal | Modal closes, calendar still works | ☐ |

#### T1.3 — Boston Calendar Loads
```
URL: https://test.tangotiempo.com/calendar/boston
```

| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 1.3.1 | Navigate to /calendar/boston | Page loads without error | ☐ |
| 1.3.2 | Events visible | Boston-area events appear | ☐ |
| 1.3.3 | Check console | No red errors | ☐ |

#### T1.4 — Basic Navigation
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 1.4.1 | Click hamburger menu | Left drawer opens | ☐ |
| 1.4.2 | Click user icon | Right drawer opens | ☐ |
| 1.4.3 | Navigate prev/next month | Calendar updates | ☐ |
| 1.4.4 | Switch Monthly ↔ List | View changes | ☐ |

---

### PHASE 2: T2 SECONDARY Tests (SHOULD PASS)

#### T2.1 — GeoLocation / City Selection (CRITICAL FIX)
```
This was the most-fixed bug in this release (8+ commits).
The "pill city name" race condition should be RESOLVED.
```

| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 2.1.1 | Clear localStorage, refresh | Welcome modal appears | ☐ |
| 2.1.2 | Allow browser geolocation | City detected automatically | ☐ |
| 2.1.3 | Check pill (top bar) | Shows city name, NOT coordinates | ☐ |
| 2.1.4 | Refresh page | Pill still shows city name | ☐ |
| 2.1.5 | Open Map Center modal | Map loads, marker at city | ☐ |
| 2.1.6 | Select different city | Pill updates to new city | ☐ |
| 2.1.7 | Refresh again | New city persists | ☐ |

**REGRESSION TEST**: The pill should NEVER show raw coordinates like "42.3601,-71.0589".

#### T2.2 — Welcome Modal
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 2.2.1 | Clear localStorage, visit site | Welcome modal appears | ☐ |
| 2.2.2 | Deny geolocation | Manual city selection shown | ☐ |
| 2.2.3 | Select a city | Modal closes, events filter | ☐ |
| 2.2.4 | Refresh | Welcome modal does NOT reappear | ☐ |

#### T2.3 — User Drawer (Login Sidebar)
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 2.3.1 | Click user icon (logged out) | Sign In / Create Account shown | ☐ |
| 2.3.2 | Click user icon (logged in) | Role selector shown | ☐ |
| 2.3.3 | Check Messages box | "Coming Soon" placeholder visible | ☐ |
| 2.3.4 | Check role display | Current role shown in Messages box | ☐ |

#### T2.4 — Hamburger Menu
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 2.4.1 | Open hamburger menu | Menu items appear | ☐ |
| 2.4.2 | Check Messages item | Shows "Soon" badge + role | ☐ |
| 2.4.3 | Messages item disabled | Cannot click (greyed out) | ☐ |

---

### PHASE 3: T3 TERTIARY Tests (NICE TO HAVE)

#### T3.1 — Spotlights Display
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 3.1.1 | Find event with DJ spotlight | "DJ: Name" badge shows on calendar | ☐ |
| 3.1.2 | Click event with spotlight | Modal shows spotlight in "Spotlights" section | ☐ |
| 3.1.3 | Find Practica event with DJ | DJ badge NOT shown (category rule) | ☐ |
| 3.1.4 | Find canceled event | ⚠️ icon + "TODAY Canceled" badge | ☐ |

#### T3.2 — Instance Overrides (Recurring Events)
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 3.2.1 | Find a recurring event | Click it | ☐ |
| 3.2.2 | Check "Repeating Event" indicator | Shows ↻ icon + date picker | ☐ |
| 3.2.3 | Click "Edit This Date" | EditOccurrenceModal opens | ☐ |
| 3.2.4 | Add DJ spotlight for one date | Save, verify shows on calendar | ☐ |
| 3.2.5 | Navigate dates with arrows | Can move between occurrence dates | ☐ |

#### T3.3 — Cancel Occurrence
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 3.3.1 | Open EditOccurrenceModal | Modal opens | ☐ |
| 3.3.2 | Select "Tonight: Canceled" | Cancel option visible | ☐ |
| 3.3.3 | Add optional reason | "Weather" | ☐ |
| 3.3.4 | Save | Modal shows red banner | ☐ |
| 3.3.5 | Check calendar | That date shows canceled badge | ☐ |

#### T3.4 — Event CRUD (Regional Organizer)
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 3.4.1 | Login as Regional Organizer | Role available | ☐ |
| 3.4.2 | Click + to add event | Create Event modal opens | ☐ |
| 3.4.3 | Check Spotlights tab | DJ, Instructor, Performer available | ☐ |
| 3.4.4 | Add a spotlight | Saves successfully | ☐ |
| 3.4.5 | Edit existing event | Spotlights load from event | ☐ |

#### T3.5 — New Pages
| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 3.5.1 | Visit /tango | Landing page loads | ☐ |
| 3.5.2 | Visit /venue/[valid-id] | Venue page loads | ☐ |
| 3.5.3 | Visit /sitemap.xml | Sitemap XML returns | ☐ |

---

## Risk Assessment

### HIGH RISK Items

| Item | Risk | Mitigation |
|------|------|------------|
| GeoLocationContext refactor | Could break city selection entirely | Test 2.1.x thoroughly |
| Calendar view changes | 900+ lines changed | Test T1.1-T1.3 first |
| transformEvents changes | Could break event display | Test T1.2 |

### MEDIUM RISK Items

| Item | Risk | Mitigation |
|------|------|------------|
| WelcomeModal changes | First-time users affected | Test 2.2.x |
| Spotlights display | New feature, display only | Test 3.1.x |
| Instance overrides | New feature, write operations | Test 3.2.x, 3.3.x |

### LOW RISK Items

| Item | Risk | Mitigation |
|------|------|------------|
| Messages placeholder | UI only, disabled | Visual check only |
| New pages | Additive, no breaking change | Quick smoke test |
| Documentation | No runtime impact | N/A |

---

## Rollback Plan

If critical issues found after PROD deploy:

**Option 1: Quick Revert**
```bash
git checkout PROD
git revert HEAD
git push origin PROD
```

**Option 2: Full Rollback to Previous**
```bash
git checkout PROD
git reset --hard <previous-known-good-commit>
git push origin PROD --force  # REQUIRES EXPLICIT APPROVAL
```

**Known Good PROD Commit**: `origin/PROD` (v1.19.21)

---

## Sign-Off Checklist

Before PROD deployment:

| Phase | Status | Tested By | Date |
|-------|--------|-----------|------|
| Phase 1: T1 CORE | ☐ Pending | | |
| Phase 2: T2 SECONDARY | ☐ Pending | | |
| Phase 3: T3 TERTIARY | ☐ Pending | | |
| User Approval | ☐ Pending | Ybotman | |

---

## Recommendation

1. **Test Phase 1 FIRST** — If T1 fails, stop and fix before PROD
2. **Test Phase 2 with focus on T2.1** — GeoLocation had 8+ bug fixes
3. **Phase 3 is optional** — New features, app works without them
4. **Deploy to PROD after T1+T2 pass** — T3 can be tested post-deploy

---

*Analysis completed by Sarah, TangoTiempo Frontend Agent*
