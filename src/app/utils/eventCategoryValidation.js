/**
 * Event Category Duration Validation (TIEMPO-291)
 *
 * Rules:
 * 1. SHORT events (Milonga, Practica, Class) must be < 24 hours
 * 2. LONG events (Festival, Encuentro, Marathon, Workshop) must be >= 48 hours
 * 3. SHORT and LONG categories cannot be mixed (mutual exclusion)
 *
 * RegionalAdmin bypasses all validation.
 */

// Category classifications
export const SHORT_CATEGORIES = ['Milonga', 'Practica', 'Class'];
export const LONG_CATEGORIES = ['Festival', 'Encuentro', 'Marathon', 'Workshop'];
export const NEUTRAL_CATEGORIES = ['Trip', 'Unknown'];

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

  // Calculate duration in hours
  if (!eventData.startDate || !eventData.endDate) {
    return { isValid: true, errors: [] }; // Skip validation if dates not set
  }

  const durationHours = eventData.endDate.diff(eventData.startDate, 'hour', true);

  // Rule 1: SHORT events must be < 24 hours
  if (SHORT_CATEGORIES.includes(categoryFirst)) {
    if (durationHours >= 24) {
      const categoryName = categoryFirst === 'Class' ? 'Classes' : `${categoryFirst}s`;
      errors.push(`${categoryName} must be less than 24 hours. Current duration: ${Math.round(durationHours)} hours.`);
    }
  }

  // Rule 2: LONG events must be >= 48 hours
  if (LONG_CATEGORIES.includes(categoryFirst)) {
    if (durationHours < 48) {
      const categoryName = categoryFirst === 'Workshop' ? 'Workshops' : `${categoryFirst}s`;
      errors.push(`${categoryName} must be 48 hours or longer. Current duration: ${Math.round(durationHours)} hours.`);
    }
  }

  // Rule 3: Mutual exclusion - SHORT and LONG cannot be mixed
  const allCategories = [categoryFirst, categorySecond, categoryThird].filter(cat => cat);
  const hasShort = allCategories.some(cat => SHORT_CATEGORIES.includes(cat));
  const hasLong = allCategories.some(cat => LONG_CATEGORIES.includes(cat));

  if (hasShort && hasLong) {
    errors.push(
      'Short events (Milonga, Practica, Class) and Long events (Festival, Encuentro, Marathon, Workshop) cannot be combined. Please choose categories from the same group.'
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
 * @returns {string} 'SHORT', 'LONG', or 'NEUTRAL'
 */
export const getCategoryGroup = (category) => {
  if (SHORT_CATEGORIES.includes(category)) return 'SHORT';
  if (LONG_CATEGORIES.includes(category)) return 'LONG';
  return 'NEUTRAL';
};
