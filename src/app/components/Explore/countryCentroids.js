// TIEMPO-408: country centroid fallback for events missing venue geolocation.
// Approximate geographic centers. Good enough for world-map overview.
// Extend as new countries appear in travelWorthy data.

export const COUNTRY_CENTROIDS = {
  'United States': [39.83, -98.58],
  'Canada': [56.13, -106.35],
  'Mexico': [23.63, -102.55],
  'Argentina': [-34.00, -64.00],
  'Brazil': [-14.24, -51.93],
  'Chile': [-35.68, -71.54],
  'Uruguay': [-32.52, -55.77],
  'Peru': [-9.19, -75.02],
  'Colombia': [4.57, -74.30],
  'Ecuador': [-1.83, -78.18],
  'Venezuela': [6.42, -66.59],
  'Spain': [40.46, -3.75],
  'Italy': [41.87, 12.57],
  'Portugal': [39.40, -8.22],
  'France': [46.23, 2.21],
  'Germany': [51.17, 10.45],
  'United Kingdom': [55.38, -3.44],
  'Poland': [51.92, 19.15],
  'Netherlands': [52.13, 5.29],
  'Turkey': [38.96, 35.24],
  'Greece': [39.07, 21.82],
  'Switzerland': [46.82, 8.23],
  'Belgium': [50.50, 4.47],
  'Austria': [47.52, 14.55],
  'Norway': [60.47, 8.47],
  'Sweden': [60.13, 18.64],
  'Denmark': [56.26, 9.50],
  'Finland': [61.92, 25.75],
  'Ireland': [53.41, -8.24],
  'Czech Republic': [49.82, 15.47],
  'Hungary': [47.16, 19.50],
  'Russia': [61.52, 105.32],
  'Ukraine': [48.38, 31.17],
  'Croatia': [45.10, 15.20],
  'Romania': [45.94, 24.97],
  'Japan': [36.20, 138.25],
  'South Korea': [35.91, 127.77],
  'Singapore': [1.35, 103.82],
  'China': [35.86, 104.20],
  'Hong Kong': [22.30, 114.17],
  'Taiwan': [23.70, 120.96],
  'Australia': [-25.27, 133.77],
  'New Zealand': [-40.90, 174.89],
  'Vietnam': [14.06, 108.28],
  'Thailand': [15.87, 100.99],
  'Indonesia': [-0.79, 113.92],
  'Philippines': [12.88, 121.77],
  'India': [20.59, 78.96],
  'Malaysia': [4.21, 101.98],
};

export function centroidFor(countryName) {
  return COUNTRY_CENTROIDS[countryName] || null;
}

// Offset markers that share the same position (same country, no venue geo)
// so they don't fully overlap. Use a simple deterministic jitter by index.
export function jitterPosition([lat, lng], idx, total) {
  if (total <= 1) return [lat, lng];
  const ring = Math.min(3, Math.ceil(total / 6));
  const angle = (idx * 137.5 * Math.PI) / 180; // golden angle
  const r = 0.4 + (idx % ring) * 0.35; // degrees
  return [lat + Math.sin(angle) * r, lng + Math.cos(angle) * r];
}
