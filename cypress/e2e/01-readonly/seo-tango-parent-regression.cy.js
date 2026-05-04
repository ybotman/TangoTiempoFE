// SEO /tango/[parent] regression test — TIEMPO-451 / CALBEAF-173
//
// Bug history: PR #334 added an "orphan-parent event leak guard" that fixed
// only single-city parents. Multi-city parents (CA, NY, FL, AU, IT, etc.)
// continued calling getCountryEvents(masteredCountryId) and rendered country-
// wide events SSR. Tangotiempo's heaviest event density is Boston/MA, so
// /tango/california displayed Massachusetts events server-side.
//
// What this test asserts (BUG INVARIANT, not implementation invariant):
//   /tango/<multi-city-parent> SSR HTML must NOT contain known
//   Massachusetts/Boston venue strings. The events that DO render must
//   belong to the parent region, not leak from the country at large.
//
// Lifecycle resilience:
//   - Pre-fix code (#330/#334-era):     FAILS — MA venues present in HTML
//   - Track A (#344, events = []):      PASSES — no events render
//   - Track C (CALBEAF-173, scoped fetch): PASSES — only region events render
//
// Test runs against SSR HTML via cy.request, not the hydrated DOM —
// catches server-side leaks (which is where the bug lived).

describe('SEO /tango/[parent] — country-wide event leak regression (TIEMPO-451)', () => {
  // Known Massachusetts venue strings observed leaking on PROD pre-hotfix.
  // Captured 2026-05-04 from /tango/california SSR HTML on tangotiempo.com.
  // Add to this list if future leaks surface other regions' venues.
  const MA_VENUE_STRINGS = [
    'Ultimate Tango',                    // Boston tango venue (well-known)
    'First Churches of Northampton',     // Northampton, MA
    'Practica del Valle',                // MA-based event
  ];

  // Multi-city parents: where the leak surfaced. Single-city parents
  // (Massachusetts, Oregon, Colorado) were already protected by PR #334's
  // isSingleCity guard, so they're not the regression target — but they're
  // included as controls to confirm we didn't break them.
  const MULTI_CITY_PARENTS = ['california', 'new-york', 'australia'];
  const SINGLE_CITY_PARENTS = ['massachusetts', 'oregon'];

  function assertNoMassachusettsLeak(parentSlug) {
    cy.request(`/tango/${parentSlug}`).then((resp) => {
      expect(resp.status, `${parentSlug} HTTP status`).to.eq(200);
      MA_VENUE_STRINGS.forEach((venue) => {
        expect(resp.body, `${parentSlug} SSR must not contain "${venue}"`)
          .to.not.include(venue);
      });
    });
  }

  context('Multi-city parents (regression target)', () => {
    MULTI_CITY_PARENTS.forEach((slug) => {
      it(`/tango/${slug} SSR contains no MA venue strings`, () => {
        assertNoMassachusettsLeak(slug);
      });
    });
  });

  context('Single-city parents (control — already correct pre-hotfix)', () => {
    SINGLE_CITY_PARENTS.forEach((slug) => {
      it(`/tango/${slug} SSR remains clean`, () => {
        // Single-city parents that ARE Massachusetts (e.g. /tango/massachusetts)
        // would legitimately surface MA venues — exclude that case from the
        // assertion. Only run leak-check for non-MA single-city parents.
        if (slug !== 'massachusetts') {
          assertNoMassachusettsLeak(slug);
        } else {
          // For massachusetts itself, just assert page renders successfully.
          cy.request(`/tango/${slug}`).its('status').should('eq', 200);
        }
      });
    });
  });

  context('Page skeleton intact (smoke)', () => {
    it('multi-city parent renders landing skeleton', () => {
      cy.visit('/tango/california');
      cy.contains('h1', 'Argentine Tango Events in California').should('exist');
      cy.contains('Tango Cities in California').should('exist');
      cy.contains('Browse Full Calendar').should('exist');
    });
  });
});
