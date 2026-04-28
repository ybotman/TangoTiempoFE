/**
 * Event Category Duration Validation (TIEMPO-291, TIEMPO-440)
 *
 * Canonical rule (mirrors BE CALBEAF-154 — `calendar-be-af/src/utils/eventCategoryValidation.js`):
 *
 * 1. SHORT events (Milonga, Practica, Class) — 15 min ≤ duration < 24h
 * 2. LONG  events (Festival, Encuentro, Marathon) — 24h ≤ duration ≤ 168h
 * 3. FLEX  events (Workshop, Other) — 15 min ≤ duration ≤ 168h (no LONG-min gate)
 * 4. Hard cap on any event: 168h (7 days)
 * 5. Mix rule: SHORT + LONG cannot combine. FLEX combines with either.
 *
 * RegionalAdmin bypasses all validation.
 *
 * DayWorkshop deprecated (TIEMPO-440): time is the distinction, not the label.
 * A small workshop = Workshop with short duration; a multi-day workshop =
 * Workshop with long duration. No more separate label.
 */

// Category classifications
export const SHORT_CATEGORIES = ['Milonga', 'Practica', 'Class'];
export const LONG_CATEGORIES = ['Festival', 'Encuentro', 'Marathon'];
export const FLEX_CATEGORIES = ['Workshop', 'Other'];
export const NEUTRAL_CATEGORIES = ['Trip', 'Unknown'];

const HARD_CAP_HOURS = 168; // 7 days

/**
 * Validate event duration and category combinations
 * @param {Object} eventData - Event data containing startDate, endDate, and category fields
 * @param {string} selectedRole - User role ('RegionalAdmin' bypasses validation)
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateEventCategoryRules = (eventData, selectedRole) => {
  // RegionalAdmin bypasses all validation
  if (selectedRole === 'RegionalAdmin') {
    return { isValid: true, errors: [] };
  }

  const errors = [];

  // Extract categories
  const categoryFirst = eventData.categoryFirst || '';
  const categorySecond = eventData.categorySecond || '';
  const categoryThird = eventData.categoryThird || '';

  // Calculate duration
  if (!eventData.startDate || !eventData.endDate) {
    return { isValid: true, errors: [] }; // Skip validation if dates not set
  }

  const durationHours = eventData.endDate.diff(eventData.startDate, 'hour', true);
  const durationMinutes = eventData.endDate.diff(eventData.startDate, 'minute', true);

  // Pluralize for friendlier error copy
  const pluralize = (cat) => (cat === 'Class' ? 'Classes' : `${cat}s`);

  // Rule 1: SHORT — 15 min ≤ duration < 24h
  if (SHORT_CATEGORIES.includes(categoryFirst)) {
    if (durationMinutes < 15) {
      errors.push(`${pluralize(categoryFirst)} must be at least 15 minutes. Current duration: ${Math.round(durationMinutes)} minutes.`);
    }
    if (durationHours >= 24) {
      errors.push(`${pluralize(categoryFirst)} must be less than 24 hours. Current duration: ${Math.round(durationHours)} hours.`);
    }
  }

  // Rule 2: LONG — 24h ≤ duration ≤ 168h
  if (LONG_CATEGORIES.includes(categoryFirst)) {
    if (durationHours < 24) {
      errors.push(`${pluralize(categoryFirst)} must be 24 hours or longer. Current duration: ${Math.round(durationHours)} hours.`);
    }
  }

  // Rule 3: FLEX — 15 min ≤ duration ≤ 168h (no LONG-min)
  if (FLEX_CATEGORIES.includes(categoryFirst)) {
    if (durationMinutes < 15) {
      errors.push(`${pluralize(categoryFirst)} must be at least 15 minutes. Current duration: ${Math.round(durationMinutes)} minutes.`);
    }
  }

  // Rule 4: Hard cap on duration applies to anything that's bucketed
  const isBucketed =
    SHORT_CATEGORIES.includes(categoryFirst) ||
    LONG_CATEGORIES.includes(categoryFirst) ||
    FLEX_CATEGORIES.includes(categoryFirst);
  if (isBucketed && durationHours > HARD_CAP_HOURS) {
    const durationDays = Math.round(durationHours / 24);
    errors.push(`Events cannot exceed 7 days. Current duration: ${durationDays} days (${Math.round(durationHours)} hours).`);
  }

  // Rule 5: Mutual exclusion — SHORT + LONG cannot combine. FLEX is permissive.
  const allCategories = [categoryFirst, categorySecond, categoryThird].filter(Boolean);
  const hasShort = allCategories.some(cat => SHORT_CATEGORIES.includes(cat));
  const hasLong = allCategories.some(cat => LONG_CATEGORIES.includes(cat));
  if (hasShort && hasLong) {
    errors.push(
      'Short events (Milonga, Practica, Class) and Long events (Festival, Encuentro, Marathon) cannot be combined. Please choose categories from the same group.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get user-friendly category group name
 * @param {string} category - Category name
 * @returns {'SHORT'|'LONG'|'FLEX'|'NEUTRAL'} Group name
 */
export const getCategoryGroup = (category) => {
  if (SHORT_CATEGORIES.includes(category)) return 'SHORT';
  if (LONG_CATEGORIES.includes(category)) return 'LONG';
  if (FLEX_CATEGORIES.includes(category)) return 'FLEX';
  return 'NEUTRAL';
};
