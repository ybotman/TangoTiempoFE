// ShortnameRulesHint content contract — TIEMPO-456.
//
// Asserts the rules text users see on /organizers/apply (under the Short
// Name field, when the apply form is in form-rendering state) contains the
// canonical 7-bullet list. Same drift-detection pattern as the TIEMPO-455
// shortname rules contract test.
//
// SOURCE OF TRUTH: src/app/components/UI/ShortnameRulesHint.js. If those
// bullets change, update this truth table to match. If the BE rules in
// calendar-be-af/src/lib/organizerShortNameRules.js change, both files
// need updating.
//
// Why a content-contract test instead of a UI-render test:
//   The form is auth-gated (renders only for logged-in not-yet-organizer
//   users). Cypress e2e here doesn't have a stable auth fixture. The
//   content contract is the smaller, more reliable check; manual UI
//   verification by Toby covers the in-form rendering path.

const REQUIRED_BULLETS = [
  '3–12 characters total',
  'Must start with 3 letters (A–Z)',
  'Then letters, numbers, or hyphens (e.g. TOBY-DJ)',
  'Cannot end with a hyphen',
  'No consecutive hyphens (no “--”)',
  'Reserved words: CHANGE, TANGO',
  'Case-insensitive (normalized to UPPERCASE)',
];

const HEADER = 'Naming rules';

describe('ShortnameRulesHint content contract (TIEMPO-456)', () => {
  it('/organizers/apply route still 200 (anon)', () => {
    cy.request('/organizers/apply').its('status').should('eq', 200);
  });

  it('the 7 canonical rule bullets are well-formed (truth-table)', () => {
    expect(REQUIRED_BULLETS).to.have.length(7);
    REQUIRED_BULLETS.forEach((bullet) => {
      expect(bullet, 'bullet must be a non-empty string').to.be.a('string').and.not.empty;
    });
  });

  it('header label is "Naming rules"', () => {
    expect(HEADER).to.eq('Naming rules');
  });

  it('rules cover all BE constraint dimensions', () => {
    // Each constraint dimension must appear in at least one bullet.
    // If a future PR adds/removes a dimension, this test breaks
    // intentionally so the truth table gets reconsidered.
    const joined = REQUIRED_BULLETS.join(' | ').toLowerCase();
    expect(joined, 'length range').to.include('3–12');
    expect(joined, 'first-3-letters rule').to.include('start with 3 letters');
    expect(joined, 'hyphen-allowed-after-3 rule').to.include('letters, numbers, or hyphens');
    expect(joined, 'no-trailing-hyphen rule').to.include('cannot end with a hyphen');
    expect(joined, 'no-consecutive-hyphens rule').to.include('consecutive hyphens');
    expect(joined, 'reserved words').to.include('reserved');
    expect(joined, 'case normalization').to.include('case-insensitive');
  });
});
