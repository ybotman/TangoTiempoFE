Here’s the refined version of your PMR system documentation, explicitly incorporating your new requirement that Phases are top-level sections (# Phase N: Title), each task within a phase has a status, and status updates are dated for audit and tracking.

⸻

Plan Migration and Retirement (PMRs)

Overview

Plan Migration and Retirement (PMRs) are documents that define and track architectural changes, platform migrations, and deprecation or retirement of systems. Each PMR captures a phased plan of work that ensures stability, testing at every step, and clear rollback paths.

As a systems migration and planning assistant, your role is to generate PMR_<topic>.md files used by engineering teams to plan, track, and document changes across the system. These PMRs live in:
	•	/public/PMR_Current/PMR_<topic>.md during active work
	•	/public/PMR_Completed/ once finalized

Purpose

PMRs provide:
	•	Clear documentation of platform changes
	•	Technical rationale behind architectural decisions
	•	Implementation details for engineering teams
	•	Risk assessments and mitigations
	•	Rollback instructions
	•	A historical reference for audits or future modifications

⸻

Template Structure

Each PMR follows the standardized structure below.

# PMR_<topic>

## Summary
High-level overview of the migration or retirement.

## Scope
What this change affects (inclusions) and what it explicitly does not (exclusions).

## Motivation
The problem or reason this PMR addresses (e.g., tech debt, upgrade, consolidation).

## Changes
- **Backend:** <short summary>
- **Frontend:** <short summary>
- **Infrastructure:** <short summary>
- Any other relevant change groups.

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Example: Data loss during transfer | Use backup + dry run validation |

## Rollback Strategy
If rollback is required, provide exact steps and who performs them.

## Dependencies
- APIs, database versions, libraries, feature flags, etc.
- Any third-party services required

## Linked PMRs
- Backend: http://localhost:3010/public/...
- TangoTiempo: http://localhost:3001/public/...
- HarmonyJunction: http://localhost:3002/public/...
- CalOps: http://localhost:3003/public/...

## Owner
Who owns this migration (team or individual)

## Timeline
this is NOT a precition timeline but rather the phased updated actuals timelines
- Start: YYYY-MM-DD
- Deploy: YYYY-MM-DD
- Final Review: YYYY-MM-DD

## Post-Migration Tasks
Cleanup, monitoring setup, verification scripts, etc.



⸻

🔄 Phase Execution Format

Every PMR must include top-level sections for each Phase as follows:

# Phase 1: <Title>

### Goals
Brief description of what this phase will accomplish.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Migrate DB schema | ✅ Complete | 2025-04-23 |
| Deploy staging API | 🚧 In Progress | 2025-04-23 |
| Run integration tests | ⏳ Pending | -

### Rollback (if needed)
Step-by-step instructions for undoing this phase’s changes.

### Notes
Any clarifying context or decisions specific to this phase.

Use clear status indicators:
	•	✅ Complete
	•	🚧 In Progress
	•	⏳ Pending
	•	❌ Blocked
	•	🔁 Rolled Back

Each update to task status must be dated under the “Last Updated” column.

⸻

Creating a New PMR
	1.	Create PMR_<topic>.md in /public/PMR_Current/
	2.	Use the structure and phase template above
	3.	Include all relevant technical details and assumptions
	4.	Keep rollback and risk sections clear
	5.	Include all linked PMRs if dependencies exist
	6.	Submit for stakeholder review before starting implementation

⸻

Best Practices
	•	Write in Markdown with structured clarity
	•	Only include facts; note assumptions clearly
	•	Treat each phase as independently verifiable
	•	Keep phases small, reversible, and safe
	•	Maintain an audit-friendly history via task updates

⸻

Let me know if you want this exported as a markdown boilerplate or scaffolded into your /public/PMR_Current/ folder.