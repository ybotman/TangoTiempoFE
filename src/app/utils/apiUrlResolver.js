/**
 * API URL Resolver
 *
 * Central utility to resolve API base URLs with automatic failover support.
 *
 * Usage:
 *   import { getApiBaseUrl, getApiUrl, initializeApiFailover } from '@/utils/apiUrlResolver';
 *
 *   // Initialize failover on app startup (call once in Providers)
 *   await initializeApiFailover();
 *
 *   // Get base URL (returns active URL after failover check)
 *   const baseUrl = getApiBaseUrl();
 *
 *   // Get full endpoint URL
 *   const eventsUrl = getApiUrl('/api/events');
 *
 * Configuration:
 *   - NEXT_PUBLIC_AF_URL          -> Primary Azure Functions URL
 *   - NEXT_PUBLIC_AF_URL_FAILOVER -> Failover Azure Functions URL
 *   - NEXT_PUBLIC_AF_ENABLED=true -> Use Azure Functions
 *
 * Failover Behavior:
 *   - On startup, health check primary URL
 *   - If primary fails, switch to failover
 *   - Active URL stored in sessionStorage for consistency
 *   - Runtime failures trigger failover switch
 *
 * @module apiUrlResolver
 * @since 2026-01-22
 * @updated 2026-03-30 - Added failover support (Sarah)
 */

// Session storage key for active URL
const ACTIVE_URL_KEY = 'api_active_url';
const FAILOVER_STATE_KEY = 'api_failover_active';

// Health check timeout (fail fast)
const HEALTH_CHECK_TIMEOUT = 2000; // 2 seconds

// Module-level state (for SSR safety, initialized to null)
let activeUrlOverride = null;
let failoverInitialized = false;

/**
 * Check if Azure Functions backend is enabled
 * @returns {boolean} True if AF is enabled
 */
export function isAFEnabled() {
  return process.env.NEXT_PUBLIC_AF_ENABLED === 'true';
}

/**
 * Get the primary AF URL
 * @returns {string} Primary URL
 */
function getPrimaryUrl() {
  return process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
}

/**
 * Get the failover AF URL
 * @returns {string|null} Failover URL or null if not configured
 */
function getFailoverUrl() {
  return process.env.NEXT_PUBLIC_AF_URL_FAILOVER || null;
}

/**
 * Check if a backend URL is healthy
 * @param {string} url - The base URL to check
 * @returns {Promise<boolean>} True if healthy
 */
async function checkHealth(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    // Use /api/roles as health check (lightweight, no auth required)
    const response = await fetch(`${url}/api/roles?appId=1`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    // Network error, timeout, or abort
    return false;
  }
}

/**
 * Get the currently active URL from sessionStorage
 * @returns {string|null} Stored active URL or null
 */
function getStoredActiveUrl() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACTIVE_URL_KEY);
}

/**
 * Store the active URL in sessionStorage
 * @param {string} url - The URL to store
 * @param {boolean} isFailover - Whether this is the failover URL
 */
function storeActiveUrl(url, isFailover) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ACTIVE_URL_KEY, url);
  sessionStorage.setItem(FAILOVER_STATE_KEY, isFailover ? 'true' : 'false');
}

/**
 * Check if currently using failover
 * @returns {boolean} True if on failover
 */
export function isUsingFailover() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(FAILOVER_STATE_KEY) === 'true';
}

/**
 * Initialize API failover - call on app startup
 * Checks primary URL health, switches to failover if needed
 * @returns {Promise<{url: string, isFailover: boolean}>} Active URL info
 */
export async function initializeApiFailover() {
  // Skip on server-side
  if (typeof window === 'undefined') {
    return { url: getPrimaryUrl(), isFailover: false };
  }

  // Skip if already initialized this session
  if (failoverInitialized) {
    const storedUrl = getStoredActiveUrl();
    if (storedUrl) {
      return { url: storedUrl, isFailover: isUsingFailover() };
    }
  }

  const primaryUrl = getPrimaryUrl();
  const failoverUrl = getFailoverUrl();

  // No failover configured - just use primary
  if (!failoverUrl) {
    storeActiveUrl(primaryUrl, false);
    failoverInitialized = true;
    return { url: primaryUrl, isFailover: false };
  }

  // Check primary health
  console.log('[API Failover] Checking primary backend health...');
  const primaryHealthy = await checkHealth(primaryUrl);

  if (primaryHealthy) {
    console.log('[API Failover] Primary backend healthy:', primaryUrl);
    storeActiveUrl(primaryUrl, false);
    activeUrlOverride = null;
    failoverInitialized = true;
    return { url: primaryUrl, isFailover: false };
  }

  // Primary unhealthy - check failover
  console.warn('[API Failover] Primary backend unhealthy, checking failover...');
  const failoverHealthy = await checkHealth(failoverUrl);

  if (failoverHealthy) {
    console.warn('[API Failover] Switched to failover backend:', failoverUrl);
    storeActiveUrl(failoverUrl, true);
    activeUrlOverride = failoverUrl;
    failoverInitialized = true;
    return { url: failoverUrl, isFailover: true };
  }

  // Both unhealthy - use primary anyway (let requests fail with better errors)
  console.error('[API Failover] Both backends unhealthy! Using primary.');
  storeActiveUrl(primaryUrl, false);
  failoverInitialized = true;
  return { url: primaryUrl, isFailover: false };
}

/**
 * Switch to failover URL (call on runtime API failure)
 * @returns {string|null} Failover URL or null if not available
 */
export function switchToFailover() {
  const failoverUrl = getFailoverUrl();
  if (!failoverUrl) return null;

  console.warn('[API Failover] Runtime switch to failover:', failoverUrl);
  storeActiveUrl(failoverUrl, true);
  activeUrlOverride = failoverUrl;
  return failoverUrl;
}

/**
 * Get the base API URL based on feature flag and failover state
 * @returns {string} The base URL for API calls
 */
export function getApiBaseUrl() {
  if (isAFEnabled()) {
    // Check for override (failover active)
    if (activeUrlOverride) {
      return activeUrlOverride;
    }

    // Check sessionStorage (persisted failover state)
    const storedUrl = getStoredActiveUrl();
    if (storedUrl) {
      return storedUrl;
    }

    // Default to primary
    return getPrimaryUrl();
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
