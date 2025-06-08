# Issue: Google Analytics Undefined ID

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This issue addresses the Google Analytics script failing to load in the production environment due to an undefined ID parameter.

## Details
- **Reported On:** 2025-05-15
- **Reported By:** User
- **Environment:** Production
- **Component/Page/API Affected:** Google Analytics integration
- **Symptoms:** Console error: `GET https://www.googletagmanager.com/gtag/js?id=undefined ERR_BLOCKED_BY_CLIENT`

## Steps to Reproduce
1. Open production environment
2. Open browser dev tools console
3. Observe error: `GET https://www.googletagmanager.com/gtag/js?id=undefined ERR_BLOCKED_BY_CLIENT`

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue._  
**Last updated:** 2025-05-15 

- [x] Identify where Google Analytics ID is configured
- [x] Determine correct GA ID for production environment
- [x] Fix the environment variable name (GA_ID → NEXT_PUBLIC_GA_ID)
- [x] Deploy to production and verify fix resolves the console error

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes._  
**Last updated:** 2025-05-15

- Initial analysis shows the Google Analytics ID is not properly set in the production environment.
- Found the issue: The environment variable in .env.local is defined as `GA_ID`, but the code in src/app/layout.js and src/app/hooks/useGoogleAnalytics.js is looking for `NEXT_PUBLIC_GA_ID`.
- This mismatch causes the ID parameter to be literally "undefined" in the Google Analytics script URL.
- There are two GA implementations: standalone (G-6KGB3S21KH) and Firebase Analytics (G-8DED6NXCJ8).
- The "ERR_BLOCKED_BY_CLIENT" error is secondary to the undefined ID issue and comes from browser ad-blockers.

## 🛠️ PATCH (Required)
_Fix details, implementation notes, and blockers._  
**Last updated:** 2025-05-15

- Implemented fix by renaming the environment variable from `GA_ID` to `NEXT_PUBLIC_GA_ID` in .env.local.
- This change makes the environment variable match what the code is expecting in layout.js and useGoogleAnalytics.js.
- The value remains the same (G-6KGB3S21KH) to maintain the existing Google Analytics configuration.
- This fix should be applied to all environment files (.env.development, .env.production, etc.) to ensure consistency across environments.
- **Note**: The Vercel environment variables for TEST and PROD environments have been updated to use `NEXT_PUBLIC_GA_ID` instead of `GA_ID`.

---

## Investigation
- **Initial Trace:** `GET https://www.googletagmanager.com/gtag/js?id=undefined ERR_BLOCKED_BY_CLIENT`

- **Suspected Cause:** Environment variable naming mismatch - defined as `GA_ID` but the code is looking for `NEXT_PUBLIC_GA_ID`.

- **Files to Inspect:** 
  1. Environment configuration files (.env.local) - found GA_ID=G-6KGB3S21KH
  2. Google Analytics implementation code:
     - src/app/layout.js - uses process.env.NEXT_PUBLIC_GA_ID
     - src/app/hooks/useGoogleAnalytics.js - uses process.env.NEXT_PUBLIC_GA_ID

## Fix (if known or applied)
- **Status:** ✅ Fixed and deployed to all environments
- **Fix Description:** Renamed the environment variable from `GA_ID` to `NEXT_PUBLIC_GA_ID` in .env.local to match what the code expects
- **Testing:** Manual verification in dev/staging environment

## Resolution Log
- **Commit/Branch:** `issue/1033-google-analytics-undefined-id`
- **PR:** Not yet created
- **Deployed To:** TEST and PROD environments
- **Verified By:** User
- **Resolution Date:** 2025-05-15

---

> Store under: `/public/IFE-Tracking/Issues/Current/Issue_1033_GoogleAnalyticsUndefinedId.md` and move to `/public/IFE-Tracking/Issues/Completed/` when resolved.