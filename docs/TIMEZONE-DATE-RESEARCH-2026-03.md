# Comprehensive Timezone & Date/Time Presentation Research
## TangoTiempo Calendar System — Deep Analysis for LLM Review

**Document Date**: 2026-03-23
**Prepared By**: Sarah (TangoTiempo Frontend Agent)
**Purpose**: Research document for LLM analysis of timezone logic, edge cases, and potential improvements

---

## 0. What Is This System? (Context for LLM Reviewers)

### The Mission

**TangoTiempo is a community calendar for Argentine Tango dancers worldwide.**

The goal is simple: **Help tango dancers find events near them — milongas, practicas, classes, festivals, and workshops.**

Argentine Tango is a social partner dance with a global community. Dancers travel frequently — a dancer in Boston might visit NYC for a weekend, attend a festival in Denver, or travel to Buenos Aires for tango tourism. They need to know:
- "What's happening tonight near me?"
- "What events are in NYC this weekend when I visit?"
- "When is the next festival in my region?"

### The Users

| User Type | What They Do | Timezone Challenge |
|-----------|--------------|-------------------|
| **Dancers** | Browse calendar, find events near them | View events in venue's local time, regardless of where they physically are |
| **Event Organizers** | Create/edit their milongas, classes | May be traveling when they create events (in different TZ than venue) |
| **Regional Admins** | Manage events for a region (e.g., New England) | Oversee multiple venues, all in same region |
| **DJs/Teachers** | Listed as participants on events | Travel constantly, book across timezones |

### Core Use Cases

1. **"What's happening tonight?"**
   - User opens app → sees events within X miles of their location
   - Events shown in venue's local time (7pm EDT means 7pm at the venue)

2. **"I'm visiting NYC next weekend"**
   - User changes map center to NYC
   - Sees all NYC-area events for that date range
   - Times shown in NYC time, not user's home timezone

3. **"I run a weekly milonga"**
   - Organizer creates recurring event: "Every Thursday at 8pm"
   - Event repeats correctly, even through DST changes
   - 8pm stays 8pm (venue time), not shifting by an hour

4. **"I'm in Berlin planning my Boston trip"**
   - User in Europe viewing Boston events
   - Sees "Thursday Milonga 7:00 PM EDT"
   - NOT "Thursday Milonga 1:00 AM CEST" (browser conversion)

### The World Goal

**One unified calendar for the global tango community.**

- **BostonTangoCalendar.com** (read-only) — serves the Boston tango community (~200 mile radius)
- **TangoTiempo.com** — serves organizers and admins for CRUD operations
- **HarmonyJunction.org** (sister app, appId=2) — same backend, different community (Barbershop singing)

Eventually: Any tango community worldwide can use this system. A dancer in Tokyo can find milongas in Buenos Aires, Berlin, or Boston — all showing correct local venue times.

### Why Timezone Handling Matters

**The fundamental UX principle**: When a dancer sees "Milonga at 8pm", they should be able to show up at 8pm local venue time and be on time.

This sounds obvious, but browsers automatically convert times to the user's timezone. Without careful handling:
- A Boston dancer viewing from a Tokyo hotel would see "Milonga at 9am" (Tokyo time)
- They'd convert mentally, probably get it wrong, and miss the event

**Our solution**: Display ALL times in venue timezone, ignore browser timezone entirely.

### The Boston Special Case

**BostonTangoCalendar.com** is the largest user base — an established community calendar that predates TangoTiempo. It's now an iframe to `/calendar/boston` with:
- Fixed location (Boston, 200-mile radius)
- Read-only (no event creation)
- Always Eastern timezone

Organizers who ADD events for Boston might be anywhere — a traveling teacher in California, a guest DJ in Argentina. They use TangoTiempo.com (full CRUD) to add events, which then appear on BostonTangoCalendar.com.

**This creates the key edge case**: Organizer in California (Pacific Time) creating an event for a Boston venue (Eastern Time). The "8pm" they intend should be 8pm Eastern, not 8pm Pacific.

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Route Analysis: /calendar vs /calendar/boston](#3-route-analysis)
4. [Geolocation & Map Centering Deep Dive](#4-geolocation--map-centering)
5. [Timezone Derivation from Venues](#5-timezone-derivation-from-venues)
6. [Date/Time Storage & Display Philosophy](#6-datetime-storage--display-philosophy)
7. [The "Why Not Text?" Question](#7-why-not-store-as-text)
8. [Backend Expectations & Data Flow](#8-backend-expectations--data-flow)
9. [Filtering & Distance Logic](#9-filtering--distance-logic)
10. [Edge Cases & Scenarios](#10-edge-cases--scenarios)
11. [Current Known Issues](#11-current-known-issues)
12. [Questions Pending Backend Answers](#12-questions-pending-backend-answers)
13. [Recommendations for Future Analysis](#13-recommendations)

---

## 1. Executive Summary

### Core Design Principle
**Display ALL event times in the VENUE's local timezone, NOT the user's browser timezone.**

A user in Tokyo viewing a NYC milonga sees "7:00 PM EDT" — NOT "8:00 AM JST".

### Key Implementation Strategy
1. **FullCalendar configured with `timeZone="UTC"`** — prevents browser timezone conversion
2. **Backend provides pre-formatted display times** — `venueStartDisplay`/`venueEndDisplay` in venue local time (no Z suffix)
3. **String manipulation utilities** — `venueTimezone.js` avoids `Date()` objects which trigger browser conversion
4. **Venues are the source of truth** — all events inherit timezone from their venue (text-based lookup by city/state/country, NOT lat/lng)

### Dual-Site Architecture
| Site | URL | appId | Role | Users |
|------|-----|-------|------|-------|
| **TangoTiempo** | tangotiempo.com | 1 | Full CRUD for RO/Admin | Organizers, Regional Admins |
| **BostonTangoCalendar** | bostontangocalendar.com | 1 | Read-only iframe | End users (largest userbase) |

**Critical Note**: BostonTangoCalendar is read-only but serves the largest userbase. Boston covers ~200 mile radius, always in Eastern timezone (America/New_York), but organizers adding Boston events may be in Europe, Argentina, or California.

---

## 2. System Architecture Overview

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Browser Location (GPS/IP)  →  GeoLocationContext  →  Map Centering     │
│                                      ↓                                   │
│                            currentLocation (lat, lng, zoomRange)         │
└─────────────────────────────────────────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           EVENT RETRIEVAL                                │
├─────────────────────────────────────────────────────────────────────────┤
│  useEvents.js  →  GET /events?lat=X&lng=Y&radius=Zkm                    │
│                         ↓                                                │
│  Backend (calendar-be-af) returns:                                       │
│    - startDate, endDate (UTC/Zulu)                                       │
│    - venueStartDisplay, venueEndDisplay (venue local, NO Z suffix)       │
│    - venueTZ (IANA: "America/New_York")                                  │
│    - venueAbbr ("EDT" or "EST")                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        EVENT TRANSFORMATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│  transformEvents.js:                                                     │
│    - Non-recurring: uses venueStartDisplay directly                      │
│    - Recurring: rrule.js expands occurrences using venue local time      │
│    - NO Z suffix on dates → prevents browser conversion                  │
└─────────────────────────────────────────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          CALENDAR DISPLAY                                │
├─────────────────────────────────────────────────────────────────────────┤
│  FullCalendar (timeZone="UTC"):                                          │
│    - Renders events without browser conversion                           │
│    - venueTimezone.js utilities for display formatting                   │
│    - String manipulation ONLY (no Date() objects)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack
| Layer | Technology | Timezone Handling |
|-------|------------|-------------------|
| Calendar UI | FullCalendar 6.x | `timeZone="UTC"` |
| Date Library | dayjs | Used in create modal (browser TZ issue) |
| RRULE | rrule.js | dtstart without Z suffix |
| Backend | Azure Functions | Calculates venue display times |
| Database | MongoDB | Stores as UTC Date objects |

---

## 3. Route Analysis

### Route: `/calendar` (General)

**File**: `src/app/calendar/page.js`

**Initialization Flow**:
1. Page loads → `useGeoLocation()` provides `currentLocation`
2. If no location exists for anonymous users:
   - WelcomeModal attempts browser geolocation (10s timeout)
   - Success → uses location silently, shows toast
   - Failure → shows MapCenterModal for manual selection
3. Logged-in users without location → opens location settings modal
4. FullCalendar renders with `timeZone="UTC"` (line ~1215)

**FullCalendar Configuration**:
```javascript
<FullCalendar
  timeZone="UTC"  // TIEMPO-239: CRITICAL - Prevents browser conversion
  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, rrulePlugin]}
  events={transformedEvents}
  // ... other config
/>
```

### Route: `/calendar/boston` (Legacy/Forced)

**File**: `src/app/calendar/boston/page.js`

**Hard-coded Configuration**:
```javascript
const BOSTON_CONFIG = {
  lat: 42.3601,
  lng: -71.0589,
  zoomRange: 200,  // 200 mile radius - covers New England
  source: 'legacy-boston',
  locked: true     // Cannot be changed by user
};
```

**Key Behaviors**:
1. Forces Boston location on mount via `setSessionLocation(BOSTON_CONFIG)`
2. Location is "locked" — cannot be changed
3. Read-only view (no event creation)
4. Same FullCalendar UTC timezone configuration
5. Always in Eastern timezone (America/New_York)

**Why This Exists**: `bostontangocalendar.com` is an iframe pointing to `/calendar/boston`. This preserves the legacy BTC experience while serving the largest user base.

---

## 4. Geolocation & Map Centering

### Geolocation Priority (3-Tier Fallback)

**File**: `src/app/utils/geolocationHelper.js`

```
Priority 1: Browser GPS (navigator.geolocation)
    └── ~10m accuracy, requires user permission
    └── 10 second timeout (TIEMPO-388)

Priority 2: Google Geolocation API (via Azure Functions proxy)
    └── ~50-500m accuracy
    └── Uses cell towers, WiFi, IP

Priority 3: ipinfo.io (backend fallback)
    └── ~10km accuracy (city-level)
    └── IP-based, no permission needed
```

**Browser Geolocation Code**:
```javascript
navigator.geolocation.getCurrentPosition(resolve, reject, {
  enableHighAccuracy: true,
  timeout: 10000,      // 10 seconds (TIEMPO-388: increased from 5s)
  maximumAge: 300000   // 5 minute cache
});
```

### GeoLocationContext — Single Source of Truth

**File**: `src/app/contexts/GeoLocationContext.js`

**State Variables**:
| Variable | Purpose |
|----------|---------|
| `userLocation` | Physical location from browser/IP detection |
| `selectedLocation` | Hierarchical location for filtering (country/region/division/city) |
| `currentLocation` | **THE SINGLE SOURCE OF TRUTH** — lat, lng, zoomRange, cityName |
| `savedLocation` | Persisted backend preferences for logged-in users |

**Location Resolution Priority** (from `useEvents.js`):
1. Explicit parameters passed directly
2. `currentLocation` from GeoLocationContext
3. Fallback — no location selected (shows all events?)

### WelcomeModal Flow (TIEMPO-388)

**File**: `src/app/components/Modals/Welcome/WelcomeModal.js`

**Flow for Anonymous Users**:
```
1. Check if user has saved/session location
   └── YES → Use silently, don't show modal
   └── NO → Continue

2. Check if on /boston route
   └── YES → Handled by boston page, don't show modal
   └── NO → Continue

3. Try browser geolocation (10s timeout)
   └── SUCCESS → Use location, show toast "Using your location", don't show modal
   └── DENIED/TIMEOUT → Show MapCenterModal for manual selection
```

### Map Centering Options

**MapCenterModal** (`src/app/components/Modals/misc/MapCenterModal.js`):
- Draggable map pin for precise location
- Zoom range slider (5-200 miles)
- City autocomplete search
- "Use My Location" button

---

## 5. Timezone Derivation from Venues

### The Core Principle

**All events exist at venues. All venues have addresses + lat/lng. All timezones are derived from venue lat/lng.**

### Venue Data Structure
```javascript
{
  _id: "ObjectId",
  venueName: "MIT Dance Studio",
  address: {
    street: "...",
    city: "Cambridge",
    state: "MA",
    country: "USA"
  },
  latitude: 42.3601,
  longitude: -71.0942,
  timezone: "America/New_York",     // IANA timezone (from lat/lng lookup)
  timezoneAbbr: "EDT",              // Display abbreviation
  // ... other fields
}
```

### How Events Inherit Timezone

**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`

When user selects a venue in the create modal:
```javascript
setEventData(prevData => ({
  ...prevData,
  venueId: newValue._id,
  venueName: venueName,
  // TIEMPO-246: Store venue timezone for event creation
  venueTimezone: newValue.timezone || newValue.venueTimezone || null,
  venueTimezoneAbbr: newValue.timezoneAbbr || null,
  // ...
}));
```

### Backend Timezone Calculation (CONFIRMED by Fulton)

**NOT lat/lng based.** Uses text-based lookup in `src/utils/timezoneMapping.js`:

```javascript
// Priority order in getTimezoneForVenue(venue):
1. venue.timezone        // If already set
2. CITY_TIMEZONE_MAP     // City name lookup
3. STATE_TIMEZONE_MAP    // State code lookup
4. COUNTRY_TIMEZONE_MAP  // Country code lookup
5. "America/New_York"    // Default fallback
```

**Implication**: Venues near timezone boundaries (e.g., cities on state lines) depend on accurate city/state data, not precise coordinates. A venue in Gary, Indiana (Central Time) would need correct city mapping to avoid being assigned Eastern Time.

---

## 6. Date/Time Storage & Display Philosophy

### Storage Format (Backend/MongoDB)

**Dates stored as UTC (Zulu time)**:
```javascript
{
  startDate: ISODate("2026-03-21T23:00:00.000Z"),  // 7pm EDT = 11pm UTC
  endDate: ISODate("2026-03-22T02:00:00.000Z"),   // 10pm EDT = 2am UTC next day
}
```

### Display Format (Frontend Receives)

**Backend provides pre-calculated venue-local times**:
```javascript
{
  startDate: "2026-03-21T23:00:00.000Z",           // UTC for sorting/filtering
  endDate: "2026-03-22T02:00:00.000Z",

  // Display fields (NO Z SUFFIX!)
  venueStartDisplay: "2026-03-21T19:00:00",        // 7:00 PM venue time
  venueEndDisplay: "2026-03-21T22:00:00",          // 10:00 PM venue time
  venueTZ: "America/New_York",
  venueAbbr: "EDT"
}
```

### The venueTimezone.js Utilities

**File**: `src/app/utils/venueTimezone.js`

**Critical Design**: Uses **string manipulation ONLY** — no `Date()` objects.

```javascript
export function formatVenueTime(timeString, timezoneAbbr = '') {
  // Parse the string directly WITHOUT Date object
  const [datePart, timePart] = timeString.split('T');
  const [hour, minute] = timePart.split(':');

  // Convert to 12-hour format
  const hourNum = parseInt(hour, 10);
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  const ampm = hourNum >= 12 ? 'PM' : 'AM';

  return {
    time: `${displayHour}:${minute} ${ampm}`,
    // ... other fields
  };
}
```

**Why no Date()?**: `new Date("2026-03-21T19:00:00")` in a browser in Tokyo would interpret this as 7pm Tokyo time, then convert to UTC. By using string manipulation, we preserve the venue's intended time.

---

## 7. Why Not Store as Text?

### The Question
> "Why did we put up all this logic? Why not just store times as text like '7:00 PM EDT'?"

### The Answer: Multiple Use Cases Require Real Dates

| Use Case | Why Text Fails |
|----------|----------------|
| **Sorting** | Can't sort "7:00 PM EDT" vs "8:00 PM PST" properly |
| **Filtering** | "Show events this week" requires date math |
| **Duration** | "Event is 3 hours" needs end - start calculation |
| **Recurring Events** | RRULE expansion requires date objects |
| **API Standards** | REST/JSON expects ISO 8601 dates |
| **MongoDB Queries** | `$gte`, `$lte` require Date types |
| **Timezone Conversion** | Same event, different viewer timezones (we chose venue TZ) |

### The Compromise Solution

**Store as dates, display as venue-local strings.**

1. Backend stores UTC dates for proper sorting/filtering
2. Backend calculates venue-local display strings
3. Frontend receives both and uses display strings for UI
4. FullCalendar uses `timeZone="UTC"` to prevent additional conversion

---

## 8. Backend Expectations & Data Flow

### API Request Format (GET /events)

**From**: `src/app/hooks/useEvents.js`

```javascript
const params = {
  appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
  page,
  limit,
  start: startDate,      // ISO string or YYYY-MM-DD
  end: endDate,
  lat,                   // From currentLocation
  lng,
  radius: `${radiusKm}km`,
  useGeoSearch: true,
  sortByDistance: true
};
```

### API Response Format

```javascript
{
  events: [
    {
      _id: "...",
      title: "Thursday Milonga",

      // UTC storage times
      startDate: "2026-03-21T23:00:00.000Z",
      endDate: "2026-03-22T02:00:00.000Z",

      // Venue-local display times (NO Z SUFFIX)
      venueStartDisplay: "2026-03-21T19:00:00",
      venueEndDisplay: "2026-03-21T22:00:00",
      venueTZ: "America/New_York",
      venueAbbr: "EDT",

      // Venue info
      venueId: "...",
      venueName: "MIT Dance Studio",

      // Recurrence (if applicable)
      isRepeating: true,
      recurrenceRule: "FREQ=WEEKLY;BYDAY=TH",
      excludedDates: ["2026-04-10T23:00:00.000Z"]
    }
  ],
  pagination: { ... }
}
```

### Event Creation (POST/PUT)

**Frontend sends**:
```javascript
{
  title: "...",
  startDate: "2026-03-21T19:00:00",  // From dayjs (browser TZ!)
  endDate: "2026-03-21T22:00:00",
  venueId: "...",
  // ...
}
```

**Backend**:
1. Looks up venue timezone from venueId
2. Interprets startDate/endDate in venue timezone
3. Converts to UTC for storage
4. Calculates venueStartDisplay/venueEndDisplay

**KNOWN ISSUE (TIEMPO-246 Phase 3)**: Events are created in browser timezone via dayjs, not venue timezone. An organizer in California creating a Boston event at "7pm" would actually create it at 7pm Pacific, not 7pm Eastern.

---

## 9. Filtering & Distance Logic

### Distance-Based Filtering

**From**: `src/app/hooks/useEvents.js`

```javascript
if (effectiveLat && effectiveLng) {
  params.lat = effectiveLat;
  params.lng = effectiveLng;

  if (currentLocation?.lat && currentLocation?.lng) {
    params.useGeoSearch = true;
    const radiusInMiles = effectiveZoomRange || 200;
    params.radius = `${Math.round(radiusInMiles * 1.60934)}km`;  // Miles → km
    params.sortByDistance = true;
  }
}
```

### Backend Geo Query (Assumed)

MongoDB geospatial query (question for Fulton to confirm):
```javascript
db.events.find({
  "venue.location": {
    $geoWithin: {
      $centerSphere: [[lng, lat], radiusInRadians]
    }
  }
})
```

### Map Bounds vs Radius

**Current Behavior**: Uses radius from center point, not map bounds.

| User Setting | Effect |
|--------------|--------|
| Zoom Range: 5 miles | Events within 5 miles of center |
| Zoom Range: 200 miles | Events within 200 miles of center |
| Pan map | Does NOT change filter (uses saved center) |

### The Venue Visibility Problem

**Scenario**: User in California with map centered on California wants to add event in Boston.

**Problem**: Venue autocomplete only shows venues near the map center. California user can't see Boston venues!

**Current Workaround**: None documented. User must:
1. Change their map center to Boston temporarily
2. Create the event
3. Change back to California (or leave at Boston)

**Potential Solution**: Venue search should be global, not filtered by map center.

---

## 10. Edge Cases & Scenarios

### Scenario 1: California Organizer Creating Boston Event

**Actor**: Event organizer in San Francisco (America/Los_Angeles)
**Action**: Creating event for MIT Dance Studio (America/New_York)
**Time**: "Thursday at 7:00 PM"

**Current Behavior**:
1. DateTimePicker shows times in Pacific timezone (browser TZ)
2. Organizer selects "19:00" thinking it's 7pm Eastern
3. But dayjs creates this as 7pm Pacific = 10pm Eastern
4. Event saves at wrong time!

**Expected Behavior**:
1. Once venue is selected, DateTimePicker should show venue timezone
2. Or at minimum, display warning "Times shown in [venue timezone]"

**JIRA**: TIEMPO-246 Phase 3 (identified, not fixed)

### Scenario 2: Argentine Teacher Adding US Festival

**Actor**: Maestro in Buenos Aires (America/Argentina/Buenos_Aires, no DST)
**Action**: Creating multi-day festival in San Francisco
**Time**: "Friday 10pm - Saturday 3am"

**Complications**:
1. Argentina has no DST; San Francisco does
2. Festival spans midnight (multi-day)
3. Organizer's browser is 4-5 hours ahead of venue

**Current Behavior**: Same as Scenario 1 — times saved in browser timezone.

### Scenario 3: European User Viewing Boston Events

**Actor**: Dancer in Berlin (Europe/Berlin)
**Action**: Viewing Boston milongas
**Route**: `/calendar/boston`

**Current Behavior**:
1. Route forces Boston location
2. Events display as "7:00 PM EDT" (venue time)
3. User sees venue time, NOT Berlin time (correct!)

**Edge Case**: If user is planning travel, they want venue time. ✅ Working correctly.

### Scenario 4: DST Transition

**Actor**: Any user
**Event**: Weekly milonga, Thursdays at 7pm
**Date**: November 2026 (DST ends Nov 1)

**Question**: Does the 7pm milonga stay at 7pm after DST?

**Current Behavior** (TIEMPO-250):
```javascript
// transformEvents.js line 251+
const rruleObj = {
  dtstart: startDate  // Venue time directly, no Z suffix
};
```

By using venue local time without Z suffix, rrule.js maintains "7pm" as the logical time across DST transitions. The UTC storage time shifts by 1 hour, but display stays at 7pm.

### Scenario 5: Location Mismatch Warning

**Actor**: User with saved location = Boston
**Action**: Temporarily viewing NYC events (changed via MapCenterModal)
**Question**: Should system warn when adding event outside their "home" area?

**Current Behavior**: No warning. User could accidentally add NYC event when they meant Boston.

**Potential Rule**: "Your calendar view is centered on NYC, but you're about to add an event in Boston. Continue?"

---

## 11. Current Known Issues

### Issue 1: Event Creation in Browser Timezone

**Status**: Identified (TIEMPO-246 Phase 3), not fixed
**Severity**: High
**Impact**: Events created at wrong times when organizer is in different timezone than venue

**Root Cause**:
```javascript
// CreateEventDetailModal.js
const selectedDay = dayjs();  // Browser timezone!
const sevenPM = selectedDay.hour(19).minute(0);
```

**Fix Required**:
```javascript
const venueTimezone = selectedVenue.timezone || 'America/New_York';
const sevenPM = dayjs.tz(selectedDay, venueTimezone).hour(19).minute(0);
```

### Issue 2: Venue Search Limited by Map Center

**Status**: Not documented as issue
**Severity**: Medium
**Impact**: Can't create events for distant venues without changing map center

### Issue 3: No Warning for Location Mismatch

**Status**: Not documented
**Severity**: Low
**Impact**: User might accidentally add event in wrong region

### Issue 4: Date() Objects Still in Some Components

**Status**: Tracked in TIMEZONE_AUDIT_V3.md
**Progress**: 3/16 bugs fixed (19%)
**Remaining**: 13 components still use `new Date()` for display

---

## 12. Backend Implementation Details (Answers from Fulton)

**Received from Fulton (calendar-be-af agent) on 2026-03-23**:

### Q1: How is venueTZ determined from venue lat/lng?

**NOT from lat/lng.** Uses **text-based lookup** in `src/utils/timezoneMapping.js`:

```
Priority Order:
1. Existing venue.timezone (if already set)
2. City name lookup (CITY_TIMEZONE_MAP)
3. State code lookup (STATE_TIMEZONE_MAP)
4. Country code lookup (COUNTRY_TIMEZONE_MAP)
5. Default fallback: "America/New_York"
```

**Key Function**: `getTimezoneForVenue(venue)` lines 61-76

**Implication**: Venues are NOT using geo-tz or similar lat/lng → timezone libraries. This is simpler but could have edge cases for cities near timezone boundaries.

---

### Q2: Where is venueStartDisplay/venueEndDisplay calculated?

**Computed at query time** in `src/utils/timezoneService.js`:

| Item | Detail |
|------|--------|
| Function | `enrichEventsWithTimezone(events)` lines 94-137 |
| Called From | `Events.js:576` at end of GET /events |
| Library | **Luxon** (DateTime, IANAZone) for IANA timezone conversion |
| Caching | 15-minute in-memory cache, 5000 entries max |

**Flow**:
```
GET /events request
    → MongoDB query (returns UTC dates)
    → enrichEventsWithTimezone(events)
        → For each event:
            → calculateDisplayTime(utcDate, venueTZ)
            → Returns venueStartDisplay, venueEndDisplay, venueAbbr, isDST
    → Response to frontend
```

---

### Q3: How does backend handle DST transitions?

In `calculateDisplayTime()` (timezoneService.js:49-86):

| Scenario | Handling |
|----------|----------|
| Normal | Luxon converts UTC → venue local time |
| DST Gap (2am doesn't exist) | Advances 1 hour, sets `disambiguation: 'gap-adjusted'` |
| DST Overlap (2am exists twice) | Luxon picks first occurrence |
| Re-calculation on DST change | **None** — computed on-demand at query time |

**Response includes**: `isDST: true/false` flag

**Implication**: No stored display times — always fresh calculation. Good for accuracy, but means every query recalculates.

---

### Q4: How does backend determine venue timezone on event creation?

In POST /events (Events.js:879-889):

```
1. Frontend sends: UTC startDate/endDate + venueId
2. Backend looks up venue document by venueId
3. Copies venue.timezone → event.venueTimezone
4. If venue has no timezone: logs warning, leaves unset
```

**Critical Finding**: Backend does NOT re-interpret frontend dates. It stores what frontend sends (assumed UTC) and looks up venue TZ separately.

---

### Q5: What if venue has no timezone set?

**No default to UTC.** Event is marked as missing timezone data:

```javascript
{
  hasTimezoneData: false,
  venueStartDisplay: undefined,
  venueEndDisplay: undefined
}
```

**Frontend responsibility**: Handle gracefully (show UTC fallback)

**Implication**: Some older venues may lack timezone data. Frontend `venueTimezone.js` has fallback logic for this.

---

### Q6: How does GET /events geo filtering work?

**MongoDB `$geoWithin/$centerSphere` queries** (Events.js:366-433):

| Parameter | Detail |
|-----------|--------|
| Geo field | `venueGeolocation` (default) or `masteredCityGeolocation` (useCity=true) |
| Radius conversion | meters / 6378137 (Earth radius) = radians |
| Default radius | 50km |
| Distance calculation | Haversine formula, computed post-query |
| Sorting | Optional `sortByDistance=true` param |

**Query Example**:
```javascript
{
  venueGeolocation: {
    $geoWithin: {
      $centerSphere: [[lng, lat], radiusInRadians]
    }
  }
}
```

---

### Q7: Are dates stored as MongoDB Date objects or ISO strings?

**MongoDB Date objects** (UTC timestamps):

| Layer | Format |
|-------|--------|
| Storage | BSON Date type (milliseconds since Unix epoch) |
| Internal | JavaScript `Date` objects |
| Response | Serialized as ISO strings in JSON |

**Example**:
```
MongoDB: ISODate("2026-03-21T23:00:00.000Z")
JSON Response: "2026-03-21T23:00:00.000Z"
```

---

## 13. Recommendations for Future Analysis

### Potential Improvements

1. **Fix Event Creation Timezone**
   - Use `dayjs.tz()` with venue timezone in create modal
   - Display "Times shown in Eastern Time" indicator

2. **Global Venue Search**
   - Remove map-center filtering from venue autocomplete
   - Allow searching venues anywhere

3. **Location Mismatch Warning**
   - Warn when creating event far from current view
   - "This venue is 2,500 miles from your current view. Continue?"

4. **Timezone Indicator in UI**
   - Always show timezone abbreviation (EDT, PST)
   - Especially important when viewing from different timezone

5. **Admin/Organizer Timezone Preference**
   - Allow organizers to set their "home" timezone
   - Default create modal to their preferred timezone

### Edge Cases Needing Further Analysis

1. **Events at Midnight** — venue date vs UTC date
2. **Events Spanning Multiple Days** — festival weekends
3. **Events During DST Transition Hour** — 2am doesn't exist
4. **International Venues** — different DST rules, southern hemisphere
5. **Venues Without Timezone** — migration handling

### Testing Recommendations

1. **Cross-Timezone Creation Test**
   - Create event from West Coast for East Coast venue
   - Verify stored time matches venue intent

2. **DST Transition Test**
   - Create recurring event spanning Nov 1 (DST end)
   - Verify all occurrences show correct venue time

3. **Boston Route Test**
   - Access from non-Eastern timezone
   - Verify times show as Eastern (venue time)

---

## Appendix A: Key File Reference

| Category | File | Purpose |
|----------|------|---------|
| Calendar Routes | `src/app/calendar/page.js` | Main calendar with FullCalendar |
| | `src/app/calendar/boston/page.js` | Forced Boston route |
| Contexts | `src/app/contexts/GeoLocationContext.js` | Location state management |
| Hooks | `src/app/hooks/useEvents.js` | Event fetching with geo params |
| | `src/app/hooks/useCalendarPage.js` | Calendar page state |
| | `src/app/hooks/useCloudFlareData.js` | CloudFlare geo headers |
| Utilities | `src/app/utils/venueTimezone.js` | Timezone display (string manipulation) |
| | `src/app/utils/transformEvents.js` | Event transformation for FullCalendar |
| | `src/app/utils/geolocationHelper.js` | 3-tier geolocation fallback |
| Modals | `src/app/components/Modals/Welcome/WelcomeModal.js` | Initial location prompt |
| | `src/app/components/Modals/misc/MapCenterModal.js` | Location selection |
| | `src/app/components/Modals/ViewEvents/ViewEventDetailModal.js` | Event detail display |
| | `src/app/components/Modals/CreateEvents/CreateEventDetailModal.js` | Event creation |
| | `src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js` | Basic event fields |
| | `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js` | RRULE creation |
| Docs | `docs/TIMEZONE_IMPLEMENTATION_V3.md` | Implementation design |
| | `docs/TIMEZONE_AUDIT_V3.md` | Bug audit (30+ files) |
| | `public/TIMEZONE_DATE_LOGIC_MAP.md` | Complete data flow map |

---

## Appendix B: Existing Documentation Reference

| Document | Location | Status |
|----------|----------|--------|
| TIMEZONE_IMPLEMENTATION_V3.md | `/docs/` | Current design doc |
| TIMEZONE_AUDIT_V3.md | `/docs/` | Bug audit, 19% complete |
| TIMEZONE_DATE_LOGIC_MAP.md | `/public/` | Data flow map |
| TIEMPO-250-RRULE-ARCHITECTURE.md | `/docs/` | Recurring events/DST |
| CLOUDFLARE_GEOLOCATION_SETUP.md | `/docs/` | Geo headers setup |

---

*End of Research Document*

*Prepared by Sarah (TangoTiempo Frontend Agent) for LLM analysis*
*Questions sent to Fulton (Backend Agent) for clarification*
