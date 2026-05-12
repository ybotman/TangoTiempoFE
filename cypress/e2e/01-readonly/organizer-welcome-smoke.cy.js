// /organizers/welcome smoke — TIEMPO-454
// Browser-side rendering check. The page is a 'use client' Next.js page so
// SSR HTML is just the layout shell; content materializes after hydration.
// curl can't see it; Cypress can.

describe('SEO /organizers/welcome — smoke (TIEMPO-454)', () => {
  it('renders welcome content for an anonymous visitor (sign-in nudge OR welcome page)', () => {
    cy.visit('/organizers/welcome');
    // Either the anonymous gate alert or the welcome heading should appear.
    // Anon gate appears if AuthContext resolves with no user; welcome page
    // appears if loading stays true (initial state). Either is correct
    // unauthenticated render.
    cy.get('body').should('contain.text', 'Tango');
    // Specifically: anon-gate nudge OR welcome hero — at least one must be present
    cy.contains(/Please sign in to view the Organizer Welcome|Welcome, Regional Organizer/, {
      timeout: 10000,
    }).should('exist');
  });

  it('does NOT render the new "Already an Organizer" excerpt on /organizers/apply for anonymous users', () => {
    cy.visit('/organizers/apply');
    // Anon gets the AuthGate / signup prompt, not the already-organizer excerpt.
    cy.contains('Visit your Organizer Welcome').should('not.exist');
  });

  it('serves /organizers/welcome with HTTP 200', () => {
    cy.request('/organizers/welcome').its('status').should('eq', 200);
  });

  it('does NOT regress /organizers/apply route', () => {
    cy.request('/organizers/apply').its('status').should('eq', 200);
  });
});
