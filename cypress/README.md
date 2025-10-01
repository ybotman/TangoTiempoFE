# Cypress E2E Testing Framework

## Overview
Comprehensive E2E testing suite for TangoTiempo calendar application.

## Quick Start

### Run Tests Locally
```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests headless
npm run test:e2e

# Run specific test group
npm run cypress:run:readonly
```

### Run Against Different Environments
```bash
# Local (default: http://localhost:3001)
npm run test:e2e

# TEST environment  
npm run cypress:run:test

# PROD smoke tests (readonly only)
npm run cypress:run:smoke
```

## Test Structure

### Phase 1: Readonly Tests (Current)
- `cypress/e2e/01-readonly/boston-calendar.cy.js` - Boston calendar tests
- `cypress/e2e/01-readonly/main-calendar.cy.js` - Main calendar with geo

### Custom Commands
See `cypress/support/commands.js` for reusable commands:
- `cy.login(email, password)` - Authentication
- `cy.navigateCalendar(direction)` - Navigate prev/next/today
- `cy.calendarShouldBeLoaded()` - Assert calendar ready
- `cy.checkEventExists(title)` - Verify event visible
- More...

### Fixtures
Test data located in `cypress/fixtures/`:
- `test-users.json` - Test account credentials
- `boston-location.json` - Location data
- `sample-events.json` - Event examples
- `categories.json` - Event categories

## Configuration

### cypress.config.js
Main configuration with environment handling:
```javascript
baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3001'
```

### cypress.env.json
Environment-specific settings (gitignored):
```json
{
  "baseUrl": "http://localhost:3001",
  "apiUrl": "http://localhost:3010"
}
```

## Test Users

**NOTE**: Test users must be created in Firebase Auth first.

From `fixtures/test-users.json`:
- `test.readonly@tangotiempo.com` - Readonly access
- `test.organizer@tangotiempo.com` - Event organizer  
- `test.admin@tangotiempo.com` - Admin access

## Writing Tests

### Best Practices
1. Use FullCalendar's built-in classes where stable
2. Add data-testid only when CSS selectors unreliable
3. Use custom commands for common operations
4. Keep tests independent
5. Use fixtures for predictable data

### Example Test
```javascript
describe('My Feature', () => {
  beforeEach(() => {
    cy.visit('/calendar');
    cy.calendarShouldBeLoaded();
  });

  it('should do something', () => {
    cy.navigateCalendar('next');
    cy.checkEventExists('My Event');
  });
});
```

## Future Phases

### Phase 2: Authentication (Planned)
- Signup/login flows
- Session management
- Password reset

### Phase 3: User Features (Planned)
- Profile updates
- Preferences
- Location settings

### Phase 4-6: Role Apps, CRUD, Admin (Planned)
- Role applications
- Event CRUD operations
- Admin functions

## CI/CD Integration

Tests run automatically via GitHub Actions on all branches:

### Workflows

**DEVL Branch** (`.github/workflows/cypress-e2e-devl.yml`)
- Triggers: Push/PR to DEVL
- Runs: Full test suite against local build
- Starts dev server, waits for port 3001
- Uploads screenshots/videos on failure

**TEST Branch** (`.github/workflows/cypress-e2e-test.yml`)
- Triggers: Push/PR to TEST, Vercel deployment
- Runs: Full test suite against https://test.tangotiempo.com
- Works with Vercel preview deployments
- Uploads screenshots/videos on failure

**PROD/MAIN Branch** (`.github/workflows/cypress-e2e-prod.yml`)
- Triggers: Push/PR to MAIN, Daily 6am UTC, Manual
- Runs: **READONLY smoke tests only** (01-readonly/**)
- Tests: https://tangotiempo.com
- Auto-creates GitHub issue if scheduled run fails
- 30-day artifact retention

### Status Badges

Add to your README.md:
```markdown
![DEVL Tests](https://github.com/YOUR_ORG/tangotiempo.com/workflows/Cypress%20E2E%20Tests%20-%20DEVL/badge.svg)
![TEST Tests](https://github.com/YOUR_ORG/tangotiempo.com/workflows/Cypress%20E2E%20Tests%20-%20TEST/badge.svg)
![PROD Smoke](https://github.com/YOUR_ORG/tangotiempo.com/workflows/Cypress%20Smoke%20Tests%20-%20PROD/badge.svg)
```

### Vercel Integration

Workflows are optimized for Vercel deployments:
- DEVL: Runs against local build (no Vercel needed)
- TEST: Waits for Vercel deployment via `deployment_status` event
- PROD: Tests live production site

### Manual Triggers

Run PROD smoke tests manually:
1. Go to Actions tab in GitHub
2. Select "Cypress Smoke Tests - PROD"
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow"

## Troubleshooting

### Port Issues
Ensure dev server runs on port 3001:
```bash
npm run dev  # Should start on :3001
```

### No Events Visible
- Check backend API is running on :3010
- Verify test data exists in TEST database
- Check browser console for API errors

### Flaky Tests
- Increase timeouts in cypress.config.js
- Add explicit waits: `cy.wait(500)`
- Use `cy.waitForEvents()` custom command
