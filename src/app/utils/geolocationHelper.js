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
    console.log('[Geolocation] Browser geolocation not supported');
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true, // Use GPS for best accuracy
        timeout: 5000, // 5 second timeout
        maximumAge: 0 // No cache, always get fresh position
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    return {
      lat: position.coords.latitude,
      long: position.coords.longitude,
      accuracy: position.coords.accuracy // meters
    };
  } catch (error) {
    // User denied permission, timeout, or position unavailable
    console.log('[Geolocation] Browser GPS unavailable:', error.message);
    return null;
  }
};

/**
 * Priority 2: Get Google Geolocation API coordinates (via AFA proxy)
 * No permission required, uses WiFi/cell towers
 * @returns {Promise<object|null>} { lat, long } or null
 */
export const getGoogleAPIGeolocation = async () => {
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
      throw new Error(`AFA Google Geo API error: ${response.status}`);
    }

    const result = await response.json();
    const data = result.data || result; // Handle AFA wrapper

    if (!data.location?.lat || !data.location?.lng) {
      throw new Error('No location data in response');
    }

    return {
      lat: data.location.lat,
      long: data.location.lng
    };
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
    console.log('[Geolocation] ✅ Using browser GPS (10m accuracy)');
    return result; // Don't call Google API if GPS works
  }

  // Priority 2: Try Google Geolocation API (good accuracy: 50-500m)
  const googleGeo = await getGoogleAPIGeolocation();
  if (googleGeo) {
    result.google_api_lat = googleGeo.lat;
    result.google_api_long = googleGeo.long;
    console.log('[Geolocation] ⚠️ Using Google API (WiFi/cell tower, 50-500m accuracy)');
    return result;
  }

  // Priority 3: Fall back to ipinfo.io (city-level: ~10km)
  // Backend handles this automatically if no frontend geolocation provided
  console.log('[Geolocation] ❌ Falling back to ipinfo.io (backend, 10km accuracy)');
  return result; // All null, backend will populate ipinfo_* fields
};
