# Merge Event Documentation Standard

This directory contains documentation for all merge events across the TangoTiempo application's development lifecycle. These documents serve as a historical record of changes, provide visibility into the codebase evolution, and help track the deployment of features, fixes, and enhancements through the development pipeline.

## Purpose

- Provide a clear, searchable history of all significant changes
- Document when features were deployed to each environment
- Create transparency for stakeholders about what has been deployed
- Maintain a record of deployment decisions and their rationale
- Supply content for the application's "What's New" feature

## Directory Structure

```
MergeEvents/
├── README.md (this file)
├── DEVL/
│   ├── merge-YYYY-MM-DDThhmm.md
│   └── ...
├── TEST/
│   ├── merge-YYYY-MM-DDThhmm.md
│   └── ...
├── PROD/
│   ├── merge-YYYY-MM-DDThhmm.md
│   └── ...
└── Updates/
    ├── update-YYYY-MM-DD.html
    └── ...
```

- **DEVL**: Contains merge events for changes integrated into the DEVL branch
- **TEST**: Contains merge events for changes promoted from DEVL to TEST
- **PROD**: Contains merge events for changes promoted from TEST to PROD
- **Updates**: Contains HTML summaries of PROD merges for display in the application

## Filename Convention

All merge event files should follow the format:
- `merge-YYYY-MM-DDThhmm.md` (e.g., merge-2025-05-15T1757.md)
- Where:
  - YYYY: Four-digit year
  - MM: Two-digit month
  - DD: Two-digit day
  - T: Literal "T" character to separate date and time
  - hh: Two-digit hour (24-hour format)
  - mm: Two-digit minute

## Merge Document Template

Every merge event document should follow this standard template:

```markdown
# 🔄 Merge Summary – {ENV} – {TIMESTAMP}

**Type:** Merge  
**Source Branch:** {SOURCE_BRANCH}  
**Target Branch:** {TARGET_BRANCH}  
**Initiated By:** {PERSON_OR_TEAM}  
**Timestamp:** {ISO_DATETIME}

---

## 📌 Related Items

---

## 📝 Description

{A CONCISE PARAGRAPH DESCRIBING THE MERGE PURPOSE AND SIGNIFICANCE}

---

## ✅ Status

- Build/Test: ✔ Passed | ⚠ Warnings | ❌ Failed  
- Conflicts: {NONE_OR_RESOLVED_WITH_DESCRIPTION}  
- Post-Merge Action: {ANY_FOLLOW_UP_ACTIONS}

---

## 📦 Impacted Areas

{LIST_OF_KEY_FILES_OR_COMPONENTS_CHANGED}

## User Benefits
- {BULLET_POINTS_OF_USER_FACING_BENEFITS}

## Technical Enhancements
- {BULLET_POINTS_OF_TECHNICAL_IMPROVEMENTS}
```

## HTML Updates Format

The Updates directory contains HTML snippets designed for inclusion in the application's "What's New" feature. These should be consumer-friendly summaries focusing on user benefits rather than technical details.

## Creation Process

1. When merging between branches, create a corresponding merge document
2. Use `git log` and `git diff` to identify changed files and components
3. Reference related IFE tracking items (Issues, Features, Epics)
4. For PROD merges, also create an HTML update for the "What's New" feature
5. Commit the merge document along with any code changes

## Best Practices

1. Be specific about what changed and why it matters
2. Focus on user benefits in consumer-facing descriptions
3. Note any significant technical improvements or architectural changes
4. Include specific IFE item IDs for cross-referencing
5. When listing modified files, prioritize the most significant changes
6. For large merges, group changes by feature or component
7. Document any known issues or follow-up work needed

## Responsibility

Creating merge documentation is the responsibility of the person or team performing the merge. Documentation should be created at the time of the merge to ensure accuracy and completeness.

---

*This standard was established on May 15, 2025, as part of the TangoTiempo Operational Documentation Initiative.*