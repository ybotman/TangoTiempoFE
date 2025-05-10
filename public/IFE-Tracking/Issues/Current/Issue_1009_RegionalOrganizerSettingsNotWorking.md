# Issue 1009: Regional Organizer Settings Not Working

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This is a lightweight formal issue log to capture, trace, and resolve a specific bug. It is stored in the ` /public/IFE-Tracking/Issues/current/` folder and moved to ` /public/IFE-Tracking/Issues/completed/` upon resolution.

## Details
- **Reported On:** 2025-05-10
- **Reported By:** User
- **Environment:** Local Development
- **Component/Page/API Affected:** Regional Organizer Settings Modal
- **Symptoms:** Opening the Regional Organizer modal in the RO TT role shows "Error loading organizer data"

## Steps to Reproduce
1. Log in with Regional Organizer role
2. Attempt to open Regional Organizer Settings
3. Modal opens but displays "Error loading organizer data" error
4. Console shows 404 error: GET http://localhost:3010/api/organizers/680669172f9268813021246f?appId=1 404 (Not Found)

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2025-05-10 00:00

- [ ] Create issue tracking document
- [ ] Investigate 404 error in organizer API call
- [ ] Check useOrganizers.js hook for error handling
- [ ] Verify Regional Organizer data format
- [ ] Implement fix
- [ ] Test fix in local environment
- [ ] Update documentation

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-05-10 00:00

- Initial error suggests the API endpoint is returning a 404 for a specific organizer ID (680669172f9268813021246f)
- Error is triggered when opening the Regional Organizer modal
- From stack trace, the error occurs in useOrganizers.js:63 and RegionalOrganizersModal.js:33
- The error message "Error fetching organizer: AxiosError" is logged at useOrganizers.js:69
- Files to investigate:
  - src/app/components/Modals/RegionalOrganizers/RegionalOrganizersModal.js
  - src/app/hooks/useOrganizers.js
  - src/app/contexts/RoleContext.js (likely contains the regional organizer role information)

## 🛠️ PATCH (Required)
_Fix details, implementation notes, and blockers._  
**Last updated:** 2025-05-10 00:00

- Not yet implemented

---

## Investigation
- **Initial Trace:** 
  - Console error: GET http://localhost:3010/api/organizers/680669172f9268813021246f?appId=1 404 (Not Found)
  - Error message: "Error loading organizer data" displayed in the modal
  - Stack trace shows the error is in useOrganizers.js:63 and RegionalOrganizersModal.js:33
- **Suspected Cause:** 
  - API endpoint failure - 404 indicates the organizer ID doesn't exist or API path is incorrect
  - Possible hardcoded MongoDB ID being used that doesn't match the local environment
  - Lack of proper error handling in the fetch request
- **Files to Inspect:** 
  - src/app/hooks/useOrganizers.js
  - src/app/components/Modals/RegionalOrganizers/RegionalOrganizersModal.js
  - Backend API routes handling organizer data

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** Not yet determined
- **Testing:** Not yet performed

## Resolution Log
- **Commit/Branch:** `issue/1009-regional-organizer-settings-not-working`
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: ` /public/IFE-Tracking/Issues/current/Issue_1009_RegionalOrganizerSettingsNotWorking.md` and move to ` /public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles