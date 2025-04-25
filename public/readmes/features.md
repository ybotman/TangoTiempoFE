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

## Git Integration

When starting a new feature:

- If the current branch is `test`, create a new branch called `feature/<title>`.
- Immediately switch to the new `feature/<title>` branch before beginning commits.
- Naming convention for feature branches: all lowercase, hyphens instead of spaces (e.g., `feature/venue-map-selection`).
- Commit frequently, referencing the FEATURE_<topic>.md document.
- Assume I have the backend (:3010) and the one or more, of the frontends (:3003/:3002/:3001) are running. But, you are expected to npm run xxx but you will like may hit the already used port.
- Merge feature branches into `test` only after successful completion and review.


---
While operating in and on features, it is Very Important to control the interctions:

You must, after each interaction, include a clear SNR block that provides structured closure to the exchange. This includes:

🔷 S — Summarize: Briefly recap what was discussed, built, or solved in this interaction. Keep it concise but informative, focusing on outcomes or decisions made — this gives context continuity.

🟡 N — Next Steps: Clearly outline the immediate next actions, broken down by who’s responsible (e.g., Jax, Ybot, Shared). These should be specific, testable, and ready for follow-through. Treat this as a live to-do list generated from the conversation.

🟩 R — Request / Role: Think about what role best fits the 🟡 N. Then make an offical request for that Role and highly summerize Next Steps are.