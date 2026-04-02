// TIEMPO-360: Event Density Pill System Constants

// ============================================================================
// CATEGORY GROUPINGS FOR HIGH-LEVEL PILLS
// ============================================================================

// Blue pill - Social dancing events
export const SOCIAL_CATEGORIES = ['Milonga', 'Practica'];

// Purple pill - Organized events/gatherings
export const EVENT_CATEGORIES = ['Encuentro', 'Festival', 'Marathon', 'Workshop'];

// Categories excluded from high-level pills (shown only at venue level)
export const EXCLUDED_HIGH_LEVEL = ['Class', 'Other', 'Unknown', 'Trip'];

// All categories for venue-level display
export const ALL_CATEGORIES = [
  'Milonga', 'Practica', 'Festival', 'Marathon',
  'Encuentro', 'Workshop', 'Class', 'Other'
];

// ============================================================================
// PILL COLORS
// ============================================================================

// High-level 3-pill colors
export const PILL_COLORS = {
  social: '#1976d2',      // Blue - Milonga + Practica
  events: '#7B1FA2',      // Purple - Encuentro/Festival/Marathon/Workshop
  discovered: '#2E7D32',  // Green - isDiscovered of above types
};

// Full category colors (from categoryColors.js, duplicated for independence)
export const CATEGORY_COLORS = {
  Milonga: '#1E90FF',     // DodgerBlue
  Practica: '#00FFFF',    // Cyan
  Festival: '#FF0000',    // Red
  Marathon: '#FFA500',    // Orange
  Encuentro: '#98FB98',   // PaleGreen
  Workshop: '#FF69B4',    // HotPink
  Class: '#FFFF00',       // Yellow
  Other: '#D3D3D3',       // LightGrey
  Unknown: '#D3D3D3',     // LightGrey
  Trip: '#9ACD32',        // YellowGreen
};

// ============================================================================
// ZOOM LEVEL THRESHOLDS (Simplified: COUNTRY -> CITY -> VENUE)
// ============================================================================

export const ZOOM_LEVELS = {
  COUNTRY: { min: 1, max: 4 },    // WAY zoomed out only
  CITY: { min: 5, max: 11 },      // Show cities earlier (zoom 5+)
  VENUE: { min: 12, max: 22 },    // Zoomed in - show individual venues
};

export const getAggregationLevel = (zoom) => {
  if (zoom <= ZOOM_LEVELS.COUNTRY.max) return 'country';  // zoom 1-4
  if (zoom <= ZOOM_LEVELS.CITY.max) return 'city';        // zoom 5-11
  return 'venue';                                          // zoom 12+
};

// ============================================================================
// CONTINENT MAPPING (FE lookup - no BE table yet)
// ============================================================================

export const COUNTRY_TO_CONTINENT = {
  // North America
  'United States': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',

  // Central America & Caribbean
  'Costa Rica': 'North America',
  'Panama': 'North America',
  'Cuba': 'North America',
  'Puerto Rico': 'North America',
  'Dominican Republic': 'North America',

  // South America
  'Argentina': 'South America',
  'Brazil': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Peru': 'South America',
  'Uruguay': 'South America',
  'Venezuela': 'South America',
  'Ecuador': 'South America',
  'Bolivia': 'South America',
  'Paraguay': 'South America',

  // Europe
  'United Kingdom': 'Europe',
  'Germany': 'Europe',
  'France': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Hungary': 'Europe',
  'Portugal': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Ireland': 'Europe',
  'Greece': 'Europe',
  'Romania': 'Europe',
  'Bulgaria': 'Europe',
  'Croatia': 'Europe',
  'Slovenia': 'Europe',
  'Slovakia': 'Europe',
  'Serbia': 'Europe',
  'Ukraine': 'Europe',
  'Russia': 'Europe',
  'Turkey': 'Europe',

  // Asia
  'Japan': 'Asia',
  'South Korea': 'Asia',
  'China': 'Asia',
  'Taiwan': 'Asia',
  'Hong Kong': 'Asia',
  'Singapore': 'Asia',
  'Thailand': 'Asia',
  'Vietnam': 'Asia',
  'Philippines': 'Asia',
  'Malaysia': 'Asia',
  'Indonesia': 'Asia',
  'India': 'Asia',
  'Israel': 'Asia',
  'United Arab Emirates': 'Asia',

  // Oceania
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',

  // Africa
  'South Africa': 'Africa',
  'Egypt': 'Africa',
  'Morocco': 'Africa',
  'Kenya': 'Africa',
  'Nigeria': 'Africa',
};

// Continent centroids for map display (approximate)
export const CONTINENT_CENTROIDS = {
  'North America': { lat: 40.0, lng: -100.0 },
  'South America': { lat: -15.0, lng: -60.0 },
  'Europe': { lat: 50.0, lng: 10.0 },
  'Asia': { lat: 35.0, lng: 105.0 },
  'Oceania': { lat: -25.0, lng: 135.0 },
  'Africa': { lat: 0.0, lng: 20.0 },
};

export const getContinent = (countryName) => {
  return COUNTRY_TO_CONTINENT[countryName] || 'Unknown';
};

// ============================================================================
// TIME RANGE SLIDER CONFIGURATION
// ============================================================================

export const TIME_RANGE_MARKS = [
  { value: 7, label: '1wk' },
  { value: 30, label: '1mo' },
  { value: 60, label: '2mo' },
  { value: 120, label: '4mo' },
  { value: 180, label: '6mo' },
  { value: 270, label: '9mo' },
  { value: 365, label: '1yr' },
];

export const TIME_RANGE_DEFAULT = 180; // 6 months
export const TIME_RANGE_MIN = 7;       // 1 week
export const TIME_RANGE_MAX = 365;     // 1 year

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Categorize an event into pill groups
 * @param {object} event - Event with categoryFirst and isDiscovered
 * @returns {object} - { isSocial, isEvent, isDiscovered }
 */
export const categorizeEvent = (event) => {
  const category = event.categoryFirst || 'Unknown';
  const isSocial = SOCIAL_CATEGORIES.includes(category);
  const isEvent = EVENT_CATEGORIES.includes(category);
  // Count ALL discovered events in BOT pill (not just social/event categories)
  const isDiscovered = event.isDiscovered === true;

  return { isSocial, isEvent, isDiscovered, category };
};

/**
 * Check if we should show high-level pills (3-pill) or venue-level (all categories)
 * @param {number} zoom - Current map zoom level
 * @returns {boolean} - true for high-level (3-pill), false for venue-level
 */
export const useHighLevelPills = (zoom) => {
  return zoom <= ZOOM_LEVELS.CITY.max;
};
