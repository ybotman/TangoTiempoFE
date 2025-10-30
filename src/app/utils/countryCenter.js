/**
 * Country Geographic Centers
 *
 * Maps ISO 3166-1 alpha-2 country codes to geographic centers
 * Used as fallback for MapCenterModal when Google geolocation unavailable
 *
 * Source: Approximate geographic centers calculated from country boundaries
 */

export const COUNTRY_CENTERS = {
  // North America
  'US': { lat: 39.8283, lng: -98.5795, name: 'United States' }, // Geographic center
  'CA': { lat: 56.1304, lng: -106.3468, name: 'Canada' },
  'MX': { lat: 23.6345, lng: -102.5528, name: 'Mexico' },

  // South America
  'AR': { lat: -38.4161, lng: -63.6167, name: 'Argentina' },
  'BR': { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  'CL': { lat: -35.6751, lng: -71.5430, name: 'Chile' },
  'CO': { lat: 4.5709, lng: -74.2973, name: 'Colombia' },
  'PE': { lat: -9.1900, lng: -75.0152, name: 'Peru' },
  'UY': { lat: -32.5228, lng: -55.7658, name: 'Uruguay' },
  'VE': { lat: 6.4238, lng: -66.5897, name: 'Venezuela' },

  // Europe
  'GB': { lat: 52.3555, lng: -1.1743, name: 'United Kingdom' },
  'FR': { lat: 46.2276, lng: 2.2137, name: 'France' },
  'DE': { lat: 51.1657, lng: 10.4515, name: 'Germany' },
  'ES': { lat: 40.4637, lng: -3.7492, name: 'Spain' },
  'IT': { lat: 41.8719, lng: 12.5674, name: 'Italy' },
  'NL': { lat: 52.1326, lng: 5.2913, name: 'Netherlands' },
  'BE': { lat: 50.5039, lng: 4.4699, name: 'Belgium' },
  'CH': { lat: 46.8182, lng: 8.2275, name: 'Switzerland' },
  'AT': { lat: 47.5162, lng: 14.5501, name: 'Austria' },
  'PT': { lat: 39.3999, lng: -8.2245, name: 'Portugal' },

  // Asia
  'JP': { lat: 36.2048, lng: 138.2529, name: 'Japan' },
  'CN': { lat: 35.8617, lng: 104.1954, name: 'China' },
  'IN': { lat: 20.5937, lng: 78.9629, name: 'India' },
  'KR': { lat: 35.9078, lng: 127.7669, name: 'South Korea' },

  // Oceania
  'AU': { lat: -25.2744, lng: 133.7751, name: 'Australia' },
  'NZ': { lat: -40.9006, lng: 174.8860, name: 'New Zealand' },

  // Add more countries as needed
};

/**
 * Get geographic center for a country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'AR')
 * @returns {object|null} - { lat, lng, name } or null if country not found
 */
export const getCountryCenter = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') {
    return null;
  }

  const upperCode = countryCode.toUpperCase();
  return COUNTRY_CENTERS[upperCode] || null;
};

/**
 * Get map location from country code with appropriate zoom
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {object|null} - { lat, lng, zoomRange } or null
 */
export const getCountryMapLocation = (countryCode) => {
  const center = getCountryCenter(countryCode);
  if (!center) {
    return null;
  }

  return {
    lat: center.lat,
    lng: center.lng,
    zoomRange: 200 // Wider zoom for country-level view
  };
};
