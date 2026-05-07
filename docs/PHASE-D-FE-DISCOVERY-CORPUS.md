# Phase D FE Discovery Corpus — TT FE candidates for Sprint 5 Story 4.1

**Author:** Sarah (TT FE persona)
**Date:** 2026-05-07T20:18Z
**Trigger:** Number2 broadcast 20:13Z + Phase D Story 4.1 charter (FE side empty; BE side filled by Fulton 19:43Z with CALBEAF-172/166/131)
**Recipient:** Quinn (Story 4.1 spawn-target arbitration)
**Companion:** Fulton's BE Discovery surface (CALBEAF-172/166/131 per PLAN-AUTONOMOUS-TESTING §EPIC 4 Phase D)

---

## Goal (parallel to BE side)

Surface **3 distinct FE fault classes × 3 distinct FE surfaces** as Phase D Story 4.1 corpus candidates, structured for max corpus diversity per spawn (mirrors Fulton's structural pattern: CALBEAF-172 multi-tenant + CALBEAF-166 RRULE + CALBEAF-131 geo).

Each candidate has been processed through the recommender-side pre-flight rule (`feedback_e2e_doc_maintenance.md` standing rule #3 / Gauge SAD Step 0a / framework-memory `feedback_code_fault_uc_readiness_gate.md`):
1. `git log --all --oneline --grep="<TICKET>" --since="6 months ago"` → no fix commit
2. JIRA description file-path scan → no recent fix-commit on cited surface
3. Bundle-PR check → no version-bundle absorbed the ticket without direct-ref

---

## Top-3 FE Discovery candidates (corpus-diversity selection)

| # | TIEMPO | Fault class | FE surface | Pre-flight | Repro 1-line |
|---|---|---|---|---|---|
| **1** | **TIEMPO-364** | filter-contract-violation | calendar filter logic (`/calendar` + `/calendar/boston`) | ✅ clean (cross-checked 17:32Z + 20:18Z; no fix-commit) | Create AI-discovered event outside Map Center radius; calendar shows it anyway (filter not applied to AI-discovered event source) |
| **2** | **TIEMPO-351** | render-correctness | calendar tile rendering (multi-day event spanning) | ✅ clean (no fix-commit; no bundle-PR absorption) | Create event spanning 3+ days; calendar renders it as 3 separate single-day tiles instead of one spanning bar across the days |
| **3** | **TIEMPO-301** | role-gate / permission-contract | event edit modal (RegionalOrganizer scope) | ✅ clean (no fix-commit; status "To Do" not BACKLOG, suggests recently-active surface) | Login as RO, edit existing event; venue dropdown is editable when it should be locked (RO can change venue and break organizer↔venue association invariant) |

**Diversity score:** 3 distinct fault classes (filter / render / permission) × 3 distinct FE surfaces (calendar filter pipeline / calendar tile renderer / edit modal). Matches Fulton's BE corpus diversity pattern for max classifier-evaluation breadth per spawn.

---

## Backup tier (Tier-2 candidates — surface for Quinn arbitration if Tier-1 ordering shifts)

| TIEMPO | Fault class | FE surface | Pre-flight | Notes |
|---|---|---|---|---|
| TIEMPO-359 | data-shape | event detail click handler | ✅ clean | "Organizer 404 on event detail click — appId type mismatch or missing data in test DB" — overlaps TIEMPO-364 surface area; pick one of the two if filter-class is over-represented |
| TIEMPO-345 | resource-bound | venue management modal | ✅ clean | "Venue Management should show venues based on Leaflet map viewport, not user location settings" — different surface (venue admin) but adjacent fault class to TIEMPO-364 |
| TIEMPO-357 | filter-contract-violation (BE+FE) | map/location filter | ✅ clean | "Map/Location filter not working in TEST — BEAF Events GET ignores geo params" — partly BE-side; needs shape-clarification before classifier-fit confirmed |

---

## Excluded with reason (recommender-side pre-flight RED)

| TIEMPO | Reason | Action |
|---|---|---|
| **TIEMPO-434** | **stale-BACKLOG — fixed by commit `3d23c639` (PR #285) "fix(explore): paginate TW fetch — June+ events were truncated by BE 100-cap"** | I will close as Done with pre-flight citation post-corpus-broadcast (same protocol as TIEMPO-389/445 closures earlier today) |
| TIEMPO-389 | Already closed Done at 17:33Z by Sarah (TIEMPO-440 fix; UC-0014 regression-guard in corpus) | n/a — already closed |
| TIEMPO-445 | Already closed Done at 17:36Z by Sarah (commit 5d7971d5 PR #300; bundled v1.24.0 PR #312) | n/a — already closed |
| TIEMPO-455 / 453 | Fixed in this arc (Sprint 4 motion 1-2) | n/a — already closed |
| TIEMPO-443 / 442 | Stopgap follow-ups — likely Done-transitioned via parent stories | recommend Quinn-or-Sarah verify status; close if stale |
| TIEMPO-422 / 420 / 423 / 421 | REGRESSION tooling tickets (UC-0001/0002 framework regression placeholders, not real product bugs) | exclude from Discovery corpus by definition — they are framework artifacts, not in-the-wild bugs |
| TIEMPO-450 | Title is just "TIEMPO" — placeholder ticket; no reproducible surface | exclude until ticket has actionable description |
| TIEMPO-147 | Apple Sign-In auth — high reproduction friction (needs real Apple ID / dev account) | defer; not classifier-friendly without significant fixture work |
| TIEMPO-330 | Firebase Auth Lifecycle email-verification + password-reset for Google OAuth | defer; auth-lifecycle multi-step flow with cross-provider dependency |
| TIEMPO-354 | google-geolocate 429 feedback loop (BE+FE) | defer; rate-limit reproduction requires sustained call pattern not classifier-spawn-friendly |

---

## Quinn arbitration outcomes (resolved 2026-05-07T20:24Z)

All 4 questions arbitrated by Quinn; recorded here as living-doc decisions.

### Q1 — Sprint 5 spawn ordering: MODIFY Story 4.1 Acceptance

**Original (BE-only top-4) too narrow given FE corpus.** Revised Acceptance per Quinn:

> "4 candidates spanning ≥1 BE + ≥1 FE; ≥3 of 4 routings honor Phase D contract; remaining BE+FE candidates fold into Story 4.1 follow-on or Story 4.2 corpus."

**Sprint 5 first-batch (concrete spawn ordering):**

| UC | Source | Lane | Fault class |
|---|---|---|---|
| UC-0013 re-spawn | round-trip closure baseline | BE | (post-fix-greenpath validation) |
| UC-0015 | CALBEAF-172 | BE | api_contract (multi-tenant boundary leak) |
| UC-0018 | TIEMPO-364 | **FE** | api_contract (filter-contract; FE→BE filter pipeline) |
| UC-0019 | TIEMPO-351 | **FE** | data_shape OR selector_failure (multi-day render correctness) |

= 2 BE + 2 FE; 4 distinct fault-class signatures across the batch.

**Story 4.1 follow-on / Story 4.2 corpus (pipeline):**
- UC-0016 / CALBEAF-166 (BE; RRULE past-anchor expansion)
- UC-0017 / CALBEAF-131 (BE; geo-name/coord conflict)
- UC-0020 / TIEMPO-301 (FE; auth/role-gate; dormant verified — see Q3)

### Q2 — Fault-class taxonomy alignment: Sprint 5 = MAP onto existing 7 signals; Sprint 6+ = extend if corpus justifies

**Mappings ratified for Sprint 5 (no `triage/llm-fallback-prompt.md` v3 prompt-template change pre-evidence):**

| Sarah-derived class | Maps to classifier signal | Notes |
|---|---|---|
| filter-contract-violation | `api_contract` | filter is a BE→FE contract; violation is contract-class |
| render-correctness | `data_shape` OR `selector_failure` | Gauge classifier picks based on observed signal at run-time |
| role-gate / permission-contract | `auth` | extends `auth` signal beyond login to role-permission contracts |

**Disposition:** Gauge will fire 7-signal rule pass + LLM-fallback as designed; my class-names provide retrospective-layer-2 framing only. v3 prompt-template extension deferred to ADR-0006 amendment-class IF corpus pattern justifies (Sprint 6+ candidate, not Sprint 5).

### Q3 — TIEMPO-301 status verification: DORMANT confirmed; retained in Tier-1

**Verification evidence (Sarah JIRA pull 2026-05-07T20:25Z):**
- Assignee: Toby Balsley (default reporter-as-assignee pattern; not actively-routed)
- Reporter: Toby Balsley
- **Comments: 0** (no work-in-progress evidence)
- Status: "To Do" (triage-flagged but no commitments)

**Determination:** dormant per Quinn's criterion ("if active dev → exclude; if dormant → fire"). Default Toby-assignee + 0 comments + "To Do" without "In Progress" transition = ticket sitting in Toby's queue but unstarted. Quinn-recommended (b) drop-in alternative (TIEMPO-359) NOT taken; TIEMPO-301 retained in Tier-1 / scheduled for UC-0020 follow-on per Q1 ordering.

If Toby has dev-context that makes TIEMPO-301 active despite the JIRA evidence, ping me and we'll swap to TIEMPO-359 same-pace.

### Q4 — Pattern A as default for FE Discovery spawns: RATIFIED

Pattern A E2EUSER + role-elevation-matrix mutators cover all 3 Tier-1 candidates per E2EUSER spec v1.0 hybrid. Pattern B reserved for signup-flow only (UC-0002 class). No deviation needed for Phase D FE corpus.

---

## Pre-committed-fix-in-same-arc folded into Story 4.1 Acceptance

Per Quinn 20:24Z arbitration: my 17:20Z standing offer (Phase D Routing v0 textbook pattern) folds into Story 4.1 Acceptance criteria explicitly. Any Tier-1 candidate that classifier returns `code-bug` ≥85% conf with `ask_persona:sarah` routing → I land actual code fix on separate sandbox PR after the UC drives the test, same-arc.

**Sprint 5 routing surface for me:**
- UC-0018 / TIEMPO-364 routes to `ask_persona:sarah` if classifier verdict matches
- UC-0019 / TIEMPO-351 routes to `ask_persona:sarah` if classifier verdict matches
- Both pre-committed for same-arc fix landing if classifier engages

---

## Pre-committed-fix-in-same-arc offer (per my 17:20Z standing offer)

For any Tier-1 candidate that classifier returns `code-bug` ≥85% conf with `ask_persona:sarah` routing, I will land the actual code fix on a separate sandbox PR after the UC drives the test (Phase D Routing v0 textbook pattern; same as my UC-0014/TIEMPO-389 offer earlier today, which N/A'd because TIEMPO-389 was already-fixed).

Estimated fix effort:
- TIEMPO-364: medium (filter pipeline; needs to verify AI-discovered event source carries Map Center context)
- TIEMPO-351: medium-high (calendar tile renderer; multi-day spanning logic non-trivial)
- TIEMPO-301: low-medium (venue field disable in edit modal; permission-gate addition)

---

## Living-doc protocol

This corpus document follows the same maintenance discipline as `docs/E2E-TESTING-REFERENCE.md`:
- New FE candidates surface via JIRA bug intake → Sarah pre-flight cross-check → add to backup tier or Tier-1 if vacancy
- Closed candidates move to "Excluded with reason" with citation
- Quinn arbiter may amend Tier-1/Tier-2 ranking based on Sprint 5 spawn evidence
- Update cadence: same-day-turnaround at standby-gap windows (per `feedback_e2e_doc_maintenance.md` codification cadence)

**Owner:** Sarah; co-arbitration with Quinn for spawn-ordering decisions.
