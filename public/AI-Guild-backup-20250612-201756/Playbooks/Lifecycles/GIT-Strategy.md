# Git Promotion and CI/CD Strategy for JIRA Management

## 🌐 Environment Promotion Flow


DEVL  → BRANCHES  → DEVL
DEVL → TEST → PROD

---

## 🔧 Assumptions

1. **User Responsibility:** Developers are responsible for placing correct versions into `DEVL` before beginning Jira work.
2. **Explicit Promotion:** Versions do **not** auto-promote. Promotions to `TEST`, or `PROD` require explicit Guild approval and execution.
4. **JIRA :** Jira is the ticket scope tracking system. This is the starting point for any branch work.

---

## 🚧 Git Workflow — DEVL Phase

### 🔹 Strategy
Each Branch is tied to some JIRA Ticket or Group of tickets (eg story or epic etc) is developed in an individual branch created from `DEVL`. All progress is documented in markdown with session-based SNR entries.

---

### 🔁 Workflow Steps

| Step | Description |
|------|-------------|
| 1. | Confirm current branch is `DEVL`. Abort if not. |
| 2. | If working on an existing I/F/E, checkout the corresponding branch. |
| 3. | For new work, assign a number and create a new branch: based on JIRA Tickets
| 4. | Initial commit includes the creation or update of I/F/E tracking markdown. |
| 5. | Code in small commits. After each session, record an SNR (Summarize, Next, Role). |
| 6. | Run ESLint: `npm run lint` |
| 7. | Run Build: `npm run build` |
| 8. | Run Locally: `npm run dev` |
| 9. | Request final review and approval. |
| 10. | Upon approval, merge into `DEVL`. |
| 11. | Delete the working branch after successful merge. |
| 12. | AI Guild logs the merge event under `~/Proctions/DEVL/merge-<timestamp>.md` with all Issue/Feature/Epic refs. |

---

### 🏷 Branch Naming Conventions
TYPE|JIRA-NUMBER|ShortDesc(CamelCased)
<EPIC><STORY><TASK>... | <TIEMPO-23> | ViewEventVenueDisplay
---

## ✅ Merge Requirements (into DEVL)

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
Check DEVL Branch
↓
Create/Checkout I/F/E Branch
↓
Initial Commit (I/F/E doc)
↓
Code + SNRs
↓
Lint → Build → Dev Run
↓
Final Review
↓
Merge into DEVL
↓
Delete Branch

```

---

## 📌 Next Phase Work

- Define TEST Promotion Rules (DEVL → TEST)
- Add GitHub Action for enforcing lint/build prior to merges (optional)

---

✅ Always verify you are on the correct branch  
✅ Always pass lint, build, and local dev run before merge  
✅ Always maintain SNR documentation in markdown  

🔐 Guild Rules Implied and Enforced:

[DEV Work: Local Branches from DEVL]
       ↓
[Merge into Local DEVL]  ← Guild merges
       ↓
[Push Local DEVL to origin/DEVL]
       ↓
[Guild merges DEVL → origin/TEST] (remote only)
       ↓
[Guild merges TEST → origin/PROD] (remote only)
       ↓
[Guild logs summary in ~/Proctions/ENV/;merge-*.md]

---
## General GIT rules
- We do NOT udpate directly in PROD or TEST or even origin DEVL without approval.  You must ask to do these update here
- We do NOT have local TEST and PROD.  OUr only full env are Local DEVL (and update branches), and origin DEVL, TEST, PROD.
- Promotion is always a GitHub push to remote origin/TEST or origin/PROD, using explicit, documented merge.
- Merge events are the only mechanism by which code moves forward.
- Guild logs the merge summary in ~/Proctions/ENV/, not in the remote repo itself — ensuring this is tracked separately from code.
- Guild works in local DEVL branch only OR the IFE branch. 
- No local work is done in TEST or PROD.



*Maintained under: `/public/readmes/Git_Strategy.md`*
```
