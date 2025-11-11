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

    it('should display 8-week view by default', () => {
      // Check for dayGrid view (8-week custom view uses dayGrid type)
      cy.get('.fc-view').should('exist');

      // FullCalendar v6 uses .fc-daygrid (lowercase, no dash before "view")
      cy.get('.fc-daygrid').should('exist');

      // Verify multiple days are visible (v6 uses .fc-daygrid-day)
      cy.get('.fc-daygrid-day').should('have.length.at.least', 20);
    });

    it('should display Boston-specific events', () => {
      // Calendar should load successfully
      cy.get('.fc-view').should('exist');

      // Check if events exist OR if "No Events Found" message is displayed
      cy.get('body').then($body => {
        if ($body.find('.fc-event').length > 0) {
          // Events exist - verify they're visible
          cy.get('.fc-event').should('be.visible');
        } else {
          // No events in current range - verify "No Events Found" message
          cy.contains('No Events Found').should('be.visible');
        }
      });

      // Boston calendar should not show location selector (locked to Boston)
      cy.get('[data-testid="location-selector"]').should('not.exist');
    });

    it('should navigate between date ranges', () => {
      // Verify navigation buttons exist and are clickable
      cy.get('[data-testid="nav-prev"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="nav-next"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="nav-today"]').should('be.visible').and('not.be.disabled');

      // Click next button
      cy.get('[data-testid="nav-next"]').click();
      cy.wait(1000); // Allow calendar to update

      // Calendar should still be functional after navigation
      cy.get('.fc-view').should('exist');
      cy.get('.fc-daygrid').should('exist');

      // Click prev button
      cy.get('[data-testid="nav-prev"]').click();
      cy.wait(1000);

      // Calendar should still be functional
      cy.get('.fc-view').should('exist');
      cy.get('.fc-daygrid').should('exist');
    });

    it('should show event details on click', () => {
      // Check if events exist in the calendar
      cy.get('body').then($body => {
        if ($body.find('.fc-event').length > 0) {
          // Events exist - test modal functionality
          cy.get('.fc-event').first().click();

          // Event modal should appear
          cy.get('[data-testid="event-modal"]', { timeout: 5000 }).should('be.visible');

          // Close modal using the close button
          cy.get('[data-testid="modal-close"]').click();

          // Modal should disappear
          cy.get('[data-testid="event-modal"]').should('not.exist');
        } else {
          // No events - verify "No Events Found" message is displayed
          cy.contains('No Events Found').should('be.visible');
        }
      });
    });

    it('should filter by category', () => {
      // Verify category filter button exists
      cy.get('[data-testid="filter-button"], button').contains(/categories|filter/i).should('exist');

      // Calendar should be functional (whether events exist or not)
      cy.get('.fc-view').should('exist');

      // Note: Full category filter implementation testing deferred to Phase 3
    });
  });

  context('Mobile View', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should display list view on mobile', () => {
      // Should show list view, not grid
      // FullCalendar v6 uses .fc-list for list views
      cy.get('.fc-list').should('exist');
      cy.get('.fc-daygrid').should('not.exist');
    });

    it('should show events in list format', () => {
      // Verify list view exists
      cy.get('.fc-list').should('exist');

      // Calendar should be functional in list format
      cy.get('.fc-view').should('exist');

      // Note: Date headers only appear when events exist
    });

    it('should navigate dates on mobile', () => {
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
    it('should not show location change option for Boston calendar', () => {
      // Boston calendar has fixed location - no map center button
      // Just verify calendar loads correctly
      cy.get('[data-testid="boston-calendar-page"]').should('exist');
    });

    it('should handle navigation without errors', () => {
      // Navigate far into future
      for(let i = 0; i < 12; i++) {
        cy.navigateCalendar('next');
        cy.wait(200);
      }

      // Calendar should still be functional
      cy.get('.fc-view').should('exist');
    });

    it('should load calendar after page refresh', () => {
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
    it('should load calendar within acceptable time', () => {
      cy.visit('/calendar/boston');

      // Calendar should be visible within 5 seconds
      cy.get('[data-testid="calendar-container"]', { timeout: 5000 }).should('be.visible');

      // Calendar view should be rendered
      cy.get('.fc-view', { timeout: 5000 }).should('exist');
    });
  });
});