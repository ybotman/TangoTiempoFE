# FEATURE_<topic>

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## Overview
Features are **net-new capabilities** added to the application, enhancing existing workflows, user interfaces, or system behavior **without changing the core architecture or infrastructure**.

Feature documents ("FEATUREs") are not for infrastructure changes, data migrations, or system retirements—those belong in Epics. Instead, they represent product or experience-level functionality that is self-contained, testable, and deployable independently.

## Directory Structure
- Active work: ` /public/IFE-Tracking/Features/Current/FEATURE_<topic>.md`
- Completed work: ` /public/IFE-Tracking/Features/Completed/FEATURE_<topic>.md`

Feature documents do **not** require phased rollout planning like Epics but do include clear task breakdown, rationale, dependencies, and references.

---

## Template Structure

# FEATURE_<topic>

> **Guidance:**  
> Each Guild role must update its own section below, using its icon and a datetime stamp.  
> The only mandatory roles are:  
> - 🗂️ **KANBAN**: Tracks what must be done, who is assigned, and current status.  
> - 🧭 **SCOUT**: Records research, discoveries, and risks.  
> - 🏛️ **ARCHITECT**: Documents user-approved decisions, technical recommendations, and rationale.  
> - 🛠️ **BUILDER**: Notes implementation details, blockers, and technical choices.  
>  
> All updates, decisions, and recommendations **must** be made in this document, clearly marked by role and timestamp.  
> Add other roles as needed, following the same pattern.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** YYYY-MM-DD HH:mm

- [ ] Example: Assign "Create initial UI component" to @username

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "Found existing library X may help with Y."

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "User approved use of API Z for this feature."

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "Implemented endpoint /api/feature-x, see PR #123."

---

## Summary
One-paragraph description of the new feature and what it introduces into the system.

## Motivation
Explain the reason for this feature:
- Product or UX enhancement
- New capability for a user or admin
- Strategic user experience improvement

## Scope
Describe what this feature does and doesn't cover:
- **In-Scope:** Core functionality and target audience
- **Out-of-Scope:** Related features or areas this does not change

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Pages, modals, components affected                    |
| API        | New endpoints or changes to request patterns          |
| Backend    | Models, data flows, or logic being added (not changed) |
| Integration | Any external services, libraries, or tools used       |

## Design
(Optional) Include link to mockups, MUI sketches, or UX flows.

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Create initial UI component          |               |
| ⏳ Pending      | Build backend endpoint               |               |
| ⏳ Pending      | Wire UI to API                       |               |
| ⏳ Pending      | Write Cypress test for full flow     |               |
| ⏳ Pending      | Final review and push to staging     |               |

Use clear status indicators:
- ✅ Complete
- 🚧 In Progress
- ⏳ Pending
- ❌ Blocked

## Rollback Plan
While features are forward-only, if rollback is required:
- Disable feature toggle (if applicable)
- Revert code branches or PRs
- Restore data if affected

## Dependencies
- APIs or data models
- External libraries or services
- Firebase rules or roles

## Linked Issues / Docs
- Related bug reports or stories (if any)
- Supporting designs or mockups
- Feature-specific docs (e.g., FEATURE_<topic>_Mockups.md)

## Owner
Name or team responsible for delivery.

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | YYYY-MM-DD |
| First Dev | YYYY-MM-DD |
| Review    | YYYY-MM-DD |
| Completed | YYYY-MM-DD |

---

## Best Practices
- This document is the **authoritative record** for all feature-related actions and decisions.
- Each Guild role must update its own section, using its icon and a datetime stamp.
- Keep features self-contained and verifiable
- Avoid scope creep — create a new FEATURE doc if needed
- Write in Markdown
- Store all supporting assets in same folder as feature
- Update task statuses frequently
- Finalize by moving to ` /public/IFE-Tracking/Features/Completed` when live

---
## Git Integration

When starting a new feature:

- If the current branch is `DEVL`, create a new branch called `feature/<title>`.
- Immediately switch to the new `feature/<title>` branch before beginning commits.
- Naming convention for feature branches: all lowercase, hyphens instead of spaces (e.g., `feature/venue-map-selection`).
- Commit frequently, referencing the FEATURE_<topic>.md document.
- Assume I have the backend (:3010) and the one or more, of the frontends (:3003/:3002/:3001) are running. But, you are expected to npm run xxx but you will likely hit the already used port.
- Merge feature branches into `test` only after successful completion and review.


---