# Issue / Feature / PMR (I/F/P) Naming Conventions and Git Policy

## Overview
This document defines the **naming conventions**, **branching structure**, and **basic summary rules** for managing Issues, Features, and PMRs (Plan Migration and Retirement documents) inside the Master Calendar system.

It aligns with the Git promotion and CICD policy and ensures consistent handling, traceability, and high-quality version control across DEVL, TEST, INTG, and PROD environments.

---

## Core Concepts
- **I/F/P (Issue, Feature, PMR):**
  - **Issues:** Bug fixes, small improvements. Numbered from 1000+.
  - **Features:** Net-new capabilities or enhancements. Numbered from 3000+.
  - **PMRs:** Architectural changes, migrations, or major refactors. Numbered from 5000+.
- **Sequential Numbering:** Each new I/F/P gets the next available number.
- **Git Enforcement:** All I/F/Ps are managed via Git branches, commits, and PRs.

---

## Naming Conventions

### 1. Branch Naming
| Type | Format | Example |
|:-----|:-------|:--------|
| Issue | `issue/{number}-{short-description}` | `issue/1022-user-name-blank` |
| Feature | `feature/{number}-{short-description}` | `feature/3018-add-user-latlong-to-vendor` |
| PMR | `pmr/{number}-{short-description}` | `pmr/5002-refactor-large-js` |

- **Lowercase only**
- **Hyphens (-) instead of spaces**
- **Short description** (under 8 words)

---

### 2. I/F/P Document Naming
| Type | Folder | Format | Example |
|:-----|:-------|:-------|:--------|
| Issue | `/public/issues/current/` | `Issue_1022_UserNameBlank.md` |
| Feature | `/public/features/current/` | `Feature_3018_AddUserLatLongVendor.md` |
| PMR | `/public/pmr/PMR_Current/` | `PMR_5002_RefactorLargeJs.md` |

- **CamelCase** after the numeric prefix.
- **Prefix** with `Issue_`, `Feature_`, or `PMR_`.

---

## Git Policy for I/F/P

| Rule | Details |
|:-----|:--------|
| Start from DEVL | All new work must start by branching off from the `DEVL` branch. |
| No direct commits | Never commit directly to `DEVL`, `TEST`, `INTG`, or `PROD`. |
| Branch Per I/F/P | Every Issue, Feature, or PMR must have its own Git branch. |
| First Commit | Must include creation or update of the related I/F/P markdown document. |
| SNR Sessions | After each work session, a SNR (Summarize, Next Steps, Role) must be recorded. |
| Lint & Build | All work must pass `npm run lint`, `npm run build`, and successful `npm run dev` before merge. |
| Merge Strategy | Complete the branch and merge it into `DEVL` only after validation and final user confirmation. |
| Deletion | Delete the branch after successful merge unless otherwise instructed. |

---

## Example Full Lifecycle (Summary)

```plaintext
1. Confirm on DEVL branch.
2. Create new branch: feature/3018-add-user-latlong-to-vendor.
3. First commit: Create Feature_3018_AddUserLatLongVendor.md.
4. Develop incrementally with SNR sessions.
5. Pass lint, build, and run checks.
6. Request merge into DEVL.
7. Merge after review.
8. Delete branch after merge.
```

---

## Best Practices
- Keep I/F/P titles **short, clear, and functional**.
- Always sync your local `DEVL` before starting a new I/F/P.
- Document assumptions and blockers clearly inside the markdown file if needed.
- Maintain high branch hygiene: finish, merge, delete.

---

# End of I/F/P Naming and Git Policy Guide

*Maintained under `/public/readmes/IFP_Strategy.md`*.

