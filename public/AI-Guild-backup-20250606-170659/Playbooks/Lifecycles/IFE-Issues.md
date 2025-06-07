# Issue: {name}

> **IFE Issue Log**  
> This document is the single source of truth for capturing all actions, findings, and status updates related to this issue.  
> Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All investigation, assignments, and fixes must be recorded here by the responsible role.

## Overview
This is a lightweight formal issue log to capture, trace, and resolve a specific bug. It is stored in the ` /public/IFE-Tracking/Issues/current/` folder and moved to ` /public/IFE-Tracking/Issues/completed/` upon resolution.

## Details
- **Reported On:** [YYYY-MM-DD]
- **Reported By:** [User/System/Test]
- **Environment:** [Local / Dev / Staging / Production]
- **Component/Page/API Affected:** [Describe]
- **Symptoms:** [Briefly describe what is broken or incorrect]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. ...

---

## 🗂️ KANBAN (Required)
_Tracks assignments, status, and workflow for this issue.  
All task assignments and status updates go here._  
**Last updated:** YYYY-MM-DD HH:mm

- [ ] Example: Assign "Investigate error logs" to @username

## 🧭 SCOUT (Required)
_Investigation, findings, and risk notes.  
Document what was discovered, suspected causes, and open questions._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "Error appears only in staging, likely related to config."

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Fix details, implementation notes, and blockers.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was changed, how, and any technical notes._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "Patched null check in ComponentB.jsx, see PR #456."

---

## Investigation
- **Initial Trace:** [Console errors, logs, etc.]
- **Suspected Cause:** [Logic bug, state issue, race condition, etc.]
- **Files to Inspect:** [FileA.js, ComponentB.jsx, etc.]

## Fix (if known or applied)
- **Status:**
Use clear status indicators:
	•	✅ Fixed
	•	🚧 In Progress
	•	⏳ Pending
	•	❌ Blocked
	•	🔁 Rolled Back
	•	⏸️  Deferred
- **Fix Description:** [What changed or needs changing]
- **Testing:** [Manual, U

## Resolution Log
- **Commit/Branch:** `bugfix/[short-title]`
- **PR:** [Link or ID]
- **Deployed To:** [Dev / Staging / Prod]
- **Verified By:** [Tester Name or System]

---

> Store under: ` /public/IFE-Tracking/Issues/current/Issue_<short-title>.md` and move to ` /public/IFE-Tracking/Issues/completed/` when resolved. 

# SNR after interactions
- SNR = Summerize, NextSteps, RequestRoles