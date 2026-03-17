/**
 * eventOverrides.js
 * TIEMPO-362: API service functions for recurring event instance overrides
 *
 * Endpoints (calendar-be-af):
 * - POST /api/events/:eventId/override - Create/update override
 * - DELETE /api/events/:eventId/override/:instanceKey - Remove override
 * - GET /api/events/:eventId/overrides - List all overrides
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071/api';

/**
 * Create or update an instance override for a recurring event
 *
 * @param {string} eventId - The master event ID
 * @param {object} override - Override data
 * @param {string|Date} override.instanceKey - Occurrence datetime (venue TZ)
 * @param {string} override.overrideType - "modify" | "cancel"
 * @param {object} override.patch - Fields to override (notes, djName, startDate, etc.)
 * @param {string} firebaseToken - Firebase auth token (required)
 * @returns {Promise<object>} Updated event
 */
export async function createOverride(eventId, override, firebaseToken) {
  if (!firebaseToken) {
    throw new Error('Firebase auth token required for override operations');
  }

  const response = await axios.post(
    `${API_BASE_URL}/events/${eventId}/override`,
    override,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      }
    }
  );
  return response.data;
}

/**
 * Cancel a single occurrence of a recurring event
 * Convenience wrapper around createOverride with overrideType="cancel"
 *
 * @param {string} eventId - The master event ID
 * @param {string|Date} instanceKey - Occurrence datetime (venue TZ)
 * @param {string} firebaseToken - Firebase auth token (required)
 * @param {string} [reason] - Optional cancellation reason
 * @returns {Promise<object>} Updated event
 */
export async function cancelOccurrence(eventId, instanceKey, firebaseToken, reason = null) {
  const patch = { isCanceled: true };
  if (reason) {
    patch.notes = reason;
  }

  return createOverride(eventId, {
    instanceKey,
    overrideType: 'cancel',
    patch
  }, firebaseToken);
}

/**
 * Modify a single occurrence of a recurring event
 * Convenience wrapper around createOverride with overrideType="modify"
 *
 * @param {string} eventId - The master event ID
 * @param {string|Date} instanceKey - Occurrence datetime (venue TZ)
 * @param {object} patch - Fields to modify
 * @param {string} firebaseToken - Firebase auth token (required)
 * @returns {Promise<object>} Updated event
 */
export async function modifyOccurrence(eventId, instanceKey, patch, firebaseToken) {
  return createOverride(eventId, {
    instanceKey,
    overrideType: 'modify',
    patch
  }, firebaseToken);
}

/**
 * Remove an override, restoring the occurrence to regular schedule
 *
 * @param {string} eventId - The master event ID
 * @param {string|Date} instanceKey - Occurrence datetime (venue TZ)
 * @param {string} firebaseToken - Firebase auth token (required)
 * @returns {Promise<object>} Updated event
 */
export async function deleteOverride(eventId, instanceKey, firebaseToken) {
  if (!firebaseToken) {
    throw new Error('Firebase auth token required for override operations');
  }

  // Encode the instanceKey for URL safety
  const encodedKey = encodeURIComponent(
    typeof instanceKey === 'string' ? instanceKey : instanceKey.toISOString()
  );

  const response = await axios.delete(
    `${API_BASE_URL}/events/${eventId}/override/${encodedKey}`,
    {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`
      }
    }
  );
  return response.data;
}

/**
 * Get all overrides for a recurring event
 *
 * @param {string} eventId - The master event ID
 * @returns {Promise<object>} Object with overrides array
 */
export async function getOverrides(eventId) {
  const response = await axios.get(
    `${API_BASE_URL}/events/${eventId}/overrides`
  );
  return response.data;
}

/**
 * Check if a specific occurrence has an override
 *
 * @param {string} eventId - The master event ID
 * @param {string|Date} instanceKey - Occurrence datetime to check
 * @returns {Promise<object|null>} Override object if exists, null otherwise
 */
export async function getOccurrenceOverride(eventId, instanceKey) {
  try {
    const { overrides } = await getOverrides(eventId);

    const keyStr = typeof instanceKey === 'string'
      ? instanceKey
      : instanceKey.toISOString();

    const override = overrides.find(ov => {
      const ovKeyStr = typeof ov.instanceKey === 'string'
        ? ov.instanceKey
        : new Date(ov.instanceKey).toISOString();
      return ovKeyStr === keyStr;
    });

    return override || null;
  } catch (error) {
    // If event doesn't exist or no overrides, return null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Add a date to the excludedDates array (RRULE EXDATE)
 * This permanently removes an occurrence from the series.
 *
 * @param {string} eventId - The master event ID
 * @param {string|Date} dateToExclude - The date to exclude (venue TZ)
 * @param {string} firebaseToken - Firebase auth token (required)
 * @returns {Promise<object>} Updated event
 */
export async function addExcludedDate(eventId, dateToExclude, firebaseToken) {
  if (!firebaseToken) {
    throw new Error('Firebase auth token required for exclude operations');
  }

  // Convert to ISO string if Date object
  const excludeDateStr = typeof dateToExclude === 'string'
    ? dateToExclude
    : dateToExclude.toISOString();

  // Step 1: Fetch current event to get existing excludedDates
  const getResponse = await axios.get(
    `${API_BASE_URL}/events/${eventId}`
  );
  const currentEvent = getResponse.data;
  const existingExcludedDates = currentEvent.excludedDates || [];

  // Step 2: Add new date if not already excluded
  const newExcludedDates = [...existingExcludedDates];
  if (!newExcludedDates.includes(excludeDateStr)) {
    newExcludedDates.push(excludeDateStr);
  }

  // Step 3: PATCH the event with updated excludedDates
  const response = await axios.patch(
    `${API_BASE_URL}/events/${eventId}`,
    {
      excludedDates: newExcludedDates
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      }
    }
  );
  return response.data;
}

export default {
  createOverride,
  cancelOccurrence,
  modifyOccurrence,
  deleteOverride,
  getOverrides,
  getOccurrenceOverride,
  addExcludedDate
};
