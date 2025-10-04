# JIRA Story: Test Results Dashboard & Notifications

**Project:** TIEMPO
**Issue Type:** Story
**Parent:** TIEMPO-299 (E2E Cypress Testing Framework)
**Priority:** Medium
**Labels:** testing, reporting, automation, ci-cd

---

## Summary
Implement Mochawesome test reporting with GitHub Pages hosting, Slack notifications, JIRA integration, and auto-cleanup of test artifacts.

---

## Description

Create a comprehensive test results dashboard and notification system that provides team visibility into Cypress E2E test runs. The system will generate beautiful HTML reports, host them publicly, send notifications to Slack, update JIRA tickets, and intelligently manage test artifacts (screenshots/videos).

### User Story
As a **development team member**, I want to **see test results in a centralized dashboard with notifications** so that I can **quickly understand test status, investigate failures, and track trends without running tests locally**.

---

## Acceptance Criteria

### 1. Mochawesome HTML Reports
- [ ] Install and configure Mochawesome reporter
- [ ] Generate timestamped HTML reports with:
  - Pass/fail counts and percentages
  - Test execution time
  - Environment (LOCAL/TEST/PROD)
  - Package version and date
  - Screenshot/video attachments for failures
- [ ] Merge multiple spec results into single combined report
- [ ] Reports include trend charts and historical data

### 2. GitHub Pages Hosting
- [ ] Deploy reports to GitHub Pages automatically
- [ ] Public URL accessible to team: `https://[org].github.io/tangotiempo/test-reports`
- [ ] Latest report always available at `/latest`
- [ ] Historical reports archived by date: `/2025-10-01`, `/2025-10-02`, etc.
- [ ] Index page showing all available reports

### 3. Slack Notifications
- [ ] Post to Slack channel on test completion
- [ ] Include:
  - Test status (✅ Pass / ❌ Fail)
  - Pass/fail counts
  - Environment and version
  - Link to full HTML report
  - Link to GitHub Actions run
  - Screenshots of failures (if any)
- [ ] Different formatting for success vs failure
- [ ] @mention team on failures

### 4. JIRA Integration - Auto-Bug Creation
- [ ] Create new Bug ticket in JIRA for each test failure
- [ ] Bug ticket includes:
  - Test name as summary
  - Environment and version
  - Link to HTML report
  - Screenshot attachment from failure
  - Stack trace and error details
  - Steps to reproduce
  - Parent link to TIEMPO-299
- [ ] Avoid duplicate bugs (check if bug already exists for same test)
- [ ] Auto-label bugs with "e2e-test-failure", environment tag

### 5. Artifact Management & Cleanup
- [ ] Archive failed test screenshots to long-term storage
- [ ] Archive failed test videos (if enabled)
- [ ] Delete screenshots/videos for passing tests
- [ ] Retention policy:
  - GitHub Actions artifacts: 7 days (DEVL/TEST), 30 days (PROD)
  - Long-term archive (S3/Drive): 90 days for failures
  - Passing test artifacts: Immediate deletion
- [ ] Automatic cleanup job runs after each test execution

### 6. Auto-Promotion Logic (Optional)
- [ ] If all tests pass on DEVL, automatically create PR to TEST
- [ ] If all tests pass on TEST, notify team for PROD deployment
- [ ] Configurable thresholds (e.g., require 95% pass rate)

---

## Technical Implementation

### Tech Stack
- **Mochawesome** - Test reporting
- **mochawesome-merge** - Report consolidation
- **mochawesome-report-generator** - HTML generation
- **GitHub Actions** - Automation
- **GitHub Pages** - Report hosting
- **Slack Incoming Webhooks** - Notifications
- **JIRA MCP Tools** - JIRA integration
- **Bash/Python** - Cleanup scripts

### Key Files to Create
```
.github/workflows/
  └── test-reporting.yml          # Test execution + reporting workflow

scripts/
  ├── generate-test-report.sh     # Report generation
  ├── cleanup-artifacts.sh        # Artifact management
  └── post-test-notifications.sh  # Slack/JIRA posting

cypress.config.js                 # Add Mochawesome reporter

package.json                      # Add report scripts
```

### npm Scripts to Add
```json
{
  "test:e2e:report": "cypress run && npm run merge-reports && npm run generate-report",
  "merge-reports": "mochawesome-merge cypress/reports/*.json > cypress/reports/combined-report.json",
  "generate-report": "marge cypress/reports/combined-report.json --reportDir public/test-reports",
  "deploy-report": "gh-pages -d public/test-reports"
}
```

---

## Implementation Steps

### Phase 1: Mochawesome Setup (2-3 hours)
1. Install Mochawesome dependencies
2. Configure Cypress to use Mochawesome reporter
3. Test report generation locally
4. Add npm scripts for report workflow

### Phase 2: GitHub Pages Deployment (1 hour)
1. Create GitHub Actions workflow for deployment
2. Configure GitHub Pages in repo settings
3. Test deployment to GitHub Pages
4. Verify public URL accessibility

### Phase 3: Slack Integration (1 hour)
1. Set up Slack Incoming Webhook
2. Create script to format test results for Slack
3. Add to GitHub Actions workflow
4. Test notifications on success/failure

### Phase 4: JIRA Integration - Auto-Bug Creation (2 hours)
1. Use existing JIRA API tools
2. Create script to parse test failures and create Bug tickets
3. Implement duplicate detection (search for existing bugs with same test name)
4. Add screenshot attachment to bug
5. Link new bugs to TIEMPO-299 parent epic
6. Add to GitHub Actions workflow
7. Test bug creation for multiple failure scenarios

### Phase 5: Artifact Cleanup (2 hours)
1. Create cleanup script (Bash or Python)
2. Implement long-term archive logic (S3 or Google Drive)
3. Add cleanup step to GitHub Actions
4. Test artifact retention policies

### Phase 6: Auto-Promotion (Optional, 2 hours)
1. Add logic to check test pass rate
2. Create PR automation for DEVL → TEST
3. Add notification for TEST → PROD readiness
4. Test promotion workflow

---

## Dependencies
- GitHub repo with Actions enabled ✅
- Slack workspace with webhook access (need webhook URL)
- GitHub Pages enabled for repo
- JIRA MCP tools configured ✅
- Optional: AWS S3 or Google Drive for long-term artifact storage

---

## Testing Strategy
1. Run tests locally with Mochawesome and verify HTML report generation
2. Deploy sample report to GitHub Pages manually
3. Test Slack webhook with mock data
4. Verify JIRA comment posting
5. Test cleanup script with sample artifacts
6. End-to-end test: Run full workflow in GitHub Actions

---

## Success Metrics
- ✅ Test reports accessible via public URL within 2 minutes of test completion
- ✅ Slack notifications arrive within 1 minute of test completion
- ✅ JIRA comments posted within 1 minute
- ✅ Failed test artifacts archived, passing artifacts deleted
- ✅ Zero manual intervention required for reporting
- ✅ Team satisfaction: Easy to find and understand test results

---

## Out of Scope (Future Enhancements)
- Trend analysis dashboard (beyond basic Mochawesome charts)
- Custom React/Vue dashboard UI
- Integration with Cypress Dashboard (paid service)
- Performance regression detection
- Visual regression testing results
- Test result database for advanced analytics

---

## Estimated Effort
**Total: 9-11 hours**
- Research & design: 1 hour (done via AI analysis)
- Mochawesome setup: 3 hours
- GitHub Pages + Slack: 2 hours
- JIRA auto-bug creation: 2 hours
- Artifact cleanup: 2 hours
- Testing & documentation: 1-2 hours

---

## Notes
- Start with simple implementation, iterate
- GitHub Pages is free for public repos
- No recurring costs (avoid Cypress Dashboard subscription)
- Leverage existing JIRA MCP tools
- Slack webhook is free
- Focus on visibility and automation, not perfection

---

## Links
- [Mochawesome Documentation](https://github.com/adamgruber/mochawesome)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- Parent Epic: TIEMPO-299
