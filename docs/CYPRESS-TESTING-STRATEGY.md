# Cypress E2E Testing Strategy

## Overview
Comprehensive E2E testing framework for TangoTiempo release quality gates. Designed for single-developer team efficiency.

## Test Architecture

### Environment Strategy
- **LOCAL**: `cypress run --config baseUrl=http://localhost:3001` (DEVL FE + TEST DB)
- **STAGING**: `cypress run --config baseUrl=https://test.tangotiempo.com` (TEST FE + TEST DB)
- **SMOKE**: `cypress run --spec "cypress/e2e/01-readonly/**" --config baseUrl=https://tangotiempo.com` (PROD readonly only)

### Data Management
```javascript
// Reset TEST DB before test suite
cy.task('db:reset');

// Use known test users
const TEST_USERS = {
  basic: 'test.user@tangotiempo.com',
  organizer: 'test.organizer@tangotiempo.com',
  admin: 'test.admin@tangotiempo.com'
};

// Cleanup after tests
afterEach(() => {
  cy.task('db:cleanup', testId);
});
```

## Test Groups

### Group 1: Boston Calendar (Readonly)
**URL**: bostontangocalendar.com (proxy to /calendar/boston)
- ✓ 8-week view on desktop
- ✓ List view on mobile
- ✓ Month navigation
- ✓ Event detail modal
- ✓ Category filtering

### Group 2: Main Calendar (Readonly + Geo)
**URL**: tangotiempo.com/calendar
- ✓ Default calendar view
- ✓ Change map center
- ✓ Location-based events
- ✓ Zoom range adjustment

### Group 3: Authentication
- ✓ Signup flow
- ✓ Login flow
- ✓ Password reset
- ✓ Email verification
- ✓ Social login (Google/Apple)

### Group 4-5: User Profiles
- ✓ Name updates
- ✓ Location preferences
- ✓ Notification settings
- ✓ Saved events

### Group 6: Role Applications
- ✓ Event Organizer application
- ✓ DJ application
- ✓ Instructor application
- ✓ Auto-accept flow
- ✓ Profile activation

### Group 7: CRUD Operations
- ✓ Event creation/editing
- ✓ Venue management
- ✓ Recurring events
- ✓ Image uploads

### Group 8: Regional Admin
- ✓ User management
- ✓ Content moderation
- ✓ Cross-region operations

## Cypress Commands

```javascript
// cypress/support/commands.js

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login');
    cy.get('[name="email"]').type(email);
    cy.get('[name="password"]').type(password);
    cy.get('[type="submit"]').click();
    cy.url().should('include', '/calendar');
  });
});

// Set location
Cypress.Commands.add('setLocation', (city) => {
  cy.get('[data-testid="map-center-btn"]').click();
  cy.get('[data-testid="location-search"]').type(city);
  cy.get('[data-testid="location-result"]').first().click();
  cy.get('[data-testid="apply-location"]').click();
});

// Check calendar event
Cypress.Commands.add('checkEvent', (eventTitle) => {
  cy.get('.fc-event-title').contains(eventTitle).should('be.visible');
});

// Apply for role
Cypress.Commands.add('applyForRole', (roleType) => {
  cy.visit('/organizers/apply');
  cy.get(`[data-testid="role-${roleType}"]`).check();
  cy.get('[data-testid="accept-terms"]').check();
  cy.get('[type="submit"]').click();
});
```

## Test Execution

### Local Development
```bash
# Run all tests locally
npm run cypress:open

# Run specific test group
npm run cypress:run -- --spec "cypress/e2e/01-readonly/**"

# Run against TEST environment
CYPRESS_BASE_URL=https://test.tangotiempo.com npm run cypress:run
```

### CI/CD Pipeline
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on:
  pull_request:
    branches: [TEST]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          config: baseUrl=https://test.tangotiempo.com
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

## Implementation Phases

### Phase 1: Core Readonly (Weeks 1-2)
- [ ] Setup Cypress framework
- [ ] Boston calendar tests
- [ ] Main calendar tests
- [ ] Test data fixtures

### Phase 2: Authentication (Week 3)
- [ ] Signup tests
- [ ] Login tests
- [ ] Session management

### Phase 3: User Features (Weeks 4-5)
- [ ] Profile updates
- [ ] Preferences
- [ ] Location settings

### Phase 4: Role Applications (Weeks 6-8)
- [ ] Organizer application
- [ ] Artist type applications
- [ ] Auto-accept testing

### Phase 5: CRUD Operations (Weeks 9-11)
- [ ] Event management
- [ ] Venue management
- [ ] Recurring events

### Phase 6: Admin Features (Week 12)
- [ ] Regional admin tests
- [ ] Moderation tools

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Keep tests independent** - each test should run in isolation
3. **Use fixtures** for predictable test data
4. **Implement retry logic** for flaky network operations
5. **Screenshot on failure** for debugging
6. **Run in headless mode** in CI for speed
7. **Parallelize tests** where possible
8. **Keep test execution under 10 minutes**

## Success Metrics

- ✅ All tests pass before TEST→PROD promotion
- ✅ Test execution < 10 minutes
- ✅ Zero flaky tests
- ✅ 80% coverage of critical user paths
- ✅ Automated on every PR

## Maintenance

### Weekly
- Review failed tests
- Update selectors if UI changed
- Add tests for new features

### Monthly
- Audit test performance
- Remove obsolete tests
- Update test data fixtures

### Quarterly
- Review test strategy
- Optimize slow tests
- Update documentation