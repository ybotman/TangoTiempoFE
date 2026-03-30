# Scout Analysis: MapCenter/Location System in TangoTiempo

**Generated**: 2026-03-30
**Analyzed by**: Scout (Sarah - TangoTiempo Frontend Agent)
**Scope**: Comprehensive analysis of MapCenter/location system

---

## Executive Summary

The MapCenter/location system is a complex, multi-layered architecture that has undergone significant evolution over the past 6 months. The system handles:
- User location detection (browser geolocation, Google API, IP fallback)
- Location storage (sessionStorage, localStorage, cookies, Azure Functions cloud)
- Event filtering by geographic radius
- User type differentiation (anonymous vs logged-in)
- Multiple UI modals (WelcomeModal, MapCenterModal, MapCenterOnboardingModal)

**Key Problem Areas Identified:**
1. Google Geocoding API 429 rate limit errors (87% of all API errors)
2. City name display race conditions (recently fixed in TIEMPO-388)
3. Complex modal orchestration with potential race conditions
4. Visit count mechanism exists but is underutilized

---

## 1. Git History Analysis (Last 6 Months)

### Key Commits by Ticket

| Ticket | Focus | Key Commits |
|--------|-------|-------------|
| **TIEMPO-388** | Geolocation + City Name Race Conditions | 15+ commits fixing pill display, modal timing, city name fetch |
| **TIEMPO-381** | MapCenter Onboarding Flow | 12+ commits for new user onboarding, Boston route fixes |
| **TIEMPO-360** | MapCenterModal Density Pills | Event density overlay on map |
| **TIEMPO-329** | Welcome Modal + Visit Tracking | First-time visitor flow |
| **TIEMPO-321** | Geolocation Migration to AFA | Backend proxy for geo APIs |
| **TIEMPO-319** | Rate Limit Fixes | Caching to prevent 429 errors |
| **TIEMPO-312** | Cloud Default Feature | Azure Functions mapCenter storage |

### Evolution Timeline

```
2024-10: TIEMPO-312 - Cloud Default feature launched
         - Users can save mapCenter to Azure Functions
         - GeoLocationContext introduced

2025-01: TIEMPO-319/321 - Rate limiting crisis
         - Google Geo 429 errors hitting 150/day
         - Added caching, migrated to AFA proxy

2025-02: TIEMPO-329 - Welcome Modal
         - First-time visitor tracking
         - Visit count mechanism added

2025-03: TIEMPO-360 - Density pills
         - MapCenterModal shows event density

2025-03: TIEMPO-381 - Onboarding flow
         - Logged-in users without mapCenter get forced modal
         - Boston route exceptions

2025-03: TIEMPO-388 - Race condition fixes
         - City name now stored in context (survives remount)
         - Browser geolocation tried before modal
         - Increased timeout from 5s to 10s
```

---

## 2. SHOFF Handoff History (Location-Related)

### Recent Session Findings

**session_2026-03-20T13-05.md** - Two Blocking Bugs:
1. Pill showing lat/long instead of city name ("Boston")
2. MapCenter modal popping up unexpectedly for guests

**Root cause**: `fetchNearestCity` not populating `nearestCityName` state due to race conditions.

**session_2026-03-27T18-14.md** - Google Geo API Analysis:
- 187 Google Geo 429 errors = 87% of all API errors
- Recommendation: Switch sessionStorage to localStorage, increase TTL to 24h
- **NOT YET IMPLEMENTED** - user declined

---

## 3. Current Code Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/app/contexts/GeoLocationContext.js` | **Single source of truth** for location state |
| `src/app/contexts/LocationAPIContext.js` | API functions for fetching location data |
| `src/app/components/Modals/misc/MapCenterModal.js` | Main modal for changing location |
| `src/app/components/Modals/misc/MapCenterOnboardingModal.js` | Blocking modal for logged-in users without mapCenter |
| `src/app/components/Modals/Welcome/WelcomeModal.js` | Anonymous user first visit flow |
| `src/app/components/UI/SiteHeader.js` | Location pill display |
| `src/app/components/UserLocationLoader.js` | Fetches cloud mapCenter on login |
| `src/app/components/UI/NoEventsAlert.js` | "No events" message with Map Center button |
| `src/app/utils/geolocationHelper.js` | Browser + Google API geolocation |
| `src/app/utils/visitorTracking.js` | Cookie + localStorage for visitor tracking |
| `src/app/hooks/useEvents.js` | Event fetching with location filtering |

### GeoLocationContext State Shape

```javascript
// Current location (single source of truth)
currentLocation: {
  lat: number,
  lng: number,
  zoomRange: number (miles),
  cityName: string | null,      // TIEMPO-388: Now stored here
  cityNameLoading: boolean,     // TIEMPO-388: Prevents flash
  cityNameFetched: boolean,     // TIEMPO-388: Tracks completion
  source: string,               // Optional: 'boston' for locked routes
  locked: boolean               // Optional: Prevents overwrite
}

// Saved location (from cloud)
savedLocation: {
  lat: number,
  lng: number,
  zoomRange: number
}

// Modal states
mapCenterModalOpen: boolean
needsOnboarding: boolean
```

---

## 4. User Flow Analysis

### A. Default Location Behavior

**Anonymous User (no saved location):**
```
1. WelcomeModal useEffect runs
2. incrementVisitCount() called
3. needsLocationSetup() checks:
   - Is /boston route? -> Skip (uses BOSTON_CONFIG)
   - Has getLastMapCenter()? -> Skip (use stored)
4. Try browser geolocation (10s timeout)
   - Success -> setSessionLocation + show toast
   - Fail -> openMapCenterModal()
```

**Logged-In User:**
```
1. UserLocationLoader.useEffect runs
2. Check if Boston route -> Skip
3. Call fetchMapCenter(firebaseToken)
4. If no mapCenter returned -> setNeedsOnboarding(true)
5. Calendar page shows MapCenterOnboardingModal when needsOnboarding && user
```

### B. Location Storage Hierarchy

| Storage | Purpose | TTL | Used By |
|---------|---------|-----|---------|
| `sessionStorage['currentLocation']` | Session state | Session | GeoLocationContext |
| `localStorage['last_map_center']` | Cross-session for anonymous | Forever | visitorTracking.js |
| `localStorage['visit_count']` | Visit tracking | Forever | visitorTracking.js |
| `cookie['visitor_id']` | Visitor identity | 365 days | visitorTracking.js |
| Azure Functions `/api/mapcenter` | Cloud default | Forever | UserLocationLoader |
| `sessionStorage['google_geo_cache']` | Geo API cache | 5 min | geolocationHelper.js |
| `sessionStorage['google_geo_rate_limited']` | Rate limit flag | Session | geolocationHelper.js |

### C. "No Events" Message Flow

**File**: `src/app/components/UI/NoEventsAlert.js`

**Conditions for display:**
```javascript
if (
  noLocationSelected ||    // Still loading location
  eventsLoading ||         // Still loading events
  !events ||               // No events array
  events.length > 0 ||     // Has events
  dismissed ||             // User closed it
  !showAlert              // 1-second delay not passed
) {
  return null;
}
```

**TIEMPO-388 Fix**: Added 1-second delay (`showAlert` state) to prevent flash during initial load.

**Boston-specific behavior**: Shows "Explore All Regions" link instead of "Adjust Map Center" button.

---

## 5. User Types and Filtering

### Role Definitions

| Role | Code Name | Description |
|------|-----------|-------------|
| Anonymous | `AnonymousUser` | Not logged in |
| Named User | `NamedUser` | Logged in, no special roles |
| Regional Organizer | `RegionalOrganizer` | Can create events |
| Regional Admin | `RegionalAdmin` | Can manage organizers |
| System Admin | `SystemAdmin` | Full system access |
| Super Admin/Owner | `SystemOwner` | System owner |

### Role-based Behavior

**From `RoleContext.js`:**
```javascript
const ELEVATED_ROLES = ['RegionalOrganizer', 'RegionalAdmin', 'SystemAdmin', 'SystemOwner'];
const BASE_ROLES = ['NamedUser', 'Anonymous', ''];
```

**Calendar Page Logic** (from `page.js`):
```javascript
const canAddEvents = selectedRole === listOfAllRoles.REGIONAL_ORGANIZER ||
                    selectedRole === listOfAllRoles.REGIONAL_ADMIN ||
                    selectedRole === listOfAllRoles.SYSTEM_ADMIN ||
                    selectedRole === listOfAllRoles.SUPER_ADMIN;

// Placeholder text changes based on role
const placeholderText = canAddEvents ? 'Click to add event' : 'No events';
```

**Event Filtering**: Uses `useEvents` hook with:
- `useGeoLocationContext: true` - Gets location from context
- `useLocationPreferences: true` - Uses saved user preferences

RO/RA do NOT see different events by default - they see the same geo-filtered events as other users. Their privilege is the ability to CREATE events.

---

## 6. Visit Count Mechanism

### Current Implementation

**File**: `src/app/utils/visitorTracking.js`

```javascript
// Storage key
const VISIT_COUNT_KEY = 'visit_count';

// Functions
incrementVisitCount() -> number  // Called on each page load
getVisitCount() -> number        // Read without increment
resetVisitCount() -> void        // For testing
```

**Current Usage** (from `WelcomeModal.js`):
```javascript
useEffect(() => {
  incrementVisitCount();
  // ... rest of logic
}, []);
```

**NOT CURRENTLY USED FOR:**
- Progressive disclosure
- Signup prompts on visit N
- Feature unlock based on visits

### What Would Be Needed for Visit-Based Features

```javascript
// Example: Show signup prompt on 5th visit
const visitNum = getVisitCount();
if (visitNum >= 5 && !user && !dismissedSignupPrompt) {
  showSignupPrompt();
}
```

---

## 7. Google 429 Errors Analysis

### Current Rate Limiting Implementation

**File**: `src/app/utils/geolocationHelper.js`

```javascript
const CACHE_KEY = 'google_geo_cache';
const RATE_LIMIT_KEY = 'google_geo_rate_limited';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Check cache before API call
if (sessionStorage.getItem(RATE_LIMIT_KEY)) {
  console.warn('[Geolocation] Skipping Google API - rate limited this session');
  return null;
}

// On 429 response
if (response.status === 429) {
  sessionStorage.setItem(RATE_LIMIT_KEY, 'true');
}
```

### Problems

1. **sessionStorage clears on tab close** - User opens new tab, hits API again
2. **5-minute cache too short** - User returns after 6 minutes, hits API again
3. **No cross-device persistence** - Same user, different device = duplicate calls
4. **Backend not rate-limited** - FE caching doesn't help when multiple users hit simultaneously

### Recommended Fixes (NOT YET IMPLEMENTED)

**FE Side** (from handoff):
- Switch `sessionStorage` -> `localStorage`
- Increase TTL from 5 min -> 24 hours
- Consider using visitor_id for more aggressive caching

**BE Side** (MSG sent to Fulton):
- Implement server-side rate limiting/caching
- Use Redis or similar for cross-user deduplication

---

## 8. Alternative Geocoding Services

### Current Services Used

| Service | Endpoint | Accuracy | Rate Limit |
|---------|----------|----------|------------|
| Browser GPS | `navigator.geolocation` | 10m | None (user permission) |
| Google Geolocation API | `/api/geo/google-geolocate` (via AFA) | 50-500m | Quota-based |
| ipinfo.io | Backend fallback | ~10km | Handled by BE |
| BigDataCloud | `/api/geo/bigdatacloud` (via AFA) | ~5km | Higher limits |

### Fallback Chain (from `geolocationHelper.js`)

```
Priority 1: Browser GPS (best accuracy)
    |
    v (if denied/failed)
Priority 2: Google Geolocation API (via AFA proxy)
    |
    v (if 429 or failed)
Priority 3: ipinfo.io (handled by backend)
```

### Services NOT Currently Used

- MapQuest Geocoding (mentioned in search results but not actively used)
- Cloudflare IP geolocation (used for tracking, not for map center)

---

## 9. Infrastructure Considerations

### Vercel Configuration

- **No special geo configuration required** - Location detection handled by FE/BE
- Vercel provides Edge Functions but not currently used for geo

### Cloudflare

- **Cloudflare IP info** available at `/cdn-cgi/trace`
- Used in `trackingHelper.js` for analytics
- NOT used for MapCenter location

### API Usage Patterns

**Google Geolocation API:**
- Called via AFA proxy at `NEXT_PUBLIC_AF_URL/api/geo/google-geolocate`
- Cached in sessionStorage for 5 minutes
- Rate-limited flag set on 429

**Azure Functions MapCenter:**
- `GET /api/mapcenter` - Fetch saved mapCenter
- `PUT /api/mapcenter` - Save mapCenter
- Requires Firebase token for authentication

---

## 10. Findings by User Concern Area

### A. Default Location Behavior

**Current State:**
- Anonymous: Try browser geo first, then show modal
- Logged-in: Fetch from Azure Functions, show onboarding if none

**Issues:**
- No server-side default based on IP (could use Cloudflare headers)
- Boston route has special hardcoded handling

### B. "No Events" Messages

**Appears when:**
- `events.length === 0` AND `!eventsLoading` AND `!noLocationSelected`

**Does NOT appear:**
- During loading
- Before location is set
- After user dismisses (persists in sessionStorage)

**Issue:** None currently identified - TIEMPO-388 fixed the timing issues

### C. User Types and Filtering

**RO/RA Behavior:**
- See same events as other users (geo-filtered)
- Can CREATE events (not filter-related)
- Header image changes based on role

**No special "No events" messages for RO/RA** - this could be an enhancement opportunity

### D. Visit Count Tracking

**Status:** Implemented but underutilized
- `incrementVisitCount()` called in WelcomeModal
- Not used for progressive disclosure or signup prompts

### E. Google 429 Errors

**Status:** CRITICAL - 87% of API errors
- FE caching helps but sessionStorage is ephemeral
- BE rate limiting requested but not confirmed

### F. Alternative Geocoding

**Status:** Fallback chain implemented
- Browser GPS -> Google API -> ipinfo.io
- BigDataCloud available but not in main chain

---

## 11. Recommendations

### Immediate (High Priority)

1. **Google Geo Caching Fix**
   - File: `src/app/utils/geolocationHelper.js`
   - Change: `sessionStorage` -> `localStorage`
   - Change: TTL 5 min -> 24 hours
   - Impact: Reduces 429 errors significantly

2. **Verify BE Rate Limiting**
   - Check with Fulton on status of server-side caching
   - MSG already sent on 2026-03-27

### Medium Priority

3. **Visit-Based Signup Prompts**
   - Infrastructure exists (`getVisitCount()`)
   - Need to implement prompt UI
   - Suggested trigger: 5th visit

4. **RO/RA "No Events" Enhancement**
   - When RO/RA sees no events: "No events in your area. Add the first one!"
   - File: `NoEventsAlert.js` - add role check

5. **Cloudflare IP Fallback**
   - Use Cloudflare headers for initial location guess
   - Reduces need for geolocation prompts

### Low Priority / Future

6. **Server-Side IP Geolocation**
   - Move initial location detection to SSR
   - Would require Vercel Edge Function

7. **Location Accuracy Indicator**
   - Show "(approx.)" or "Near-ish:" based on source accuracy
   - Already partially implemented for > 100mi

---

## 12. Key File Locations (Absolute Paths)

```
/Users/tobybalsley/MyDocs/AppDev/MasterCalendar/tangotiempo.com/
├── src/app/
│   ├── contexts/
│   │   ├── GeoLocationContext.js      # Main location state
│   │   ├── LocationAPIContext.js      # API functions
│   │   ├── RoleContext.js             # User roles
│   │   └── AuthContext.js             # Authentication
│   ├── components/
│   │   ├── Modals/
│   │   │   ├── misc/
│   │   │   │   ├── MapCenterModal.js
│   │   │   │   └── MapCenterOnboardingModal.js
│   │   │   └── Welcome/
│   │   │       └── WelcomeModal.js
│   │   ├── UI/
│   │   │   ├── SiteHeader.js          # Location pill
│   │   │   └── NoEventsAlert.js       # No events message
│   │   └── UserLocationLoader.js      # Cloud mapCenter fetch
│   ├── hooks/
│   │   ├── useEvents.js               # Event filtering
│   │   └── useGeoLocations.js
│   ├── utils/
│   │   ├── geolocationHelper.js       # Geo API logic
│   │   ├── visitorTracking.js         # Visit count
│   │   └── trackingHelper.js          # Analytics geo
│   └── calendar/
│       ├── page.js                    # Main calendar
│       └── boston/
│           └── page.js                # Boston variant
```

---

## 13. SNR Block

**S -- Summarize:**
Scout completed comprehensive analysis of the MapCenter/location system. Key findings:
- System has evolved significantly over 6 months with 50+ related commits
- Google 429 errors are the critical issue (87% of API errors)
- City name race conditions were fixed in TIEMPO-388
- Visit count tracking exists but is underutilized
- User role affects what users CAN DO (create events) but not what they SEE

**N -- Next Steps:**
1. Implement Google Geo localStorage fix (sessionStorage -> localStorage, 5min -> 24h TTL)
2. Verify BE rate limiting status with Fulton
3. Consider visit-based signup prompts (infrastructure ready)
4. Consider RO/RA specific "No events" messaging

**R -- Request Role:**
- **Architect Mode** recommended for designing the Google Geo caching fix (localStorage migration)
- **CRK Mode** if implementing immediately to assess risks of localStorage change
- **Builder Mode** for straightforward TTL/storage changes after approval
