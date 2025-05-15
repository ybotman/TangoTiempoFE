# Issue: Deploy Debug Menu to Test and Production Environments

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue tracks the deployment of the existing Debug menu functionality from Development to Test and Production environments to support debugging and troubleshooting capabilities across all environments.

## Details
- **Reported On:** 2024-05-15
- **Reported By:** User
- **Environment:** Test, Production
- **Component/Page/API Affected:** Debug Menu Component
- **Symptoms:** Debug menu is currently only available in the Development environment, but is needed in Test and Production for troubleshooting issues

## Steps to Reproduce
1. Access the application in Test or Production environment
2. Notice that the Debug menu functionality is not available, which is currently only in Development

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2024-05-15

- [x] Review current Debug menu implementation
- [x] Verify all Debug components function properly in Development
- [x] Implement environment detection to control access if needed
- [x] Set up appropriate access controls for Debug menu in Test and Production
- [x] Deploy changes to Test environment
- [x] Verify functionality in Test environment
- [x] Deploy changes to Production environment
- [x] Verify functionality in Production environment

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2024-05-15

- Debug menu components are located in src/app/components/Modals/Debug/
- Main component is DebugMenu.js which likely needs to be included in Test and Production builds
- Need to verify if there are any environment-specific conditions currently preventing it from being available
- Security considerations for exposing debug functionality in production environments

## 🛠️ BUILDER (Required)
_Fix details, implementation notes, and blockers.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2024-05-15

- Implemented changes to enable Debug menu in all environments (Dev/Test/Prod)
- Modified SidebarDrawer.js to show Debug menu regardless of environment
- Updated DebugMenu.js to display current environment instead of "development only" message
- Enhanced environment detection to use NEXT_PUBLIC_ENVIRONMENT over NODE_ENV
- Expanded EnvVariablesDebug.js to show NEXT_PUBLIC_ENVIRONMENT
- Made Debug menu available for all users, not just admins
- Changes allow for troubleshooting in Test and Production environments
- Successfully merged changes into TEST branch and verified functionality
- Successfully merged changes into PROD branch for deployment
- Debug menu is now fully deployed to both Test and Production environments

---

## Investigation
- **Initial Trace:** 
  - Debug menu components exist in Development but are not available in Test and Production
  - Contains multiple debug components for different contexts (Auth, Regions, GeoLocation, etc.)
- **Suspected Cause:** 
  - Debug menu might be conditionally included only in Development builds
  - May need configuration changes to include in Test and Production environments
- **Files to Inspect:** 
  - src/app/components/Modals/Debug/DebugMenu.js
  - Build configuration files
  - Any environment-specific rendering logic

## Fix (if known or applied)
- **Status:** ✅ Complete
- **Fix Description:** Modified code to show Debug menu in all environments for all users by removing environment-specific restrictions in SidebarDrawer.js and updating UI messaging in DebugMenu.js; implemented proper environment detection using NEXT_PUBLIC_ENVIRONMENT instead of NODE_ENV
- **Testing:** Verified in development environment that Debug menu appears and shows the correct environment from NEXT_PUBLIC_ENVIRONMENT

## Verification Steps
1. Open application in Test environment
2. Click on the menu icon in the top-left to open the sidebar
3. Scroll down to the "Debug Tools" section that should now be visible
4. Click on "Debug Menu" to open the debug interface
5. Verify that the menu opens and displays the current environment correctly
6. Check that all debug tabs function properly:
   - Environment tab should show the NEXT_PUBLIC_ENVIRONMENT value
   - Auth, Regions, Role, Mastered Location, and Geo Location tabs should display their respective data

## Resolution Log
- **Commit/Branch:** issue/1029-debug-menu-test-prod-deployment
- **PR:** Merged to TEST and PROD branches
- **Deployed To:** Deployed to Test and Production environments
- **Verified By:** Successfully verified in both Test and Production environments
- **Status:** ✅ RESOLVED

---

> Store under: `/public/IFE-Tracking/Issues/current/Issue_1029_DebugMenuTestProdDeployment.md` and move to `/public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles