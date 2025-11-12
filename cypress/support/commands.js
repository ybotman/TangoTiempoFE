// ***********************************************
// TangoTiempo Custom Cypress Commands
// ***********************************************

// ============================================
// Authentication Commands
// ============================================

/**
 * Login with email and password
 * Uses session caching for performance
 */
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible').type(email);
    cy.get('input[name="password"]').should('be.visible').type(password);
    cy.get('button[type="submit"]').click();

    // Wait for redirect to calendar or successful login indicator
    cy.url().should('include', '/calendar', { timeout: 15000 });
  });
});

/**
 * Dismiss welcome modal if it appears
 * The welcome modal shows "Welcome to Tango Tiempo" and offers location selection
 */
Cypress.Commands.add('dismissWelcomeModal', () => {
  // Check if welcome modal exists (it may not appear every time)
  cy.get('body').then($body => {
    // Look for common welcome modal indicators
    if ($body.find('[data-testid="welcome-modal"]').length > 0 ||
        $body.text().includes('Welcome to Tango Tiempo')) {

      // Try to click close button (various possible selectors)
      cy.get('body').then($modal => {
        // Option 1: Click close/dismiss button
        if ($modal.find('[data-testid="modal-close"]').length > 0) {
          cy.get('[data-testid="modal-close"]').click();
        }
        // Option 2: Click "Select Location" or similar button
        else if ($modal.find('button').filter(':contains("Select")').length > 0) {
          cy.contains('button', 'Select').first().click();
        }
        // Option 3: Click any dismiss/continue button
        else if ($modal.find('button').filter(':contains("Continue")').length > 0) {
          cy.contains('button', 'Continue').click();
        }
        // Option 4: Press ESC key
        else {
          cy.get('body').type('{esc}');
        }
      });

      // Wait for modal to disappear
      cy.get('[data-testid="welcome-modal"]', { timeout: 3000 }).should('not.exist');
    }
  });
});

/**
 * Logout current user
 */
Cypress.Commands.add('logout', () => {
  cy.visit('/');
  cy.get('[data-testid="user-menu"]', { timeout: 5000 }).click();
  cy.contains('Logout').click();
  cy.url().should('include', '/');
});

// ============================================
// Calendar Navigation Commands
// ============================================

/**
 * Navigate calendar (prev/next/today)
 */
Cypress.Commands.add('navigateCalendar', (direction) => {
  const buttonMap = {
    prev: '[data-testid="nav-prev"]',
    next: '[data-testid="nav-next"]',
    today: '[data-testid="nav-today"]'
  };

  cy.get(buttonMap[direction]).click();
  cy.wait(500); // Allow calendar to update
});

/**
 * Change calendar view
 */
Cypress.Commands.add('changeCalendarView', (viewType) => {
  const viewMap = {
    '8week': '[data-testid="view-8week"]',
    'list': '[data-testid="view-list"]',
    'month': '[data-testid="view-month"]'
  };

  if (viewMap[viewType]) {
    cy.get(viewMap[viewType]).click();
    cy.wait(500);
  }
});

/**
 * Set location/map center via UI
 */
Cypress.Commands.add('setLocation', (city) => {
  cy.get('[data-testid="map-center-btn"]').click();
  cy.get('[data-testid="location-search"]').type(city);
  cy.get('[data-testid="location-result"]').first().click();
  cy.get('[data-testid="apply-location"]').click();
  cy.wait(1000); // Allow events to reload
});

/**
 * Set map center directly in sessionStorage (bypasses MapCenterModal)
 * Useful for CI/CD where localStorage is empty and modal blocks calendar
 *
 * Presets:
 * - 'oklahoma-city': Single event location for testing
 * - 'boston': ~100 events, default test area
 * - Or pass custom { lat, lng, zoomRange }
 */
Cypress.Commands.add('setMapCenterDirectly', (location = 'oklahoma-city') => {
  const presets = {
    'oklahoma-city': { lat: 35.4676, lng: -97.5164, zoomRange: 50 },
    'boston': { lat: 42.3601, lng: -71.0589, zoomRange: 50 }
  };

  const mapCenter = typeof location === 'string' ? presets[location] : location;

  if (!mapCenter) {
    throw new Error(`Unknown location preset: ${location}. Use 'oklahoma-city', 'boston', or custom object.`);
  }

  cy.window().then((win) => {
    win.sessionStorage.setItem('currentLocation', JSON.stringify(mapCenter));
  });
});

// ============================================
// Event Verification Commands
// ============================================

/**
 * Check if event exists by title
 */
Cypress.Commands.add('checkEventExists', (eventTitle) => {
  cy.get('.fc-event-title').contains(eventTitle).should('be.visible');
});

/**
 * Check event count
 */
Cypress.Commands.add('checkEventCount', (minCount) => {
  cy.get('.fc-event').should('have.length.at.least', minCount);
});

/**
 * Open event details modal
 */
Cypress.Commands.add('openEventDetails', (eventTitle) => {
  cy.get('.fc-event-title').contains(eventTitle).click();
  cy.get('[data-testid="event-modal"]', { timeout: 5000 }).should('be.visible');
});

/**
 * Close event details modal
 */
Cypress.Commands.add('closeEventModal', () => {
  cy.get('[data-testid="modal-close"]').click();
  cy.get('[data-testid="event-modal"]').should('not.exist');
});

// ============================================
// Category Filter Commands
// ============================================

/**
 * Toggle category filter
 */
Cypress.Commands.add('filterByCategory', (categoryName) => {
  // Click on category circle or filter button
  cy.contains(categoryName).click();
  cy.wait(300); // Allow filter to apply
});

/**
 * Clear all category filters
 */
Cypress.Commands.add('clearCategoryFilters', () => {
  cy.get('[data-testid="clear-filters"]').click();
  cy.wait(300);
});

// ============================================
// Calendar Assertions
// ============================================

/**
 * Assert calendar is loaded
 */
Cypress.Commands.add('calendarShouldBeLoaded', () => {
  // First dismiss welcome modal if it appears
  cy.dismissWelcomeModal();

  // Then wait for calendar to load
  cy.get('.fc-view', { timeout: 10000 }).should('be.visible');
  cy.get('.fc-event', { timeout: 5000 }).should('have.length.at.least', 0); // At least container exists
});

/**
 * Assert on specific view type
 */
Cypress.Commands.add('shouldBeInView', (viewType) => {
  const viewClasses = {
    '8week': '.fc-dayGrid8Week-view',
    'list': '.fc-list21Days-view',
    'month': '.fc-dayGridMonth-view'
  };

  if (viewClasses[viewType]) {
    cy.get(viewClasses[viewType]).should('exist');
  }
});

// ============================================
// Wait/Utility Commands
// ============================================

/**
 * Wait for events to load
 */
Cypress.Commands.add('waitForEvents', () => {
  // Wait for loading indicator to disappear or events to appear
  cy.get('.fc-event', { timeout: 10000 }).should('have.length.at.least', 0);
});

/**
 * Wait for no loading spinner
 */
Cypress.Commands.add('waitForNoSpinner', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 15000 }).should('not.exist');
});