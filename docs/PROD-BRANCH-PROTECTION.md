# PROD Branch Protection Strategy

> **Purpose**: Prevent accidental deployments to production while allowing AI team to work freely on DEVL/TEST.

## Overview

```
DEVL ──(free)──→ TEST ──(free)──→ PROD
                                    │
                              🔒 Human Gate
                              (PR + Approval)
```

| Branch | Push Rights | Deploy Trigger |
|--------|-------------|----------------|
| **DEVL** | AI + Human | Auto on push |
| **TEST** | AI + Human | Auto on push |
| **PROD** | PR only | Manual (recommended) |

---

## GitHub Branch Protection Rules

### Setup Command

```bash
gh api repos/ybotman/tangotiempo.com/branches/PROD/protection -X PUT \
  --input - <<'EOF'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "enforce_admins": true,
  "required_status_checks": null,
  "restrictions": null
}
EOF
```

### What Each Setting Does

| Setting | Value | Effect |
|---------|-------|--------|
| `required_approving_review_count` | 1 | One human must click "Approve" |
| `dismiss_stale_reviews` | true | New commits invalidate old approvals |
| `enforce_admins` | true | Even repo admins must use PR workflow |
| `restrictions` | null | Anyone can create PR, but merge requires approval |

---

## Workflow to PROD

### Step 1: Create PR
```bash
gh pr create --base PROD --head TEST --title "Release 1.20.6 to PROD"
```

### Step 2: Human Reviews
- Go to GitHub PR page
- Click **Files changed** tab
- Review the diff
- Click **Review changes** → **Approve** → **Submit review**

### Step 3: Merge
- **Merge pull request** button becomes green
- Click to merge
- Vercel auto-deploys (or manual trigger if workflow_dispatch)

---

## Optional: Two-Gate System

For maximum protection, combine branch protection with manual deployment:

```
Gate 1: Branch Protection
├── PR required
├── 1 approval required
└── Merge blocked until approved

Gate 2: Deployment Protection
├── GitHub Actions: workflow_dispatch only
└── Vercel: Require manual "Promote to Production"
```

### GitHub Actions workflow_dispatch

In `.github/workflows/deploy-prod.yml`:
```yaml
on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      confirm:
        description: 'Type DEPLOY to confirm'
        required: true
```

---

## Repositories to Protect

| Repo | Branch | Status |
|------|--------|--------|
| `tangotiempo.com` | PROD | Pending setup |
| `harmonyjunction.org` | PROD | Pending setup |
| `calendar-be-af` | PROD | Pending setup |

---

## Rollback Plan

If bad code reaches PROD:

1. **Revert PR**: Create PR reverting the bad commit
2. **Fast-track approval**: Human approves immediately
3. **Merge**: PROD reverts to previous state

Or via Vercel:
1. Go to Vercel Dashboard → Deployments
2. Find last good deployment
3. Click **Promote to Production**

---

## FAQ

**Q: Can AI agents still work autonomously?**
A: Yes, on DEVL and TEST. Only PROD requires human approval.

**Q: What if I need emergency PROD fix?**
A: Create PR, approve it yourself, merge. Takes 30 seconds.

**Q: Can I bypass the protection?**
A: No, `enforce_admins: true` means even you must use PR workflow.

**Q: What about force push?**
A: Blocked by default with branch protection enabled.

---

## Implementation Checklist

- [ ] Run branch protection command for `tangotiempo.com`
- [ ] Run branch protection command for `harmonyjunction.org`
- [ ] Run branch protection command for `calendar-be-af`
- [ ] Update GitHub Actions to `workflow_dispatch` (optional)
- [ ] Document in team CLAUDE.md files
- [ ] Test: Attempt direct push to PROD (should fail)
- [ ] Test: Create PR, approve, merge (should succeed)
