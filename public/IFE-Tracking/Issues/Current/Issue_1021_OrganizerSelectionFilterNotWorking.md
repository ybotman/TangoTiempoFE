# Issue: Organizer Selection Filter Not Working in Hamburger Menu

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue addresses a problem with the organizer selection feature in the hamburger menu. The selection should function as a multi-select box that filters events via API, but it's currently not showing any organizers and generating several errors.

## Details
- **Reported On:** 2025-05-12
- **Reported By:** User
- **Environment:** Local Development
- **Component/Page/API Affected:** Hamburger Menu Organizer Selection
- **Symptoms:** No organizers are displayed in the selection menu, and multiple errors appear in the console

## Steps to Reproduce
1. Open the application
2. Click the hamburger menu
3. Navigate to the organizer selection section
4. Observe that no organizers are displayed
5. Check console for errors

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.
All task assignments and status updates go here._
**Last updated:** 2025-05-12 16:30

- [x] Investigate MasteredLocationContext initialization errors
- [x] Review API rate limiting issues with geolocation endpoint
- [x] Check the organizer selection component implementation
- [x] Research previous geolocation issues for relevant fixes (Issue_1010, Issue_1008)
- [ ] Review changes that may have reintroduced circular dependencies
- [ ] Implement proper null checks in useOrganizers hook
- [ ] Add caching mechanism to useOrganizers (similar to useRegions approach)
- [ ] Enhance error handling in RegionalOrganizerSelection component
- [ ] Re-apply or strengthen the Hierarchical Responsibility Model from Issue_1010
- [ ] Implement staggered API call initialization to prevent rate limiting
- [ ] Test fix across different scenarios (with/without cached location data)
- [ ] Update documentation in context providers to clarify responsibility boundaries

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.
Document what was discovered, suspected causes, and open questions._
**Last updated:** 2025-05-12 16:00

- Console shows error: "MasteredLocationContext: Error fetching nearest city: Cannot access 'latitude' before initialization"
- GET request to http://localhost:3010/api/firebase/geo/ip returns 429 (Too Many Requests)
- useGeoLocations.js throws error: "Request failed with status code 429"
- HTML warning about invalid nesting: "<h2> cannot be a descendant of <p>"
- Similar to previously fixed issue Issue_1020_UserSettingsHamburgerMenuCrash (d4f5155)

### Component Architecture Investigation
- **Sidebar Drawer Implementation**:
  - SidebarDrawer uses RegionalOrganizerSelection component for organizer selection
  - Gets selectedOrganizers from useCalendarPage hook
  - Passes current selection and callback functions to the modal component

- **RegionalOrganizerSelection Component**:
  - Implemented as a modal dialog with multi-select checkboxes
  - Relies on useOrganizers hook to fetch organizer data
  - Maintains internal selected state and syncs with parent on apply

- **useOrganizers Hook**:
  - Fetches organizers filtered by current location (region/division/city)
  - Directly depends on GeoLocationContext for location filters
  - **Missing defensive programming**: No null checks for selectedLocation
  - **No error resilience**: Fails completely when location data unavailable
  - **No caching mechanism**: Always hits API even when rate limited

### Root Causes Identified
1. **Circular Dependency Regression**:
   - GeoLocationContext depends on MasteredLocationContext
   - MasteredLocationContext depends on GeoLocationContext
   - Provider order was changed: GeoLocationProvider now initializes BEFORE MasteredLocationProvider
   - This creates a race condition during initialization
   - Similar to issues previously fixed in Issue_1010_LocationContextHierarchicalRefactor

2. **API Call Cascade**:
   - Multiple components make geolocation API calls simultaneously
   - No request throttling or orchestration
   - Leads to 429 Too Many Requests errors

3. **Missing Error Handling in Component Chain**:
   - useOrganizers hook doesn't handle null location data
   - No fallbacks when location context initialization fails
   - No caching to reduce API dependency
   - No retry logic for failed API requests

4. **Access Before Initialization**:
   - The error specifically refers to latitude/longitude being accessed before initialization
   - This suggests timing issues in the initialization sequence

### Relation to Previous Issues
- **Issue_1010** previously implemented a Hierarchical Responsibility Model to fix circular dependencies
- **Issue_1008** fixed initialization bugs in GeoLocationContext with proper fallbacks
- **Issue_1013** (current) aims to standardize coordinate handling across components
- Our current issue appears to be a regression where circular dependencies have been reintroduced

## 🤔 ARCHITECT (Required)
_Design decisions, approach, and technical solution planning.
Outlines the solution architecture before implementation._
**Last updated:** 2025-05-12 16:30

Based on our investigation and findings from previous issues, I recommend the following solution approach:

1. **Restore Hierarchical Responsibility Model**:
   - Review Issue_1010 solution to understand how circular dependencies were previously resolved
   - Ensure GeoLocationContext remains the primary owner of location state
   - Remove any new dependencies where MasteredLocationContext reaches back into GeoLocationContext

2. **Add Caching and Resilience to useOrganizers**:
   - Implement localStorage caching with reasonable expiration (similar to Issue_1020 fix for useRegions)
   - Add proper error handling with fallbacks for when location data is unavailable
   - Implement exponential backoff retry logic for failed API requests
   - Default to showing all organizers when location filtering fails

3. **Implement Defensive Programming**:
   - Add robust null/undefined checks throughout the component chain
   - Validate location data before access with optional chaining
   - Add Array.isArray() checks for collections
   - Ensure empty states are handled gracefully with informative UI

4. **Prevent API Call Cascades**:
   - Implement staggered initialization to prevent simultaneous API calls
   - Add a central request orchestrator to batch and prioritize location-related API calls
   - Implement client-side request throttling

5. **Visual Feedback Improvements**:
   - Add loading state to RegionalOrganizerSelection component
   - Show helpful error messages when organizers can't be loaded
   - Implement retry buttons for failed data fetching

This approach addresses both the immediate symptoms and underlying architectural issues.

---

## Investigation
- **Initial Trace:**
  - "MasteredLocationContext: Error fetching nearest city: Cannot access 'latitude' before initialization"
  - "GET http://localhost:3010/api/firebase/geo/ip 429 (Too Many Requests)"
  - "useGeoLocations-> Error: Request failed with status code 429"
  - "Warning: In HTML, <h2> cannot be a descendant of <p>"

- **Key Files Analyzed:**
  - MasteredLocationContext.js - Location context with dependency on GeoLocationContext
  - useGeoLocations.js - Hook handling geolocation with API calls
  - SidebarDrawer.js - Hamburger menu with organizer selection trigger
  - RegionalOrganizerSelection.js - Modal component with organizer multi-select
  - useOrganizers.js - Hook for fetching and filtering organizers based on location

- **Component Chain:**
  SidebarDrawer → RegionalOrganizerSelection → useOrganizers → GeoLocationContext → MasteredLocationContext

- **Technical Analysis:**
  1. Provider initialization order was changed to have GeoLocationProvider before MasteredLocationProvider
  2. This creates a circular dependency during initialization
  3. The useOrganizers hook has insufficient error handling and no caching
  4. Multiple components trigger simultaneous API calls causing rate limiting
  5. No proper state management for empty/loading/error states

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** Not yet implemented
- **Testing:** Not yet performed

## Resolution Log
- **Commit/Branch:** Not yet created
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1021_OrganizerSelectionFilterNotWorking.md` and move to `/public/IFE-Tracking/Issues/Completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles