# User Tracking & Geolocation Strategy

**Document Purpose:** Architecture for visitor and login tracking with multi-service geolocation comparison

**Last Updated:** 2025-10-17

---

## Business Goal

**Track and compare accuracy of different geolocation services** to determine which provides the best location data for users.

### Services to Compare
1. **ipapi.co** - IP-based geolocation (city-level, ~5km accuracy)
2. **Google Geolocation API** - WiFi/cell tower-based (neighborhood-level, 50m-500m accuracy)
3. **Google Geocoding API (Reverse)** - Convert lat/lng → street address
4. **Google Time Zone API** - Get timezone from lat/lng

### Data We Need to Log
- User IP address
- Browser-reported geolocation (lat/lng from navigator.geolocation or Google Geolocation API)
- Timezone (from browser)
- All location results from each service (for comparison)
- Timestamp, user ID (if logged in), page visited

---

## Current State (v1.12.4)

### Login Tracking
```
Frontend (AuthContext.js:95)
    ↓ User logs in via Firebase
    ↓ POST /api/user/login-track
    ↓ Body: {timezone, timezoneOffset}
    ↓ Authorization: Bearer {idToken}
Azure Functions
    ↓ Saves to MongoDB: UserLoginHistory collection
```

**What's Missing:**
- ❌ No IP address logged
- ❌ No lat/lng logged
- ❌ No comparison of geolocation services
- ❌ No reverse geocoding (lat/lng → address)

### Visitor Tracking
```
Frontend (calendar/layout.js:22)
    ↓ Page loads
    ↓ POST /api/visitor/track
    ↓ Body: {page, timezone, timezoneOffset}
Azure Functions
    ↓ Returns 400 Bad Request (not implemented yet)
```

**What's Missing:**
- ❌ Endpoint not fully implemented
- ❌ No IP address logged
- ❌ No lat/lng logged
- ❌ No geolocation service comparison

### Geolocation Services (Frontend)
```
Frontend calls:
1. ipapi.co (via Express BE /api/firebase/geo/ip)
   - Returns: city, region, country, timezone, lat/lng

2. Google Geolocation API (direct from browser)
   - Returns: lat/lng, accuracy
   - ✅ Works from browser (no referrer restriction issue)
```

---

## Problem: Server-Side-Only APIs

**APIs that CANNOT be called from browser** with HTTP referrer restrictions:
- ❌ Google Geocoding API (Reverse) - "API keys with referer restrictions cannot be used with this API"
- ❌ Google Time Zone API - Same restriction

**Solution:** Azure Functions must call these APIs server-side

---

## Proposed Architecture

### Data Flow: Login Tracking

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Browser)                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. User logs in                                             │
│ 2. Get browser data:                                        │
│    - IP address: (get from ipapi.co or AF endpoint)        │
│    - Lat/Lng: navigator.geolocation OR Google Geo API      │
│    - Timezone: Intl.DateTimeFormat().resolvedOptions()     │
│    - TimezoneOffset: -new Date().getTimezoneOffset()       │
│                                                             │
│ 3. POST /api/user/login-track                              │
│    Authorization: Bearer {idToken}                          │
│    Body: {                                                  │
│      ip: "203.0.113.45",                                   │
│      latitude: 40.7128,                                     │
│      longitude: -74.0060,                                   │
│      timezone: "America/New_York",                          │
│      timezoneOffset: 300  // minutes from UTC              │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ AZURE FUNCTIONS (Server-Side)                               │
├─────────────────────────────────────────────────────────────┤
│ /api/user/login-track receives:                            │
│   - User IP, lat/lng, timezone from request                │
│                                                             │
│ 4. Call geolocation services IN PARALLEL:                  │
│                                                             │
│    A. ipapi.co API                                         │
│       GET https://ipapi.co/{ip}/json                       │
│       Returns: city, region, country, lat/lng, timezone    │
│                                                             │
│    B. Google Geolocation API (if needed)                   │
│       POST https://www.googleapis.com/geolocation/v1/      │
│       Body: {considerIp: true}                             │
│       Returns: lat/lng, accuracy                           │
│                                                             │
│    C. Google Geocoding API (Reverse) - SERVER ONLY         │
│       GET https://maps.googleapis.com/maps/api/geocode/    │
│       Params: latlng={lat},{lng}                           │
│       Returns: formatted_address, address_components       │
│                                                             │
│    D. Google Time Zone API - SERVER ONLY                   │
│       GET https://maps.googleapis.com/maps/api/timezone/   │
│       Params: location={lat},{lng}&timestamp={now}         │
│       Returns: timeZoneId, timeZoneName, rawOffset         │
│                                                             │
│ 5. Aggregate all results:                                  │
│    {                                                        │
│      userId: "firebase-uid-123",                           │
│      timestamp: ISODate("2025-10-17T22:30:00Z"),          │
│      page: "/calendar",                                     │
│      browser: {                                             │
│        ip: "203.0.113.45",                                 │
│        latitude: 40.7128,                                   │
│        longitude: -74.0060,                                 │
│        timezone: "America/New_York",                        │
│        timezoneOffset: 300                                  │
│      },                                                     │
│      services: {                                            │
│        ipapi: {                                             │
│          city: "New York",                                  │
│          region: "New York",                                │
│          country: "US",                                     │
│          latitude: 40.7128,                                 │
│          longitude: -74.0060,                               │
│          timezone: "America/New_York",                      │
│          accuracy_km: 5.0  // Estimated                    │
│        },                                                   │
│        googleGeo: {                                         │
│          latitude: 40.7135,                                 │
│          longitude: -74.0055,                               │
│          accuracy_meters: 450                               │
│        },                                                   │
│        googleGeocode: {                                     │
│          formatted_address: "123 Main St, New York, NY",   │
│          street: "Main Street",                             │
│          city: "New York",                                  │
│          state: "NY",                                       │
│          zip: "10001"                                       │
│        },                                                   │
│        googleTimezone: {                                    │
│          timeZoneId: "America/New_York",                    │
│          timeZoneName: "Eastern Standard Time",             │
│          rawOffset: -18000,  // seconds                     │
│          dstOffset: 3600     // seconds                     │
│        }                                                    │
│      }                                                      │
│    }                                                        │
│                                                             │
│ 6. Save to MongoDB:                                        │
│    Collection: UserLoginHistory                            │
│    Document: (full object above)                           │
│                                                             │
│ 7. Return 200 OK to frontend                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Visitor Tracking

Same as login tracking, but:
- No userId (anonymous visitor)
- Collection: `VisitorTrackingHistory`
- No authentication required

---

## Implementation Plan

### Phase 1: Update Frontend (AuthContext.js)

**Current:**
```javascript
fetch(`${afUrl}/api/user/login-track`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: -new Date().getTimezoneOffset()
  })
})
```

**Updated:**
```javascript
// Get user location from browser
const getUserLocation = async () => {
  try {
    // Option 1: Browser geolocation API
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (err) {
    // Option 2: Fallback to Google Geolocation API (works from browser)
    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ considerIp: true })
      }
    );
    const data = await response.json();
    return {
      latitude: data.location.lat,
      longitude: data.location.lng
    };
  }
};

// Get IP address
const getIPAddress = async () => {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
};

// Send tracking data
const [location, ip] = await Promise.all([
  getUserLocation(),
  getIPAddress()
]);

fetch(`${afUrl}/api/user/login-track`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ip: ip,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: -new Date().getTimezoneOffset()
  })
})
```

### Phase 2: Update Azure Functions

**New Function:** `/api/user/login-track` (enhanced)

```javascript
module.exports = async function (context, req) {
  const { ip, latitude, longitude, timezone, timezoneOffset } = req.body;
  const userId = req.user.uid; // From Firebase auth middleware

  // Call all geolocation services in parallel
  const [ipapiData, googleGeoData, googleGeocodeData, googleTimezoneData] =
    await Promise.all([
      callIpapiCo(ip),
      callGoogleGeolocation(ip),
      callGoogleGeocoding(latitude, longitude),  // SERVER-SIDE ONLY
      callGoogleTimezone(latitude, longitude)     // SERVER-SIDE ONLY
    ]);

  // Aggregate results
  const trackingDoc = {
    userId,
    timestamp: new Date(),
    browser: { ip, latitude, longitude, timezone, timezoneOffset },
    services: {
      ipapi: ipapiData,
      googleGeo: googleGeoData,
      googleGeocode: googleGeocodeData,
      googleTimezone: googleTimezoneData
    }
  };

  // Save to MongoDB
  await db.collection('UserLoginHistory').insertOne(trackingDoc);

  context.res = { status: 200, body: { success: true } };
};
```

### Phase 3: Create Helper Functions (Azure Functions)

```javascript
// Helper: Call ipapi.co
async function callIpapiCo(ip) {
  const response = await fetch(`https://ipapi.co/${ip}/json`);
  const data = await response.json();
  return {
    city: data.city,
    region: data.region,
    country: data.country_code,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    accuracy_km: 5.0  // Estimated city-level accuracy
  };
}

// Helper: Call Google Geolocation API
async function callGoogleGeolocation(ip) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const response = await fetch(
    `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ considerIp: true })
    }
  );
  const data = await response.json();
  return {
    latitude: data.location.lat,
    longitude: data.location.lng,
    accuracy_meters: data.accuracy
  };
}

// Helper: Call Google Geocoding API (Reverse) - SERVER-SIDE ONLY
async function callGoogleGeocoding(lat, lng) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );
  const data = await response.json();

  if (data.status === 'OK' && data.results[0]) {
    const result = data.results[0];
    const components = result.address_components;

    return {
      formatted_address: result.formatted_address,
      street: getComponent(components, 'route'),
      city: getComponent(components, 'locality'),
      state: getComponent(components, 'administrative_area_level_1', 'short_name'),
      zip: getComponent(components, 'postal_code')
    };
  }
  return null;
}

// Helper: Call Google Time Zone API - SERVER-SIDE ONLY
async function callGoogleTimezone(lat, lng) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
  );
  const data = await response.json();

  if (data.status === 'OK') {
    return {
      timeZoneId: data.timeZoneId,
      timeZoneName: data.timeZoneName,
      rawOffset: data.rawOffset,
      dstOffset: data.dstOffset
    };
  }
  return null;
}
```

---

## Cost Analysis

### Per Login/Visit Tracking Call

| Service | Cost per 1K Calls | Notes |
|---|---|---|
| ipapi.co | $0 (1K/day free) | City-level accuracy |
| Google Geolocation | $5 | WiFi/cell tower accuracy |
| Google Geocoding (Reverse) | $5 | Lat/lng → address |
| Google Time Zone | $5 | Lat/lng → timezone |
| **TOTAL per track** | **$15 per 1K** | All services combined |

### Monthly Cost Estimates

| Scenario | Monthly Logins | Monthly Cost |
|---|---|---|
| Current (100 users) | 3,000 logins | $45 |
| Growth (1,000 users) | 30,000 logins | $450 |
| Scale (10,000 users) | 300,000 logins | $4,500 |

**Cost Optimization:**
- ✅ Only call Google APIs for logged-in users (not all visitors)
- ✅ Cache results by IP address (1 hour TTL)
- ✅ Make Google API calls optional (can disable if costs too high)
- ✅ Eventually retire frontend geolocation APIs once we have enough comparison data

---

## Rollout Plan

### Phase 1: Test in DEVL (Week 1)
- ✅ Update frontend to send IP + lat/lng
- ✅ Update Azure Functions to call all geo services
- ✅ Test with 10-20 logins
- ✅ Verify MongoDB documents look correct

### Phase 2: Deploy to TEST (Week 2)
- ✅ Monitor costs on Google Cloud Console
- ✅ Test with real users (50-100 logins)
- ✅ Analyze which service provides best accuracy

### Phase 3: Deploy to PROD (Week 3-4)
- ✅ Enable for all users
- ✅ Monitor costs daily
- ✅ Set billing alerts at $50, $100, $200/month

### Phase 4: Analysis & Optimization (Month 2)
- 📊 Compare accuracy of each service
- 📊 Identify which service is most reliable
- 🔧 Disable less accurate services to reduce costs
- 🔧 Eventually retire frontend APIs and only use best service

---

## Success Metrics

### Week 1
- ✅ 100% of login tracking calls include all geo services
- ✅ MongoDB documents contain data from all 4 services
- ✅ Zero errors in Azure Functions logs

### Month 1
- 📊 Accuracy comparison report generated
- 📊 Cost vs. accuracy analysis complete
- 🎯 Decision made on which service(s) to keep

### Month 3
- 🔧 Optimized to only call 1-2 most accurate services
- 💰 Costs reduced by 50-75%
- 📈 Reliable geolocation data for analytics

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2025-10-17 | Move Google Geocoding/Timezone to Azure Functions | Can't call from browser with referrer restrictions |
| 2025-10-17 | Log data from ALL geo services | Need to compare accuracy before choosing one |
| 2025-10-17 | Start with login tracking only | Lower volume, easier to test |
| TBD | Extend to visitor tracking | After login tracking proves successful |
| TBD | Retire less accurate services | After 1-2 months of comparison data |

---

## References
- AuthContext.js:95 - Login tracking implementation
- calendar/layout.js:22 - Visitor tracking implementation
- Azure Functions: /api/user/login-track endpoint
- MongoDB Collections: UserLoginHistory, VisitorTrackingHistory
