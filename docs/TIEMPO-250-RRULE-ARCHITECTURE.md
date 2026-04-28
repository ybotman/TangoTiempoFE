---
date: 2026-01-05
persona: sarah
type: architecture
state: live
feature: rrule
keywords: [recurrent, events]
appid: 1
niche: tango
app: "[[APP-01-TangoTiempo]]"
audience: all
permanence: long-term
tags: [app/tangotiempo, type/architecture, type/architecture]
---
| 2nd Saturday | FREQ=MONTHLY;BYDAY=2SA | Dec 2025 | Dec 13, 2025 |
| Last Friday | FREQ=MONTHLY;BYDAY=-1FR | Dec 2025 | Dec 26, 2025 |
| 1st Monday | FREQ=MONTHLY;BYDAY=1MO | Dec 2025 | Dec 1, 2025 |
| DST Transition | Weekly across Nov 2/3 2025 | Verify time stays consistent |

**COUNT Mode Tests**:
- Weekly COUNT=4: Should show exactly 4 occurrences
- Monthly COUNT=6: Should show exactly 6 occurrences

**UNTIL Mode Tests**:
- Weekly UNTIL=20251231: Should stop at Dec 31, 2025
- Monthly UNTIL=20260601: Should stop at Jun 1, 2026

## File Changes Summary

| File | Changes | Risk |
|------|---------|------|
| `CreateEventDetailsRepeating.js` | Fix regex, remove disabling code | Low-Medium |
| `transformEvents.js` | Fix BYDAY case, verify DTSTART | Low |
| Tests (if exist) | Add monthly test cases | None |

## Acceptance Criteria

- [ ] Monthly recurrence option enabled in UI
- [ ] 2nd Saturday pattern creates correct RRULE
- [ ] Last Friday pattern creates correct RRULE
- [ ] UNTIL date saves without validation warning
- [ ] COUNT saves correctly
- [ ] Monthly events display on correct days in calendar
- [ ] No console errors for monthly RRULE parsing
- [ ] Weekly recurrence still works (regression check)

## Rollback Plan

If monthly causes issues:
1. Revert MenuItem to `disabled`
2. Re-add early return in handler
3. Monthly was working with weekly as fallback before

## Out of Scope (Deferred)

- All-day event toggle in CREATE modal
- Multi-day festival events (>24 hours)
- International timezone support beyond US
- Individual occurrence modifications (TIEMPO-281)
