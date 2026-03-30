/**
 * Geolocation Helper - 3-Tier Fallback System
 * TIEMPO-324: Multi-Source Geolocation Architecture
 *
 * Priority 1: Browser GPS (google_browser_*) - 10m accuracy
 * Priority 2: Google Geolocation API (google_api_*) - 50-500m accuracy
 * Priority 3: ipinfo.io (ipinfo_*) - 10km accuracy (backend fallback)
 */

/**
 * Priority 1: Get browser GPS coordinates
 * Requires user permission
 * @returns {Promise<object|null>} { lat, long, accuracy } or null
 */
export const getBrowserGeolocation = async () => {
  if (!navigator.geolocation) {
    // Browser geolocation not supported
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true, // Use GPS for best accuracy
        timeout: 5000, // 5 second timeout
        maximumAge: 300000 // 5 minute cache - reduces GPS prompts and battery drain
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    return {
      lat: position.coords.latitude,
      long: position.coords.longitude,
      accuracy: position.coords.accuracy // meters
    };
  } catch {
    // User denied permission, timeout, or position unavailable
    return null;
  }
};

/**
 * Priority 2: Get Google Geolocation API coordinates (via AFA proxy)
 * No permission required, uses WiFi/cell towers
 *
 * PERFORMANCE FIX (2026-03-23): Added caching and rate-limit tracking
 * to reduce 429 errors (was 150/day before fix)
 *
 * TIEMPO-XXX (2026-03-30): Changed cache from sessionStorage to localStorage
 * with 24h TTL to further reduce 429 errors (was 87% of all API errors).
 * Rate limit flag stays in sessionStorage (clears on new session = retry).
 *
 * @returns {Promise<object|null>} { lat, long } or null
 */
export const getGoogleAPIGeolocation = async () => {
  const CACHE_KEY = 'google_geo_cache';
  const RATE_LIMIT_KEY = 'google_geo_rate_limited';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (was 5 minutes)

  // Check localStorage cache first (persists across sessions)
  if (typeof window !== 'undefined') {
    try {
      // Check if rate limited this session (sessionStorage - clears on tab close)
      if (window.sessionStorage?.getItem(RATE_LIMIT_KEY)) {
        console.warn('[Geolocation] Skipping Google API - rate limited this session');
        return null;
      }

      // Check cache (localStorage - persists across sessions)
      const cached = window.localStorage?.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          return data;
        }
      }
    } catch {
      // Storage errors (private browsing, etc.) - continue without cache
    }
  }

  const afaUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

  try {
    const response = await fetch(
      `${afaUrl}/api/geo/google-geolocate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ considerIp: true }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    if (!response.ok) {
      // Track rate limiting to avoid hammering the API
      if (response.status === 429) {
        console.warn('[Geolocation] Google API rate limited (429) - disabling for session');
        try {
          sessionStorage.setItem(RATE_LIMIT_KEY, 'true');
        } catch { /* ignore */ }
      }
      throw new Error(`AFA Google Geo API error: ${response.status}`);
    }

    const result = await response.json();
    const data = result.data || result; // Handle AFA wrapper

    if (!data.location?.lat || !data.location?.lng) {
      throw new Error('No location data in response');
    }

    const geoResult = {
      lat: data.location.lat,
      long: data.location.lng
    };

    // Cache successful response in localStorage (persists 24h)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: geoResult,
          timestamp: Date.now()
        }));
      } catch { /* ignore */ }
    }

    return geoResult;
  } catch (error) {
    console.warn('[Geolocation] Google API failed:', error.message);
    return null;
  }
};

/**
 * Get geolocation data with 3-tier fallback
 * Priority 1: Browser GPS → Priority 2: Google API → Priority 3: ipinfo (backend)
 *
 * @returns {Promise<object>} Geolocation fields for tracking
 * @returns {object.google_browser_lat} Latitude from browser GPS (or null)
 * @returns {object.google_browser_long} Longitude from browser GPS (or null)
 * @returns {object.google_browser_accuracy} Accuracy in meters from browser GPS (or null)
 * @returns {object.google_api_lat} Latitude from Google API (or null)
 * @returns {object.google_api_long} Longitude from Google API (or null)
 */
export const getGeolocationData = async () => {
  const result = {
    google_browser_lat: null,
    google_browser_long: null,
    google_browser_accuracy: null,
    google_api_lat: null,
    google_api_long: null
  };

  // Priority 1: Try browser GPS first (best accuracy: ~10m)
  const browserGeo = await getBrowserGeolocation();
  if (browserGeo) {
    result.google_browser_lat = browserGeo.lat;
    result.google_browser_long = browserGeo.long;
    result.google_browser_accuracy = browserGeo.accuracy;
    return result; // Don't call Google API if GPS works
  }

  // Priority 2: Try Google Geolocation API (good accuracy: 50-500m)
  const googleGeo = await getGoogleAPIGeolocation();
  if (googleGeo) {
    result.google_api_lat = googleGeo.lat;
    result.google_api_long = googleGeo.long;
    return result;
  }

  // Priority 3: Fall back to ipinfo.io (city-level: ~10km)
  // Backend handles this automatically if no frontend geolocation provided
  // Falling back to ipinfo.io (backend handles this)
  return result;
};
