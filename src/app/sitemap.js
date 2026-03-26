// Dynamic Sitemap - Phase 3 SEO Implementation
// App Router native sitemap generation
// ISR with 1-hour cache

import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const BASE_URL = 'https://www.tangotiempo.com';
const API_URL = getApiBaseUrl();

// Static pages that should always be in the sitemap
const STATIC_PAGES = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/tango', priority: 1.0, changefreq: 'daily' },
  { path: '/calendar', priority: 1.0, changefreq: 'hourly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/organizers', priority: 0.8, changefreq: 'weekly' },
  { path: '/organizers/apply', priority: 0.7, changefreq: 'monthly' },
  { path: '/benefits', priority: 0.6, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/data-deletion', priority: 0.3, changefreq: 'yearly' },
];

// Fetch events for sitemap (future events only)
async function fetchEventUrls() {
  try {
    // First, try the dedicated sitemap endpoint (if Fulton has implemented it)
    const sitemapResponse = await fetch(
      `${API_URL}/api/sitemap/urls?appId=1&type=events&limit=5000`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (sitemapResponse.ok) {
      const data = await sitemapResponse.json();
      return (data.urls || []).map((item) => ({
        url: `${BASE_URL}${item.loc}`,
        lastModified: item.lastmod ? new Date(item.lastmod) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }

    // Fallback: Use the regular events endpoint if sitemap endpoint not available
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday
    const endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year ahead

    const response = await fetch(
      `${API_URL}/api/events?appId=1&start=${startDate}&end=${endDate}&limit=1000`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.error('Failed to fetch events for sitemap:', response.status);
      return [];
    }

    const data = await response.json();
    const events = data.events || [];

    return events.map((event) => ({
      url: `${BASE_URL}/event/${event._id}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
    return [];
  }
}

// Fetch venues for sitemap
async function fetchVenueUrls() {
  try {
    // First, try the dedicated sitemap endpoint
    const sitemapResponse = await fetch(
      `${API_URL}/api/sitemap/urls?appId=1&type=venues&limit=5000`,
      { next: { revalidate: 3600 } }
    );

    if (sitemapResponse.ok) {
      const data = await sitemapResponse.json();
      return (data.urls || []).map((item) => ({
        url: `${BASE_URL}${item.loc}`,
        lastModified: item.lastmod ? new Date(item.lastmod) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }

    // Fallback: Use the regular venues endpoint
    const response = await fetch(
      `${API_URL}/api/venues?appId=1&isActive=true&limit=1000`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.error('Failed to fetch venues for sitemap:', response.status);
      return [];
    }

    const data = await response.json();
    const venues = Array.isArray(data) ? data : (data.venues || []);

    return venues.map((venue) => ({
      url: `${BASE_URL}/venue/${venue._id}`,
      lastModified: venue.updatedAt ? new Date(venue.updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching venues for sitemap:', error);
    return [];
  }
}

// Fetch organizers for sitemap (using existing organizersList.json if available)
async function fetchOrganizerUrls() {
  try {
    // First, try the dedicated sitemap endpoint
    const sitemapResponse = await fetch(
      `${API_URL}/api/sitemap/urls?appId=1&type=organizers&limit=5000`,
      { next: { revalidate: 3600 } }
    );

    if (sitemapResponse.ok) {
      const data = await sitemapResponse.json();
      return (data.urls || []).map((item) => ({
        url: `${BASE_URL}${item.loc}`,
        lastModified: item.lastmod ? new Date(item.lastmod) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    // Fallback: Try to read from the organizersList.json file (generated at build time)
    // This is populated by generateStaticParams in organizers/[slug]/page.js
    const response = await fetch(`${BASE_URL}/organizersList.json`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    const organizers = await response.json();

    return organizers.map((org) => ({
      url: `${BASE_URL}/organizers/${org.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching organizers for sitemap:', error);
    return [];
  }
}

// Main sitemap function - required export for Next.js App Router
export default async function sitemap() {
  // Fetch all dynamic URLs in parallel
  const [eventUrls, venueUrls, organizerUrls] = await Promise.all([
    fetchEventUrls(),
    fetchVenueUrls(),
    fetchOrganizerUrls(),
  ]);

  // Build static page entries
  const staticUrls = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));

  // Combine all URLs
  const allUrls = [
    ...staticUrls,
    ...organizerUrls,
    ...eventUrls,
    ...venueUrls,
  ];

  console.log(`[Sitemap] Generated ${allUrls.length} URLs:`, {
    static: staticUrls.length,
    organizers: organizerUrls.length,
    events: eventUrls.length,
    venues: venueUrls.length,
  });

  return allUrls;
}
