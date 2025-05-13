# Issue: Organizer Selection Empty For Boston

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue addresses the problem that organizers are not appearing in the hamburger menu selection dropdown when Boston is the active geolocation. The dropdown should display organizers within the active geolocation (selected masteredCity/Region) and allow filtering events by selected organizers.

## Details
- **Reported On:** 2025-05-13
- **Reported By:** User
- **Environment:** Local Development
- **Component/Page/API Affected:** Hamburger Menu Organizer Selection
- **Symptoms:** No organizers are displayed in the selection dropdown when Boston is the active location

## Steps to Reproduce
1. Open the application
2. Ensure Boston is selected as the active location
3. Click the hamburger menu
4. Navigate to the organizer selection section
5. Observe that no organizers are displayed

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2025-05-13 12:45

- [x] Investigate organizer selection component
- [x] Examine useOrganizers.js hook functionality
- [x] Check if organizers exist in Boston in database
- [x] Verify API query parameters for organizer filtering
- [x] Test API response directly for Boston masteredCityId
- [x] Determine if this is a data problem or API issue
- [ ] Plan appropriate fix based on findings

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-05-13 12:45

### Initial Investigation:
- Reviewed RegionalOrganizerSelection.js component:
  - Component correctly shows "No organizers available in [city]" message when no data
  - Uses `useOrganizers` hook for data fetching and filtering
  - Handles loading, error, and empty states properly

- Examined useOrganizers.js hook:
  - Hook properly retrieves IDs from GeoLocationContext: `selectedLocation?.city?.id`
  - Adds location filters to API request as query parameters
  - Uses caching mechanism to reduce API calls
  - Implements proper error handling and retry logic

### API Testing Results:

1. **Checked Boston's City ID**:
   ```bash
   curl "http://localhost:3010/api/masteredLocations/cities?cityName=Boston"
   ```
   - Confirmed Boston's masteredCityId is `6751f58a5db435dd8005e46a`

2. **Queried Organizers API for Boston**:
   ```bash
   curl "http://localhost:3010/api/organizers?masteredCityId=6751f58a5db435dd8005e46a"
   ```
   - Response: Empty organizers array with total count of 0
   ```json
   {
     "organizers": [],
     "pagination": {
       "total": 0,
       "page": 1,
       "limit": 100,
       "pages": 0
     }
   }
   ```

3. **Checked General Organizers List**:
   ```bash
   curl "http://localhost:3010/api/organizers?isActive=true"
   ```
   - Response: 44 active organizers in the system
   - None are associated with Boston's masteredCityId
   - Organizers are using `organizerRegion` field instead of masteredCityId

### Root Cause Identified:

The root cause is a **data mapping issue** between the frontend location model and the backend organizer model:

1. **Frontend Expectation**:
   - Frontend uses a hierarchical model with masteredCityId, masteredDivisionId, masteredRegionId
   - The `useOrganizers` hook filters using these IDs

2. **Backend Reality**:
   - Organizers in the database use a field called `organizerRegion` (not masteredRegionId)
   - No `masteredCityId` field exists on organizer documents
   - Example organizer document:
   ```json
   {
     "_id": "680669162f92688130212454",
     "firebaseUserId": "tangospark",
     "fullName": "Practica Spark",
     "shortName": "PRACTICASP",
     "organizerRegion": "68066916a6d70c00c2841000"
   }
   ```

3. **API Parameter Mismatch**:
   - Frontend sends: `?masteredCityId=6751f58a5db435dd8005e46a`
   - Backend expects: `?organizerCity=6751f58a5db435dd8005e46a`
   - Additionally, some organizers might be associated with regions but not cities

### Conclusion:

This is a **data structure mismatch** issue. The organizers API endpoint is not recognizing the `masteredCityId` parameter because organizers in the database use a different field structure for location association.

---

## Investigation
- **Initial Trace:** 
  - Console log shows "Fetching organizers with params: [parameters]" but returns empty array
  - No errors in the console, system working as designed but with no data
  - RegionalOrganizerSelection component correctly shows "No organizers available in Boston"

- **Suspected Cause:**
  - **Confirmed**: Data mapping issue between frontend and backend models
  - Frontend uses masteredCityId/Region/Division from new location model
  - Backend organizers use organizerRegion/City fields from older model

- **Files Inspected:** 
  - RegionalOrganizerSelection.js - Modal component with organizer selection
  - useOrganizers.js - Hook for fetching and filtering organizers
  - Backend models - Organizer schema using organizerRegion instead of masteredRegionId

## Fix (if known or applied)
- **Status:** ⏳ Pending
- **Fix Description:** The fix will need to address the parameter naming mismatch between the frontend hook and the backend API. Two potential approaches:
  1. Update the useOrganizers hook to map masteredCityId → organizerCity, masteredRegionId → organizerRegion
  2. Update the backend API to recognize and handle both parameter naming conventions
- **Testing:** To be determined

## Resolution Log
- **Commit/Branch:** `issue/1024-organizer-selection-dropdown-empty-for-boston`
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1024_OrganizerSelectionEmptyForBoston.md` and move to `/public/IFE-Tracking/Issues/Completed/` when resolved. 

# SNR after interactions
🔷 **S** - Investigated the empty organizer selection dropdown for Boston and identified the root cause: a parameter naming mismatch between the frontend and backend. The useOrganizers hook sends 'masteredCityId' parameter, but the backend API expects 'organizerCity' due to an older data model in use.

🟡 **N** - Next steps are to:
1. Update useOrganizers.js to map the new location model parameters to the legacy parameter names expected by the API
2. Test the fix with Boston and other locations
3. Consider a more comprehensive frontend-backend alignment for location parameters

🟩 **R** - Switch to Architect mode to design the solution that maintains compatibility with both the new mastered location model and the legacy organizer location fields.