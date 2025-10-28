/**
 * Visitor Tracking Utilities
 *
 * Manages visitor identity with persistent cookies and welcome modal state.
 * Part of TIEMPO-329: Managed User Entry Flow
 *
 * @module visitorTracking
 */

import Cookies from 'js-cookie';

// Constants
const COOKIE_NAME = 'visitor_id';
const COOKIE_EXPIRY_DAYS = 365; // 1 year as per TIEMPO-329 spec
const WELCOME_SHOWN_KEY = 'welcome_shown';
const WELCOME_SHOWN_AT_KEY = 'welcome_shown_at';
const VISITOR_FIRST_VISIT_KEY = 'visitor_first_visit';
const LAST_MAP_CENTER_KEY = 'last_map_center';
const VISIT_COUNT_KEY = 'visit_count'; // TIEMPO-329: Track visit number for onboarding flow

/**
 * Get or create a persistent visitor ID using UUID
 * Creates a new UUID v4 on first visit and stores in cookie (365-day expiry)
 *
 * @returns {string} UUID visitor_id
 *
 * @example
 * const visitorId = getOrCreateVisitorId();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export const getOrCreateVisitorId = () => {
  // Check for existing visitor_id cookie
  let visitorId = Cookies.get(COOKIE_NAME);

  if (!visitorId) {
    // Generate new UUID v4 using browser crypto API
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      visitorId = crypto.randomUUID();
    } else {
      // Fallback for browsers without crypto.randomUUID()
      visitorId = generateUUIDFallback();
    }

    // Store in cookie with 365-day expiry
    Cookies.set(COOKIE_NAME, visitorId, {
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: 'Lax',  // Allow cross-site navigation
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined  // Configurable domain
    });

    // Track first visit timestamp
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(VISITOR_FIRST_VISIT_KEY, new Date().toISOString());
    }

    console.log('[Visitor] New visitor_id created:', visitorId);
  } else {
    console.log('[Visitor] Existing visitor_id found:', visitorId);
  }

  return visitorId;
};

/**
 * Fallback UUID generator for browsers without crypto.randomUUID()
 * Generates RFC4122 version 4 compliant UUID
 *
 * @private
 * @returns {string} UUID v4
 */
const generateUUIDFallback = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Check if this is a first-time visitor (no visitor_id cookie exists)
 *
 * @returns {boolean} True if first-time visitor, false if returning
 *
 * @example
 * if (isFirstTimeVisitor()) {
 *   showWelcomeModal();
 * }
 */
export const isFirstTimeVisitor = () => {
  return !Cookies.get(COOKIE_NAME);
};

/**
 * Check if this is a returning visitor (has visitor_id cookie)
 *
 * @returns {boolean} True if returning visitor, false if first-time
 */
export const isReturningVisitor = () => {
  return !!Cookies.get(COOKIE_NAME);
};

/**
 * Mark welcome modal as shown
 * Stores flag in localStorage to prevent showing modal again
 *
 * @example
 * setWelcomeShown();  // Modal won't show again
 */
export const setWelcomeShown = () => {
  if (typeof localStorage === 'undefined') return;

  localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
  localStorage.setItem(WELCOME_SHOWN_AT_KEY, new Date().toISOString());
  console.log('[Visitor] Welcome modal marked as shown');
};

/**
 * Check if welcome modal was previously shown
 *
 * @returns {boolean} True if welcome was shown before, false otherwise
 *
 * @example
 * if (!wasWelcomeShown()) {
 *   setShowWelcomeModal(true);
 * }
 */
export const wasWelcomeShown = () => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(WELCOME_SHOWN_KEY) === 'true';
};

/**
 * Reset welcome shown flag (for testing or allowing re-display)
 *
 * @example
 * resetWelcomeShown();  // Modal will show again on next visit
 */
export const resetWelcomeShown = () => {
  if (typeof localStorage === 'undefined') return;

  localStorage.removeItem(WELCOME_SHOWN_KEY);
  localStorage.removeItem(WELCOME_SHOWN_AT_KEY);
  console.log('[Visitor] Welcome shown flag reset');
};

/**
 * Get timestamp of when welcome modal was first shown
 *
 * @returns {string|null} ISO timestamp or null if never shown
 */
export const getWelcomeShownAt = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(WELCOME_SHOWN_AT_KEY);
};

/**
 * Get timestamp of visitor's first visit
 *
 * @returns {string|null} ISO timestamp or null if not available
 */
export const getFirstVisitTimestamp = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(VISITOR_FIRST_VISIT_KEY);
};

/**
 * Save last selected map center to localStorage
 * Used to restore visitor's location on return visits
 *
 * @param {Object} mapCenter - Map center coordinates and zoom
 * @param {number} mapCenter.lat - Latitude
 * @param {number} mapCenter.lng - Longitude
 * @param {number} mapCenter.zoomRange - Zoom range in miles
 *
 * @example
 * saveLastMapCenter({
 *   lat: 40.7128,
 *   lng: -74.0060,
 *   zoomRange: 50
 * });
 */
export const saveLastMapCenter = (mapCenter) => {
  if (typeof localStorage === 'undefined') return;

  if (!mapCenter || typeof mapCenter.lat !== 'number' || typeof mapCenter.lng !== 'number') {
    console.warn('[Visitor] Invalid map center data:', mapCenter);
    return;
  }

  localStorage.setItem(LAST_MAP_CENTER_KEY, JSON.stringify(mapCenter));
  console.log('[Visitor] Map center saved:', mapCenter);
};

/**
 * Get last selected map center from localStorage
 *
 * @returns {Object|null} Map center object or null if not found
 * @returns {number} return.lat - Latitude
 * @returns {number} return.lng - Longitude
 * @returns {number} return.zoomRange - Zoom range in miles
 *
 * @example
 * const lastCenter = getLastMapCenter();
 * if (lastCenter) {
 *   restoreMapView(lastCenter.lat, lastCenter.lng, lastCenter.zoomRange);
 * }
 */
export const getLastMapCenter = () => {
  if (typeof localStorage === 'undefined') return null;

  const stored = localStorage.getItem(LAST_MAP_CENTER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('[Visitor] Failed to parse map center:', error);
    return null;
  }
};

/**
 * Clear all visitor tracking data (for testing or privacy reset)
 * Removes cookie and all localStorage data
 *
 * @example
 * clearVisitorData();  // Complete reset - treats user as new visitor
 */
export const clearVisitorData = () => {
  // Remove cookie
  Cookies.remove(COOKIE_NAME);

  // Clear localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(WELCOME_SHOWN_KEY);
    localStorage.removeItem(WELCOME_SHOWN_AT_KEY);
    localStorage.removeItem(VISITOR_FIRST_VISIT_KEY);
    localStorage.removeItem(LAST_MAP_CENTER_KEY);
    localStorage.removeItem(VISIT_COUNT_KEY);
  }

  console.log('[Visitor] All visitor data cleared');
};

/**
 * Increment and get visit count
 * Call this on each page load to track visitor return behavior
 *
 * @returns {number} Current visit number (1, 2, 3, ...)
 *
 * @example
 * const visitNum = incrementVisitCount();
 * // Returns: 1 (first visit), 2 (second), etc.
 */
export const incrementVisitCount = () => {
  if (typeof localStorage === 'undefined') return 1;

  const current = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
  const next = current + 1;

  localStorage.setItem(VISIT_COUNT_KEY, next.toString());
  console.log('[Visitor] Visit count:', next);

  return next;
};

/**
 * Get current visit count without incrementing
 *
 * @returns {number} Current visit number (0 if never visited)
 */
export const getVisitCount = () => {
  if (typeof localStorage === 'undefined') return 0;
  return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
};

/**
 * Reset visit count (for testing)
 *
 * @example
 * resetVisitCount(); // Next visit will be #1
 */
export const resetVisitCount = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(VISIT_COUNT_KEY);
  console.log('[Visitor] Visit count reset');
};

/**
 * Get complete visitor state for debugging
 *
 * @returns {Object} Visitor state information
 *
 * @example
 * console.log('Visitor State:', getVisitorState());
 */
export const getVisitorState = () => {
  return {
    visitorId: Cookies.get(COOKIE_NAME) || null,
    isFirstTime: isFirstTimeVisitor(),
    isReturning: isReturningVisitor(),
    welcomeShown: wasWelcomeShown(),
    welcomeShownAt: getWelcomeShownAt(),
    firstVisit: getFirstVisitTimestamp(),
    lastMapCenter: getLastMapCenter(),
    visitCount: getVisitCount()
  };
};
