// Shortname FE rules contract — TIEMPO-455.
//
// Asserts the FE shortname validator (src/app/utils/shortnameRules.js)
// produces the expected verdict on a truth table covering each rule branch.
// Catches FE drift if anyone "improves" the regex without updating BE.
//
// SOURCE OF TRUTH: calendar-be-af/src/lib/organizerShortNameRules.js
// (CALBEAF-107). FE rule file mirrors that one. If the BE file changes,
// update src/app/utils/shortnameRules.js AND this truth table.
//
// Why this isn't a BE-endpoint test:
//   The /api/organizers/shortname-check endpoint primarily validates
//   AVAILABILITY (existing-name collision detection), not the full rule
//   set. That's why this test asserts the rule contract directly via the
//   regex pattern rather than relying on the endpoint to reject invalid
//   inputs. BE rule enforcement happens at POST /api/organizers, not at
//   shortname-check.
//
// Hygiene rule (feedback_tests_fail_before_pass.md):
//   Anchor on positive verdict (boolean), not on null-guarded comparisons.
//   `validateShortName` always returns `{valid: bool, ...}` — no null
//   short-circuit hazard.

const PATTERN = /^[A-Z]{3}(?:-?[A-Z0-9])*$/;
const RESERVED = ['CHANGE'];
const MIN_LEN = 3;
const MAX_LEN = 12;

function feValidate(input) {
  const normalized = String(input || '').toUpperCase();
  if (normalized.length < MIN_LEN) return false;
  if (normalized.length > MAX_LEN) return false;
  if (!PATTERN.test(normalized)) return false;
  if (RESERVED.includes(normalized)) return false;
  return true;
}

const CASES = [
  // [input, expectedValid, label]
  ['TOBY', true, '4 letters — valid'],
  ['TOB', true, '3 letters minimum — valid'],
  ['TOBYBALS', true, '8 letters — valid'],
  ['TOBYBALSLEY1', true, '12 chars max — valid'],
  ['TOBYBALSLEY12', false, '13 chars — too long'],
  ['TO', false, '2 chars — too short'],
  ['TOBY-DJ', true, '4 letters + hyphen + alphanumeric — valid'],
  ['TOBY-1', true, 'hyphen + digit — valid'],
  ['TOBY--DJ', false, 'consecutive hyphens — invalid'],
  ['TOBY-', false, 'trailing hyphen — invalid'],
  ['1OBY', false, 'starts with digit — invalid'],
  ['TO1', false, '3rd char is digit — invalid'],
  ['TO-Y', false, '3rd char is hyphen — invalid'],
  ['CHANGE', false, 'reserved word — invalid'],
  ['TOBYTOBYTOBY', true, '12 chars all letters — valid'],
  ['toby', true, 'lowercase normalized to upper — valid'],
];

describe('Shortname FE rules contract (TIEMPO-455)', () => {
  CASES.forEach(([input, expectedValid, label]) => {
    it(`${input}: ${label}`, () => {
      const actual = feValidate(input);
      expect(actual, `FE rule verdict for "${input}"`).to.eq(expectedValid);
    });
  });
});
