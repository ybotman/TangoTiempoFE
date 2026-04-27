---
date: 2026-04-10
persona: sarah
type: architecture
state: live
feature: ui-design
keywords: [explore, map]
appid: 1
niche: tango
app: "[[APP-01-TangoTiempo]]"
audience: all
permanence: long-term
tags: [app/tangotiempo, type/architecture, type/architecture]
---

## 1. Purpose

The Explore tab is the **travel / vacation planner** view of TangoTiempo. It answers "where in the world could I go tango for more than a day?" — the opposite of the Local tab (here-and-now, within radius).

**Not location-based.** Unlike Local (map-center-driven) and Beginner (location-driven), Explore is *geography-neutral* by default: it shows every travel-worthy event everywhere, then lets the user filter down by region/country/category.

**Driver:** a backend-computed flag, `travelWorthy`:
- Rule (Toby, 2026-04-16): `duration > 24h AND category NOT IN [Class, Milonga, Practica]`
- Organizer override via `travelWorthyOverride` (null = computed, bool = force)

---

## 2. What exists today (TIEMPO-404 shipped on TEST)

### 2.1 Data fetch
- `/explore/page.js` calls `GET /api/events?travelWorthy=true&appId=1&limit=500`
- One fetch on mount. No map-bounds-based re-fetch, no pagination from server.
- All country denormalization (`masteredCountryName`) is backend-resolved via CALBEAF-109.

### 2.2 Desktop view — @visx timeline scatter
`src/app/components/Explore/ExploreTimeline.js` (280 lines)

**The @visx packages we added (Airbnb's D3-based viz toolkit):**
| Package | Used for |
|---|---|
| `@visx/scale` | `scaleTime` for X-axis (dates), `scaleBand` for Y-axis (countries) |
| `@visx/axis` | `AxisBottom` (dates), `AxisLeft` (countries) |
| `@visx/group` | SVG grouping |
| `@visx/shape` | (imported, available; rectangles currently hand-rolled) |
| `@visx/tooltip` | Hover tooltip with date range + location |
| `@visx/zoom` | D.4 — X-axis zoom (0.5×–8×) + pan |

**Visual language:**
- Rows = **countries** (Y axis, fixed during zoom)
- Bars = **events** spanning startDate→endDate (X axis, zooms)
- Bar color = **category** (Festival=red, Marathon=orange, Encuentro=green, Workshop=pink, Other=grey)
- Dashed horizontal gridline per country row
- Min bar width 10px (so single-day events remain clickable)

**Interactions:**
- Drag to pan, scroll to zoom, double-click to reset
- `+` / `−` / `Reset` buttons
- Click bar → `/event/:id` detail page
- Hover bar → tooltip with title, formatted date range, city + country

**Below the chart:** `DensityBar` — aligned to the same xScale, shows event-density histogram across the time axis.

### 2.3 Mobile view — card list (D → D.1)
`ExploreCardList.js`

- Breakpoint: `<md (900px)` → card list instead of scatter
- `PAGE_SIZE = 30`, infinite scroll via IntersectionObserver (`rootMargin: 200px`)
- Sorted by `startDate` ascending
- Each card: colored left stripe (continent color), title, date range, city, category chip, country chip, cost chip, AI badge
- Continent stripe colors: Americas=blue, Europe=purple, Asia-Pacific=teal, Other=grey

### 2.4 Filters — D.3 dropdown UX
`ExploreFilters.js`

Two Popper dropdowns (matching Local's PostFilter pattern):
- **Event type** — All / Festival / Marathon / Encuentro / Workshop (Trip + Class dropped in D.4 per Toby — Class is already excluded by `travelWorthy` backend rule; Trip now renders as "Other" grey)
- **Region** — All / Americas / Europe / Asia-Pacific (presets mapped to country lists in `exploreConstants.js`)

Country persistence: `tt_explore_countries` cookie, 365-day expiry.

### 2.5 State flow
```
events (travelWorthy=true, all)
  ↓ filter by selectedCountries (desktop: hard, mobile: soft)
  ↓ filter by selectedCategory
  ↓
filteredEvents → ExploreTimeline (desktop) or ExploreCardList (mobile)
```

---

## 3. Legacy `/explorer` (singular) — still on PROD

**Shipped:** 2025-07-27 (CALBE-37), last touched 2025-08-23 (TIEMPO-280).
**File:** `src/app/explorer/page.js` (437 lines)
**Route:** `/explorer` — still live, linked under "Find Events" in sidebar.

### 3.1 What it does
- **Leaflet world map** with clustering (via `createClusterIcon`)
- Zoom-aware backend call: `GET /api/events/summary?format=clusters|events`
  - `zoom < 8` → server returns clusters
  - `zoom ≥ 8` → server returns individual events
- Map-bounds-driven re-fetch (debounced 500ms)
- Filter drawer: date range (defaults now→+12mo), category checkboxes (Milonga / Festival / Workshop / DayWorkshop / Classes / Practices / Concerts / Other), region presets with `fitBounds` (USA / Europe / Asia / Argentina / South America), AI events toggle
- Click marker → popup; click cluster → zoom in
- Auth-aware (Firebase ID token sent in header)

### 3.2 Relevant assets we can harvest for new `/explore`
| Asset | Status | Value for new Explore |
|---|---|---|
| `components/EventDiscovery/MapEventHandler.js` | Live, SSR-safe pattern | Reusable for any Leaflet view |
| `components/EventDiscovery/clusterIcon.js` | Live | Cluster pin style, ready |
| `components/EventDiscovery/markerIcon.js` | Live | Event pin style, ready |
| `/api/events/summary` + `format=clusters` | Live (backend supports) | Zoom-aware clustering already built |
| Leaflet dynamic-import pattern (SSR-safe) | Proven | Copy-paste into `/explore` |
| Region-bounds `fitBounds` | Live | Better UX than our current country dropdown |
| Mapbox + OSM fallback handling | Live (`890d2964`) | Already solves tile-provider risk |
| `public/leaflet/*.png` marker PNGs | Live | No new asset work |

### 3.3 Legacy pain points we should NOT re-inherit
- "Explorer" name conflicts with the new "Explore" mode — kill the `/explorer` route entirely once we port the map
- Category list is old tango vocabulary (DayWorkshop, Practices) — we now use `categoryFirst` with `travelWorthy` rule
- No `appId` multi-niche awareness in filter labels
- Filter drawer is heavy MUI Drawer — our new D.3 Popper is lighter
- Auth-gated fetch (adds Firebase token) — not needed for read-only Explore

---

## 4. Gap between what we have and where we're going

### 4.1 Shipped today
- Timeline scatter (desktop) + card list (mobile) — **unique view**, not in legacy
- Dropdown filters (D.3) — consistent with Local
- Zoom + pan on X axis (D.4)
- Category color + continent stripe language

### 4.2 Obvious near-term additions (not yet built)

**A. Map view — port from legacy `/explorer`**
- Add a third view mode: **Timeline / List / Map**
- Reuse legacy Leaflet clustering + `/api/events/summary?format=clusters`
- Filter the endpoint by `travelWorthy=true` (backend change or FE filter)
- Region preset buttons should drive `fitBounds` (like legacy), not just country filter
- Mobile: map fills viewport, tap cluster → list underneath

**B. Date range filter**
- Current: passive (we just show all `travelWorthy` events from API)
- Legacy had: now → +12 months
- Useful: "show me everything between June–September" for summer planning

**C. Multi-year horizon**
- `travelWorthy` events are planned far out (festivals announce 12–18 months ahead)
- Timeline should handle multi-year naturally — X-axis zoom already helps, but a "next 6mo / 12mo / 2 years" quick-select would be powerful

**D. Cost/duration sorting in mobile card list**
- We already have `cost` chip. Sort options: soonest / cheapest / longest
- Useful for "budget travel planner" framing

**E. Saved plans / favorites**
- Future: click-to-save, show on a "My Trips" section
- Ties into TIEMPO-403 `preferredMode` + future user settings

### 4.3 Aspirational ideas (brainstorm)

**F. Density heatmap overlay on map**
- Use `DensityBar` data to color-shade country polygons by event density in selected date range
- "Where is tango busiest this summer?"

**G. Timeline milestone markers**
- Mark major festivals (Marathon Buenos Aires, Sitges, etc.) as named anchors on the timeline
- Community-curated "hero events" list

**H. Airfare / lodging integration (long-term)**
- Third-party deep-links from event cards (Skyscanner, Airbnb) with pre-filled dates + city
- Opt-in affiliate revenue stream

**I. "People I know are going" (social)**
- Requires friend graph — MessageHub infrastructure (Phase 2+) could back this
- Visual: small avatar cluster on timeline bar

**J. Country-by-country comparison**
- Two-country split-pane timeline: "US vs Argentina over next 12mo"

### 4.4 Cleanup owed
- Retire `/explorer` (singular) once Map view ports into `/explore`
- Remove `components/EventDiscovery/` deadcode after harvest
- Kill old CategoryFilter/CountryFilter (already done in commit 68213cf1)

---

## 5. Packages summary

**New with TIEMPO-404:**
- `@visx/axis`, `@visx/group`, `@visx/scale`, `@visx/shape`, `@visx/tooltip` (Milestone A)
- `@visx/zoom` (Milestone D.4)

**Already in repo (candidates for Map view port):**
- `leaflet` ^1.9.4
- `react-leaflet` ^4.2.1
- (no `react-leaflet-cluster` — legacy rolled its own cluster icons)

**Worth evaluating for future:**
- `react-leaflet-markercluster` (or `@changey/react-leaflet-markercluster`) — proper clustering plugin
- `react-window` — virtualized list if card count grows past ~200

---

## 6. Open design questions

1. **View selector:** Timeline / List / Map segmented control inside `/explore`, or separate routes `/explore/timeline` `/explore/map`? Cookie-persist last choice.
2. **Does Explore ever respect the user's map-center?** Right now, no — Explore is global. Should there be a "near me" toggle that pivots to a map filter?
3. **Relationship to Beginner tab:** should a beginner-friendly festival (travelWorthy=true AND forBeginners=true) show in both tabs? Yes — they're independent axes.
4. **Y-axis beyond country:** for very zoomed-in state (e.g. one country), should rows become regions/cities? Currently bars stack tall in one row.
5. **Legacy data format/summary endpoint:** do we extend `/api/events/summary` to accept `travelWorthy=true` and return clusters, or just filter client-side? Fulton decision.

---

## 7. Ticket / phase tracker

| Phase | Status | Owner |
|---|---|---|
| P2 3-mode toggle (TIEMPO-402) | In Review | Sarah |
| P3 Explore timeline POC (TIEMPO-404) | In Review | Sarah |
| P4 Map view port from `/explorer` | Not ticketed | Sarah (needs ticket) |
| P5 Date range + quick-select | Not ticketed | Sarah |
| P6 Retire `/explorer` (singular) | Not ticketed | Sarah |
| BE: travelWorthy support on `/summary` | Not ticketed | Fulton |
