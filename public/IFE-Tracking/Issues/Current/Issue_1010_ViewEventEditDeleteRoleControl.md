# Issue 1010: View Event Modal Shows Edit/Delete Options Regardless of Role

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
- **Component/Page/API Affected:** View Event Modal
- **Symptoms:** EDIT and DELETE options are visible in the View Event Modal for all users regardless of role, but they should only be available to users with the Regional Organizer (RO) role and only when editing an event

## Steps to Reproduce
1. Log in with any role that is not Regional Organizer
2. View any event in the calendar
3. Observe that EDIT and DELETE options are visible in the View Event Modal
4. The options should only be available to Regional Organizers and only in edit mode, not view mode

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2025-05-10 22:30

- [x] Create issue tracking document
- [ ] Investigate View Event Modal component structure
- [ ] Identify where role checks should be implemented
- [ ] Determine how to distinguish between view and edit modes
- [ ] Implement proper role-based permission checks for edit/delete actions
- [ ] Test fix with different user roles
- [ ] Update documentation

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2025-05-10 22:30

- Initial investigation needed to identify component files for the View Event Modal
- Need to check how user roles are currently being accessed in the component
- Need to verify if there's already a mechanism to distinguish between view and edit modes
- Files to investigate include:
  - src/app/components/Modals/ViewEvents/ViewEventDetailModal.js (likely the main component)
  - Other related components in the ViewEvents directory

## 🛠️ PATCH (Required)
_Fix details, implementation notes, and blockers._  
**Last updated:** 2025-05-10 22:30

- Not yet implemented

---

## Investigation
- **Initial Trace:** 
  - Need to examine ViewEventDetailModal.js and related components
  - Need to check how AuthContext and RoleContext are being used
  - Need to investigate how event editing permissions are determined
- **Suspected Cause:** 
  - Missing role check for EDIT and DELETE options
  - Improper conditional rendering based on user role
  - No distinction between view and edit modes in the UI
- **Files to Inspect:** 
  - src/app/components/Modals/ViewEvents/ViewEventDetailModal.js
  - src/app/contexts/RoleContext.js
  - src/app/contexts/AuthContext.js

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** Not yet determined
- **Testing:** Not yet performed

## Resolution Log
- **Commit/Branch:** `issue/1010-view-event-edit-delete-role-control`
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified

---

> Store under: ` /public/IFE-Tracking/Issues/current/Issue_1010_ViewEventEditDeleteRoleControl.md` and move to ` /public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles