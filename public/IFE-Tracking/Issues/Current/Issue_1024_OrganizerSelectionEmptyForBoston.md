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
**Last updated:** 2025-05-13 11:30

- [x] Investigate organizer selection component
- [x] Examine useOrganizers.js hook functionality
- [ ] Check if organizers exist in Boston in database
- [ ] Verify API query parameters for organizer filtering
- [ ] Test API response directly for Boston masteredCityId
- [ ] Determine if this is a data problem or API issue
- [ ] Plan appropriate fix based on findings

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-05-13 11:30

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

### Potential Causes:
1. **Data Issue**: No organizers in database for Boston
   - Boston organizers might not have proper masteredCityId
   - Boston masteredCityId might be incorrect or mismatched

2. **API Filtering Issue**:
   - Region/Division/City query parameters may not be working as expected
   - Parameter names in API query may be different than frontend expectations
   - Query might be too restrictive (using all: region, division, AND city)

3. **Environment Issue**:
   - Dev environment might have different data than production
   - Boston geolocation might not be correctly loaded in location context

### Key Questions:
- Do organizers exist in the database with Boston's masteredCityId?
- Is the API properly filtering when provided with Boston's location IDs?
- Is the client correctly passing Boston's location IDs to the API?
- Is there a difference in how Boston organizers are structured in the database?

Next steps will be to:
1. Test the API endpoint directly with Boston location parameters
2. Check Boston's location IDs are correct in the context
3. Verify database has organizers associated with Boston

---

## Investigation
- **Initial Trace:** 
  - Console log shows "Fetching organizers with params: [parameters]" but returns empty array
  - No errors in the console, system working as designed but with no data
  - RegionalOrganizerSelection component correctly shows "No organizers available in Boston"

- **Suspected Cause:** 
  - Most likely a data issue where no organizers are associated with Boston's masteredCityId
  - Alternatively, API query parameters might be constructed incorrectly

- **Files Inspected:** 
  - RegionalOrganizerSelection.js - Modal component with organizer selection
  - useOrganizers.js - Hook for fetching and filtering organizers
  - GeoLocationContext.js - Context providing location data

## Fix (if known or applied)
- **Status:** ⏳ Pending
- **Fix Description:** To be determined after further investigation
- **Testing:** To be determined

## Resolution Log
- **Commit/Branch:** `issue/1024-organizer-selection-empty-for-boston`
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1024_OrganizerSelectionEmptyForBoston.md` and move to `/public/IFE-Tracking/Issues/Completed/` when resolved. 

# SNR after interactions
🔷 **S** - Investigated the organizer selection component and related hooks. The system appears to be working as designed, but no organizers are showing up for Boston. Need to determine if this is a data issue (no Boston organizers in database) or an API filtering issue.

🟡 **N** - Next steps are to:
1. Check the database for organizers with Boston's masteredCityId
2. Test the API directly with Boston's location parameters
3. Verify the location IDs being used in the context are correct

🟩 **R** - Continue in Scout mode to investigate the API and database, or switch to Architect mode once the root cause is identified to design a solution.