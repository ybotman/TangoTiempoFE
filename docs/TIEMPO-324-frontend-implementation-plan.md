# TIEMPO-324: Frontend Implementation Plan - 3-Tier Geolocation

**JIRA**: https://hdtsllc.atlassian.net/browse/TIEMPO-324

**Backend Status**: ✅ Complete (Deployed to TEST by Fulton on Oct 22, 2025)

**Frontend Status**: ⏳ Not Started

---

## Executive Summary

Implement browser-based geolocation with Google API fallback to achieve **100x accuracy improvement** (10m vs 10km) for visitor and login tracking.

**Current**: City-level accuracy (~10km) via ipinfo.io
**Target**: GPS-level accuracy (~10m) via browser geolocation

---

## Architecture Overview

### 3-Tier Geolocation Fallback

**Priority 1: Browser GPS (Best - 10m accuracy)**
- Requires user permission
- Uses `navigator.geolocation.getCurrentPosition()`
- Fields: `google_browser_lat`, `google_browser_long`, `google_browser_accuracy`

**Priority 2: Google Geolocation API (Good - 50-500m accuracy)**
- No permission required
- Uses WiFi/cell tower data
- Fields: `google_api_lat`, `google_api_long`

**Priority 3: ipinfo.io (Fallback - 10km accuracy)**
- IP-based city-level
- Already implemented
- Fields: `ipinfo_lat`, `ipinfo_long`, `ipinfo_city`, `ipinfo_region`

---

## Backend API Contract (Already Implemented)

### Visitor Tracking Endpoint

**POST** `/api/visitor/track`

**New Optional Fields:**
```javascript
{
  // Existing fields (keep as-is)
  page: "/calendar",
  pathname: "/calendar",
  hostname: "tangotiempo.com",
  url: "https://tangotiempo.com/calendar",
  timezone: "America/New_York",
  timezoneOffset: 240,

  // NEW: Priority 1 - Browser GPS (optional)
  google_browser_lat: 40.748817,
  google_browser_long: -73.985428,
  google_browser_accuracy: 10.5, // meters

  // NEW: Priority 2 - Google API (optional)
  google_api_lat: 40.748900,
  google_api_long: -73.985500
}
```

### Login Tracking Endpoint

**POST** `/api/user/login-track`

**Authorization**: `Bearer {firebase-token}`

**Same fields as visitor tracking above**

---

## Implementation Tasks

### Task 1: Create Geolocation Helper Utility

**File**: `src/app/utils/geolocationHelper.js`

**Exports:**
- `getBrowserGeolocation()` - Priority 1
- `getGoogleAPIGeolocation()` - Priority 2
- `getGeolocationData()` - Orchestrator with fallback

**Code:**
```javascript
/**
 * Priority 1: Get browser GPS coordinates
 * Requires user permission
 * @returns {Promise<object>} { lat, long, accuracy } or null
 */
export const getBrowserGeolocation = async () => {
  if (!navigator.geolocation) {
    console.log('[Geolocation] Browser geolocation not supported');
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true, // Use GPS
        timeout: 5000,
        maximumAge: 0 // No cache
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    return {
      lat: position.coords.latitude,
      long: position.coords.longitude,
      accuracy: position.coords.accuracy // meters
    };
  } catch (error) {
    // User denied permission or timeout
    console.log('[Geolocation] Browser permission denied:', error.message);
    return null;
  }
};

/**
 * Priority 2: Get Google Geolocation API coordinates
 * No permission required, uses WiFi/cell towers
 * @returns {Promise<object>} { lat, long } or null
 */
export const getGoogleAPIGeolocation = async () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEO_API_KEY;

  if (!apiKey) {
    console.warn('[Geolocation] Google API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ considerIp: true }),
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      lat: data.location?.lat || null,
      long: data.location?.lng || null
    };
  } catch (error) {
    console.warn('[Geolocation] Google API failed:', error.message);
    return null;
  }
};

/**
 * Get geolocation data with 3-tier fallback
 * Priority 1: Browser GPS → Priority 2: Google API → Priority 3: ipinfo (backend)
 * @returns {Promise<object>} Geolocation fields for tracking
 */
export const getGeolocationData = async () => {
  const result = {
    google_browser_lat: null,
    google_browser_long: null,
    google_browser_accuracy: null,
    google_api_lat: null,
    google_api_long: null
  };

  // Priority 1: Try browser GPS
  const browserGeo = await getBrowserGeolocation();
  if (browserGeo) {
    result.google_browser_lat = browserGeo.lat;
    result.google_browser_long = browserGeo.long;
    result.google_browser_accuracy = browserGeo.accuracy;
    console.log('[Geolocation] Using browser GPS (10m accuracy)');
    return result; // Don't call Google API if GPS works
  }

  // Priority 2: Try Google API
  const googleGeo = await getGoogleAPIGeolocation();
  if (googleGeo) {
    result.google_api_lat = googleGeo.lat;
    result.google_api_long = googleGeo.long;
    console.log('[Geolocation] Using Google API (WiFi/cell tower)');
    return result;
  }

  // Priority 3: ipinfo.io (handled by backend, no frontend action)
  console.log('[Geolocation] Falling back to ipinfo.io (backend)');
  return result; // All null, backend will use ipinfo
};
```

**Estimated Time**: 2 hours

---

### Task 2: Update Visitor Tracking (calendar/layout.js)

**File**: `src/app/calendar/layout.js`

**Changes:**
```javascript
import { fetchAllGeolocationData } from '@/utils/trackingHelper';
import { getGeolocationData } from '@/utils/geolocationHelper'; // NEW

useEffect(() => {
  const trackVisitor = async () => {
    try {
      // ... existing localStorage check ...

      const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

      // NEW: Get 3-tier geolocation data
      const geoData = await getGeolocationData();

      // Existing: Get Cloudflare/ipinfo data
      const cloudflareData = await fetchAllGeolocationData(1440);

      await fetch(`${afUrl}/api/visitor/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Existing fields
          pathname: window.location.pathname,
          page: window.location.pathname,
          hostname: window.location.hostname,
          url: window.location.href,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: -new Date().getTimezoneOffset(),

          // Existing Cloudflare/ipinfo
          cloudflare: cloudflareData.cloudflare,
          google: cloudflareData.google,
          ipapi: cloudflareData.ipapi,
          distance: cloudflareData.distance,

          // NEW: Browser GPS and Google API data
          google_browser_lat: geoData.google_browser_lat,
          google_browser_long: geoData.google_browser_long,
          google_browser_accuracy: geoData.google_browser_accuracy,
          google_api_lat: geoData.google_api_lat,
          google_api_long: geoData.google_api_long
        })
      });

      localStorage.setItem('visitor_last_tracked', Date.now().toString());
    } catch (error) {
      console.warn('[Visitor Tracking] Failed:', error.message);
    }
  };

  trackVisitor();
}, []);
```

**Estimated Time**: 1 hour

---

### Task 3: Update Login Tracking (AuthContext.js)

**File**: `src/app/contexts/AuthContext.js`

**Changes (similar to visitor tracking):**
```javascript
import { getGeolocationData } from '@/utils/geolocationHelper'; // NEW

// Inside login success handler
const geoData = await getGeolocationData(); // NEW

fetchAllGeolocationData(480).then(cloudflareData => {
  fetch(`${afUrl}/api/user/login-track`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Existing fields
      loginType: loginType,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: -new Date().getTimezoneOffset(),
      cloudflare: cloudflareData.cloudflare,
      google: cloudflareData.google,
      ipapi: cloudflareData.ipapi,
      distance: cloudflareData.distance,

      // NEW: Browser GPS and Google API data
      google_browser_lat: geoData.google_browser_lat,
      google_browser_long: geoData.google_browser_long,
      google_browser_accuracy: geoData.google_browser_accuracy,
      google_api_lat: geoData.google_api_lat,
      google_api_long: geoData.google_api_long
    })
  }).catch(err => console.warn('[Login Tracking] Failed:', err.message));
});
```

**Estimated Time**: 1 hour

---

### Task 4: Add User Permission UI (Optional Enhancement)

**File**: `src/app/components/UI/GeolocationPermissionBanner.js` (NEW)

**Purpose**: Politely ask for geolocation permission before auto-requesting

**Features:**
- Show banner on first visit
- Explain benefits: "Enable location for accurate event recommendations"
- Buttons: "Enable Location" / "No Thanks"
- Store preference in localStorage

**Estimated Time**: 2 hours (optional)

---

## Testing Plan

### Test Case 1: Browser GPS Permission Granted

**Steps:**
1. Fresh browser (no permission cached)
2. Visit /calendar
3. Browser prompts for location permission
4. Click "Allow"

**Expected:**
- Visitor tracking sends `google_browser_*` fields
- Backend stores with accuracy ~10m
- Console logs: "Using browser GPS (10m accuracy)"

**Verify MongoDB:**
```javascript
db.VisitorTrackingHistory.findOne(
  { google_browser_lat: { $exists: true } },
  { google_browser_lat: 1, google_browser_long: 1, google_browser_accuracy: 1 }
)
```

---

### Test Case 2: Browser GPS Permission Denied

**Steps:**
1. Visit /calendar
2. Browser prompts for location
3. Click "Block"

**Expected:**
- Falls back to Google API
- Visitor tracking sends `google_api_*` fields
- Console logs: "Using Google API (WiFi/cell tower)"

**Verify MongoDB:**
```javascript
db.VisitorTrackingHistory.findOne(
  { google_api_lat: { $exists: true } },
  { google_api_lat: 1, google_api_long: 1 }
)
```

---

### Test Case 3: Both Browser and Google API Fail

**Steps:**
1. Block browser permission
2. Disconnect from internet briefly OR disable Google API key

**Expected:**
- Falls back to ipinfo.io (backend)
- Visitor tracking sends NO new geolocation fields
- Backend populates `ipinfo_*` fields
- Console logs: "Falling back to ipinfo.io (backend)"

**Verify MongoDB:**
```javascript
db.VisitorTrackingHistory.findOne(
  { ipinfo_lat: { $exists: true } },
  { ipinfo_lat: 1, ipinfo_long: 1, ipinfo_city: 1 }
)
```

---

### Test Case 4: Login Tracking

**Steps:**
1. Login to app
2. Check browser console for geolocation logs
3. Verify MongoDB UserLoginHistory

**Expected:**
- Same behavior as visitor tracking
- `google_browser_*` or `google_api_*` or `ipinfo_*` populated

---

## Rollout Strategy

### Phase 1: DEVL (Local Testing)

- Implement all tasks
- Test with browser permission Allow/Block scenarios
- Verify console logs show correct fallback priority
- **Timeline**: 1-2 days

### Phase 2: TEST Deployment

- Deploy to TEST branch
- Verify TEST Azure Functions receive new fields
- Check MongoDB TangoTiempo database for new fields
- Test with real users if possible
- **Timeline**: 1 day

### Phase 3: PROD Deployment

- Deploy to PROD after TEST verification
- Monitor Vercel logs for errors
- Check MongoDB TangoTiempoProd for data
- Monitor Google API usage/costs
- **Timeline**: 1 day

---

## Cost Analysis

### Google Geolocation API

**Pricing**: $5 per 1,000 requests

**Usage Estimate:**
- Visitor tracking: 1 request per unique visitor per 24h
- Login tracking: 1 request per login (if browser GPS denied)

**Monthly Estimate (1,000 users):**
- Visitors: ~1,000 requests/month = $5
- Logins: ~500 requests/month = $2.50
- **Total: ~$7.50/month**

**Note**: Most users will grant browser GPS, so Google API usage will be minimal.

---

## Benefits

1. **100x Accuracy Improvement**: 10m vs 10km
2. **Better "Events Near Me"**: Accurate distance calculations
3. **Improved Analytics**: Real user locations vs IP approximations
4. **Graceful Degradation**: Falls back to ipinfo if GPS unavailable

---

## Risks & Mitigation

### Risk 1: Users Deny Permission

**Mitigation**: Falls back to Google API, then ipinfo.io

### Risk 2: Google API Costs

**Mitigation**:
- Monitor usage via Google Cloud Console
- Set billing alerts at $10, $25, $50/month
- Disable if costs exceed budget

### Risk 3: Privacy Concerns

**Mitigation**:
- Only request permission when needed
- Explain benefits clearly
- Store geolocation data securely
- Allow users to opt-out

---

## Success Criteria

✅ Frontend requests browser geolocation permission
✅ Falls back to Google API if permission denied
✅ Falls back to ipinfo.io if both fail
✅ MongoDB stores all 3 geolocation sources
✅ Analytics can compare accuracy of each source
✅ Cost stays under $25/month
✅ No user-facing errors or broken functionality

---

**Updated**: 2025-10-22
**Status**: Ready to implement
**Estimated Effort**: 4-6 hours coding + 2 hours testing
**Assignee**: Frontend team (Sarah)
