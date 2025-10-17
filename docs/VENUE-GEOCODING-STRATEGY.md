# Venue Geocoding Strategy

**Document Purpose:** Architecture and migration strategy for venue address → lat/long geocoding

**Last Updated:** 2025-10-17

---

## Current State (v1.12.4)

### Architecture
```
Frontend (VenueModalAddWithSearch.js)
    ↓ axios.get('/api/venues/geocode', {address: "123 Main St..."})
Express Backend (Node.js)
    ↓ Uses Mapbox Geocoding API
    ↓ Returns: {latitude, longitude, confidence, formattedAddress}
Frontend
    ↓ Displays map and saves venue
MongoDB
```

### Implementation Details
- **File:** `src/app/components/Modals/Venues/VenueModalAddWithSearch.js:290`
- **Endpoint:** `${NEXT_PUBLIC_BE_URL}/api/venues/geocode`
- **Service:** Mapbox Geocoding API
- **API Key:** Server-side (Express Backend)
- **Cost:** $0.50 per 1,000 requests
- **Works:** ✅ Server-side API call (no browser restrictions)

### Why This Works
- Mapbox API is called from **Express Backend** (server-side)
- No API key exposed to browser
- No referrer restriction issues
- Centralized cost control

---

## Future Migration #1: Mapbox → Google Geocoding API

### Timeline
**When:** TBD (not urgent)

### Why Migrate?
- **Consolidation:** Already using Google Geolocation API for user tracking
- **Consistency:** Single vendor for all geo services
- **Features:** Better address parsing and timezone integration
- **Cost:** Google Geocoding: $5 per 1,000 requests (vs Mapbox $0.50)

### Migration Steps

**Step 1: Update Express Backend**
```javascript
// OLD: Mapbox
const mapboxUrl = `https://api.mapbox.com/geocoding/v5/...`;

// NEW: Google Geocoding API
const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
```

**Step 2: Update Response Parser**
```javascript
// Mapbox response format
{ coordinates: [lng, lat], ... }

// Google response format
{ results: [{ geometry: { location: { lat, lng } } }] }
```

**Step 3: Test & Deploy**
- No frontend changes required (same endpoint contract)
- Backend swap only
- Monitor costs

### Impact
- ✅ **Frontend:** No changes
- ✅ **Backend:** Update API endpoint and response parser
- ✅ **MongoDB:** No schema changes
- ⚠️ **Cost:** Increases from $0.50 → $5.00 per 1,000 geocodes

---

## Future Migration #2: Express Backend → Azure Functions

### Timeline
**When:** TBD (major architectural change)

### Why Migrate?
- **Serverless:** No Node.js Express server to maintain
- **Scalability:** Auto-scaling with Azure Functions
- **Cost:** Pay only for executions
- **Consistency:** All backend logic in Azure Functions

### Current Express Endpoints to Migrate
```
/api/venues/geocode          → Azure Functions: /api/Venues_Geocode
/api/venues/check-proximity  → Azure Functions: /api/Venues_CheckProximity
/api/firebase/geo/ip         → Azure Functions: /api/Geo_IPLookup
/health                      → Azure Functions: /api/health
... (all other Express routes)
```

### Migration Strategy

**Phase 1: Add Azure Functions Endpoints**
- Create new Azure Functions that mirror Express endpoints
- Keep both running in parallel
- Test Azure Functions with subset of traffic

**Phase 2: Update Frontend Environment Variables**
```javascript
// OLD
NEXT_PUBLIC_BE_URL=http://localhost:3010

// NEW
NEXT_PUBLIC_BE_URL=https://calendarbeaf-prod.azurewebsites.net
```

**Phase 3: Decommission Express Backend**
- Monitor traffic on old Express endpoints
- Once traffic is zero, shut down Express server
- Remove Express deployment from infrastructure

### Impact
- ✅ **Frontend:** Update environment variable only
- ✅ **Backend:** Rewrite Express routes as Azure Functions
- ✅ **MongoDB:** No changes (Azure Functions already use MongoDB)
- ✅ **API Keys:** Already stored in Azure Function App Settings

---

## Recommended Timeline

### Short Term (Now - Q1 2026)
- ✅ Keep current architecture (Express + Mapbox)
- ✅ Monitor geocoding costs and accuracy

### Medium Term (Q2-Q3 2026)
- 🔄 **Migration #1:** Mapbox → Google Geocoding API
  - Estimated effort: 2-3 hours
  - Risk: Low (backend swap only)
  - Test in DEVL → TEST → PROD

### Long Term (Q4 2026+)
- 🔄 **Migration #2:** Express Backend → Azure Functions
  - Estimated effort: 20-40 hours (all endpoints)
  - Risk: Medium (major architectural change)
  - Requires comprehensive testing

---

## Cost Comparison

| Service | Cost per 1K Requests | Monthly (est. 100 venues) | Notes |
|---|---|---|---|
| **Mapbox Geocoding** | $0.50 | $0.05 | Current |
| **Google Geocoding** | $5.00 | $0.50 | Future Option |

**Recommendation:** Mapbox is 10x cheaper for geocoding. Only migrate if consolidation or features justify the cost increase.

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2025-10-17 | Keep Mapbox for now | Cost-effective, working well |
| TBD | Migrate to Google? | Re-evaluate based on volume and feature needs |
| TBD | Migrate to Azure Functions | Part of larger backend consolidation |

---

## References
- VenueModalAddWithSearch.js - Frontend venue creation
- Express Backend: `/api/venues/geocode` endpoint
- Mapbox Geocoding API: https://docs.mapbox.com/api/search/geocoding/
- Google Geocoding API: https://developers.google.com/maps/documentation/geocoding
