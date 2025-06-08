# Issue / Feature / Epic (I/F/E) Naming Conventions and Git Policy

## Overview
This document defines the **naming conventions**, **branching structure**, and **basic summary rules** for managing Issues, Features, and Epics inside the Master Calendar system.

It aligns with the Git promotion and CICD policy and ensures consistent handling, traceability, and high-quality version control across DEVL, TEST, INTG, and PROD environments.

---

## Core Concepts
- **I/F/E (Issue, Feature, Epic):**
  - **Issues:** Bug fixes, small improvements. Numbered from 1001+.
  - **Features:** Net-new capabilities or enhancements. Numbered from 3001+.
  - **Epics:** Large endeavors with architectural changes, migrations, or major refactors. Numbered from 5001+. OFtnen muit phase.

- **Sequential Numbering:** Each new I/F/E gets the next available number.
- **Git Enforcement:** All I/F/Es are managed via Git branches, commits, and PRs.

## you may be ask 
-- if this new tracking item the probem is best fit as an I F or E. Use your best guess.


## when asked to create a new Issue/Feature/Epic
find the maximun number withing the IFE Type and add one. If its the first of the type, the types are numbered accouringly. Issues from 1001, features from 3001, Epics from 5001.

## IFE State
IFE are in 1 state Completed or Current.  The directory tells us this (and the documenation within the ife)

## list IFE
-- when ased to LIST IFE, find all Issues, Features and Epics and list them. Include the state
-- List Issue should return only issues, List feature should return only features, and list Epic should ...

## Naming Conventions

### 1. Branch Naming
| Type   | Format                           | Example                                 |
|:-------|:---------------------------------|:----------------------------------------|
| Issue  | `issue/{number}-{short-description}`  | `issue/1022-user-name-blank`           |
| Feature| `feature/{number}-{short-description}`| `feature/3018-add-user-latlong-to-vendor`|
| Epic   | `epic/{number}-{short-description}`   | `epic/5002-refactor-large-js`          |

- **Lowercase only**
- **Hyphens (-) instead of spaces**
- **Short description** (under 8 words)

---

### 2. I/F/E Document Naming
| Type    | Folder                                      | Format                          | Example                              |
|:--------|:--------------------------------------------|:---------------------------------|:-------------------------------------|
| Issue   | ` /public/IFE-Tracking/Issues/Current/`        | `Issue_1022_UserNameBlank.md`   | ` /public/IFE-Tracking/Issues/Current/Issue_1022_UserNameBlank.md`   |
| Feature | ` /public/IFE-Tracking/Features/Current/`      | `Feature_3018_AddUserLatLongVendor.md` | ` /public/IFE-Tracking/Features/Current/Feature_3018_AddUserLatLongVendor.md` |
| Epic    | ` /public/IFE-Tracking/Epics/Current/`         | `Epic_5002_RefactorLargeJs.md`  | ` /public/IFE-Tracking/Epics/Current/Epic_5002_RefactorLargeJs.md`   |

- **CamelCase** after the numeric prefix.
- **Prefix** with `Issue_`, `Feature_`, or `Epic_`.
- **Move to `/Completed/` folder when finished.**

---

## Git Policy for I/F/E

| Rule | Details |
|:-----|:--------|
| Start from DEVL | All new work must start by branching off from the `DEVL` branch. |
| No direct commits | Never commit directly to `DEVL`, `TEST`, `INTG`, or `PROD`. |
| Branch Per I/F/E | Every Issue, Feature, or Epic must have its own Git branch. |
| First Commit | Must include creation or update of the related I/F/E markdown document. |
| SNR Sessions | After each work session, a SNR (Summarize, Next Steps, Role) must be recorded. |
| Lint & Build | All work must pass `npm run lint`, `npm run build`, and successful `npm run dev` before merge. |
| Merge Strategy | Complete the branch and merge it into `DEVL` only after validation and final user confirmation. |
| Deletion | Delete the branch after successful merge unless otherwise instructed. |

---

## Example Full Lifecycle (Summary) with an IFE

```plaintext
1. Confirm on DEVL branch.
2. Create new branch: feature/3018-add-user-latlong-to-vendor.
3. First commit: Create Feature_3018_AddUserLatLongVendor.md.
4. Develop incrementally with SNR sessions.
5. Pass lint, build, and run checks.
6. Request merge into DEVL.
7. Request to Merge after review.
8. Ask the user if we should Delete branch after merge.
```

---

## Best Practices
- Keep I/F/E titles **short, clear, and functional**.
- Always sync your local `DEVL` before starting a new I/F/E.
- Document assumptions and blockers clearly inside the markdown file if needed.
- TRACK STATUS and actions KANBAM STYLE.
- Maintain high branch hygiene: finish, merge, delete.

---

# End of I/F/E Naming and Git Policy Guide



