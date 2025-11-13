# Cypress E2E Test Suite Summary

## Overview

The TangoTiempo application uses Cypress for comprehensive end-to-end testing. The test suite covers calendar functionality, authentication flows, and user interactions across desktop and mobile viewports.

**Framework**: Cypress v13+ with FullCalendar v6 integration  
**Configuration**: `cypress.config.js`  
**Test Location**: `cypress/e2e/`  
**Custom Commands**: `cypress/support/commands.js`

---

## Test Configuration

### Base Setup (cypress.config.js)

- **Base URL**: `http://localhost:3001` (configurable via `CYPRESS_BASE_URL`)
- **API URL**: `http://localhost:3010` (configurable via `NEXT_PUBLIC_BE_URL`)
- **Viewport**: 1280x720 (desktop), iPhone X (mobile tests)
- **Retries**: 2 attempts in CI, 0 in local development
- **Timeouts**: 
  - Default commands: 10 seconds
  - Page load: 30 seconds
  - Request/Response: 10 seconds
- **Reporter**: Mochawesome (generates JSON reports in `cypress/reports/`)
- **Fail-Fast**: Enabled - stops after 9999 failures (currently set high for debugging)

### Key Features

- Screenshots captured on test failures
- Video recording disabled by default (for performance)
- Chrome web security disabled (for testing OAuth flows)
- Session caching for authentication tests
- Custom navigation and assertion commands

---

## Test Organization

### Phase 1: Readonly Tests (Current) ✅

Tests that don't require authentication - verifying public calendar access and basic functionality.

#### 1.1 Boston Calendar (`01-readonly/boston-calendar.cy.js`)

**Purpose**: Test the Boston-specific calendar at `/calendar/boston`

**Desktop View Tests (1280x720)**:
- ✅ Default 8-week dayGrid view renders correctly
- ✅ Boston-specific events display (or "No Events Found" message)
- ✅ Location selector is hidden (Boston calendar is location-locked)
- ✅ Navigation buttons (prev/next/today) work properly
- ✅ Event detail modal opens on event click
- ✅ Modal closes correctly
- ✅ Category filter UI exists
- ✅ Calendar loads within 5 seconds

**Mobile View Tests (iPhone X)**:
- ✅ List view displays instead of grid on mobile
- ✅ Events render in list format
- ✅ Mobile navigation works correctly

**Common Features**:
- ✅ Fixed location (no map center button for Boston)
- ✅ Handles rapid navigation (12+ months forward)
- ✅ Calendar persists after page refresh
- ✅ Performance benchmarks met

**Test Count**: 13 tests across 4 contexts

---

#### 1.2 Main Calendar (`01-readonly/main-calendar.cy.js`)

**Purpose**: Test the main calendar at `/calendar` with geo-location features

**Desktop View Tests (1280x720)**:
- ✅ Main calendar page loads with tango content
- ✅ Default dayGrid view with 20+ visible days
- ✅ Navigation controls present and functional
- ✅ Date changes when navigating
- ✅ "Today" button returns to current date
- ✅ Events display correctly (or handle empty state)
- ✅ Event detail modal functionality
- ✅ Category filtering UI available

**Geo Location Features**:
- ✅ Location-based filtering capability
- ✅ Events filtered by selected location
- ✅ UI supports changing map center/region
- ✅ Calendar functional with location changes

**Mobile View Tests (iPhone X)**:
- ✅ Calendar displays on mobile devices
- ✅ Mobile-optimized view (list or condensed grid)
- ✅ Mobile navigation buttons work
- ✅ Event clicks work on mobile

**View Switching**:
- ✅ Switch between 8-week and list views
- ✅ Calendar maintains functionality across view changes

**Common Features**:
- ✅ Rapid navigation without errors (5+ forward clicks)
- ✅ State persists across page refresh
- ✅ Custom navigation controls visible
- ✅ Empty date ranges handled gracefully (24+ months forward)

**Performance**:
- ✅ Calendar loads within 5 seconds
- ✅ Month changes complete in under 2 seconds

**Accessibility**:
- ✅ Semantic calendar structure (proper table/grid)
- ✅ Clickable events with proper targets
- ✅ Keyboard-accessible navigation buttons

**Test Count**: 24 tests across 7 contexts

---

### Phase 2: Authentication Tests ✅

Tests covering user authentication flows including signup, login, and password reset.

#### 2.1 Login Flow (`02-authentication/auth-login.cy.js`)

**Purpose**: Test user authentication and login functionality

**Login Page Display**:
- ✅ "SIGN IN" page title visible
- ✅ Google login button present ("Continue with Google")
- ✅ Email login button present ("Continue with Email")
- ✅ Apple login button available
- ✅ Facebook button disabled with "Coming Soon" label
- ✅ Signup link visible ("New user?" + "CREATE ACCOUNT")
- ✅ "Back to Calendar" button present

**Email Login Form**:
- ✅ Form appears when email button clicked
- ✅ Email and password fields visible (no first/last name fields)
- ✅ "Log In" submit button present
- ✅ "Forgot Password?" link available
- ✅ Empty form validation ("Email and password are required")
- ✅ Email format validation
- ✅ Password visibility toggle works
- ✅ Back button returns to provider selection

**Password Reset Link**:
- ✅ Navigates to `/auth/reset-password` page

**OAuth Providers**:
- ✅ Google login button enabled
- ✅ Apple login button visible

**Error Handling**:
- ✅ Server error messages display correctly
- ✅ Wrong credentials handled appropriately

**Navigation**:
- ✅ Signup link navigates to `/auth/signup`
- ✅ "Back to Calendar" navigates to `/calendar`

**Responsive Design**:
- ✅ Mobile layout displays properly (iPhone X)
- ✅ Mobile form is visible and scrollable

**Loading States**:
- ✅ Button shows loading state during authentication

**Test Count**: 18 tests across 9 contexts  
**Skipped**: 1 test (successful login with valid credentials - requires test user setup)

---

#### 2.2 Signup Flow (`02-authentication/auth-signup.cy.js`)

**Purpose**: Test new user registration functionality

**Signup Page Display**:
- ✅ "SIGN UP" page title visible
- ✅ Google signup button ("Continue with Google")
- ✅ Email signup button ("Continue with Email")
- ✅ Facebook button disabled ("Coming Soon")
- ✅ Login link ("Already have an account?" + "SIGN IN")
- ✅ "Back to Calendar" button present

**Email Signup Form**:
- ✅ Form appears when email button clicked
- ✅ "Create an Account" title visible
- ✅ First name field present
- ✅ Last name field present
- ✅ Email field present
- ✅ Password field present
- ✅ Confirm password field present
- ✅ "Sign Up" submit button visible

**Form Validation**:
- ✅ Empty form validation error
- ✅ Email format validation
- ✅ Password strength requirements (8+ characters)
- ✅ Password confirmation match validation
- ✅ First and last name required validation
- ✅ Password visibility toggle works
- ✅ Back button returns to provider options

**Navigation**:
- ✅ "SIGN IN" link navigates to `/auth/login`
- ✅ "Back to Calendar" navigates to `/calendar`

**OAuth Providers**:
- ✅ Google signup button functional (triggers OAuth popup)

**Responsive Design**:
- ✅ Mobile layout displays properly (iPhone X)
- ✅ Mobile form is scrollable and visible

**Test Count**: 14 tests across 4 contexts

---

#### 2.3 Password Reset Flow (`02-authentication/auth-password-reset.cy.js`)

**Purpose**: Test password recovery functionality

**Reset Page Display**:
- ✅ "Reset Password" page title
- ✅ Instruction text visible
- ✅ Email input field with email icon
- ✅ "Send Reset Email" submit button
- ✅ "Back to Sign In" link

**Form Validation**:
- ✅ Empty email field validation (HTML5)
- ✅ Invalid email format validation (HTML5)
- ✅ Valid email accepted without client-side errors

**Form State Management**:
- ✅ Submit button disables during processing
- ✅ Button re-enables after error

**Error Handling**:
- ✅ Firebase error messages displayed appropriately
- ✅ Email enumeration protection (doesn't reveal if email exists)

**Navigation**:
- ✅ "Back to Sign In" navigates to `/auth/login`
- ✅ Accessible from login page "Forgot Password?" link

**Responsive Design**:
- ✅ Mobile layout displays properly (iPhone X)
- ✅ Mobile-friendly form layout

**Accessibility**:
- ✅ Proper input type (`type="email"`)
- ✅ Required attribute set
- ✅ Email field auto-focused on load

**Test Count**: 12 tests across 8 contexts  
**Skipped**: 3 tests (require Firebase email service configuration)

---

## Custom Cypress Commands

Located in `cypress/support/commands.js`, these reusable commands simplify test writing:

### Authentication Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `cy.login(email, password)` | Login with session caching | `cy.login('user@example.com', 'pass123')` |
| `cy.logout()` | Logout current user | `cy.logout()` |

### Calendar Navigation Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `cy.navigateCalendar(direction)` | Navigate calendar (prev/next/today) | `cy.navigateCalendar('next')` |
| `cy.changeCalendarView(viewType)` | Switch calendar view | `cy.changeCalendarView('list')` |
| `cy.setLocation(city)` | Set location via UI | `cy.setLocation('Boston')` |
| `cy.setMapCenterDirectly(location)` | Set map center directly in sessionStorage | `cy.setMapCenterDirectly('boston')` |

**Location Presets**:
- `'oklahoma-city'`: Single event location for testing
- `'boston'`: ~100 events, default test area
- Custom: Pass `{ lat, lng, zoomRange }` object

### Event Verification Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `cy.checkEventExists(eventTitle)` | Verify event by title | `cy.checkEventExists('Milonga')` |
| `cy.checkEventCount(minCount)` | Assert minimum event count | `cy.checkEventCount(5)` |
| `cy.openEventDetails(eventTitle)` | Open event modal | `cy.openEventDetails('Practica')` |
| `cy.closeEventModal()` | Close event modal | `cy.closeEventModal()` |

### Category Filter Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `cy.filterByCategory(categoryName)` | Toggle category filter | `cy.filterByCategory('Milonga')` |
| `cy.clearCategoryFilters()` | Clear all filters | `cy.clearCategoryFilters()` |

### Calendar Assertions

| Command | Purpose | Usage |
|---------|---------|-------|
| `cy.calendarShouldBeLoaded()` | Assert calendar is ready | `cy.calendarShouldBeLoaded()` |
| `cy.shouldBeInView(viewType)` | Assert specific view type | `cy.shouldBeInView('list')` |

### Wait/Utility Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `cy.waitForEvents()` | Wait for events to load | `cy.waitForEvents()` |
| `cy.waitForNoSpinner()` | Wait for loading spinner to disappear | `cy.waitForNoSpinner()` |

---

## Test Data & Fixtures

Located in `cypress/fixtures/`:

- `test-users.json` - Test account credentials (must be created in Firebase first)
- `boston-location.json` - Location data for geo tests
- `sample-events.json` - Event examples for verification
- `categories.json` - Event category definitions

### Test Users (Must Create in Firebase Auth)

From `fixtures/test-users.json`:
- `test.readonly@tangotiempo.com` - Readonly calendar access
- `test.organizer@tangotiempo.com` - Event organizer permissions
- `test.admin@tangotiempo.com` - Admin access

---

## Running Tests

### Local Development

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all tests headless
npm run test:e2e

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/01-readonly/boston-calendar.cy.js"
```

### Different Environments

```bash
# Local (default: http://localhost:3001)
npm run test:e2e

# TEST environment
npm run cypress:run:test

# PROD smoke tests (readonly only)
npm run cypress:run:smoke
```

### Manual Test Execution

```bash
# Run specific test group
npx cypress run --spec "cypress/e2e/01-readonly/**"

# Run with specific browser
npx cypress run --browser chrome

# Run with custom base URL
CYPRESS_BASE_URL=https://test.tangotiempo.com npx cypress run
```

---

## CI/CD Integration

### GitHub Actions Workflows

**DEVL Branch** (`.github/workflows/cypress-e2e-devl.yml`):
- Triggers: Push/PR to DEVL branch
- Runs: Full test suite against local build
- Process: Starts dev server on port 3001, waits for availability, runs all tests
- Artifacts: Screenshots and videos on failure

**TEST Branch** (`.github/workflows/cypress-e2e-test.yml`):
- Triggers: Push/PR to TEST, Vercel deployment events
- Runs: Full test suite against `https://test.tangotiempo.com`
- Process: Works with Vercel preview deployments
- Artifacts: Screenshots and videos on failure

**PROD/MAIN Branch** (`.github/workflows/cypress-e2e-prod.yml`):
- Triggers: Push/PR to MAIN, Daily at 6am UTC, Manual workflow dispatch
- Runs: **READONLY smoke tests only** (`01-readonly/**`)
- Tests: Live production at `https://tangotiempo.com`
- Features: Auto-creates GitHub issue if scheduled run fails
- Artifacts: 30-day retention for screenshots/videos

### Vercel Integration

- **DEVL**: Tests against local build (no Vercel dependency)
- **TEST**: Waits for Vercel deployment via `deployment_status` event
- **PROD**: Tests live production site

---

## Test Coverage Summary

### Current Coverage

| Area | Tests | Status |
|------|-------|--------|
| **Readonly Calendar** | 37 | ✅ Complete |
| - Boston Calendar | 13 | ✅ |
| - Main Calendar | 24 | ✅ |
| **Authentication** | 44 | ✅ Complete |
| - Login Flow | 18 | ✅ (1 skipped) |
| - Signup Flow | 14 | ✅ |
| - Password Reset | 12 | ✅ (3 skipped) |
| **Total Active Tests** | 77 | ✅ |
| **Total Skipped Tests** | 4 | ⏭️ (Require test user setup) |

### Test Categories Breakdown

**Functionality Tests**: 45
- Calendar rendering and navigation
- Event display and interaction
- Authentication flows
- Form validation

**Responsive Design Tests**: 12
- Desktop viewport (1280x720)
- Mobile viewport (iPhone X)
- Layout adaptations

**Performance Tests**: 4
- Page load times
- Navigation speed
- Calendar rendering

**Accessibility Tests**: 4
- Semantic HTML structure
- Keyboard navigation
- Form attributes

**Error Handling Tests**: 12
- Form validation errors
- API error responses
- Empty states

---

## Future Test Phases (Planned)

### Phase 3: User Features
- Profile updates
- User preferences
- Location settings persistence
- Saved favorites

### Phase 4: Role Applications
- Organizer role requests
- Venue role applications
- Application approval flows

### Phase 5: CRUD Operations
- Event creation
- Event editing
- Event deletion
- Draft management

### Phase 6: Admin Functions
- User management
- Event moderation
- Category management
- System settings

---

## Key Testing Patterns

### 1. Conditional Event Testing
Tests handle both scenarios where events exist or don't exist:

```javascript
cy.get('body').then($body => {
  if ($body.find('.fc-event').length > 0) {
    // Test with events
    cy.get('.fc-event').should('be.visible');
  } else {
    // Test empty state
    cy.contains('No Events Found').should('be.visible');
  }
});
```

### 2. FullCalendar v6 Selectors
Tests use proper FullCalendar v6 class names:
- `.fc-daygrid` (not `.fc-dayGrid-view`)
- `.fc-daygrid-day` (not `.fc-day`)
- `.fc-list` (for list views)
- `.fc-event-title` (for event titles)

### 3. Map Center Setup
Tests bypass MapCenterModal by setting location before visiting:

```javascript
beforeEach(() => {
  cy.setMapCenterDirectly('boston'); // Sets sessionStorage
  cy.visit('/calendar'); // Modal won't appear
});
```

### 4. Session Caching for Auth
Login tests use Cypress session caching for performance:

```javascript
cy.session([email, password], () => {
  // Login logic here
});
```

---

## Best Practices

1. **Use FullCalendar's built-in classes** where stable
2. **Add `data-testid` only when CSS selectors are unreliable**
3. **Use custom commands** for common operations
4. **Keep tests independent** - each test should work in isolation
5. **Use fixtures** for predictable test data
6. **Handle both event and no-event scenarios** gracefully
7. **Set appropriate timeouts** based on operation complexity
8. **Clean up after tests** - logout, clear filters, etc.

---

## Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
npm run dev
```

**No Events Visible**:
- Ensure backend API runs on port 3010
- Verify test data exists in database
- Check browser console for API errors
- Verify map center is set correctly

**Flaky Tests**:
- Increase timeouts in `cypress.config.js`
- Add explicit waits: `cy.wait(500)`
- Use `cy.waitForEvents()` custom command
- Check for race conditions in asynchronous operations

**Modal Not Opening**:
- Verify events exist before clicking
- Check event selector is correct (`.fc-event`)
- Ensure modal element has correct `data-testid`

**Skipped Tests Failing**:
- Create test users in Firebase Authentication
- Add credentials to `cypress.env.json` (gitignored)
- Configure Firebase email service for password reset tests

---

## Summary Statistics

- **Total Test Files**: 5
- **Total Test Contexts**: 23
- **Total Test Cases**: 81 (77 active, 4 skipped)
- **Custom Commands**: 20
- **Test Fixtures**: 4
- **GitHub Workflows**: 3
- **Supported Browsers**: Chrome, Firefox, Edge, Electron
- **Viewport Configurations**: Desktop (1280x720), Mobile (iPhone X)

---

## Documentation References

- Main Cypress README: `cypress/README.md`
- Custom Commands: `cypress/support/commands.js`
- Configuration: `cypress.config.js`
- Test Users: `cypress/fixtures/test-users.json`

---

**Last Updated**: 2025-11-13  
**Cypress Version**: 13.x  
**FullCalendar Version**: 6.x  
**Next.js Version**: 14.x
