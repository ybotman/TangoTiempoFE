# Issue: ESLint Errors Cleanup

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This is a lightweight formal issue log to capture, trace, and resolve multiple ESLint errors across the codebase. It is stored in the `/public/IFE-Tracking/Issues/Current/` folder and will be moved to `/public/IFE-Tracking/Issues/Completed/` upon resolution.

## Details
- **Reported On:** 2025-05-11
- **Reported By:** User
- **Environment:** Local Development
- **Component/Page/API Affected:** Multiple files across the codebase
- **Symptoms:** Multiple ESLint errors preventing clean builds and potentially causing runtime issues

## Steps to Reproduce
1. Run `npm run eslint` in the project root
2. Observe approximately 939 ESLint errors across the codebase

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.
All task assignments and status updates go here._
**Last updated:** 2025-05-11 18:45

- [x] Create issue documentation for ESLint errors cleanup
- [x] Fix ESLint errors in Cypress test files
- [x] Fix unused variables in React components
- [x] Fix unescaped entities errors
- [x] Fix prop validation errors
- [x] Fix context and hook-related ESLint errors
- [x] Fix hook usage rules violations in useEvents.js
- [x] Fix conditional hook calls in GeoLocationContext.js
- [x] Create venueService.js to properly handle venue operations
- [x] Verify all critical ESLint errors are resolved
- [ ] Commit final changes and close issue

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.
Document what was discovered, suspected causes, and open questions._
**Last updated:** 2025-05-11 17:45

- Initial scan showed approximately 939 ESLint errors across codebase
- Main categories of errors that have been addressed:
  - Cypress test files with undefined globals (`cy`, `describe`, `it`, etc.) - FIXED
  - Unused variables in React components - FIXED
  - Unescaped entities in JSX - FIXED
  - Missing prop validations - FIXED
  - Context and hook-related errors - FIXED

- Remaining issues that still need attention:
  - Some remaining unused variables in component files
  - Several React hooks dependency warnings
  - Hook usage rules violations in useEvents.js
  - Various warnings in component files

## 🛠️ PATCH (Required)
_Fix details, implementation notes, and blockers.
Document what was changed, how, and any technical notes._
**Last updated:** 2025-05-11 18:30

- Fixed errors in batches by category:
  1. Cypress test files: Added ESLint environment config to recognize Cypress globals
     - Updated eslint.config.mjs to include specific configuration for Cypress test files
     - Added global definitions for Cypress testing functions (cy, describe, it, etc.)

  2. React component unused variables: Removed unused imports and variables
     - Fixed unused imports in ViewEventDetailModal.js, LocationInfo.js, SiteMenuBar.js
     - Removed unused variables in SidebarDrawer.js, SiteMenuBarUserDrawer.js
     - Cleaned up context-related imports in multiple files

  3. Unescaped entities: Fixed apostrophes in JSX with proper &apos; entities
     - Updated text content in ViewEventDetailsVenueOther.js with proper entities
     - Fixed similar issues in login/signup pages and other components
     - Fixed apostrophe in GeoLocationContextDebug.js

  4. Prop validation errors: Added missing props to PropTypes validation
     - Added fallbackImageUrl to ViewEventDetailModal.js PropTypes
     - Added venue address property to ViewEventDetailsVenueOther.js
     - Added ownerOrganizerName to CreateEventDetailsBasic.js PropTypes

  5. Context and hook-related errors: Added eslint-plugin-react-hooks and fixed dependency issues
     - Installed and configured eslint-plugin-react-hooks in eslint.config.mjs
     - Fixed dependency array issues in GeoLocationContext.js useEffect hooks
     - Fixed dependency arrays in multiple component useEffect and useCallback hooks
     - Created venueService.js to fix Hook usage rule violations in useEvents.js
     - Resolved conditional hook calls in GeoLocationContext.js
     - Fixed unnecessary dependency warnings in useEvents.js and other hooks

- Successfully reduced the ESLint errors and warnings in key application files, particularly:
  - Fully resolved ESLint errors in GeoLocationContext.js
  - Fully resolved ESLint errors in useEvents.js
  - Fixed React hooks dependency warnings throughout the application

---

## Investigation
- **Initial Trace:** Output from `npm run eslint` shows 939 errors
- **Suspected Cause:** Lack of proper ESLint configuration for test files, normal code maintenance issues with unused variables and prop validations
- **Files to Inspect:** 
  - Cypress test files in cypress/e2e directory
  - React components with unused imports
  - Components with prop validation issues
  - Context files with hook dependency issues

## Fix (if known or applied)
- **Status:** ✅ Fixed
- **Fix Description:**
  - Updated ESLint configuration to properly handle Cypress and Jest test files
  - Fixed React component issues including unused variables and imports
  - Properly escaped entities in JSX content
  - Added missing PropTypes validation for component props
  - Added eslint-plugin-react-hooks and fixed dependency array issues
  - Resolved hook usage rule violations in useEvents.js and GeoLocationContext.js
  - Created venueService.js to handle venue operations properly
  - Fixed conditional hook calls and dependency warnings
- **Testing:**
  - Manual testing through ESLint execution
  - Reduced ESLint errors from 939 to less than 40 (mostly warnings in test files)
  - Major error categories have been addressed and fixed
  - Critical application files (GeoLocationContext.js, useEvents.js) are fully ESLint compliant
- **Next Steps:**
  - Continue monitoring ESLint during future development
  - Consider addressing remaining warnings in Cypress test files in a separate task if needed

## Resolution Log
- **Commit/Branch:** `issue/1018-eslint-errors-cleanup`
- **PR:** Not yet created
- **Deployed To:** Not yet deployed
- **Verified By:** Not yet verified
- **Commits:**
  - c15c5a9 Create Issue #1018: ESLint Errors Cleanup
  - 8373d5a Fix ESLint configuration for Cypress and Jest test files
  - 404d59d Fix unused variables in React components
  - 0313cd8 Fix unescaped entities in React components
  - db32105 Fix prop validation errors in React components
  - ebb2035 Fix React Hooks ESLint configuration and errors
  - [Pending commit] Fix hook usage rules in useEvents.js and GeoLocationContext.js

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1018_ESLintErrorsCleanup.md` and move to `/public/IFE-Tracking/Issues/Completed/` when resolved.

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles