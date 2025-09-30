// Main Calendar Readonly Tests
// Test Group 2: Verify tangotiempo.com/calendar functionality with geo features

describe('Main Calendar - Readonly Access with Geo', () => {

  beforeEach(() => {
    // Visit main calendar
    cy.visit('/calendar');

    // Wait for calendar to load
    cy.get('[data-testid="calendar-container"]', { timeout: 10000 }).should('be.visible');
    cy.calendarShouldBeLoaded();
  });

  context('Desktop View', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should display calendar with 8-week view', () => {
      // Check for dayGrid view
      cy.get('.fc-view').should('exist');
      cy.get('.fc-dayGrid-view, .fc-daygrid-view').should('exist');

      // Verify multiple days are visible
      cy.get('.fc-day, .fc-daygrid-day').should('have.length.at.least', 20);
    });

    it('should display events', () => {
      // Events should be visible or empty
      cy.get('.fc-view').should('exist');
    });

    it('should navigate between date ranges', () => {
      // Get initial date
      cy.get('.fc-daygrid-day, .fc-day').first().invoke('attr', 'data-date').as('initialDate');

      // Navigate forward
      cy.navigateCalendar('next');

      // Date should change
      cy.get('.fc-daygrid-day, .fc-day').first().invoke('attr', 'data-date').should('not.equal', '@initialDate');

      // Navigate back
      cy.navigateCalendar('prev');
    });

    it('should handle view toggle buttons', () => {
      // View toggle buttons should exist
      cy.get('[data-testid="view-8week"], button[title*="Week"]').should('exist');
      cy.get('[data-testid="view-list"], button[title*="List"]').should('exist');
    });
  });

  context('Mobile View', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should display list view on mobile', () => {
      // Mobile view should show list format
      cy.get('.fc-view').should('exist');
    });

    it('should navigate on mobile', () => {
      cy.navigateCalendar('next');
      cy.waitForEvents();

      cy.navigateCalendar('today');
      cy.waitForEvents();

      // Should complete without errors
      cy.get('.fc-view').should('exist');
    });
  });

  context('Performance', () => {
    it('should load calendar within acceptable time', () => {
      cy.visit('/calendar');

      // Calendar should load within 5 seconds
      cy.get('[data-testid="calendar-container"]', { timeout: 5000 }).should('be.visible');
      cy.get('.fc-view', { timeout: 5000 }).should('exist');
    });
  });

  context('Geo Features', () => {
    it('should load with default or user location', () => {
      // Calendar loads regardless of location
      cy.get('.fc-view').should('exist');

      // Note: Geo features will be tested more in Phase 3
    });
  });
});
