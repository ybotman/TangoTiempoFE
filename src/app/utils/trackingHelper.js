/**
 * Tracking Helper - Shared utilities for visitor and user login/logout tracking
 * Fetches geolocation data from multiple sources and calculates distances
 *
 * TIEMPO-319: Added caching to prevent 429 rate limiting errors
 */

// Cache for geolocation data to prevent excessive API calls
let geolocationCache = null;
let cacheTimestamp = null;

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
 * TIEMPO-319: Added configurable caching to prevent 429 rate limiting
 * @param {number} cacheMinutes - Cache duration in minutes (default 5, use 480 for login, 1440 for visitor)
 * @returns {Promise<object>} - { cloudflare, google, ipapi, distance }
 */
export const fetchAllGeolocationData = async (cacheMinutes = 5) => {
  const CACHE_DURATION = cacheMinutes * 60 * 1000; // Convert minutes to milliseconds

  // Check cache first
  if (geolocationCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp;
    if (cacheAge < CACHE_DURATION) {
      const ageMinutes = Math.round(cacheAge / 60000);
      console.log(`[Tracking] Using cached geolocation (age: ${ageMinutes}m of ${cacheMinutes}m cache)`);
      return geolocationCache;
    }
  }

  console.log('[Tracking] Fetching fresh geolocation data...');
  const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

  // Fetch Cloudflare and Google in parallel using Promise.allSettled for graceful failures
  const [cloudflareResult, googleResult] = await Promise.allSettled([
    // 1. Cloudflare API
    fetch(`${afUrl}/api/cloudflare/info`, {
      signal: AbortSignal.timeout(2000)
    }).then(res => res.ok ? res.json() : null),

    // 2. Google Geolocation API (via AFA proxy)
    fetch(`${afUrl}/api/geo/google-geolocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ considerIp: true }),
      signal: AbortSignal.timeout(2000)
    }).then(res => {
      if (!res.ok) return null;
      return res.json().then(result => result.data || result);
    })
  ]);

  // Extract data from settled promises
  const cloudflareData = cloudflareResult.status === 'fulfilled' ? cloudflareResult.value : null;
  const googleData = googleResult.status === 'fulfilled' ? googleResult.value : null;

  // 3. If Google succeeded, use Mapbox to get city/region/country from coordinates
  let mapboxData = null;
  if (googleData?.location?.lat && googleData?.location?.lng) {
    try {
      const mapboxResponse = await fetch(`${afUrl}/api/geo/mapbox/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: googleData.location.lat,
          longitude: googleData.location.lng
        }),
        signal: AbortSignal.timeout(2000)
      });
      const mapboxJson = await mapboxResponse.json();
      mapboxData = mapboxJson.success ? mapboxJson.data : null;
    } catch (err) {
      console.warn('[Tracking] Mapbox reverse geocoding failed:', err.message);
    }
  }

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

  // Format Google data (primary source for coordinates)
  const google = googleData?.location ? {
    latitude: googleData.location.lat || null,
    longitude: googleData.location.lng || null,
    accuracy: googleData.accuracy || null
  } : null;

  // Format Mapbox data (address details from Google coordinates)
  const mapbox = mapboxData ? {
    latitude: mapboxData.latitude || google?.latitude || null,
    longitude: mapboxData.longitude || google?.longitude || null,
    city: mapboxData.city || null,
    region: mapboxData.region || null,
    postal: mapboxData.postal || null,
    country: mapboxData.country || null,
    formatted_address: mapboxData.formatted_address || null
  } : null;

  // No distance calculation needed (Mapbox uses Google's coordinates)
  const result = {
    cloudflare,
    google,
    mapbox, // Replaced ipapi with mapbox
    distance: null // No longer calculating distance between two different sources
  };

  // Cache the result
  geolocationCache = result;
  cacheTimestamp = Date.now();

  return result;
};
