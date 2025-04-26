# Git Promotion and CICD Strategy for I/F/P Management

## Environment Flow

```
DEVL --> TEST --> INTG --> PROD
```

## Assumptions
1. **User Responsibility:** It is the user's job to bring the correct version into DEVL before starting an I/F/P (Issue/Feature/PMR) process.
2. **Explicit Promotion:** Versions do **not** automatically promote from one environment to the next. Promotion must be explicitly requested and confirmed.
3. **Numbering Scheme:**
   - Issues: Start at 1000+
   - Features: Start at 3000+
   - PMRs: Start at 5000+
   - Numbers are sequential within their category.
4. **New I/F/P:** Creating a new I/F/P assigns a new incremental number and title.

---

## Git Workflow (DEVL Phase)

### 1. General Strategy
- Each Issue, Feature, or PMR (I/F/P) is developed in its own branch.
- Branch is created **from DEVL**.
- Work is managed and tracked individually via branches and corresponding markdown docs.

### 2. Workflow Steps

| Step | Action |
|:----|:------|
| **1.** | Confirm the current Git branch is `DEVL`. |
| **2.** | If not on `DEVL`, abort with a message: "Not on DEVL, cannot proceed." |
| **3.** | If updating an existing I/F/P, checkout the existing branch. |
| **4.** | If creating a new I/F/P: |
| | ➔ Assign the next number in the correct sequence. |
| | ➔ Create a new branch from DEVL: `issue/1022-title`, `feature/3018-title`, `pmr/5002-title`. |
| **5.** | First commit must contain creation/update of the I/F/P tracking markdown file. |
| **6.** | Develop incrementally, recording an SNR (Summarize, Next Steps, Role) after each working session. |
| **7.** | Run ESLint (`npm run lint`) and fix any errors. |
| **8.** | Run Build (`npm run build`) and verify success. |
| **9.** | Run locally (`npm run dev`) and verify app boots without errors. |
| **10.** | Request final review and approval. |
| **11.** | Upon approval, merge the branch into `DEVL`. |
| **12.** | Delete the feature branch after successful merge. |

---

## Branch Naming Conventions

| Type | Example |
|:-----|:--------|
| Issue | `issue/1022-user-name-blank` |
| Feature | `feature/3018-add-user-latlong-to-vendor` |
| PMR | `pmr/5002-refactor-large-js` |

- Use lowercase letters.
- Replace spaces with hyphens.
- Prefix with `issue/`, `feature/`, or `pmr/`.

---

## Merge Conditions (into DEVL)
- ✅ No ESLint errors.
- ✅ Successful build.
- ✅ Successful local development run.
- ✅ All SNRs properly documented.
- ✅ Final I/F/P update and confirmation.

---

## SNR Protocol (Mandatory after each session)
- **S — Summarize:** What was done in the session.
- **N — Next Steps:** What will be done next.
- **R — Request / Role:** What role or action is now needed.

---

## Visual Summary

```
Start --> Check DEVL Branch --> Create/Checkout I/F/P Branch --> First Commit (doc) --> Code/Develop (SNRs) --> ESLint/Build/Run --> Final Review --> Merge to DEVL --> Delete Branch
```

---

## Next Work
- Define TEST Phase Promotion (from DEVL to TEST)
- Prepare GitHub Action for enforcing ESLint/Build pre-merge (Optional)

---

# End of DEVL Phase Git and CICD Strategy

---

✅ Always verify you are on the correct branch.
✅ Always enforce lint, build, and local runs before merge.
✅ Always track Issues, Features, PMRs via markdown and SNR.

---

*Maintained under `/public/readmes/Git_Strategy.md`*.

