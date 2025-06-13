# Git Promotion and CI/CD Strategy for JIRA Management

## 🌐 Environment Promotion Flow


DEVELOPMENT → BRANCHES → DEVELOPMENT
DEVELOPMENT → TESTING → PRODUCTION
(Branch names as defined in .guild-config)

---

## 🔧 Assumptions

1. **User Responsibility:** Developers are responsible for placing correct versions into the DEVELOPMENT branch (as defined in .guild-config) before beginning Jira work.
2. **Explicit Promotion:** Versions do **not** auto-promote. Promotions to TESTING or PRODUCTION branches require explicit Guild approval and execution.
4. **JIRA :** Jira is the ticket scope tracking system. This is the starting point for any branch work.

---

## 🚧 Git Workflow — DEVELOPMENT Phase

### 🔹 Strategy
Each Branch is tied to some JIRA Ticket or Group of tickets (eg story or epic etc) is developed in an individual branch created from the DEVELOPMENT branch. All progress is documented in markdown with session-based SNR entries.

---

### 🔁 Workflow Steps

| Step | Description |
|------|-------------|
| 1. | Confirm current branch is the DEVELOPMENT branch (as defined in .guild-config). Abort if not. |
| 2. | If working on an existing JIRA ticket, checkout the corresponding branch. |
| 3. | For new work, create a new branch based on JIRA ticket number. |
| 4. | Initial commit includes the creation or update of JIRA tracking markdown. |
| 5. | Code in small commits. After each session, record an SNR (Summarize, Next, Role). |
| 6. | Run ESLint: `npm run lint` |
| 7. | Run Build: `npm run build` |
| 8. | Run Locally: `npm run dev` |
| 9. | Request final review and approval. |
| 10. | Upon approval, merge into the DEVELOPMENT branch. |
| 11. | Delete the working branch after successful merge. |
| 12. | AI Guild logs the merge event under `~/Proctions/DEVELOPMENT/merge-<timestamp>.md` with all JIRA ticket references. |

---

### 🏷 Branch Naming Conventions
TYPE|JIRA-NUMBER|ShortDesc(CamelCased)
<EPIC><STORY><TASK>... | <TIEMPO-23> | ViewEventVenueDisplay
---

## ✅ Merge Requirements (into DEVELOPMENT branch)

- ✔ No ESLint errors.
- ✔ Successful build.
- ✔ Local `npm run dev` test passes.
- ✔ All SNRs documented in markdown.
- ✔ Final summary and markdown confirmation included.

---

## 📓 SNR Protocol (Mandatory)

After every working session, update the tracking markdown file with an **SNR block**:

```

### SNR - YYYY-MM-DD-HH-MM

**S — Summary:**
🔷 S — Summarize: What was completed this session.

**N — Next Steps:**
🟡 N — Next Steps: What will be tackled next.

**R — Request / Role:**
🟩 R — Request / Role: What help is needed (if any), or who’s responsible next.

```

---

## 🧭 Visual Flow Summary

```

Start
↓
Check DEVELOPMENT Branch
↓
Create/Checkout JIRA Branch
↓
Initial Commit (JIRA tracking doc)
↓
Code + SNRs
↓
Lint → Build → Dev Run
↓
Final Review
↓
Merge into DEVELOPMENT
↓
Delete Branch

```

---

## 📌 Next Phase Work

- Define TESTING Promotion Rules (DEVELOPMENT → TESTING)
- Add GitHub Action for enforcing lint/build prior to merges (optional)

---

✅ Always verify you are on the correct branch  
✅ Always pass lint, build, and local dev run before merge  
✅ Always maintain SNR documentation in markdown  

🔐 Guild Rules Implied and Enforced:

[DEV Work: Local Branches from DEVELOPMENT]
       ↓
[Merge into Local DEVELOPMENT]  ← Guild merges
       ↓
[Push Local DEVELOPMENT to origin/DEVELOPMENT]
       ↓
[Guild merges DEVELOPMENT → origin/TESTING] (remote only)
       ↓
[Guild merges TESTING → origin/PRODUCTION] (remote only)
       ↓
[Guild logs summary in ~/Proctions/ENV/;merge-*.md]

---
## General GIT rules
- We do NOT update directly in PRODUCTION or TESTING or even origin DEVELOPMENT without approval. You must ask to do these updates here
- We do NOT have local TESTING and PRODUCTION. Our only full env are Local DEVELOPMENT (and update branches), and origin DEVELOPMENT, TESTING, PRODUCTION.
- Promotion is always a GitHub push to remote origin/TESTING or origin/PRODUCTION, using explicit, documented merge.
- Merge events are the only mechanism by which code moves forward.
- Guild logs the merge summary in ~/Proctions/ENV/, not in the remote repo itself — ensuring this is tracked separately from code.
- Guild works in local DEVELOPMENT branch only OR the JIRA ticket branch. 
- No local work is done in TESTING or PRODUCTION branches.



*Maintained under: `/public/readmes/Git_Strategy.md`*
```
