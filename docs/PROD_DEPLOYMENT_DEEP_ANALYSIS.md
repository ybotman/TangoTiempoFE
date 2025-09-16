# PRODUCTION DEPLOYMENT v1.10.0 - DEEP ANALYSIS
## TEST → PROD Risk Assessment & Testing Strategy

### 1. CODE CHANGES ANALYSIS

#### CRITICAL CONTEXT REFACTORING
**REMOVED Contexts (Code cleanup only - NO DATA CHANGES):**
- `MasteredLocationContext.js` → Replaced with `LocationAPIContext.js`
- `RegionsContext.js` → Merged into `GeoLocationContext.js`
- **Data Fields**: All `masteredCityId`, `masteredDivisionId`, `masteredRegionId` KEPT in database
- **API Compatibility**: Still accepts and returns mastered fields

**What Changed:**
```javascript
// OLD: Multiple contexts with circular dependencies
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
import { useRegions } from '@/contexts/RegionsContext';

// NEW: Consolidated clean architecture
import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
```

**Backward Compatibility MAINTAINED:**
```javascript
// Hooks still use mastered IDs internally
const masteredRegionId = selectedLocation?.region?.id || null;
const masteredDivisionId = selectedLocation?.division?.id || null;
const masteredCityId = selectedLocation?.city?.id || null;

// API params unchanged
params.masteredCityId = masteredCityId;
params.masteredDivisionId = masteredDivisionId;
```

#### New Features (Non-Breaking)
1. **Boston Calendar Route** (`/calendar/boston`)
   - **Files**: `src/app/calendar/boston/page.js` (626 lines)
   - **Risk**: LOW - Isolated new route
   - **Dependencies**: Reuses existing calendar components
   - **Backward Compatible**: ✅ Yes - doesn't affect existing routes

2. **Venue Location Filtering**
   - **Files Modified**: `src/app/hooks/useVenues.js`
   - **Risk**: MEDIUM - Changes core venue fetching
   - **Key Changes**:
     ```javascript
     // NEW: Location-based filtering
     params.lat = lat;
     params.lng = lng;
     params.radius = `${radiusValue}mi`;
     params.sortByDistance = true;
     ```
   - **Fallback**: ✅ Falls back to all venues if no location
   - **Cache Strategy**: dedupeFetch prevents API flooding

3. **Timezone Display Utilities**
   - **New File**: `src/app/utils/venueTimezone.js` (128 lines)
   - **Risk**: LOW - Display-only utilities
   - **Purpose**: Show venue times in venue timezone (not browser)
   - **Breaking Change**: ❌ No - additive only

#### Critical Dependencies
```javascript
// New imports in multiple files:
import { dedupeFetch } from '@/utils/dedupeFetch';
import { formatVenueTime } from '@/utils/venueTimezone';
```

### 2. DATABASE MIGRATION ANALYSIS

#### Field Additions (Non-Breaking)
```javascript
// Venues Collection - NEW FIELDS (optional)
{
  timezone: "America/New_York",      // Optional
  timezoneAbbr: "EDT",               // Optional
  coordinates: [lng, lat]            // For geospatial queries
}

// Events Collection - FIELD COMPATIBILITY
{
  venueId: "...",          // NEW primary field
  locationID: "...",       // LEGACY kept for compatibility
  venueTimezone: "...",    // NEW optional field
}
```

#### Migration Safety Assessment
- **Breaking Changes**: NONE - All new fields are optional
- **Backward Compatibility**: ✅ MAINTAINED
- **Fallback Logic**: 
  ```javascript
  // Code handles both patterns:
  const id = event.venueId || event.locationID;
  const name = event.venueName || event.locationName;
  ```

#### Required Indexes
```javascript
// Geospatial index for venue queries (non-blocking)
db.venues.createIndex({ "coordinates": "2dsphere" });
```

#### Backend Status (UPDATED Jan 31, 2025)
- **CALBE-53**: ✅ DEPLOYED TO TEST
- **Venue Filtering**: ✅ WORKING IN TEST
- **Distance Calculation**: ✅ FUNCTIONAL
- **Ready for PROD**: YES

### 3. RISK MATRIX

| Component | Risk Level | Impact | Mitigation |
|-----------|------------|--------|------------|
| Boston Route | MEDIUM | New feature - BUT site currently uses /calendar | Two options below |
| Venue Filtering | MEDIUM | Core functionality | Backend API must support params |
| Timezone Utils | LOW | Display only | Test venue times display |
| dedupeFetch | LOW | Performance improvement | Has fallback to normal fetch |
| Location Context | MEDIUM | Affects venue loading | Has fallback for no location |

### 4. TESTING REQUIREMENTS

#### Pre-Production Smoke Tests (5 minutes)
```bash
# 1. Boston Route Test
curl https://test.tangotiempo.com/calendar/boston
# Expected: 200 OK, calendar loads with Boston events

# 2. Venue API with Location
curl "https://api.tangotiempo.com/api/venues?lat=42.3601&lng=-71.0589&radius=50mi"
# Expected: Venues sorted by distance

# 3. Main Calendar Unaffected
curl https://test.tangotiempo.com/calendar
# Expected: Works as before
```

#### Critical Path Testing (15 minutes)

1. **Event Creation Flow**
   - [ ] Create event WITHOUT location (should work)
   - [ ] Create event WITH location (venue filtering active)
   - [ ] Select venue from filtered list
   - [ ] Save event successfully
   - [ ] Verify timezone displays correctly

2. **Boston Calendar Iframe - TWO OPTIONS**
   
   **OPTION A: Lower Risk (Keep existing)**
   - [ ] bostontangocalendar.com KEEPS using `/calendar`
   - [ ] Already works with old context structure
   - [ ] No changes needed on their site
   - [ ] Risk: Shows all events, not Boston-filtered
   
   **OPTION B: New Route (Requires coordination)**
   - [ ] Update bostontangocalendar.com to use `/calendar/boston`
   - [ ] Test in iframe: `<iframe src="/calendar/boston">`
   - [ ] Verify 200-mile radius events shown
   - [ ] Risk: Requires Boston site to update iframe src

3. **Mobile Testing (85% of traffic)**
   - [ ] Boston route loads on mobile
   - [ ] Touch/scroll works properly
   - [ ] Venue dropdown usable
   - [ ] No keyboard issues in forms

4. **Performance Checks**
   - [ ] Page load < 3 seconds
   - [ ] API calls deduplicated (check Network tab)
   - [ ] No console errors
   - [ ] Memory usage stable

#### Regression Testing (10 minutes)

1. **Existing Features**
   - [ ] Regular calendar still works
   - [ ] Event details modal opens
   - [ ] Categories filter properly
   - [ ] User settings save
   - [ ] Regional Organizer functions work

2. **API Compatibility**
   - [ ] Old clients still work (using locationID)
   - [ ] New clients work (using venueId)
   - [ ] Mixed field usage handled

### 5. DEPLOYMENT SEQUENCE

#### Phase 1: Backend API (if needed)
```bash
# Only if TIEMPO-277 backend not deployed
# Backend must support: lat, lng, radius params
```

#### Phase 2: Frontend Deploy
```bash
# No database migration needed - fields are optional
# No breaking changes - backward compatible

1. Merge TEST to PROD
2. Deploy to Vercel
3. Monitor for 30 minutes
```

### 6. ROLLBACK TRIGGERS

#### Automatic Rollback If:
- Error rate > 1% (baseline: 0.1%)
- API response time > 5s (baseline: < 2s)
- 500 errors on /calendar/boston
- Memory leak detected (> 500MB growth)

#### Manual Rollback Procedure:
```bash
# Instant rollback (< 60 seconds)
git checkout PROD
git reset --hard v1.4.5
git push --force origin PROD
vercel --prod

# No database rollback needed (no breaking changes)
```

### 7. MONITORING POINTS

#### Real-Time Monitoring (First Hour)
```javascript
// Key Metrics to Watch
1. /calendar/boston - Response times
2. /api/venues - Query performance with location params
3. Error rate - Should stay < 0.1%
4. Memory usage - Should be stable
5. API call volume - dedupeFetch should reduce by 50%
```

#### Success Criteria
- [ ] Boston calendar loads for bostontangocalendar.com
- [ ] No increase in error rates
- [ ] API performance maintained
- [ ] No user complaints
- [ ] Mobile experience smooth

### 8. SAFE UPGRADE ASSESSMENT

#### Why This Is Safe:
1. **No Breaking Changes** - All changes are additive
2. **Fallback Logic** - Every new feature has fallback
3. **Field Compatibility** - Handles old and new field names
4. **Isolated Features** - Boston route doesn't affect main app
5. **TEST Validation** - Running successfully in TEST environment

#### Minimal Risk Items:
- dedupeFetch is wrapper around axios (safe)
- Timezone utils are display-only (safe)
- Boston route is new endpoint (safe)
- Location filtering has fallback (safe)

### 9. GO-LIVE CHECKLIST

#### T-30 Minutes
- [ ] Verify TEST is stable
- [ ] Check no active user sessions need migration
- [ ] Backend team confirms API ready

#### T-0 Deploy
- [ ] Merge PR to PROD
- [ ] Deploy to Vercel
- [ ] Verify deployment successful

#### T+5 Minutes
- [ ] Test Boston route
- [ ] Test main calendar
- [ ] Check API performance

#### T+30 Minutes
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Confirm with stakeholders

#### T+24 Hours
- [ ] Full regression test
- [ ] Performance analysis
- [ ] User feedback review

### BOSTON SITE COMPATIBILITY ANALYSIS

**Current Setup:**
- bostontangocalendar.com uses: `<iframe src="https://tangotiempo.com/calendar">`
- This ALREADY WORKS with the refactored contexts
- Shows ALL events (not Boston-filtered)

**Three Deployment Strategies:**

1. **LOWEST RISK: Do Nothing**
   - Deploy everything to PROD
   - Boston site continues using `/calendar`
   - Works perfectly, just not Boston-filtered
   - Zero coordination needed

2. **MEDIUM RISK: Gradual Migration**
   - Deploy to PROD with both routes working
   - `/calendar` - existing (all events)
   - `/calendar/boston` - new (Boston-filtered)
   - Coordinate with Boston site to update when ready

3. **HIGHEST RISK: Force Migration**
   - Require Boston site to update immediately
   - Risk of downtime if not coordinated

**RECOMMENDATION: Strategy #2 (Gradual Migration)**
- Both routes work
- No breaking changes
- Boston site can migrate when convenient

### CONCLUSION

**Deployment Risk: LOW**

**CONFIRMED: NO DATA LOSS RISK**
- All `mastered*` fields RETAINED in database
- Only CODE refactored (contexts consolidated)
- API endpoints unchanged
- Full backward compatibility maintained

The changes are:
1. **Code Architecture**: Cleaned up contexts (removed circular dependencies)
2. **New Features**: Boston route (isolated), venue filtering (with fallbacks)
3. **Data Model**: UNCHANGED - all mastered fields kept
4. **API Contracts**: UNCHANGED - accepts old and new field names

**Recommendation: SAFE TO DEPLOY**

No database migration needed. The refactoring was CODE-ONLY:
- Removed duplicate context files
- Consolidated into cleaner architecture
- Kept all data fields and API compatibility
- Added new features as progressive enhancements