// TIEMPO-404: Shared constants for Explore timeline
// Region-country mapping for Explore filter presets.
// Countries not in any region fall through to "Other".

export const CATEGORY_COLORS = {
  Festival: '#e94560',
  Marathon: '#f97316',
  Encuentro: '#22c55e',
  Workshop: '#ec4899',
  Trip: '#3b82f6',
  Class: '#8b5cf6',
  Other: '#6b7280',
};

export const categoryLabel = (c) => (c && c !== 'unknown' ? c : 'Other');
export const colorFor = (c) => CATEGORY_COLORS[categoryLabel(c)] || CATEGORY_COLORS.Other;

export const REGIONS = {
  Americas: [
    'United States', 'Canada', 'Argentina', 'Brazil', 'Mexico',
    'Chile', 'Uruguay', 'Peru', 'Colombia', 'Ecuador', 'Venezuela',
  ],
  Europe: [
    'Spain', 'Italy', 'Portugal', 'France', 'Germany', 'United Kingdom',
    'Poland', 'Netherlands', 'Turkey', 'Greece', 'Switzerland', 'Belgium',
    'Austria', 'Norway', 'Sweden', 'Denmark', 'Finland', 'Ireland',
    'Czech Republic', 'Hungary', 'Russia', 'Ukraine', 'Croatia', 'Romania',
  ],
  'Asia-Pacific': [
    'Japan', 'South Korea', 'Singapore', 'China', 'Hong Kong', 'Taiwan',
    'Australia', 'New Zealand', 'Vietnam', 'Thailand', 'Indonesia',
    'Philippines', 'India', 'Malaysia',
  ],
};

export const regionFor = (country) => {
  for (const [region, list] of Object.entries(REGIONS)) {
    if (list.includes(country)) return region;
  }
  return 'Other';
};

export const COUNTRY_COOKIE = 'tt_explore_countries';

// TIEMPO-404 D.1: continent/region colors for mobile card stripes.
// Category stays in chip; continent becomes primary visual region signal.
export const CONTINENT_COLORS = {
  Americas: '#3b82f6',
  Europe: '#a855f7',
  'Asia-Pacific': '#14b8a6',
  Other: '#6b7280',
};

export const continentColorFor = (country) => CONTINENT_COLORS[regionFor(country)] || CONTINENT_COLORS.Other;
