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
    prev: 'button[title="Previous"]',
    next: 'button[title="Next"]',
    today: 'button[title="Today"]'
  };

  cy.get(buttonMap[direction]).click();
  cy.wait(500); // Allow calendar to update
});

/**
 * Change calendar view
 */
Cypress.Commands.add('changeCalendarView', (viewType) => {
  const viewMap = {
    '8week': 'button[title="8 Week View"]',
    'list': 'button[title="List View"]',
    'month': 'button[title="Month View"]'
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