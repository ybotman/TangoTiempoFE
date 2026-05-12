// FE shortname validation utility (TIEMPO-455).
//
// SOURCE OF TRUTH: calendar-be-af/src/lib/organizerShortNameRules.js
// (CALBEAF-107 + Toby ruling 2026-04-14). This file MIRRORS the BE rules so
// FE rejects invalid input before the POST round-trip and renders the same
// constraint messaging the BE would surface on a 4xx.
//
// IF THE BE RULES CHANGE: update this file too. Drift between FE and BE
// produces the exact "FE accepts what BE rejects" / "FE rejects what BE
// accepts" UX bugs this utility was created to eliminate. Per Quinn's DRY
// observation, a future shared package (calendar-be-af exports → npm) would
// avoid even this manual mirror; until then, this is the canonical FE source
// and any divergence is a bug.
//
// Charset:
//   - Length 3–12
//   - First 3 chars MUST be A-Z letters
//   - Chars 4+ may be A-Z, 0-9, or hyphen
//   - Must end alphanumeric (no trailing hyphen)
//   - No consecutive hyphens
//   - No spaces, no underscore, no unicode
//   - Case-insensitive via UPPERCASE normalization
//   - Reserved: ['CHANGE']
//
// appId=1 only configured. Hard pass-through (valid:true) for any other appId.

export const SHORTNAME_RULES = {
  '1': {
    minLength: 3,
    maxLength: 12,
    pattern: /^[A-Z]{3}(?:-?[A-Z0-9])*$/,
    reserved: ['CHANGE'],
  },
  // No other appIds configured. appId=2 (HJ) etc. receive no rules entry.
};

export function getShortNameRules(appId) {
  return SHORTNAME_RULES[String(appId)] || null;
}

// Returns { valid: true, normalized } on pass,
// or { valid: false, reason, message, normalized } on fail.
//
// Reasons mirror BE: 'invalid-length' | 'invalid-pattern' | 'reserved'.
export function validateShortName(shortName, appId) {
  const rules = getShortNameRules(appId);
  if (!rules) return { valid: true };

  const normalized = String(shortName || '').toUpperCase();

  if (normalized.length < rules.minLength) {
    return {
      valid: false,
      reason: 'invalid-length',
      message: `Short name must be at least ${rules.minLength} characters`,
      normalized,
    };
  }
  if (normalized.length > rules.maxLength) {
    return {
      valid: false,
      reason: 'invalid-length',
      message: `Short name exceeds maximum of ${rules.maxLength} characters`,
      normalized,
    };
  }
  if (!rules.pattern.test(normalized)) {
    return {
      valid: false,
      reason: 'invalid-pattern',
      message:
        'First 3 characters must be letters; rest must be letters, numbers, or hyphens; no trailing or consecutive hyphens',
      normalized,
    };
  }
  if (rules.reserved.includes(normalized)) {
    return {
      valid: false,
      reason: 'reserved',
      message: `Short name "${normalized}" is reserved`,
      normalized,
    };
  }

  return { valid: true, normalized };
}
