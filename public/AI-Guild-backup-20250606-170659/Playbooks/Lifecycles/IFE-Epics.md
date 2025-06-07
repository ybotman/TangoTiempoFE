# Epic System - Large Effort, Multi-Phase, Multi-Branch Process

> **IFE Epic Document**  
> This document is the single source of truth for all actions, decisions, and status updates related to this Epic.  
> All Guild roles must update their own section below, using their role icon and a datetime stamp.  
> All assignments, findings, and technical notes must be recorded here by the responsible role.  
>  
> Epics are always **phased** and **heavily documented**.  
> Epics may include:  
> - Large refactors (even if functionally equivalent)  
> - Software design changes  
> - Plugin or dependency swaps  
> - Cross-cutting context or folder structure redesigns  
> - Any multi-file, multi-phase, or architectural effort  
>  
> **Every Epic must include architecture diagrams, graphical summaries, or annotated visuals** to ensure broad understanding and continuity across Guild handoffs or "reboots."

---

## Purpose

Epic documents define **large, multi-phase efforts** that drive major platform changes: migrations, retirements, data model shifts, and architectural refactors.  
By definition, an Epic is broken into multiple phases, each with its own branch, work effort, and commit cycle.  
**At any time, work is focused on a single phase branch of the larger Epic.**  
Each phase must be independently completed, reviewed, and merged before the next phase begins.  
**The phased approach ensures broad understanding and continuity, even if the Guild team changes or the project is rebooted.**

---

## Folder Structure

Each Epic lives in its own folder.

| Path                                               | Contents                                       |
|----------------------------------------------------|-----------------------------------------------|
| ` /public/IFE-Tracking/Epics/Current/Epic_<topic>/`   | Active Epic and all related documentation     |
| ` /public/IFE-Tracking/Epics/Completed/Epic_<topic>/` | Completed Epic and all supporting docs, archived |

Inside each Epic folder are documents. Build only the documents you deem necessary based on the scope:

- `Epic_<topic>.md` → Main document  
- Additional supporting files (optional):  
  - `Epic_<topic>_Communication.md`  
  - `Epic_<topic>_Summary.md`  
  - `Epic_<topic>_Approach.md`  
  - `Epic_<topic>_API_Changes.md`  
  - `Epic_<topic>_UI_Changes.md`  

---

## Required Structure for `Epic_<topic>.md`

Each Epic must follow this template:

---

# Epic_<topic>

> **Guidance:**  
> Each Guild role must update its own section below, using its icon and a datetime stamp.  
> The only mandatory roles are:  
> - 🗂️ **KANBAN**: Tracks what must be done, who is assigned, and current status.  
> - 🧭 **SCOUT**: Records research, discoveries, and risks.  
> - 🛠️ **BUILDER / PATCH / TINKER**: Notes implementation details, blockers, and technical choices.  
>  
> All updates, decisions, and recommendations **must** be made in this document, clearly marked by role and timestamp.  
> Add other roles as needed, following the same pattern.  
>  
> **Include at least one architecture diagram, graphical summary, or annotated visual for each Epic and for each major phase.**  
> Store images in the Epic folder and embed them below.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** YYYY-MM-DD HH:mm

- [ ] Example: Assign "Refactor folder structure" to @username

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "Found that plugin X is incompatible with new structure."

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Implementation details, blockers, and technical choices.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was built, how, and any issues encountered._  
**Last updated:** YYYY-MM-DD HH:mm

- Example: "Refactored all context providers into /contexts/, see PR #789."

---

### Architecture & Visuals

_Provide at least one architecture diagram, graphical summary, or annotated visual for this Epic.  
Update or add visuals for each major phase as needed.  
Store images in the Epic folder and embed them here using Markdown:_

```
![System Architecture](./Epic_<topic>_Architecture.png)
```
_or link to a Miro, Lucidchart, or Figma board if preferred._

---

### Summary

High-level purpose and context of this Epic.

### Scope

**Inclusions:**  
- What is covered.

**Exclusions:**  
- What is explicitly not covered.

### Motivation

Why this large, multi-phase effort is being undertaken.

### Changes

Describe the changes needed:  
- Backend  
- Frontend  
- Infrastructure (if any)  
- Database schema  
- API endpoints  

### Risks & Mitigations

| Risk | Mitigation |
|-------|------------|
|       |            |

### Rollback Strategy

Exact steps to revert the changes if needed.

### Dependencies

Other Epics, API versions, systems, or external services this Epic depends on.

### Linked Epics

Cross-references to related or prerequisite Epics.

### Owner

Primary owner (team or individual) responsible for this Epic.

---

### Phases

Each Epic is divided into multiple phases.  
**Each phase:**
- Has its own branch (e.g., `epic/5002-phase-1-db-migration`)
- Is worked on and committed independently
- Must be completed, reviewed, and merged before the next phase starts
- May remove, refactor, or retire existing code as needed
- **All phase-specific actions, decisions, and notes must be recorded in the role sections above and in the phase table below**

#### Example Phase Table

| Phase    | Status         | Branch Name                        | Last Updated | Description                  |
|----------|---------------|------------------------------------|--------------|------------------------------|
| Phase 1  | ✅ Complete    | epic/5002-phase-1-db-migration     | 2025-04-23   | DB schema migration          |
| Phase 2  | 🚧 In Progress | epic/5002-phase-2-api-refactor     | 2025-04-24   | API refactor                 |
| Phase 3  | ⏳ Pending     | epic/5002-phase-3-ui-update        | -            | UI updates                   |

---

### Phase Template

#### Phase N: <Phase Title>

**Goals:**  
- What this phase accomplishes.

**Tasks:**

| Status  | Task                 | Last Updated |
|---------|----------------------|--------------|
| ✅/🚧/⏳/❌ | Specific task description | YYYY-MM-DD   |

**Rollback (if needed):**  
- How to undo this phase if problems occur.

**Notes:**  
- Phase-specific clarifications, side decisions, or extra context.

---

### Rollback (if needed)

Step-by-step instructions for undoing this phase’s changes.

---

### Timeline

| Stage        | Date       |
|--------------|------------|
| Start        | YYYY-MM-DD |
| Deploy       | YYYY-MM-DD |
| Final Review | YYYY-MM-DD |

---

### Status & Next Steps

This centralizes status across all phases.  
Keep this table updated continuously.

| Phase     | Status                                | Next Step             | Last Updated |
|-----------|-------------------------------------|----------------------|--------------|
| Phase 1:  | ✅ Complete / 🚧 In Progress / ⏳ Pending / ❌ Blocked | Short action description | YYYY-MM-DD   |
| Phase 2:  |                                     |                      |              |
| Phase 3:  |                                     |                      |              |
| …         |                                     |                      |              |

✅ No more updating status in multiple places. This is the one source of truth.

---

## Epic Process

1. Create Folder: ` /public/IFE-Tracking/Epics/Current/Epic_<topic>/`  
2. Write `Epic_<topic>.md` following the structure above.  
3. For each phase:
   - Create a dedicated branch for the phase.
   - Work only on that phase branch until complete.
   - Complete, review, and merge before starting the next phase.
4. Optional: Add supporting files (Communication, API changes, etc.).
5. Maintain Status & Next Steps table during active work.
6. When all phases are completed:
   - Move folder to ` /public/IFE-Tracking/Epics/Completed/`
   - Update any cross-Epic references if needed.

---

## Best Practices

- **This document is the authoritative, phased, and heavily documented record for the Epic.**
- **Markdown Only:** All Epics written in `.md` format.  
- **Small, Verifiable Phases:** Each phase should be individually stable and testable.  
- **Clear Status Tracking:** Always update the Status & Next Steps table first.  
- **Linked Documents:** Keep supporting files in the Epic folder itself.  
- **Rollback Plans:** Always be ready to revert safely.  
- **History Friendly:** Every major update should leave a clean audit trail.
- **Each phase may remove, refactor, or retire existing code as needed.**
- **All Guild roles must update their own section, using their icon and a datetime stamp.**

---
