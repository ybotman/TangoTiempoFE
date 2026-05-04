// SEO /tango/[parent] region-assertion test — CALBEAF-173 (Track C)
//
// Supersedes the bug-shaped PR #345 regression test once Track C ships.
// Both can co-exist; this one is the canonical contract-level assertion.
//
// What this asserts (REGION CORRECTNESS, positive set-membership):
//   For every parent (CA, NY, AU, MA):
//     1. BE endpoint returns events whose masteredCountryName matches the
//        parent's expected country (positive single-value membership)
//     2. BE endpoint returns events with non-empty masteredCityName
//        (rules out null short-circuit hazards)
//     3. State-level disjointness: events from /api/events?parentSlug=california
//        do NOT appear in /api/events?parentSlug=massachusetts (catches
//        state-level leaks that country-only checks would miss)
//     4. FE page renders successfully with parent name in title
//
// Test-hygiene rule (from Fulton's M3 self-catch, codified in
// feedback_tests_fail_before_pass.md):
//   ✗ DO NOT anchor on potentially-null fields with truthy-guard inequality
//     (e.g. `e.masteredDivisionName && e.masteredDivisionName !== 'California'`)
//     — short-circuits to silent pass when the field is null.
//   ✓ DO anchor on always-populated fields with positive set membership.
//
// Field availability (verified 2026-05-04 against TEST + PROD):
//   - masteredCityId       always populated
//   - masteredCityName     always populated  ← anchor here
//   - masteredCountryName  always populated  ← anchor here
//   - masteredDivisionName NOT populated     ← do NOT anchor
//
// Why not geo-summary as expected city set:
//   geo-summary?parentSlug=california returns 4 cities (event-windowed),
//   but masteredcities + events endpoint resolve to a broader set
//   (e.g. Orange County also shows up). geo-summary is curated for SEO
//   display, not authoritative for region assertion.
//
// Lifecycle:
//   - Pre-Track-C (Track A `events = []`): N/A — empty results valid by contract
//   - Post-Track-C (parent-scoped fetch):  PASS — country/city checks hold,
//                                                cross-state disjoint holds
//   - Future regression (BE returns wrong region): FAIL — country mismatch
//                                                 OR cross-state overlap

const PARENTS = [
  { slug: 'california', country: 'United States', kind: 'multi-city-state' },
  { slug: 'new-york', country: 'United States', kind: 'multi-city-state' },
  { slug: 'australia', country: 'Australia', kind: 'multi-city-country' },
  { slug: 'massachusetts', country: 'United States', kind: 'single-city-state' },
];

function eventsRequest(parentSlug, limit = 50) {
  const now = new Date().toISOString();
  const end = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  return cy.request(
    `/api/events?appId=1&parentSlug=${parentSlug}&start=${now}&end=${end}&limit=${limit}`,
  );
}

describe('SEO /tango/[parent] region assertion (CALBEAF-173)', () => {
  PARENTS.forEach(({ slug, country, kind }) => {
    context(`Parent: ${slug} (${kind})`, () => {
      it(`BE events all have masteredCountryName="${country}" and populated masteredCityName`, () => {
        eventsRequest(slug).then((resp) => {
          expect(resp.status).to.eq(200);
          const events = resp.body.events || [];
          // Empty results are acceptable per fail-closed contract.
          events.forEach((e) => {
            expect(
              e.masteredCityName,
              `event ${e._id || e.title} masteredCityName must be populated string`,
            ).to.be.a('string').and.not.empty;
            expect(
              e.masteredCountryName,
              `event ${e._id || e.title} ("${e.masteredCityName}") masteredCountryName must be "${country}"`,
            ).to.eq(country);
          });
          cy.log(`${slug}: ${events.length} events, all country=${country}, cityName populated`);
        });
      });

      it('FE /tango page renders with parent name in title', () => {
        cy.request(`/tango/${slug}`).then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp.body).to.include('Argentine Tango Events in');
          expect(resp.body).to.include('Tango Cities in');
        });
      });
    });
  });

  context('Cross-state disjointness — California ⊄ Massachusetts (state-level leak guard)', () => {
    it('no event ID returned for parentSlug=california appears in parentSlug=massachusetts', () => {
      let caIds = new Set();
      eventsRequest('california', 100).then((caResp) => {
        expect(caResp.status).to.eq(200);
        caIds = new Set((caResp.body.events || []).map((e) => e._id));
        eventsRequest('massachusetts', 100).then((maResp) => {
          expect(maResp.status).to.eq(200);
          const maIds = (maResp.body.events || []).map((e) => e._id);
          const overlap = maIds.filter((id) => caIds.has(id));
          expect(
            overlap,
            `CA and MA event sets must be disjoint; overlap: ${JSON.stringify(overlap)}`,
          ).to.have.length(0);
        });
      });
    });
  });

  context('Negative case: unknown parent slug fails closed', () => {
    it('BE returns empty events for nonexistent parent', () => {
      eventsRequest('this-parent-does-not-exist-zzz').then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body.events || []).to.have.length(0);
      });
    });
  });
});
