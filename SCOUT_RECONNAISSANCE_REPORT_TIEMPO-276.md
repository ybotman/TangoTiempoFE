# 🧭 Scout Reconnaissance Report - TIEMPO-276 Venue Filtering

**Mission:** Investigate critical implementation details for venue filtering based on user location settings  
**Scout Agent:** Active  
**Target:** TIEMPO-276 venue filtering requirements  
**Date:** 2025-08-25  

---

## 🎯 Critical Findings - All Unknowns RESOLVED

### 1. **COORDINATE FORMAT CONFIRMED** ✅
- **GeoLocationContext uses**: `latitude` and `longitude` (full names)
- **Backend API expects**: `lat` and `lng` (abbreviated)
- **File Evidence**: `/src/app/contexts/GeoLocationContext.js` lines 118-120, 405-408
- **Risk**: Mismatch between context and API - requires mapping

### 2. **UNIT EXPECTATIONS CONFIRMED** ✅  
- **Backend expects**: **MILES** (confirmed from multiple files)
- **Default radius**: 20 miles (useVenues.js line 34)
- **Evidence**: Distance calculations use 3958.8 mile radius (useVenueSelection.js line 34)
- **Map display**: Converts miles to meters (×1609.34) for Leaflet circles
- **Risk**: Low - system consistently uses miles

### 3. **PREVIOUS IMPLEMENTATION ANALYSIS** ✅
- **Branch**: `venue-filter-implementation` exists with commit 2060fa8
- **Approach**: Modified CreateEventDetailsBasic.js directly (component-level)
- **NOT modified**: useVenues hook itself (strategic gap identified)
- **Features implemented**: 
  - Radius-based filtering from GeoLocation context
  - "+50 miles" expand button
  - Location info display
- **Lesson learned**: Component-level approach, not hook-level

### 4. **COMPONENT IMPACT ANALYSIS** ✅
**Components using useVenues:**
1. **CreateEventDetailsBasic.js** - Create/edit events (HIGH IMPACT)
2. **ViewEventDetailsVenue.js** - Event viewing (MEDIUM IMPACT) 
3. **ViewEventDetailsMore.js** - Event details (LOW IMPACT)
4. **VenueModal.js** - Venue management (MEDIUM IMPACT)
5. **useVenueSelection.js** - Venue picker (HIGH IMPACT)
6. **useLocations.js** - Deprecated wrapper (LOW IMPACT)

### 5. **BACKEND API INVESTIGATION** ✅
- **Endpoint**: `GET /api/venues`
- **Distance parameters supported**: `lat`, `lng`, `radius` 
- **Additional parameters**: `all=true`, `isActive`, `appId`
- **Response formats**: Multiple (venues array, data.venues, direct array)
- **Evidence**: useVenues.js lines 46-63 handle all response variations

---

## 🔍 Technical Architecture Deep Dive

### GeoLocationContext Field Mapping
```javascript
// Context stores (GeoLocationContext.js lines 318-323):
savedLocation: {
  lat: defaults.defaultCenterLocation?.latitude,    // Backend stores as 'latitude'
  lng: defaults.defaultCenterLocation?.longitude,   // Backend stores as 'longitude'  
  zoomRange: defaults.defaultZoomRange || 50
}

// API expects (useVenues.js lines 32-34):
params.lat = location.lat;      // abbreviated
params.lng = location.lng;      // abbreviated  
params.radius = location.radius || 20; // miles
```

### Distance Calculation Standards
```javascript
// Frontend calculations (useVenueSelection.js lines 33-34):
const radius = 3958.8; // miles (6371 km for kilometers)
return radius * c; // Returns miles

// Map display conversion (UserSettingsLocationPreferences.js):
radius: zoomRange * 1609.34, // Convert miles to meters for Leaflet
```

### Current useVenues Implementation Gap
```javascript
// CURRENT (lines 31-35): Only uses location if explicitly passed
if (location && location.lat && location.lng) {
  params.lat = location.lat;
  params.lng = location.lng; 
  params.radius = location.radius || 20;
}

// REQUIRED: Should ALWAYS use context location when available
const effectiveLocation = location || contextLocation;
```

---

## ⚠️ Risk Assessment & Mitigation

### HIGH RISK - Coordinate Field Name Mismatch
- **Issue**: Context uses `latitude/longitude`, API uses `lat/lng`
- **Location**: Property mapping between context and API calls
- **Mitigation**: Proper field mapping in useVenues hook

### MEDIUM RISK - Implementation Strategy Inconsistency  
- **Issue**: Previous branch modified component, not hook
- **Impact**: Inconsistent venue filtering across app
- **Mitigation**: Implement at hook level for universal application

### LOW RISK - Response Format Variations
- **Issue**: API returns venues in 3 different response structures
- **Mitigation**: Already handled in useVenues.js lines 49-63

---

## 🛠️ Implementation Requirements Clarified

### Required Changes to useVenues.js

1. **Import GeoLocationContext**
```javascript
import { useGeoLocation } from '@/contexts/GeoLocationContext';
```

2. **Get context in hook**
```javascript  
const { currentLocation, savedLocation } = useGeoLocation();
const contextLocation = currentLocation || savedLocation;
```

3. **Apply effective location logic**
```javascript
// Use passed location OR context location  
const effectiveLocation = location || contextLocation;

if (effectiveLocation?.lat && effectiveLocation?.lng) {
  params.lat = effectiveLocation.lat;           // Already correct format
  params.lng = effectiveLocation.lng;           // Already correct format  
  params.radius = effectiveLocation.zoomRange || effectiveLocation.radius || 20;
}
```

4. **Update useEffect dependency**
```javascript
useEffect(() => {
  fetchVenues();
}, [fetchVenues, contextLocation]); // Add contextLocation dependency
```

---

## 📋 Component-Specific Impacts

### CreateEventDetailsBasic.js
- **Current**: Manual venue filtering (venue-filter-implementation branch)
- **After**: Automatic filtering via useVenues hook
- **Benefit**: Simpler component code, consistent filtering

### VenueModal.js & VenueSelectionModal.js  
- **Current**: No location filtering
- **After**: Automatic radius-based filtering 
- **Benefit**: Better UX - only show nearby venues

### ViewEventDetails*.js
- **Current**: Shows all venues for venue lookup
- **After**: Location-aware venue display
- **Benefit**: Faster venue resolution, better performance

---

## 🚀 Compatibility & Migration Strategy

### Backward Compatibility Maintained
- `fetchVenues(isActive, location)` signature preserved
- Explicit location parameter overrides context (as expected)
- Legacy useLocations.js wrapper unaffected

### Progressive Enhancement
- Components not passing location get automatic filtering
- Components passing explicit location work unchanged  
- No breaking changes to existing API

---

## 📊 Performance Implications

### Network Optimization
- Backend filtering reduces payload size
- Fewer venues = faster JSON parsing
- Reduced client-side memory usage

### User Experience
- Relevant venues load faster
- Less scrolling through irrelevant options
- Consistent with event filtering behavior

---

## ✅ Implementation Readiness Assessment

| Component | Ready | Notes |
|-----------|-------|-------|  
| useVenues.js | **READY** | Clear implementation path |
| GeoLocationContext | **READY** | Provides all needed data |  
| Backend API | **READY** | Supports lat/lng/radius params |
| Response Handling | **READY** | Multiple formats already handled |
| Distance Calculations | **READY** | Mile-based system established |

---

## 🔄 Next Steps for Architect Mode

1. **Design hook-level implementation** for universal venue filtering
2. **Determine fallback strategy** when no location context available
3. **Plan component cleanup** to remove manual filtering code  
4. **Design testing strategy** for location-aware filtering
5. **Consider caching strategy** for location-based venue requests

---

## 📁 Evidence Files Analyzed

| File | Purpose | Key Findings |
|------|---------|--------------|
| `src/app/contexts/GeoLocationContext.js` | Location context | Uses `latitude/longitude`, stores as `lat/lng` |
| `src/app/hooks/useVenues.js` | Venue hook | Supports distance params, handles multiple response formats |
| `src/app/hooks/useVenueSelection.js` | Distance calculations | Uses miles (radius 3958.8) |  
| `venue-filter-implementation` branch | Previous attempt | Component-level approach, not hook-level |
| `TIEMPO-276-TICKET.md` | Requirements | Confirms hook-level implementation needed |
| `VENUE_FILTER_IMPLEMENTATION.md` | Previous docs | Documents mile-based system |

---
