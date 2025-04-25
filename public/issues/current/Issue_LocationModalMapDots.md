# Issue: City Dots Not Appearing in "Select Nearest City" Map Modal

## Overview
The "Select Nearest City" map functionality in LocationContextModal.js is not displaying city dots on the map, despite the feature being correctly implemented in the codebase and working in similar components like VenueModalMap.js.

## Details
- **Reported On:** 2025-04-25
- **Reported By:** User
- **Environment:** Development/Local
- **Component/Page/API Affected:** LocationContextModal.js
- **Symptoms:** Map loads correctly but city markers/dots are not visible, preventing users from selecting their location

## Steps to Reproduce
1. Navigate to any page with the location selector
2. Click on the current location display to open the location selection modal
3. Modal opens with map but no city dots appear
4. Console shows no JS errors, and logging indicates cities with coordinates are being processed

## Investigation
- **Initial Trace:** Component logs show cities with coordinates are being processed but markers aren't visible
- **Suspected Cause:** Either rendering timing issues, CSS/styling problems, or react-leaflet component configuration
- **Files to Inspect:** 
  - `/src/app/components/Modals/misc/LocationContextModal.js`
  - `/src/app/hooks/useMasteredLocations.js`
  - `/src/app/contexts/MasteredLocationContext.js`
  - `/src/app/contexts/GeoLocationContext.js`

## Analysis
### Key Differences with Working Implementation
1. **Map Initialization Approach:**
   - VenueModalMap uses imperative Leaflet initialization with L.map()
   - LocationContextModal uses declarative MapContainer from react-leaflet

2. **Marker Implementation:**
   - VenueModalMap manually adds markers with L.marker()
   - LocationContextModal uses CircleMarker components

3. **Data Flow:**
   - API returns cities with coordinates
   - Component correctly filters for valid coordinates
   - Map appears to initialize but markers aren't visible

### Potential Root Causes
1. **Map Container Sizing:** The map container might be rendering with zero height or improper dimensions
2. **Marker Visibility:** CircleMarker might not be visible due to styling or z-index issues
3. **Timing Issues:** React-leaflet components might initialize before city data is processed
4. **CSS Conflicts:** Leaflet CSS might not be properly applied or overridden

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** 
  1. Add explicit height/width styling to the map container
  2. Move from CircleMarker to standard Marker component with a more visible icon
  3. Add z-index styling to ensure markers appear above map tiles
  4. Improve validation of city data before attempting to render markers
  5. Add more granular console logging to track exact point of failure

- **Testing:** Manual verification that city dots appear and can be selected

## Resolution Log
- **Commit/Branch:** (pending)
- **PR:** (pending)
- **Deployed To:** (pending)
- **Verified By:** (pending)

---

> Note: Related to PMR_LocationModalFix.md in public/PMR_Current/