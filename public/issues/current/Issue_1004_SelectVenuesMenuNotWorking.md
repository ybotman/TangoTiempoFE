# Issue 1004: "Select Venues" Screen Not Working in Hamburger Menu

## Overview
The "Select Venues" option in the hamburger menu has never worked properly. This feature should integrate with the GeoLocation system to display physical venues, but it currently appears disabled and doesn't display venues when selected.

## Details
- **Reported On:** 2025-04-26
- **Reported By:** User
- **Environment:** Development/Local
- **Component/Page/API Affected:** Hamburger menu "Select Venues" option and related venue selection UI
- **Symptoms:** The "Select Venues" option in the hamburger menu appears disabled and cannot be clicked, preventing users from accessing venue selection functionality

## Steps to Reproduce
1. Open the application and wait for it to fully load
2. Click on the hamburger menu icon
3. Observe that the "Select Venues" option is grayed out and disabled
4. (If somehow accessible) When clicking "Select Venues", a message appears saying "Please select a city first"

## Investigation
- **Initial Trace:** Code analysis shows the venue selection functionality is disabled by design unless a city is first selected
- **Actual Root Cause:** The GeoLocationContext/MasteredLocationContext initialization flow is not properly setting the selected city
- **Key Findings:**
  1. The SidebarDrawer.js component disables the "Select Venues" option when `!selectedLocation?.city?.id`
  2. The VenueSelectionModal shows "Please select a city first" when no city is selected
  3. The GeoLocationContext should be auto-detecting the nearest city on initialization, but this process appears to be failing
  4. The MasteredLocationContext attempts to fetch the nearest city but may be encountering issues with the API or geolocation service
  5. Backend API appears to be working (http://localhost:3010/api/venues?appId=1 returns data)

- **Files to Inspect:** 
  - `/src/app/contexts/GeoLocationContext.js` (core issue likely here)
  - `/src/app/contexts/MasteredLocationContext.js` (used by GeoLocationContext)
  - `/src/app/components/UI/SidebarDrawer.js` (where the disabled state is implemented)
  - `/src/app/components/Modals/Venues/VenueSelectionModal.js` (UI for venue selection)
  - `/src/app/hooks/useVenues.js` and `/src/app/hooks/useVenueSelection.js` (data fetching)

## Fix (if known or applied)
- **Status:** ❌ Blocked - Initial fix unsuccessful
- **Fix Description:** 
  1. Initial approach: Added extensive logging and fallbacks to GeoLocationContext
  2. Current status: Issue persists despite fallback city implementation
  3. Next steps: Review console logs to identify where the context initialization is failing
  4. Potential new approach: May need to modify the SidebarDrawer component to handle missing city state more gracefully
- **Testing:** 
  1. Verify logs in console to track GeoLocationContext initialization flow
  2. Check if city selection is happening but not being communicated to SidebarDrawer
  3. Determine if there's a timing issue with context initialization
  4. Consider a more direct approach to enable the menu item regardless of city selection

## Resolution Log
- **Commit/Branch:** issue/1004-select-venues-menu-not-working
- **Commit:** eeb5bf9 - Fix GeoLocationContext initialization to ensure city selection for venue feature
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verification Status:** ❌ Failed - Issue still present after implementation
- **Implementation Details:**
  1. Added extensive debug logging to GeoLocationContext to track initialization
  2. Improved error handling in location detection with proper fallbacks
  3. Added multiple backup strategies when geolocation fails
  4. Ensured the context always sets a default city (Boston) when other methods fail
  5. Added explicit initialization on component mount to guarantee a city is selected
- **Next Investigation Steps:**
  1. Analyze debug logs to identify where initialization is failing
  2. Check if there's a timing issue between context initialization and UI rendering
  3. Investigate if SidebarDrawer is accessing the context correctly
  4. Consider a more direct approach that doesn't rely on geolocation at all

---

> Note: This issue is related to the location context initialization flow. The venue selection functionality itself appears to be properly implemented but is disabled due to a missing city selection.