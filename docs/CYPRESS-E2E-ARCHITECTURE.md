# Cypress E2E Testing Architecture - TIEMPO-303

**Last Updated:** October 1, 2025

---

## Environment Architecture

### DEVL LOCAL (Developer Machine)
**Purpose:** Local development and testing

- **Frontend:** `localhost:3001` (Next.js dev server)
- **Backend:** `localhost:3010` (local API server)
- **MongoDB:** TEST MongoDB (remote, via backend connection)
- **Use Case:** Developer writes code and tests locally

### DEVL Branch (GitHub Actions CI/CD)
**Purpose:** Automated E2E testing on feature branches

- **Frontend:** `npm run dev` in GitHub Actions runner (`localhost:3001`)
- **Backend:** Azure TEST backend
  `https://calendarbe-test-bpg5caaqg5chbndu.eastus-01.azurewebsites.net/api`
- **MongoDB:** TEST MongoDB (via Azure TEST backend)
- **Environment:** GitHub **TESTING** environment (provides secrets/variables)
- **Test Reports:** Deployed to GitHub Pages
  `https://ybotman.github.io/tangotiempo.com/devl-reports/`
- **⚠️ NO Vercel Deployment** - Frontend runs only in GitHub Actions runner

### TEST Branch (Vercel + Azure)
**Purpose:** Pre-production testing environment

- **Frontend:** Vercel deployment → `https://test.tangotiempo.com`
- **Backend:** Azure TEST backend
  `https://calendarbe-test-bpg5caaqg5chbndu.eastus-01.azurewebsites.net/api`
- **MongoDB:** TEST MongoDB (via Azure TEST backend)
- **Test Reports:** Deployed to GitHub Pages
  `https://ybotman.github.io/tangotiempo.com/test-reports/`
- **Trigger:** Automatic on push to TEST branch

### PROD Branch (Vercel + Azure)
**Purpose:** Production environment

- **Frontend:** Vercel deployment → `https://tangotiempo.com`
- **Backend:** Azure PROD backend
  `https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net/api`
- **MongoDB:** PROD MongoDB (via Azure PROD backend)
- **Test Reports:** Smoke tests deployed to GitHub Pages
  `https://ybotman.github.io/tangotiempo.com/prod-reports/`
- **Trigger:** Automatic on push to PROD branch

---

## Git Branch Workflow

```
DEVL (feature branches)
  ↓
  → GitHub Actions CI/CD (runs Cypress, deploys reports to GitHub Pages)
  → Merge to TEST when ready

TEST (pre-production)
  ↓
  → Vercel deployment to test.tangotiempo.com
  → GitHub Actions CI/CD (runs Cypress against Vercel deployment)
  → Merge to PROD when validated

PROD (production)
  ↓
  → Vercel deployment to tangotiempo.com
  → GitHub Actions smoke tests
```

---

## Vercel Configuration

### Current Issue (as of 2025-10-01)
Vercel was deploying DEVL branch, sending `deployment_status` webhooks that triggered TEST workflow repeatedly.

### Solution Options

#### Option A: vercel.json (Recommended for code-based config)
**File:** `/vercel.json`
```json
{
  "git": {
    "deploymentEnabled": {
      "DEVL": false,
      "TEST": true,
      "PROD": true
    }
  }
}
```

**How it works:**
- Must be merged to TEST and PROD branches (not just DEVL)
- Vercel reads config from branch being deployed
- Globally disables DEVL deployments for the project

**Steps:**
1. Create `vercel.json` on DEVL branch ✅ (done)
2. Merge DEVL → TEST (brings vercel.json to TEST)
3. Merge TEST → PROD (brings vercel.json to PROD)
4. Vercel will respect the config and skip DEVL deployments

#### Option B: Ignored Build Step Command (Recommended for dashboard config)
**Location:** Vercel Dashboard → Project Settings → Git → Ignored Build Step

**Command:**
```bash
if [ "$VERCEL_GIT_COMMIT_REF" == "DEVL" ]; then exit 0; else exit 1; fi
```

**How it works:**
- Runs BEFORE every build attempt
- Exit code `0` = SKIP build (no deployment)
- Exit code `1` = BUILD (proceed with deployment)
- Checks branch name and skips if DEVL

**Alternative (whitelist approach):**
```bash
if [ "$VERCEL_GIT_COMMIT_REF" == "TEST" ] || [ "$VERCEL_GIT_COMMIT_REF" == "PROD" ]; then exit 1; else exit 0; fi
```

**Steps:**
1. Go to Vercel Dashboard
2. Select tangotiempo.com project
3. Settings → Git → Ignored Build Step
4. Paste command above
5. Save

---

## GitHub Actions Workflows

### `.github/workflows/cypress-e2e-devl.yml`
**Triggers:** Push to DEVL branch
**Runs:**
1. Checkout code
2. Install dependencies
3. Start `npm run dev` in background
4. Wait for localhost:3001
5. Run Cypress tests against localhost:3001
6. Generate Mochawesome HTML report with inline screenshots
7. Deploy report to GitHub Pages (`devl-reports/`)
8. Post commit comment with report link

**Key Configuration:**
- `baseUrl: http://localhost:3001`
- Backend: Azure TEST (via env vars)
- Environment: GitHub TESTING
- No Vercel deployment

### `.github/workflows/cypress-e2e-test.yml`
**Triggers:**
- Push to TEST branch
- `deployment_status` webhook (Vercel deployments)

**Runs:**
1. Wait for Vercel deployment to complete
2. Run Cypress tests against `https://test.tangotiempo.com`
3. Generate Mochawesome report
4. Upload artifacts

**Issue:** Currently triggers on ALL `deployment_status` events including DEVL
**Fix:** Will be resolved when Vercel stops deploying DEVL

### `.github/workflows/deploy-test-reports.yml`
**Triggers:** After TEST or PROD Cypress workflows complete
**Runs:** Downloads test artifacts and deploys to GitHub Pages

**Note:** DEVL was removed from triggers - DEVL deploys its own reports inline

---

## Mochawesome Report Configuration

### package.json scripts
```json
{
  "report:merge": "mochawesome-merge cypress/reports/*.json > cypress/reports/combined-report.json",
  "report:generate": "marge cypress/reports/combined-report.json --reportDir cypress/reports/html --inline --inlineAssets"
}
```

### Key Features
- **`--inline`**: Embeds CSS and JS into single HTML file
- **`--inlineAssets`**: Embeds screenshots as base64 (fixes broken image links)
- **Output:** `cypress/reports/html/combined-report.html`
- **Copy:** `index.html` created as symlink for backward compatibility

### Screenshot Handling
- Screenshots taken on test failure
- Embedded as base64 in HTML report (no external dependencies)
- Deployed with report to GitHub Pages
- No broken links when viewing deployed reports

---

## CI/CD Test User

**Email:** `griffon.dater0g@icloud.com`
**Role:** Admin
**Environment:** TEST only (not PROD)
**GitHub Secret:** `CICD_TEST_PASSWORD` (configured in TESTING environment)

**Security:**
- Password stored only in GitHub Secrets
- Never committed to code
- Used only for automated E2E tests

---

## GitHub Pages Deployment

### Structure
```
https://ybotman.github.io/tangotiempo.com/
├── index.html                    # Root dashboard
├── devl-reports/
│   ├── index.html               # DEVL environment page
│   ├── latest/
│   │   ├── combined-report.html # Latest DEVL report
│   │   └── index.html           # Symlink to combined-report.html
│   └── 2025-10-01/              # Dated archive
│       └── combined-report.html
├── test-reports/
│   ├── index.html               # TEST environment page
│   ├── latest/
│   └── 2025-10-01/
└── prod-reports/
    ├── index.html               # PROD environment page
    ├── latest/
    └── 2025-10-01/
```

### URLs
- **Root Dashboard:** https://ybotman.github.io/tangotiempo.com/
- **DEVL Reports:** https://ybotman.github.io/tangotiempo.com/devl-reports/
- **TEST Reports:** https://ybotman.github.io/tangotiempo.com/test-reports/
- **PROD Reports:** https://ybotman.github.io/tangotiempo.com/prod-reports/

---

## Troubleshooting

### Issue: TEST workflow triggering repeatedly
**Cause:** Vercel deploying DEVL branch, sending deployment_status webhooks
**Solution:** Configure Vercel to ignore DEVL (Option A or B above)

### Issue: Screenshots not showing in reports
**Cause:** Screenshots not embedded, only linked
**Solution:** Added `--inlineAssets` flag to mochawesome (fixed)

### Issue: Report links 404
**Cause:** Links pointed to `index.html` but file was `combined-report.html`
**Solution:** Updated links + create index.html as copy (fixed)

### Issue: YAML workflow validation error line 361
**Cause:** `##` in template literal interpreted as YAML comment
**Solution:** Refactored to array-based string building (fixed)

---

## Related Documentation

- **JIRA Ticket:** [TIEMPO-303](https://hdtsllc.atlassian.net/browse/TIEMPO-303)
- **Configuration Summary:** `docs/TIEMPO-303-CONFIG.md`
- **Phase 1-2 Complete:** `docs/TIEMPO-303-PHASE1-2-COMPLETE.md`
- **GitHub Actions Summary:** `docs/GITHUB_ACTIONS_SUMMARY.md`
- **Cypress Strategy:** `docs/CYPRESS-TESTING-STRATEGY.md`
