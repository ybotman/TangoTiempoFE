# FEATURE_<topic>

## Overview
Features are **net-new capabilities** added to the application, enhancing existing workflows, user interfaces, or system behavior **without changing the core architecture or infrastructure**.

Feature documents ("FEATUREs") are not for infrastructure changes, data migrations, or system retirements—those belong in PMRs. Instead, they represent product or experience-level functionality that is self-contained, testable, and deployable independently.

## Directory Structure
- Active work: `/public/feature/current/FEATURE_<topic>.md`
- Completed work: `/public/feature/completed/FEATURE_<topic>.md`

Feature documents do **not** require phased rollout planning like PMRs but do include clear task breakdown, rationale, dependencies, and references.

---

## Template Structure

# FEATURE_<topic>

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
- Keep features self-contained and verifiable
- Avoid scope creep — create a new FEATURE doc if needed
- Write in Markdown
- Store all supporting assets in same folder as feature
- Update task statuses frequently
- Finalize by moving to `/feature/completed` when live

---

Would you like me to auto-create the folder structure and first FEATURE doc for a topic now? ✅

