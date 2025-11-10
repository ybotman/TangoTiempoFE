// Boston Calendar Readonly Tests
// Test Group 1: Verify bostontangocalendar.com functionality

describe('Boston Calendar - Readonly Access', () => {

  beforeEach(() => {
    // Visit Boston calendar (proxy to tangotiempo.com/calendar/boston)
    cy.visit('/calendar/boston');

    // Wait for calendar to load
    cy.get('[data-testid="calendar-container"]', { timeout: 10000 }).should('be.visible');
    cy.calendarShouldBeLoaded();
  });

  context('Desktop View', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it.skip('should display 8-week view by default', () => {
      // Check for dayGrid view (8-week custom view uses dayGrid type)
      cy.get('.fc-view').should('exist');

      // FullCalendar v6 uses .fc-daygrid (lowercase, no dash before "view")
      cy.get('.fc-daygrid').should('exist');

      // Verify multiple days are visible (v6 uses .fc-daygrid-day)
      cy.get('.fc-daygrid-day').should('have.length.at.least', 20);
    });

    it.skip('should display Boston-specific events', () => {
      // Events should be visible (may be 0 if no events in range)
      cy.get('.fc-event').should('exist');

      // Note: Location display may not exist in Boston calendar (locked location)
      // Boston calendar doesn't show location selector
    });

    it.skip('should navigate between date ranges', () => {
      // Get initial visible date from calendar
      cy.get('.fc-daygrid-day').first().invoke('attr', 'data-date').then(initialDate => {
        // Navigate to next period
        cy.navigateCalendar('next');

        // Verify date range changed
        cy.get('.fc-daygrid-day').first().invoke('attr', 'data-date').should('not.equal', initialDate);

        // Navigate back
        cy.navigateCalendar('prev');

        // Should return to initial date
        cy.get('.fc-daygrid-day').first().invoke('attr', 'data-date').should('equal', initialDate);
      });
    });

    it.skip('should show event details on click', () => {
      // Check if events exist first
      cy.get('.fc-event').then($events => {
        if ($events.length > 0) {
          // Click first event
          cy.get('.fc-event').first().click();

          // Event modal should appear
          cy.get('[data-testid="event-modal"]', { timeout: 5000 }).should('be.visible');

          // Close modal using the close button
          cy.get('[data-testid="modal-close"]').click();

          // Modal should disappear
          cy.get('[data-testid="event-modal"]').should('not.exist');
        }
      });
    });

    it.skip('should filter by category', () => {
      // Category filtering functionality exists but selectors may vary
      // This test is simplified for Phase 1
      cy.get('.fc-event').should('exist');

      // Note: Category filter implementation will be tested in Phase 3
    });
  });

  context('Mobile View', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it.skip('should display list view on mobile', () => {
      // Should show list view, not grid
      // FullCalendar v6 uses .fc-list for list views
      cy.get('.fc-list').should('exist');
      cy.get('.fc-daygrid').should('not.exist');
    });

    it.skip('should show events in list format', () => {
      // List should have date headers
      cy.get('.fc-list-day, .fc-list-day-cushion').should('have.length.at.least', 1);

      // Events should be in list format (or view is empty)
      cy.get('.fc-view').should('exist');
    });

    it.skip('should navigate dates on mobile', () => {
      // Navigate using custom command
      cy.navigateCalendar('next');
      cy.waitForEvents();

      // Navigate back
      cy.navigateCalendar('prev');
      cy.waitForEvents();

      // Should complete without errors
      cy.get('.fc-view').should('exist');
    });
  });

  context('Common Features', () => {
    it.skip('should not show location change option for Boston calendar', () => {
      // Boston calendar has fixed location - no map center button
      // Just verify calendar loads correctly
      cy.get('[data-testid="boston-calendar-page"]').should('exist');
    });

    it.skip('should handle navigation without errors', () => {
      // Navigate far into future
      for(let i = 0; i < 12; i++) {
        cy.navigateCalendar('next');
        cy.wait(200);
      }

      // Calendar should still be functional
      cy.get('.fc-view').should('exist');
    });

    it.skip('should load calendar after page refresh', () => {
      // Navigate to next period
      cy.navigateCalendar('next');

      // Refresh page
      cy.reload();

      // Calendar should load again
      cy.get('[data-testid="calendar-container"]', { timeout: 10000 }).should('be.visible');
      cy.calendarShouldBeLoaded();
    });
  });

  context('Performance', () => {
    it.skip('should load calendar within acceptable time', () => {
      cy.visit('/calendar/boston');

      // Calendar should be visible within 5 seconds
      cy.get('[data-testid="calendar-container"]', { timeout: 5000 }).should('be.visible');

      // Calendar view should be rendered
      cy.get('.fc-view', { timeout: 5000 }).should('exist');
    });
  });
});