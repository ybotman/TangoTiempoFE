# TIEMPO-XXX: Deployment Preparation - Venue Filtering Feature

**Type:** Task
**Priority:** High
**Sprint:** Current Sprint
**Labels:** deployment, backend, frontend, venue-filtering

## Summary
Coordinate backend and frontend deployment of venue filtering feature (TIEMPO-276/CALBE-53) to TEST and PROD environments.

## Current Status

### Frontend (TIEMPO-276) ✅
- **Local DEVL**: Working with localhost:3010 backend
- **TEST Branch**: Merged and deployed to Vercel
- **TEST Deployment**: Not working - backend missing distance filtering

### Backend (CALBE-53) ⚠️
- **Local**: Working with distance-based venue filtering
- **TEST**: Not deployed - missing venue distance filtering
- **PROD**: Not deployed

## Required Actions

### Backend Team (BETTY)
1. **Deploy CALBE-53 to TEST backend**
   - Venue distance filtering by lat/lng/radius
   - Support for `radius=200mi` parameter format
   - Remove `all=true` bypass of distance filtering
   - Add distance property to venue responses

2. **Verify TEST backend**
   - Test endpoint: `/api/venues?lat=39.59&lng=-105.24&radius=200mi`
   - Should return only venues within radius
   - Should include distance property

3. **Deploy to PROD backend** (after TEST validation)
   - Same venue filtering features
   - Performance testing for distance calculations

### Frontend Team (FRED)
1. **TEST Environment**
   - Verify Vercel environment variables
   - Confirm `NEXT_PUBLIC_BE_URL` points to TEST backend
   - Test venue filtering after backend deployment

2. **PROD Deployment Prep**
   - Remove all debug console.log statements
   - Verify version number (1.8.5)
   - Update deployment documentation

## Testing Checklist

### TEST Environment
- [ ] Backend deployed with CALBE-53
- [ ] Frontend connects to correct backend URL
- [ ] Venue filtering works with user location
- [ ] Only shows venues within configured radius
- [ ] Venue count matches expected (2 for Denver, not 57)

### PROD Readiness
- [ ] All debug logging removed
- [ ] Performance tested with production data
- [ ] Fallback behavior tested (no location)
- [ ] Mobile device testing completed

## Dependencies
- Backend CALBE-53 must be deployed before frontend will work
- TEST backend URL must support distance-based filtering
- Environment variables must be configured on Vercel

## Risk Mitigation
- Frontend has fallback to show all venues if no location
- Cache-aware implementation prevents excessive API calls
- Defensive programming handles missing coordinates

## Success Criteria
1. TEST environment shows filtered venues based on location
2. Denver location shows 2 venues, not 57
3. UI shows location context in venue dropdown
4. Performance acceptable with production dataset

## Notes
- Local DEVL works perfectly with localhost:3010
- Issue only affects deployed TEST environment
- Frontend code is ready, waiting on backend deployment

---

**Action Required**: Backend team deploy CALBE-53 to TEST environment ASAP