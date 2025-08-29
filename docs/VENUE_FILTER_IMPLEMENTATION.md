# Venue Filter Implementation Documentation

## Date: 2025-08-24
## Branch: venue-filter-implementation

## Overview
Implemented GeoLocation-based venue filtering for Create/Update Event modals. Venues are now filtered based on the user's map center and zoomRange settings.

## Problem Solved
- Venues in Create/Update Event dropdowns were not filtered by location
- Users saw all venues regardless of their location settings
- Unlike events (which are filtered by location), venues showed everything

## Implementation Details

### Files Modified
1. **src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js**
   - Added GeoLocation context import
   - Added venue radius filtering based on user's map center
   - Added "+50 miles" expand button
   - Added informational message about venue filtering

### Key Features Added

#### 1. GeoLocation Integration
```javascript
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const { currentLocation, savedLocation } = useGeoLocation();
const mapCenter = currentLocation || savedLocation;
```

#### 2. Radius-Based Filtering
```javascript
// Calculate radius from user's zoomRange + any extra
const actualRadius = (mapCenter?.zoomRange || 50) + extraRadius;

// Send to backend for filtering
if (mapCenter && mapCenter.lat && mapCenter.lng) {
  const location = {
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: actualRadius
  };
  fetchVenues(null, location);
}
```

#### 3. Expand Search Feature
```javascript
// Button to add 50 miles to search radius
const expandSearchRadius = () => {
  setExtraRadius(prev => prev + 50);
};

// UI Button
<Button
  variant="outlined"
  startIcon={<ExpandIcon />}
  onClick={expandSearchRadius}
  title="Expand search radius by 50 miles"
>
  +50 miles
</Button>
```

#### 4. User Feedback
```javascript
// Info message showing filtering status
<Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
  <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
  <Typography variant="caption" color="text.secondary">
    Venues within {actualRadius} miles of your map center
    {venues.length === 0 && ' (No venues found)'}
  </Typography>
  {extraRadius > 0 && (
    <Chip 
      label={`+${extraRadius} miles`} 
      size="small" 
      color="primary" 
      variant="outlined"
    />
  )}
</Box>
```

## How It Works

1. **User sets map center**: Through location settings modal
2. **User sets zoomRange**: Preferred radius (10, 25, 50, 100, 150, 250 miles)
3. **Create/Update Event**: Opens modal with venue dropdown
4. **Venues are filtered**: Backend receives lat/lng/radius and returns only venues within range
5. **Expand if needed**: User can click "+50 miles" to expand search incrementally

## Backend Integration
- Frontend sends: `lat`, `lng`, `radius` (in miles)
- Backend (CALBE-53) performs distance calculations
- Returns only venues within specified radius
- No frontend filtering - backend does all the work

## Benefits
- Consistent with event filtering behavior
- Reduces venue dropdown clutter
- Shows relevant local venues first
- Expandable when user needs wider search

## Testing Notes
- Works for both Create and Update Event modals
- Requires user to have map center set
- Falls back to all venues if no location set
- Expand button only shows when venues exist but more might be available

## Reapplication Instructions
To reapply this feature:
1. Check out this branch: `git checkout venue-filter-implementation`
2. Copy changes from `src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`
3. Ensure GeoLocation context is properly initialized
4. Test with various radius settings

## Known Issues to Address
- Events not showing when logged in with map center (unrelated to venue filter)
- Need to verify backend properly handles radius parameter
- May need to adjust radius units (miles vs km) based on backend expectations