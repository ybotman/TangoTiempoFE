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
**Last updated:** 2025-05-10 23:00

- [x] Create issue tracking document
- [x] Investigate View Event Modal component structure
- [x] Identify where role checks should be implemented
- [x] Determine how to distinguish between view and edit modes
- [ ] Implement proper role-based permission checks for edit/delete actions
- [ ] Test fix with different user roles
- [ ] Update documentation

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.
Document what was discovered, suspected causes, and open questions._
**Last updated:** 2025-05-10 23:00

- Investigation complete on ViewEventDetailModal.js and related contexts
- The issue is in lines 181-202 where Edit and Delete buttons are displayed
- The current permission check at line 117 is insufficient:
  ```javascript
  const canEditEvent = user && eventDetails?.extendedProps?.ownerOrganizerID;
  ```
- This only checks if a user is logged in and if the event has an owner ID, but doesn't verify the user's role
- The component doesn't import or use RoleContext, which is available and provides `selectedRole`
- The existing `editMode` state variable at line 41 is defined but never used
- ViewEventDetailModal.js doesn't have proper role-based permission checks for displaying Edit/Delete buttons

## 🛠️ PATCH (Required)
_Fix details, implementation notes, and blockers._
**Last updated:** 2025-05-10 23:00

- Proposed solution:
  1. Import RoleContext in ViewEventDetailModal.js
  2. Update the permission check to verify the user has the 'RegionalOrganizer' role
  3. Update the `canEditEvent` check to something like:
     ```javascript
     const { selectedRole } = useContext(RoleContext);
     const canEditEvent = user &&
                          eventDetails?.extendedProps?.ownerOrganizerID &&
                          selectedRole === 'RegionalOrganizer';
     ```
  4. Utilize the existing `editMode` state variable to control when edit/delete buttons appear
  5. Update the JSX to conditionally render buttons based on both role and edit mode:
     ```javascript
     {canEditEvent && editMode && (
       <>
         <Button onClick={handleEditClick} ... > Edit </Button>
         <Button onClick={handleDeleteClick} ... > Delete </Button>
       </>
     )}
     ```
  6. Add logic to determine when to set `editMode` to true

---

## Investigation
- **Initial Trace:**
  - ViewEventDetailModal.js includes Edit and Delete buttons at lines 181-202
  - These buttons are conditionally displayed based on `canEditEvent` variable
  - `canEditEvent` only checks for user existence and ownerOrganizerID, not user role
  - The component has `editMode` state defined, but never actually uses it
- **Confirmed Cause:**
  - Missing role check for EDIT and DELETE options
  - Component doesn't use `RoleContext` to check if user has RegionalOrganizer role
  - The modal doesn't properly distinguish between view and edit modes
- **Relevant Files:**
  - src/app/components/Modals/ViewEvents/ViewEventDetailModal.js - Main component to modify
  - src/app/contexts/RoleContext.js - Provides current user role information
  - src/app/hooks/useEvents.js - Contains event permission logic

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