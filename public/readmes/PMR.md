# PMR System - New Folder Structure and Process.
# Legacy system do not use

do not use this to build PMR's there is a newwer standard.  THis is leacy historical refreence info only.

---

## Purpose

Plan Migration and Retirement (PMRs) documents capture major platform changes: system migrations, retirements, data model shifts, and major architectural refactors.  
They provide a phased, verifiable, auditable roadmap for implementation.
Note that some old PMR do not follow this docuemnt and we are not retrofillting old ducments to new standards.

This README governs PMRs created after the folder structure update.  
(PMRs before this still live under the legacy system.)

---

## Folder Structure

Each PMR now lives in its own folder.

| Path                                               | Contents                                       |
|----------------------------------------------------|-----------------------------------------------|
| `/public/pmr/PMR_Current/PMR_<topic>/`             | Active PMR and all related documentation      |
| `/public/pmr/PMR_Completed/PMR_<topic>/`           | Completed PMR and all supporting docs, archived |

Inside each PMR folder are documents. Build only the documents you deem necessary based on the scope:

- `PMR_<topic>.md` → Main document  
- Additional supporting files (optional):  
  - `PMR_<topic>_Communication.md`  
  - `PMR_<topic>_Summary.md`  
  - `PMR_<topic>_Approach.md`  
  - `PMR_<topic>_API_Changes.md`  
  - `PMR_<topic>_UI_Changes.md`  

---

## Required Structure for `PMR_<topic>.md`

Each PMR must follow this template:

---

# PMR_<topic>

### Summary

High-level purpose and context of this PMR.

### Scope

**Inclusions:**  
- What is covered.

**Exclusions:**  
- What is explicitly not covered.

### Motivation

Why this migration or retirement is being undertaken.

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

Other PMRs, API versions, systems, or external services this PMR depends on.

### Linked PMRs

Cross-references to related or prerequisite PMRs.

### Owner

Primary owner (team or individual) responsible for this PMR.

---

### Tasks

| Status         | Task                | Last Updated |
|----------------|---------------------|--------------|
| ✅ Complete    | Migrate DB schema   | 2025-04-23   |
| 🚧 In Progress | Deploy staging API  | 2025-04-23   |
| ⏳ Pending     | Run integration tests | -           |

---

### Rollback (if needed)

Step-by-step instructions for undoing this phase’s changes.

---

### Notes

Any clarifying context or decisions specific to this phase.

---

Use clear status indicators:  
- ✅ Complete  
- 🚧 In Progress  
- ⏳ Pending  
- ❌ Blocked  
- 🔁 Rolled Back  
- ⏸️ Deferred  

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

## Phase N:

### Goals

What the phase accomplishes.

### Tasks

| Status  | Task                 | Last Updated |
|---------|----------------------|--------------|
| ✅/🚧/⏳/❌ | Specific task description | YYYY-MM-DD   |

### Rollback (if needed)

How to undo this phase if problems occur.

### Notes

Phase-specific clarifications, side decisions, or extra context.

---

---

## PMR Process

1. Create Folder: `/public/pmr/PMR_Current/PMR_<topic>/`  
2. Write `PMR_<topic>.md` following the structure above.  
3. Optional: Add supporting files (Communication, API changes, etc.).  
4. Maintain Status & Next Steps table during active work.  
5. When completed:  
   - Move folder to `/public/pmr/PMR_Completed/`  
   - Update any cross-PMR references if needed.

---

## Best Practices

- **Markdown Only:** All PMRs written in `.md` format.  
- **Small, Verifiable Phases:** Each phase should be individually stable and testable.  
- **Clear Status Tracking:** Always update the Status & Next Steps table first.  
- **Linked Documents:** Keep supporting files in the PMR folder itself.  
- **Rollback Plans:** Always be ready to revert safely.  
- **History Friendly:** Every major update should leave a clean audit trail.

---

---
While operating in and on PMRs, it is Very Important to control the interctions:

You must, after each interaction, include a clear SNR block that provides structured closure to the exchange. 

🔷 S — Summarize: Briefly recap what was discussed, built, or solved in this interaction. Keep it concise but informative, focusing on outcomes or decisions made — this gives context continuity.

🟡 N — Next Steps: Clearly outline the immediate next actions, broken down by who’s responsible (e.g., Jax, Ybot, Shared). These should be specific, testable, and ready for follow-through. Treat this as a live to-do list generated from the conversation.

🟩 R — Request / Role: Think about what role best fits the 🟡 N. Then make an offical request for that Role and highly summerize Next Steps are..