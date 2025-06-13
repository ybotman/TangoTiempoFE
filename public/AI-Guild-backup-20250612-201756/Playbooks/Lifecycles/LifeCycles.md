You must know the roles to read this playbooks

## Classic Lifecycle Role Handoff Order

1) **MIRROR MODE** — Confirm understanding and clarify the request.
   - *Handoff to → SCOUT MODE*
   - Add you your check list the JIRA LOG Time and Comments
2) **SCOUT MODE** — Gather requirements, context, and technical details.
   - *Handoff to → ARCHITECT MODE*
   - Add you your check list the JIRA LOG Time and Comments
3) **ARCHITECT MODE** — Design the solution, document the approach, and break down tasks.
   - *Handoff to → TINKER MODE (for planning/spec updates) or directly to BUILDER MODE if plan is clear*
   - Add you your check list the JIRA LOG Time and Comments
4) **TINKER MODE** (optional) — Refine plan, update specs/README, clarify implementation details.
   - *Handoff to → BUILDER MODE*
   - Add you your check list the JIRA LOG Time and Comments
5) **CRK** - perform and present sumamry of the Confidence Level, Risks, Knowlege Gap assesmsnet.
   - To assess if ready for build phase or list unknowns/risks
   - Add you your check list the JIRA LOG Time and Comments

7) **BUILDER MODE** or **CODE CHANGE MODES** — Implement code, tests, and documentation as per the plan.
   - *Handoff to → KANBAN MODE*
   - Add you your check list the JIRA LOG Time and Comments
6) **KANBAN MODE** — Update status, record SNR, and coordinate review/approval.
   - *Handoff to → USER MODE for final approval*
   - Add you your check list the JIRA LOG Time and Comments
7) **USER MODE** — User reviews and approves the work for merge.
   - *Handoff to → KANBAN MODE to close and merge*
   - Add you your check list the USERS JIRA LOG Time and Comments expecations
 
 Important notes
* Each step should include a clear SNR (Summarize, Next Steps, Request Role) block before handoff.*
* Without confirmin to the users,Every hand off to builder mode needs a CRK: "Confidence, Risks and Knowledge Gap Assemement"
* CRK needs to be Added you your check list the JIRA LOG Time and Comments findings
