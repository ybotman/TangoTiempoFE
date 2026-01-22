/**
 * API URL Resolver
 *
 * Central utility to resolve API base URLs based on the AF_ENABLED feature flag.
 * This allows clean migration from calendar-be to calendar-be-af.
 *
 * Usage:
 *   import { getApiBaseUrl, getApiUrl } from '@/utils/apiUrlResolver';
 *
 *   // Get base URL
 *   const baseUrl = getApiBaseUrl();  // Returns AF or BE URL based on flag
 *
 *   // Get full endpoint URL
 *   const eventsUrl = getApiUrl('/api/events');
 *
 * Configuration:
 *   - NEXT_PUBLIC_AF_ENABLED=true  -> Use Azure Functions (NEXT_PUBLIC_AF_URL)
 *   - NEXT_PUBLIC_AF_ENABLED=false -> Use Express BE (NEXT_PUBLIC_BE_URL)
 *
 * @module apiUrlResolver
 * @since 2026-01-22
 * @author Quinn (Migration Agent)
 */

/**
 * Check if Azure Functions backend is enabled
 * @returns {boolean} True if AF is enabled
 */
export function isAFEnabled() {
  return process.env.NEXT_PUBLIC_AF_ENABLED === 'true';
}

/**
 * Get the base API URL based on feature flag
 * @returns {string} The base URL for API calls
 */
export function getApiBaseUrl() {
  if (isAFEnabled()) {
    return process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
  }
  return process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';
}

/**
 * Get full API endpoint URL
 * @param {string} endpoint - The API endpoint path (e.g., '/api/events')
 * @returns {string} The full URL for the endpoint
 */
export function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Get the current backend type for logging/debugging
 * @returns {string} 'AF' or 'BE'
 */
export function getBackendType() {
  return isAFEnabled() ? 'AF' : 'BE';
}

/**
 * Endpoint mapping for any path differences between BE and AF
 * Most endpoints are identical, but this allows for exceptions
 */
const ENDPOINT_MAP = {
  // Example: If AF uses different path, map it here
  // '/api/events/post': isAFEnabled() ? '/api/events' : '/api/events/post',
};

/**
 * Get the correct endpoint path for the current backend
 * @param {string} endpoint - The original endpoint path
 * @returns {string} The mapped endpoint path
 */
export function getEndpointPath(endpoint) {
  return ENDPOINT_MAP[endpoint] || endpoint;
}

/**
 * Get full API URL with endpoint mapping
 * @param {string} endpoint - The API endpoint path
 * @returns {string} The full mapped URL
 */
export function getMappedApiUrl(endpoint) {
  const mappedEndpoint = getEndpointPath(endpoint);
  return getApiUrl(mappedEndpoint);
}
