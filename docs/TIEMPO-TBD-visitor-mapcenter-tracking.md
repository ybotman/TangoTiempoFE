# TIEMPO-TBD: Add MapCenter Coordinates and Zoom Range to Visitor Tracking

**Type:** Story
**Priority:** Medium
**Component:** Frontend, Backend (Azure Functions)
**Assignee:** Sarah (Frontend), Fulton (Backend)

---

## Summary

Enhance visitor tracking to capture map center coordinates and zoom range to understand what geographic areas visitors are viewing, not just where they are physically located.

---

## Background

Currently visitor tracking only captures:
- User's physical location (via Google/Cloudflare geolocation)
- Page visited
- Timezone

We need to also capture:
- **Map center coordinates** (what area they're viewing on the map)
- **Zoom range** (how wide their search radius is)

---

## Requirements

### 1. Track Map Center Changes

**Trigger:** When user changes map center (not just page load)
- Create new visitor tracking entry
- Tag as "map-center-change" event type
- Include map center coordinates and zoom range

**Data to Capture:**
```json
{
  "eventType": "map-center-change",
  "mapCenter": {
    "lat": 40.7128,
    "lng": -74.0060,
    "zoomRange": 50
  },
  "page": "/calendar",
  "timestamp": "ISO timestamp"
}
```

### 2. Initial Page Load Enhancement

**Also capture map center on initial page visit:**
```json
{
  "eventType": "page-visit",
  "page": "/calendar",
  "mapCenter": {
    "lat": 40.7128,
    "lng": -74.0060,
    "zoomRange": 50
  }
}
```

### 3. Analytics 5-Minute Consolidation Rule ⭐ IMPORTANT

**Problem:** If user visits page AND changes map center within 5 minutes → creates 2 database rows

**Solution for Analytics:**
- **Database:** Can have 2 separate rows (acceptable)
- **Analytics queries:** Should treat as single event if within 5-minute window
- Implement consolidation logic in analytics queries/views

**Example:**
```
12:00:00 - Page visit (/calendar, map center: NYC)
12:02:30 - Map center change (NYC → Boston)

Analytics should show: 1 visitor event with latest map center (Boston)
```

---

## Technical Implementation

### Frontend Changes (Sarah)

**File:** `src/app/calendar/layout.js`

#### Change 1: Enhance Existing Visitor Tracking (Page Load)

Add map center to existing visitor tracking:

```javascript
// Import GeoLocationContext
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// In component
const { selectedLocation } = useGeoLocation();

// In visitor tracking fetch body
body: JSON.stringify({
  // Existing fields...
  eventType: 'page-visit',  // NEW
  page: window.location.pathname,
  pathname: window.location.pathname,

  // NEW: Add map center
  mapCenter: {
    lat: selectedLocation?.center?.lat || null,
    lng: selectedLocation?.center?.lng || null,
    zoomRange: selectedLocation?.zoomRange || null
  },

  // Existing geolocation (user's physical location)
  cloudflare: geoData.cloudflare,
  google: geoData.google,
  // ...
})
```

#### Change 2: Add Map Center Change Tracking

New useEffect to track map center changes:

```javascript
// Subscribe to map center change events
useEffect(() => {
  const trackMapCenterChange = async (location) => {
    try {
      const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

      // Check if this is too soon after last tracking (optional throttling)
      const lastTracked = sessionStorage.getItem('mapcenter_last_tracked');
      const now = Date.now();
      const MIN_INTERVAL = 10000; // 10 seconds minimum between map center tracks

      if (lastTracked && (now - parseInt(lastTracked)) < MIN_INTERVAL) {
        console.log('[MapCenter Tracking] Throttled - too soon since last track');
        return;
      }

      await fetch(`${afUrl}/api/visitor/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: 'map-center-change',
          page: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
          pathname: typeof window !== 'undefined' ? window.location.pathname : '/calendar',
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : '',

          mapCenter: {
            lat: location.lat,
            lng: location.lng,
            zoomRange: location.zoomRange
          },

          timestamp: new Date().toISOString()
        })
      });

      sessionStorage.setItem('mapcenter_last_tracked', now.toString());
      console.log('[MapCenter Tracking] Successfully tracked map center change');
    } catch (error) {
      console.warn('[MapCenter Tracking] Failed:', error.message);
    }
  };

  // Subscribe to location change events from LocationEventBus
  const unsubscribe = locationEventBus.on(
    LOCATION_EVENTS.LOCATION_CHANGED,
    (location) => {
      if (location?.lat && location?.lng) {
        trackMapCenterChange(location);
      }
    }
  );

  return () => unsubscribe();
}, []); // Empty deps - subscribe once
```

---

### Backend Changes (Fulton - Azure Functions)

**Endpoint:** `/api/visitor/track`

#### Change 1: Accept New Fields

Update endpoint to accept:
- `eventType` (string: "page-visit" | "map-center-change")
- `mapCenter` (object):
  - `lat` (number)
  - `lng` (number)
  - `zoomRange` (number)

#### Change 2: Store in MongoDB

Update MongoDB schema for visitors collection:

```javascript
{
  // Existing fields...
  eventType: String,  // NEW: "page-visit" or "map-center-change"
  page: String,
  pathname: String,

  // NEW: Map center data
  mapCenter: {
    lat: Number,
    lng: Number,
    zoomRange: Number
  },

  // Existing: User's physical location
  google: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },

  cloudflare: {
    ip: String,
    country: String
  },

  timestamp: Date
}
```

#### Change 3: Analytics Helper Function (Backend)

Create helper function to consolidate events:

```javascript
// In Azure Functions or analytics service
async function getConsolidatedVisitorEvents(startDate, endDate) {
  const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

  const pipeline = [
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $sort: {
        'cloudflare.ip': 1,
        timestamp: 1
      }
    },
    {
      $group: {
        _id: {
          ip: '$cloudflare.ip',
          // Create 5-minute time buckets
          timeBucket: {
            $subtract: [
              { $toLong: '$timestamp' },
              { $mod: [{ $toLong: '$timestamp' }, FIVE_MINUTES] }
            ]
          }
        },
        firstEvent: { $first: '$$ROOT' },
        lastMapCenter: { $last: '$mapCenter' },
        events: { $push: { eventType: '$eventType', timestamp: '$timestamp' } },
        eventCount: { $sum: 1 }
      }
    },
    {
      $project: {
        ip: '$_id.ip',
        timestamp: '$firstEvent.timestamp',
        page: '$firstEvent.page',
        physicalLocation: '$firstEvent.google',
        mapCenter: '$lastMapCenter',  // Use LAST map center in window
        eventTypes: '$events',
        consolidatedCount: '$eventCount'
      }
    }
  ];

  return await db.collection('visitors').aggregate(pipeline).toArray();
}
```

---

## Acceptance Criteria

- [ ] Visitor tracking captures map center on page load
- [ ] Visitor tracking captures map center on map center change
- [ ] Zoom range included in all tracking data
- [ ] Events tagged with eventType field
- [ ] Backend accepts and stores mapCenter data
- [ ] MongoDB visitors collection has mapCenter fields
- [ ] Analytics query consolidates events within 5-minute windows
- [ ] No impact on existing visitor tracking functionality
- [ ] No console errors on TEST
- [ ] Tested on TEST environment
- [ ] Deployed to PROD
- [ ] Coordinated with Fulton for backend deployment

---

## Data Dictionary

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **eventType** | string | Type of visitor event | "page-visit" or "map-center-change" |
| **mapCenter.lat** | number | Latitude of map center (what user is viewing) | 40.7128 |
| **mapCenter.lng** | number | Longitude of map center (what user is viewing) | -74.0060 |
| **mapCenter.zoomRange** | number | Zoom range in miles | 50 |
| **google.latitude** | number | User's physical location latitude | 42.36 |
| **google.longitude** | number | User's physical location longitude | -71.06 |
| **page** | string | Page path where event occurred | "/calendar" |
| **timestamp** | ISO date | When event occurred | "2025-10-21T20:00:00Z" |

---

## Key Insights This Enables

**Physical Location vs. Map Center:**
- **Physical Location (google.lat/lng):** Where visitors are coming from geographically
- **Map Center (mapCenter.lat/lng):** What geographic areas they're interested in viewing

**Example Use Cases:**
1. Visitor in Boston viewing NYC events → `google: Boston, mapCenter: NYC`
2. Visitor in LA viewing SF events → `google: LA, mapCenter: SF`
3. Analytics: "Users in Boston are most interested in NYC, not Boston events"

**Analytics Questions We Can Answer:**
- What areas are visitors most interested in viewing?
- Do visitors view local events (where they are) or events elsewhere?
- What zoom range do most visitors use? (hyperlocal vs. regional)
- How often do visitors change their map center?

---

## Related Tickets

- **TIEMPO-323:** Page parameter tracking (completed in v1.12.12)
- **TIEMPO-313:** Visitor tracking implementation (completed)
- **TIEMPO-319:** Rate limiting fixes (completed)
- **CALBEAF-53:** Backend MapCenter tracking for logged-in users (in progress)

---

## Notes

- This ticket is for **anonymous visitor tracking** (not logged in)
- CALBEAF-53 handles logged-in user MapCenter tracking (separate system)
- Both physical location AND map center should be captured
- 5-minute consolidation is for **analytics only**, not database storage
- Backend coordination with Fulton required

---

## Definition of Done

1. Frontend code complete and tested locally
2. Backend code complete and tested locally
3. Deployed to TEST environment
4. Integrated testing complete (frontend + backend)
5. Analytics consolidation query tested
6. Deployed to PROD
7. Monitoring for 24 hours - no errors
8. Documentation updated
9. Ticket marked as Done in JIRA
