Here is the full cleaned version in `.md` format for copy-pasting into your local file (e.g. `public/readmes/Git_Strategy.md`):

---

```md
# Git Promotion and CI/CD Strategy for I/F/E Management

## 🌐 Environment Promotion Flow

```

DEVL  → BRANCHES  → DEVL
DEVL → TEST → INTG → PROD

```

---

## 🔧 Assumptions

1. **User Responsibility:** Developers are responsible for placing correct versions into `DEVL` before beginning I/F/E work.
2. **Explicit Promotion:** Versions do **not** auto-promote. Promotions to `TEST`, `INTG`, or `PROD` require explicit Guild approval and execution.
3. **Numbering Scheme:**
   - Issues: `Issue-1000+`
   - Features: `Feature-3000+`
   - Epics: `Epic-5000+`
4. **New I/F/E Creation:** Triggers the assignment of a new sequential number and title. This is the starting point for any branch work.

---

## 🚧 Git Workflow — DEVL Phase

### 🔹 Strategy
Each **Issue**, **Feature**, or **Epic** is developed in an individual branch created from `DEVL`. All progress is documented in markdown with session-based SNR entries.

---

### 🔁 Workflow Steps

| Step | Description |
|------|-------------|
| 1. | Confirm current branch is `DEVL`. Abort if not. |
| 2. | If working on an existing I/F/E, checkout the corresponding branch. |
| 3. | For new work, assign a number and create a new branch: <br>`issue/1022-title`, `feature/3018-title`, `epic/5002-title` |
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

| Type    | Format                              |
|---------|-------------------------------------|
| Issue   | `issue/1022-user-name-blank`        |
| Feature | `feature/3018-add-user-location`    |
| Epic    | `epic/5002-refactor-auth-service`   |

- Use lowercase only.
- Replace spaces with hyphens.
- Always prefix with `issue/`, `feature/`, or `epic/`.

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

### SNR - YYYY-MM-DD

**S — Summary:**
What was completed this session.

**N — Next Steps:**
What will be tackled next.

**R — Request / Role:**
What help is needed (if any), or who’s responsible next.

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
Guild works in local DEVL branch only.

No local work is done in TEST or PROD.

Promotion is always a GitHub push to remote origin/TEST or origin/PROD, using explicit, documented merge.

Merge events are the only mechanism by which code moves forward.

Guild logs the merge summary in ~/Proctions/ENV/, not in the remote repo itself — ensuring this is tracked separately from code.

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

*Maintained under: `/public/readmes/Git_Strategy.md`*
```
