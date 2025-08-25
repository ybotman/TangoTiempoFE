# TIEMPO-276: Implement Venue Filtering Based on User Location Settings

**Type:** Story
**Priority:** High
**Sprint:** Current Sprint
**Labels:** venue-filtering, location-based, frontend

## Summary
Connect venue filtering to user's location settings - venues should be filtered by the same range that controls which events users see.

## Problem Statement
Currently, the useVenues hook only uses location if explicitly passed. It needs to always use the selectedLocation from GeoLocationContext to ensure venues are filtered based on the user's map center and zoomRange preferences.

## Solution Design

### 1. Update useVenues Hook
**File:** `/src/app/hooks/useVenues.js`

**Current Issue (lines 30-35):**
```javascript
// Only uses location if explicitly passed
if (location && location.lat && location.lng) {
  params.lat = location.lat;
  params.lng = location.lng;
  params.radius = location.radius || 20;
}
```

**Proposed Fix:**
```javascript
// TIEMPO-276: Always use user's location and range from context
const effectiveLocation = location || selectedLocation;

if (effectiveLocation?.latitude && effectiveLocation?.longitude) {
  params.lat = effectiveLocation.latitude;
  params.lng = effectiveLocation.longitude;
  // Use zoomRange from context (user's saved preference)
  params.radius = `${effectiveLocation.zoomRange || 50}km`;
  params.sortByDistance = true; // Sort by closest first
}
```

### 2. Update useEffect Hook
**Current Issue (lines 74-76):**
```javascript
useEffect(() => {
  fetchVenues(); // Not passing location
}, [fetchVenues]);
```

**Proposed Fix:**
```javascript
useEffect(() => {
  fetchVenues(null, selectedLocation); // Pass location from context
}, [fetchVenues, selectedLocation]);
```

### 3. Optional: Update VenueSelectionModal
Show distance in venue dropdown for better UX:
```javascript
{venues.map(venue => (
  <MenuItem key={venue._id} value={venue._id}>
    {venue.venueName}
    {venue.distance && ` (${venue.distance.toFixed(1)} km)`}
  </MenuItem>
))}
```

## Technical Details

### API Request Format
After implementation, venue API calls should include:
```
GET /api/venues?lat=42.36&lng=-71.05&radius=50km&sortByDistance=true
```

### Expected Response
```json
{
  "data": [
    {
      "venueName": "Dance Complex",
      "distance": 1.2,
      "address": {...}
    }
  ]
}
```

## Acceptance Criteria
1. ✅ Venues are filtered based on user's selectedLocation from GeoLocationContext
2. ✅ User's zoomRange setting controls the radius for venue filtering
3. ✅ Venues are sorted by distance (closest first)
4. ✅ Distance is displayed in venue selection dropdown (optional)
5. ✅ Changing location settings immediately updates available venues

## Testing Plan
1. Set location to Boston in user settings
2. Set range to 10km in settings
3. Open Create Event modal
4. Verify only venues within 10km appear
5. Change range to 50km
6. Verify more venues appear
7. Verify Network tab shows correct lat/lng/radius parameters

## Dependencies
- GeoLocationContext must be properly configured
- Backend API (CALBE-53) must support distance-based filtering
- User must have location settings saved

## Implementation Notes
- This connects venue filtering to the same range that controls event visibility
- Uses the existing selectedLocation from GeoLocationContext
- Maintains backward compatibility with explicit location parameter
- Follows the pattern established in TIEMPO-275 for context usage

## Related Work
- CALBE-53: Backend venue filtering by distance
- TIEMPO-275: Context cleanup and optimization
- venue-filter-implementation branch: Previous implementation attempt

---

## Fred's Implementation Checklist
- [ ] Update useVenues.js to use effectiveLocation
- [ ] Add selectedLocation to useEffect dependency
- [ ] Test with different location ranges
- [ ] Verify API calls include correct parameters
- [ ] Optional: Add distance display to dropdown
- [ ] Document any issues found