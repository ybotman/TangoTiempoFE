# Issue: Duplicate Privacy Policy Menu Items in Hamburger Menu

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue addresses a UI inconsistency where there are two Privacy Policy options in the hamburger menu. One is labeled "Privacy Policy" and links to the User Settings, while the other is labeled "Privacy Policy Details" and links to the actual Privacy Policy modal.

## Details
- **Reported On:** 2024-05-15
- **Reported By:** User
- **Environment:** All Environments
- **Component/Page/API Affected:** SidebarDrawer.js, Hamburger Menu
- **Symptoms:** Two Privacy Policy menu items in the hamburger menu causing user confusion

## Steps to Reproduce
1. Open the application
2. Click on the hamburger menu icon (☰) in the top left
3. Scroll down to the "Other" section
4. Notice two Privacy Policy related items:
   - "Privacy Policy" (links to User Settings)
   - "Privacy Policy Details" (links to actual Privacy Policy)

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2024-05-15

- [ ] Analyze SidebarDrawer.js to identify the duplicate entries
- [ ] Determine which entry should be kept (Privacy Policy pointing to the Privacy Policy modal)
- [ ] Remove the word "Details" from the menu item text
- [ ] Remove or repurpose the entry pointing to User Settings
- [ ] Test changes to ensure proper functionality
- [ ] Verify fix in all environments

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2024-05-15

- Found two Privacy Policy entries in SidebarDrawer.js (lines 411-432)
- First entry at lines 411-422 labeled "Privacy Policy" redirects to User Settings modal
- Second entry at lines 423-432 labeled "Privacy Policy Details" opens the correct Privacy Policy modal
- The issue seems to be a UI/UX problem that can cause user confusion
- The fix is straightforward with low risk - remove the incorrect entry and rename the correct one

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2024-05-15

- Not started

---

## Investigation
- **Initial Trace:** 
  - SidebarDrawer.js contains two Privacy Policy menu items:
    1. Lines 411-422: "Privacy Policy" links to User Settings
    2. Lines 423-432: "Privacy Policy Details" links to the actual Privacy Policy modal
- **Suspected Cause:** 
  - Likely a copy-paste error or oversight during development
  - The first item incorrectly uses setUserSettingsOpen instead of setPrivacyPolicyOpen
- **Files to Inspect:** 
  - src/app/components/UI/SidebarDrawer.js

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** 
  1. Remove the first Privacy Policy entry (lines 411-422) that points to User Settings
  2. Rename the second entry from "Privacy Policy Details" to just "Privacy Policy"
- **Testing:** 
  - Verify hamburger menu displays only one Privacy Policy item
  - Verify clicking on it opens the correct Privacy Policy modal

## Resolution Log
- **Commit/Branch:** Not created yet
- **PR:** Not created yet
- **Deployed To:** Not deployed yet
- **Verified By:** Not verified yet

---

> Store under: `/public/IFE-Tracking/Issues/current/Issue_1030_DuplicatePrivacyPolicyMenuItems.md` and move to `/public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles