You must know the roles to read this playbooks

## Classic Lifecycle Role Handoff Order

1) **MIRROR MODE** — Confirm understanding and clarify the request.
   - *Handoff to → SCOUT MODE*
2) **SCOUT MODE** — Gather requirements, context, and technical details.
   - *Handoff to → ARCHITECT MODE*
3) **ARCHITECT MODE** — Design the solution, document the approach, and break down tasks.
   - *Handoff to → TINKER MODE (for planning/spec updates) or directly to BUILDER MODE if plan is clear*
4) **TINKER MODE** (optional) — Refine plan, update specs/README, clarify implementation details.
   - *Handoff to → BUILDER MODE*
5) **BUILDER MODE** — Implement code, tests, and documentation as per the plan.
   - *Handoff to → KANBAN MODE*


6) **KANBAN MODE** — Update status, record SNR, and coordinate review/approval.
   - *Handoff to → USER MODE for final approval*
7) **USER MODE** — User reviews and approves the work for merge.
   - *Handoff to → KANBAN MODE to close and merge*

Important notes
* Each step should include a clear SNR (Summarize, Next Steps, Request Role) block before handoff.*
* Without confirmin to the users,Every hand off to builder mode needs a "Confidence, Risks and Knowledge Gap Assemement"
