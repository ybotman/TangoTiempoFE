# Issue: Facebook and Google Cannot Login with Same Email on Firebase

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This is a formal issue log to capture, trace, and resolve an authentication bug where a user cannot use both Facebook and Google authentication with the same email address.

## Details
- **Reported On:** 2024-05-15
- **Reported By:** User
- **Environment:** TEST
- **Component/Page/API Affected:** Authentication system, Facebook/Google login
- **Symptoms:** Facebook Firebase authentication fails with error "auth/account-exists-with-different-credential" when trying to log in using an email already registered with Google

## Steps to Reproduce
1. Create/use an account with Google authentication
2. Attempt to log in using Facebook authentication with the same email
3. Authentication fails with console error: "FirebaseError: Firebase: Error (auth/account-exists-with-different-credential)"

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** 2024-05-15

- [ ] Investigate Firebase authentication credential conflict
- [ ] Research Firebase methods for linking authentication providers
- [ ] Design solution for account linking or user notification
- [ ] Implement resolution
- [ ] Verify fix in TEST environment

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** 2024-05-15

- Error "auth/account-exists-with-different-credential" occurs when Firebase detects the same email address being used with different authentication providers
- This is a security feature of Firebase to prevent account takeovers
- Need to implement account linking functionality to allow users to use multiple sign-in methods

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** 2024-05-15

- Not started

---

## Investigation
- **Initial Trace:** 
```
Error in authenticateWithFacebook: FirebaseError: Firebase: Error (auth/account-exists-with-different-credential).
    at v (0d36cfa1-8de6cc42e768b6d0.js:1:1351)
    at f (0d36cfa1-8de6cc42e768b6d0.js:1:917)
    at U (0d36cfa1-8de6cc42e768b6d0.js:1:7923)
    at A (0d36cfa1-8de6cc42e768b6d0.js:1:6675)
    at async N (0d36cfa1-8de6cc42e768b6d0.js:1:7224)
    at async tn (0d36cfa1-8de6cc42e768b6d0.js:1:52864)
    at async tX.onAuthEvent (0d36cfa1-8de6cc42e768b6d0.js:1:70414)
```
- **Suspected Cause:** 
  1. Firebase security constraints prevent using the same email with multiple providers
  2. Need to implement account linking functionality to handle this case
  3. Missing error handling for credential conflicts
- **Files to Inspect:** 
  - Authentication implementation code
  - Firebase configuration and authentication handling

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** TBD - Likely requires implementing provider account linking or proper error handling and user guidance
- **Testing:** TBD

## Resolution Log
- **Commit/Branch:** Not created yet
- **PR:** Not created yet
- **Deployed To:** Not deployed yet
- **Verified By:** Not verified yet

---

> Store under: `/public/IFE-Tracking/Issues/current/Issue_1028_FacebookGoogleSameEmailAuthConflict.md` and move to `/public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summarize, NextSteps, RequestRoles