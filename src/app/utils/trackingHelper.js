/**
 * Tracking Helper - Shared utilities for visitor and user login/logout tracking
 * Fetches geolocation data from multiple sources and calculates distances
 *
 * TIEMPO-319: Added caching to prevent 429 rate limiting errors
 */

// Cache for geolocation data to prevent excessive API calls
let geolocationCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
 * Fetch all geolocation data from multiple sources in parallel
 * Returns Cloudflare, Google Geolocation API, and IP API data with distance calculation
 * TIEMPO-319: Added caching to prevent 429 rate limiting (health checks run every 30s)
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<object>} - { cloudflare, google, ipapi, distance }
 */
export const fetchAllGeolocationData = async (forceRefresh = false) => {
  // Check cache first (unless force refresh)
  if (!forceRefresh && geolocationCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp;
    if (cacheAge < CACHE_DURATION) {
      console.log(`[Tracking] Using cached geolocation (age: ${Math.round(cacheAge / 1000)}s)`);
      return geolocationCache;
    }
  }

  console.log('[Tracking] Fetching fresh geolocation data...');
  const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_GEO_API_KEY;

  // Fetch all three sources in parallel using Promise.allSettled for graceful failures
  const [cloudflareResult, googleResult, ipapiResult] = await Promise.allSettled([
    // 1. Cloudflare API
    fetch(`${afUrl}/api/cloudflare/info`, {
      signal: AbortSignal.timeout(2000)
    }).then(res => res.ok ? res.json() : null),

    // 2. Google Geolocation API
    googleApiKey ? fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ considerIp: true }),
        signal: AbortSignal.timeout(2000)
      }
    ).then(res => res.ok ? res.json() : null) : Promise.resolve(null),

    // 3. IP API
    fetch(`${afUrl}/api/geo/ip`, {
      signal: AbortSignal.timeout(2000)
    }).then(res => res.ok ? res.json() : null)
  ]);

  // Extract data from settled promises
  const cloudflareData = cloudflareResult.status === 'fulfilled' ? cloudflareResult.value : null;
  const googleData = googleResult.status === 'fulfilled' ? googleResult.value : null;
  const ipapiData = ipapiResult.status === 'fulfilled' ? ipapiResult.value : null;

  // Format Cloudflare data
  const cloudflare = cloudflareData?.data ? {
    ip: cloudflareData.data.ip || null,
    country: cloudflareData.data.country || null,
    ray: cloudflareData.data.ray || null
  } : (cloudflareData ? {
    ip: cloudflareData.ip || null,
    country: cloudflareData.country || null,
    ray: cloudflareData.ray || null
  } : null);

  // Format Google data
  const google = googleData?.location ? {
    latitude: googleData.location.lat || null,
    longitude: googleData.location.lng || null,
    accuracy: googleData.accuracy || null
  } : null;

  // Format IP API data
  const ipapi = ipapiData ? {
    latitude: ipapiData.latitude || null,
    longitude: ipapiData.longitude || null,
    city: ipapiData.city || null,
    region: ipapiData.region || null,
    postal: ipapiData.postal || null,
    country: ipapiData.country || null
  } : null;

  // Calculate distance between Google and IP API coordinates
  let distance = null;
  if (google?.latitude && google?.longitude && ipapi?.latitude && ipapi?.longitude) {
    distance = calculateDistance(
      google.latitude,
      google.longitude,
      ipapi.latitude,
      ipapi.longitude
    );
  }

  const result = {
    cloudflare,
    google,
    ipapi,
    distance
  };

  // Cache the result
  geolocationCache = result;
  cacheTimestamp = Date.now();

  return result;
};
