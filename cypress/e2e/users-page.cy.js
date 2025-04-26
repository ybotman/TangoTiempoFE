// <reference types="cypress" />
// cypress/e2e/users-page.cy.js
describe('Users Page', () => {
  beforeEach(() => {
    // Using baseUrl from cypress.config.js which is set from NEXT_PUBLIC_FE_URL
    cy.visit('/organizers');
  });

  it('should show organizers page title', () => {
    cy.contains('Organizers').should('be.visible');
  });

  it('should display organizer cards', () => {
    cy.get('[data-cy="organizer-card"], .organizer-card')
      .should('exist');
  });

  it('should allow filtering organizers', () => {
    cy.get('input[type="search"], [data-cy="search-field"], .search-field')
      .should('exist');
  });
});