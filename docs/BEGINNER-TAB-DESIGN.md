# Beginner Tab — Feature & Vision Document

> **Status:** Draft for design discussion
> **Date:** 2026-04-17
> **Ticket lineage:** TIEMPO-400 (epic) → TIEMPO-406 (MVP, shipped to TEST)
> **Route:** `/beginner`
> **Data drivers:** `forBeginners = true` events, user `mapCenter` location

---

## 1. Purpose

The Beginner tab is the **"where do I start learning"** view. Unlike Local (everything near me) and Explore (global travel planner), Beginner is **hyper-local and organizer-first**: the primary question is *"which studios or teachers in my area teach beginners?"* — then, within that, *"what are their upcoming beginner classes?"*

**Driver hierarchy:**
1. **User's mapCenter + radius** (primary — location first, like Local)
2. **Organizer/Studio** (primary grouping — who, not when)
3. **Date** (secondary sort — nearest 60 days, inside each organizer group)

**No calendar view.** Beginners don't need a monthly grid — they need "who, where, how to reach them, and when's their next class."

---

## 2. Data classification (shared with CALBEAF-109)

Two related but **distinct** backend flags:

| Flag | Meaning | Where shown |
|---|---|---|
| `forBeginners` | This event **IS** a beginner class (targeted at new dancers) | Beginner tab **only** — removed from Local |
| `beginnerFriendly` | This event welcomes beginners (but isn't specifically for them) | Local tab (no change) + optionally badged in Beginner |

**Rule for Local tab:** if `forBeginners === true`, the event is REMOVED from Local (it's redundant noise on a calendar meant for all dancers). `beginnerFriendly` events remain on Local with a "welcomes beginners" badge.

**Rule for Beginner tab:** fetch `forBeginners=true` only. (Optional future: a "show also beginner-friendly" toggle that expands to include `beginnerFriendly=true`.)

---

## 3. What exists today (TIEMPO-406 MVP on TEST)

`src/app/beginner/page.js` — 63 lines, deliberately minimal.

- Fetch: `GET /api/events?forBeginners=true&appId=1&limit=500`
- Render: `ExploreCardList` (reused from mobile Explore)
- No location filter, no organizer grouping, no date window

**This is a stub.** TIEMPO-406 explicitly punted polish to "Phase 5 full pass." This document is that polish spec.

---

## 4. Target design (new spec)

### 4.1 Location bar — linked to Local

At the top of `/beginner`, render the **same map-center pill** that lives on Local:

- Shows current center (e.g. "Boston, MA · 25mi")
- Clicking it opens `MapCenterModal` (existing `src/app/components/Modals/misc/MapCenterModal.js`)
- Changes persist to `GeoLocationContext` — so changing it on Beginner **also changes Local** (and vice versa)

**Rationale:** a beginner's "my area" is the same whether they're browsing beginner classes or the full Local calendar. One source of truth.

### 4.2 Primary grouping — Organizer (or Studio)

The page body is a **list of organizers** (not a list of events) in the current radius.

**Rules:**
- Show the organizer / studio as the section header
- If the event has a **venue** with type `Studio`, prefer the studio name as the heading
- Else fall back to `ownerOrganizerName` (the organizer hosting the event)
- Collapse-by-default if list is long (>5 organizers)? Open question.

**Header format:**
```
┌─────────────────────────────────────────────────────┐
│ 🏛 Tango Affair Studio                              │
│    Simonida Tijanić · ☎ (617) 555-1234 · email     │
└─────────────────────────────────────────────────────┘
   • Tue Apr 22 · 7:00 PM · Beginner Milonga Practice
   • Thu Apr 24 · 7:30 PM · Intro to Tango (6-week)
   • Sat May 4  · 6:00 PM · Absolute Beginners Workshop
   …
```

**Contact line** (second line under organizer name):
- `ownerOrganizerShortName` or full name
- Phone (if on organizer record)
- Optionally: email / website link
- All tap-to-dial / tap-to-email on mobile

### 4.3 Secondary sort — Date, rolling 60-day window

Within each organizer section:
- Only events with `startDate` between **now** and **now + 60 days**
- Sorted ascending by `startDate`
- If no events in window, the organizer still shows? **Decision needed** — probably NO (if no upcoming beginner classes in 60 days, don't advertise them)
- Show max ~6 events per organizer, then "+ N more" expansion

**Why 60 days:** beginners plan short-term. A class 3 months out is useless to them.

### 4.4 Event line format (inside organizer section)

```
  • [DATE]  [TIME]  [TITLE]           [optional: format chip]
```

- No category chip (all are beginner classes — redundant)
- No country/continent stripe (all in same radius — redundant)
- No cost chip? Probably yes, if available. "$" is valuable info.
- Click → `/event/:id` detail page (same as other tabs)

### 4.5 What we're NOT showing
- No monthly calendar grid
- No list-view toggle (it's already a list)
- No map (we use the map center, but don't render one on this page)
- No `travelWorthy` events (forBeginners excludes them naturally)
- No category filter (all are beginner classes)
- No region filter (location-scoped, out of scope for beginners)

---

## 5. Map-center & radius behavior

### 5.1 Uses existing GeoLocationContext
- Same provider as Local / Boston / regular calendar
- Reads `mapCenter` from `user.backendInfo` or cookie
- Fires `openMapCenterModal()` to change

### 5.2 Filter to radius
Current API: we'd need `GET /api/events?forBeginners=true&near=<lat>,<lng>&radius=<km>&appId=1`

**Open question:** does `/api/events` currently accept `near` + `radius` params?
- If yes: use it, done.
- If no: fetch all forBeginners=true events (small set in practice), filter client-side by distance from `mapCenter`.

**Dependency:** check with Fulton what `/api/events` geo params exist today (possibly `lat`/`lng`/`radiusMi` per Boston page).

### 5.3 Boston interaction
Local has `/calendar/boston` — hardcoded Boston center. Beginner tab:
- Default behavior: respects user's current `mapCenter` (even if they're in Boston mode on Local)
- Open question: should `/calendar/boston` → click Beginner toggle land on `/beginner?locked=boston` with center pinned? Or just respect user's pref?

---

## 6. Local-tab impact (MUST ship with Beginner polish)

**Change:** Local (`/calendar` + `/calendar/boston`) filters out `forBeginners === true` events.

**Frontend filter location:** likely in `useEvents` hook or per-cell render. Grep for `events.filter(...isActive...)` — same place we filter canceled/discovered.

**`beginnerFriendly` stays on Local.** Optionally badge it with a small "Beginners welcome" chip (future polish).

**Rationale:** reduces Local clutter. A beginner class at 7pm on a Tuesday shouldn't compete with the advanced milonga at 10pm for the same day cell.

---

## 7. Data requirements — what backend needs

**Already shipped (CALBEAF-109):**
- `forBeginners` + `forBeginnersOverride` on events ✓
- `beginnerFriendly` + `beginnerFriendlyOverride` on events ✓
- `GET /api/events?forBeginners=true` query param ✓

**Potentially needed (open with Fulton):**
- [ ] Geo-filter on `/api/events` — `near=lat,lng` + `radiusMi` — confirm support
- [ ] Organizer contact fields on event response — `ownerOrganizerName`, phone, email, shortName
  - Currently probably populated but inconsistent; audit needed
- [ ] Venue `isStudio` or venueType flag — to prefer studio name in header
- [ ] Index: `{ appId, forBeginners, isActive, startDate }` (already planned in CALBEAF-109)

**Data hygiene / organizer side:**
- Organizers need to flag their classes `forBeginners=true` in the create-event form — TIEMPO-405 (Backlog)
- Default should be `false` — opt-in flagging

---

## 8. Vision: why grouping-by-organizer matters

A beginner's mental model is:
> "I want to learn tango. Where are the teachers near me?"

Not:
> "Show me all beginner events in chronological order."

Event-first views flatten the social reality. A tango beginner is joining a **community** — they're picking a teacher and a studio they'll return to weekly for months. The primary choice is *who,* not *when.*

By surfacing organizer/studio as the header, we:
1. Make "my teacher" the unit of exploration
2. Give organizers incentive to mark their classes `forBeginners` (visibility = students)
3. Naturally deduplicate the "Simonida teaches 3 times a week" problem — one section, three lines, not three cards
4. Keep contact info one tap away

---

## 9. Open design questions

1. **Empty organizer hide:** organizer shown only if they have ≥1 upcoming beginner event in 60 days — confirm.
2. **Max radius default:** 25mi? 50mi? Match user's Local preference or allow override?
3. **No-events-in-area fallback:** what if user's map-center has zero beginner events? Show "Expand search" CTA with +50mi button, or "Nearest beginner studios" fallback (closest N within 200mi)?
4. **Organizer sort order within page:** alphabetical, or by distance from mapCenter, or by "most upcoming events"?
5. **Studio vs Organizer header:** if an organizer has events at multiple venues, how do we pick? Or split into two sections (studio-1 vs studio-2 by same organizer)?
6. **Contact info privacy:** is phone always shown, or only if organizer opted in? Current organizer record likely has it — we need a display-opt flag.
7. **Mobile vs desktop:** single-column list works on both. Any desktop-specific enrichment (e.g. map in sidebar showing organizer pins)?
8. **Cross-linking:** should organizer header link to `/organizer/:id` page? (We have organizer detail pages.)
9. **"Show also beginner-friendly"** expansion toggle — MVP or Phase 6?
10. **i18n:** "Beginner" label — does any current locale target non-English? Not currently, so skip.

---

## 10. Shipping phases (suggested)

| Phase | Scope | Ticket status |
|---|---|---|
| **P5.0 (done)** | MVP stub: `/beginner` + card list | TIEMPO-406 ✓ (on TEST) |
| **P5.1** | Add MapCenter pill + radius filter | Not ticketed |
| **P5.2** | Organizer grouping + 60-day window | Not ticketed |
| **P5.3** | Contact-info line (phone/email) | Not ticketed (needs BE audit) |
| **P5.4** | Local tab: remove `forBeginners=true` events | Not ticketed |
| **P5.5** | Empty-state + expand-search fallback | Not ticketed |
| **P5.6** | Studio/venue header preference logic | Not ticketed |

**Depends on:**
- Fulton: `/api/events` geo-filter confirmation (or add it)
- Fulton: organizer contact fields on event response
- TIEMPO-405: forBeginners checkbox in event creation form (organizer-facing)
- TIEMPO-403: preferredMode backend endpoint (so Beginner mode persists cross-device)

---

## 11. Sketch

```
┌──────────────────────────────────────────────┐
│  TangoTiempo          [Beginner|Local|Explore]│   ← mode toggle
├──────────────────────────────────────────────┤
│  📍 Boston, MA · 25 mi           [change]     │   ← linked MapCenter
├──────────────────────────────────────────────┤
│                                              │
│  Beginner                                    │
│  Classes and welcoming events for new        │
│  dancers in your area.                       │
│                                              │
│  ─── Tango Affair Studio ─────────────       │
│  Simonida Tijanić · ☎ (617) 555-1234         │
│    • Tue Apr 22 · 7:00 PM · Beginner Milonga │
│    • Thu Apr 24 · 7:30 PM · Intro to Tango   │
│    • Sat May 4  · 6:00 PM · Absolute Beg WS  │
│                                              │
│  ─── Shawna Diamond Tango ────────────       │
│  Shawna Diamond · ☎ (617) 555-9876 · web     │
│    • Mon Apr 21 · 6:00 PM · Beginner Class   │
│    • Mon Apr 28 · 6:00 PM · Beginner Class   │
│                                              │
│  ─── Rhode Island Tango ──────────────       │
│  Yoana & Erik · email                        │
│    • Wed Apr 23 · 7:00 PM · Basics 101       │
│                                              │
│  (no calendar, no map, no category chips)    │
└──────────────────────────────────────────────┘
```
