# TIEMPO-303 Configuration Summary

**Ticket:** [TIEMPO-303](https://hdtsllc.atlassian.net/browse/TIEMPO-303)
**Title:** Test Results Dashboard with Auto-Bug Creation
**Date:** October 1, 2025

---

## 🏗️ Infrastructure Architecture

### Git Branches
- **DEVL** - Development branch (runs E2E tests in GitHub Actions)
- **TEST** - Test environment branch (deploys to Vercel test.tangotiempo.com)
- **PROD** - Production branch (deploys to Vercel tangotiempo.com)

### GitHub Environments
- **TESTING** - Used by DEVL and TEST branches for secrets/variables
- **PRODUCTION** - Used by PROD branch
- **INTEGRATION** - Not currently used

### Frontend Deployments (Vercel)
- **test.tangotiempo.com** - Deployed from TEST branch
- **tangotiempo.com** - Deployed from PROD branch
- **DEVL branch** - NO Vercel deployment (runs locally in GitHub Actions)

### Backend APIs (Azure)
- **TEST Backend:** `https://calendarbe-test-bpg5caaqg5chbndu.eastus-01.azurewebsites.net/api`
- **PROD Backend:** `https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net/api`

### E2E Testing Strategy
- **DEVL Workflow:** Runs `npm run dev` inside GitHub Actions runner
  - Frontend: `http://localhost:3001` (GitHub Actions runner)
  - Backend: Azure TEST backend
  - Environment: TESTING (GitHub environment)
  - **CORS Consideration:** Backend may need to allow GitHub Actions IPs

- **TEST Workflow:** Tests against deployed Vercel TEST site
  - Frontend: `https://test.tangotiempo.com`
  - Backend: Azure TEST backend

- **PROD Workflow:** Smoke tests against production
  - Frontend: `https://tangotiempo.com`
  - Backend: Azure PROD backend

---

## ✅ Configuration Complete

### GitHub Repository
- **Organization:** `ybotman`
- **Repository:** `tangotiempo.com`
- **GitHub URL:** https://github.com/ybotman/tangotiempo.com
- **GitHub Pages URL:** `https://ybotman.github.io/tangotiempo/test-reports`

### CI/CD Test User (TEST Environment Only)
- **Email:** `griffon.dater0g@icloud.com`
- **Role:** Admin
- **Environment:** TEST (NOT PROD)
- **GitHub Secret:** `CICD_TEST_PASSWORD` ✅ Configured in TEST environment
- **Security:** ✅ Password removed from environment variables (kept only in secrets)

### JIRA Integration (Direct API)
- **Method:** Direct JIRA API (per retrospective guidance)
- **Environment Variables:**
  - `JIRA_EMAIL`
  - `JIRA_API_TOKEN`
  - `JIRA_BASE_URL` (https://hdtsllc.atlassian.net)
- **Auto-Bug Creation:** Each test failure creates new Bug ticket
- **Default Priority:** Medium
- **Default Assignment:** Unassigned

### Artifact Storage
- **Long-term Storage:** ❌ Not needed (skip for MVP)
- **GitHub Actions Retention:**
  - DEVL/TEST: 7 days
  - PROD: 30 days
- **Cleanup Strategy:** Delete passing test artifacts immediately

### Slack Notifications
- **Status:** ⏸️ Deferred (can add webhook URL later)
- **Implementation:** Phase 3 (optional for MVP)

---

## 📋 Implementation Phases

### Phase 1: Mochawesome Setup ✅ READY TO START
- Install mochawesome packages
- Configure Cypress reporter
- Add npm scripts for report generation
- Test local report generation

### Phase 2: GitHub Pages Deployment ⏳ PENDING
- Create GitHub Actions workflow
- Deploy reports to `https://ybotman.github.io/tangotiempo/test-reports`
- Configure /latest and dated archives

### Phase 3: Slack Integration ⏸️ OPTIONAL
- Requires webhook URL (not yet provided)
- Can add later without blocking other phases

### Phase 4: JIRA Auto-Bug Creation ⏳ PENDING
- Use direct JIRA API (per retrospective)
- Create Bug ticket for each test failure
- Duplicate detection logic
- Screenshot attachment

### Phase 5: Artifact Cleanup ⏳ PENDING
- Delete passing test artifacts
- Archive failed test artifacts
- Respect retention policies

### Phase 6: Auto-Promotion ⏸️ OPTIONAL
- Auto-create PR on test success
- Notify team for PROD readiness

---

## 🎯 Ready to Proceed

**Next Step:** Start Phase 1 - Install and configure Mochawesome

**Estimated Time:** 2-3 hours for Phase 1

**Branch:** `feature/TIEMPO-299-cypress-e2e-framework`

---

**Last Updated:** October 1, 2025
**Current Version:** 1.10.7
