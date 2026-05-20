/**
 * Tracking Helper - Shared utilities for visitor and user login/logout tracking
 * TIEMPO-466: Google IP geo + Mapbox removed. CF edge is the sole geo source.
 * TIEMPO-319: Added caching to prevent 429 rate limiting errors
 * 2026-03-24: Added sessionStorage caching for cloudflare + rate-limit tracking
 */

// Cache for geolocation data to prevent excessive API calls
let geolocationCache = null;
let cacheTimestamp = null;
// TIEMPO-381: In-progress promise to prevent parallel fetches (React StrictMode)
let fetchInProgress = null;

// Session storage keys for rate limiting and shared caching
const CF_CACHE_KEY = 'cloudflare_info_cache';
const CF_RATE_LIMIT_KEY = 'cloudflare_info_rate_limited';
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate distance between two coordinates using Haversine formula
 * Copied from useServiceHealth.js for consistency
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {object} - { km: number, mi: number }
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R_KM = 6371; // Earth's radius in kilometers
  const R_MI = 3959; // Earth's radius in miles

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return {
    km: R_KM * c,
    mi: R_MI * c
  };
};

/**
 * Fetch Cloudflare visitor info (ip, country, ray) for tracking POST bodies.
 * TIEMPO-466: Google IP geo + Mapbox calls removed — CF edge headers are the
 * canonical geo source. City/lat/lng come from /api/geo/cf-location (Next.js
 * route handler) and are forwarded as cfLocation in each POST body by the caller.
 * TIEMPO-319: Added configurable caching to prevent 429 rate limiting
 * @param {number} cacheMinutes - Cache duration in minutes (default 5, use 480 for login, 1440 for visitor)
 * @returns {Promise<object>} - { cloudflare }
 */
export const fetchAllGeolocationData = async (cacheMinutes = 5) => {
  const CACHE_DURATION = cacheMinutes * 60 * 1000; // Convert minutes to milliseconds

  // Skip Azure Functions calls on localhost (prevents 403 errors when AF not running)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('[Tracking] Skipping geolocation fetch on localhost - Azure Functions not running');
    return { cloudflare: null };
  }

  // Check cache first
  if (geolocationCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp;
    if (cacheAge < CACHE_DURATION) {
      const ageMinutes = Math.round(cacheAge / 60000);
      console.log(`[Tracking] Using cached geolocation (age: ${ageMinutes}m of ${cacheMinutes}m cache)`);
      return geolocationCache;
    }
  }

  // TIEMPO-381: If fetch already in progress, wait for it instead of starting another
  // This prevents React StrictMode from causing duplicate API calls
  if (fetchInProgress) {
    console.log('[Tracking] Fetch already in progress, waiting...');
    return fetchInProgress;
  }

  console.log('[Tracking] Fetching fresh geolocation data...');

  // TIEMPO-381: Create promise and store it so parallel callers can await it
  const doFetch = async () => {
    const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

    // Helper: Check sessionStorage cache
    const getSessionCache = (key) => {
      if (typeof window === 'undefined' || !window.sessionStorage) return null;
      try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < SESSION_CACHE_TTL_MS) return data;
      } catch { /* ignore */ }
      return null;
    };

    // Helper: Set sessionStorage cache
    const setSessionCache = (key, data) => {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      try {
        sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
      } catch { /* ignore */ }
    };

    // Helper: Check if rate limited
    const isRateLimited = (key) => {
      if (typeof window === 'undefined' || !window.sessionStorage) return false;
      try {
        return sessionStorage.getItem(key) === 'true';
      } catch { return false; }
    };

    // Helper: Mark as rate limited
    const markRateLimited = (key) => {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      try {
        sessionStorage.setItem(key, 'true');
      } catch { /* ignore */ }
    };

    // TIEMPO-466: Fetch Cloudflare visitor info only (Google IP geo retired).
    // CF city/lat/lng come from /api/geo/cf-location (Next.js route handler)
    // and are forwarded as cfLocation by each caller's POST body.
    let cloudflareData = null;
    const cfCached = getSessionCache(CF_CACHE_KEY);
    if (cfCached) {
      cloudflareData = cfCached;
    } else if (!isRateLimited(CF_RATE_LIMIT_KEY)) {
      try {
        const res = await fetch(`${afUrl}/api/cloudflare/info`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.status === 429) {
          markRateLimited(CF_RATE_LIMIT_KEY);
        } else if (res.ok) {
          cloudflareData = await res.json();
          setSessionCache(CF_CACHE_KEY, cloudflareData);
        }
      } catch { /* network error — non-blocking */ }
    }

    const cloudflare = cloudflareData?.data ? {
      ip: cloudflareData.data.ip || null,
      country: cloudflareData.data.country || null,
      ray: cloudflareData.data.ray || null
    } : (cloudflareData ? {
      ip: cloudflareData.ip || null,
      country: cloudflareData.country || null,
      ray: cloudflareData.ray || null
    } : null);

    const result = { cloudflare };

    // Cache the result
    geolocationCache = result;
    cacheTimestamp = Date.now();

    return result;
  };

  // TIEMPO-381: Store promise so parallel callers await the same fetch
  fetchInProgress = doFetch().finally(() => {
    fetchInProgress = null; // Clear when done (success or error)
  });

  return fetchInProgress;
};

/**
 * Get cached geolocation data without making new API calls.
 * @returns {object|null} Cached data ({ cloudflare }) or null if no cache
 */
export const getCachedGeolocation = () => {
  return geolocationCache;
};
