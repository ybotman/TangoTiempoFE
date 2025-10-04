# GitHub Pages Setup for Test Reports

**JIRA:** TIEMPO-303
**Deployment URL:** https://ybotman.github.io/tangotiempo/test-reports
**Date:** October 1, 2025

---

## Manual Configuration Required

GitHub Pages needs to be enabled in the repository settings. This is a **one-time manual setup**.

### Steps to Enable GitHub Pages

1. **Navigate to Repository Settings**
   - Go to https://github.com/ybotman/tangotiempo.com
   - Click `Settings` tab
   - Click `Pages` in the left sidebar

2. **Configure Source**
   - Under "Build and deployment"
   - Source: Select **GitHub Actions**
   - Save changes

3. **Verify Configuration**
   - GitHub will provide the URL: `https://ybotman.github.io/tangotiempo`
   - Test reports will be at: `https://ybotman.github.io/tangotiempo/test-reports`

---

## How It Works

### Workflow Trigger
The `deploy-test-reports.yml` workflow triggers automatically when:
- The `Cypress E2E Tests - TEST` workflow completes (on TEST branch)
- Manual trigger via GitHub Actions UI (workflow_dispatch)

### Report Structure
```
https://ybotman.github.io/tangotiempo/test-reports/
├── index.html                    # Landing page with report links
├── latest/
│   └── combined-report.html      # Most recent test run
└── [YYYY-MM-DD]/
    └── combined-report.html      # Archived dated reports
```

### Workflow Steps
1. Download latest Mochawesome report artifact from TEST workflow
2. Copy report to `latest/` directory
3. Copy report to dated archive `YYYY-MM-DD/`
4. Generate index page with links to all reports
5. Deploy to GitHub Pages

---

## Accessing Reports

### Latest Report
Always available at:
```
https://ybotman.github.io/tangotiempo/test-reports/latest/combined-report.html
```

### Dated Archives
Historical reports by date:
```
https://ybotman.github.io/tangotiempo/test-reports/2025-10-01/combined-report.html
https://ybotman.github.io/tangotiempo/test-reports/2025-10-02/combined-report.html
```

### Index Page
Browse all available reports:
```
https://ybotman.github.io/tangotiempo/test-reports/
```

---

## Report Contents

Each Mochawesome HTML report includes:

✅ **Test Summary**
- Total tests run
- Pass/fail counts and percentages
- Test duration
- Environment (TEST)
- Timestamp

✅ **Test Details**
- Individual test results
- Test execution times
- Test hierarchy (describe/it blocks)
- Pass/fail status with icons

✅ **Failure Information** (if any)
- Error messages
- Stack traces
- Screenshot attachments
- Steps to reproduce

✅ **Interactive Features**
- Expand/collapse test suites
- Filter by pass/fail
- Search functionality
- Beautiful, responsive UI

---

## Troubleshooting

### GitHub Pages Not Showing Reports

**Check:**
1. GitHub Pages is enabled in Settings > Pages
2. Source is set to "GitHub Actions"
3. `deploy-test-reports.yml` workflow completed successfully
4. Check Actions tab for deployment logs

**Fix:**
- Re-run the `Deploy Test Reports to GitHub Pages` workflow
- Check workflow logs for errors
- Verify permissions (pages: write, id-token: write)

### Reports Not Updating

**Cause:** Deploy workflow only triggers when TEST workflow completes

**Fix:**
1. Push to TEST branch to trigger Cypress tests
2. Or manually trigger deploy workflow from Actions tab

### 404 Error on Report URL

**Cause:** GitHub Pages URL structure mismatch

**Fix:**
- Verify URL: `https://ybotman.github.io/tangotiempo/test-reports`
- Note: Base URL is `tangotiempo` (repo name), not `tangotiempo.com`
- Check `deploy-test-reports.yml` for correct path

---

## Security & Permissions

### Workflow Permissions
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Public vs Private Reports
- ✅ Reports are **publicly accessible** (GitHub Pages is public)
- ✅ No sensitive data in reports (test data only)
- ⚠️ Do **NOT** include passwords or API keys in test names/descriptions

---

## Maintenance

### Retention Policy
- **GitHub Pages:** Reports persist indefinitely
- **GitHub Actions Artifacts:** 7 days (DEVL/TEST)
- **Manual Cleanup:** Delete old dated folders from `gh-pages` branch if needed

### Monitoring
- Check deployment status in Actions tab
- Review report availability weekly
- Monitor disk usage on `gh-pages` branch

---

## Related Documentation

- [TIEMPO-303](https://hdtsllc.atlassian.net/browse/TIEMPO-303) - Test Results Dashboard
- [Mochawesome Documentation](https://github.com/adamgruber/mochawesome)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Last Updated:** October 1, 2025
**Status:** ⏳ Awaiting manual GitHub Pages configuration
