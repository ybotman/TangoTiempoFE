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

## Open questions for Quinn arbitration

1. **Sprint 5 spawn ordering:** is the Story 4.1 acceptance "≥3 of 4 in-the-wild code-fault routings" intended to mix BE + FE candidates (e.g., 3 BE + 1 FE, or 2 BE + 2 FE), or are FE candidates additive beyond the 4-spawn baseline?
2. **Fault-class taxonomy alignment:** my FE fault-class names (filter-contract-violation, render-correctness, role-gate, etc.) are derived inductively from the candidates rather than from a shared FE taxonomy. Worth a Quinn-pass to align with the framework's classifier signal vocabulary (api_contract / data_shape / etc. were BE-side; FE equivalents may need their own enumeration in `triage/llm-fallback-prompt.md` v3).
3. **TIEMPO-301 status:** "To Do" not BACKLOG — does this mean it's been triaged for active development by someone? If so, exclude per "not currently being worked" criterion in Number2's original code-fault hunt profile. Need Quinn or Toby ratify before spawning.
4. **Pattern A vs Pattern B for FE Discovery spawns:** all three Tier-1 candidates require some user state (TIEMPO-364 = MapCenter set; TIEMPO-351 = event create / RO role; TIEMPO-301 = RO + existing event). Pattern A E2EUSER + role-elevation-matrix mutators cover all three. Recommend Pattern A as default for Phase D FE spawns per partition isolation; Pattern B reserved for signup-flow UCs only.

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
