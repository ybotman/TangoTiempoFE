// Venue Detail Page - Phase 2 SEO Implementation
// ISR with 1-hour revalidation (venues change less frequently than events)

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import PropTypes from 'prop-types';
import VenuePageClient from './VenuePageClient';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

// Get dynamic base URL from request headers
function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get('host') || 'tangotiempo.com';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

// API URL
const API_URL = getApiBaseUrl();

// Fetch venue data from backend
async function getVenueData(venueId) {
  try {
    // Validate venueId format (MongoDB ObjectId is 24 hex characters)
    if (!venueId || !/^[a-fA-F0-9]{24}$/.test(venueId)) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/venues/${venueId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour (ISR)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch venue: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching venue data:', error);
    return null;
  }
}

// Fetch upcoming events at this venue
async function getVenueEvents(venueId) {
  try {
    if (!venueId || !/^[a-fA-F0-9]{24}$/.test(venueId)) {
      return [];
    }

    const now = new Date();
    const startDate = now.toISOString();
    // Get events for next 3 months
    const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `${API_URL}/api/events?appId=1&venueId=${venueId}&start=${startDate}&end=${endDate}&limit=10`,
      {
        next: { revalidate: 300 }, // Cache events for 5 minutes
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching venue events:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = params;
  const venueData = await getVenueData(id);

  if (!venueData) {
    return {
      title: 'Venue Not Found | TangoTiempo',
      description: 'This venue could not be found.',
    };
  }

  const baseUrl = getBaseUrl();
  const venue = venueData;

  const venueName = venue.name || 'Tango Venue';
  const cityName = venue.masteredCityName || venue.city || '';
  const stateName = venue.masteredDivisionName || venue.state || '';

  // Build description
  let description = `Find Argentine tango events at ${venueName}`;
  if (cityName) description += ` in ${cityName}`;
  if (stateName) description += `, ${stateName}`;
  description += '. View upcoming milongas, practicas, classes, and workshops.';

  const canonicalUrl = `${baseUrl}/venue/${id}`;

  return {
    title: `${venueName}${cityName ? `, ${cityName}` : ''} | TangoTiempo`,
    description,

    // OpenGraph
    openGraph: {
      title: venueName,
      description,
      url: canonicalUrl,
      siteName: 'TangoTiempo',
      type: 'place',
      images: [
        {
          url: `${baseUrl}/images/TangoTiempo3.jpg`,
          width: 1200,
          height: 630,
          alt: venueName,
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: `${venueName} | TangoTiempo`,
      description,
      images: [`${baseUrl}/images/TangoTiempo3.jpg`],
    },

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Server Component - Venue Detail Page
export default async function VenuePage({ params }) {
  const { id } = params;
  const venueData = await getVenueData(id);

  if (!venueData) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const upcomingEvents = await getVenueEvents(id);

  // Schema.org Place structured data
  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: venueData.name,
    description: venueData.description || `Tango venue in ${venueData.masteredCityName || venueData.city || 'Unknown'}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: venueData.address || '',
      addressLocality: venueData.masteredCityName || venueData.city || '',
      addressRegion: venueData.masteredDivisionName || venueData.state || '',
      addressCountry: 'US',
      postalCode: venueData.zip || '',
    },
    url: `${baseUrl}/venue/${id}`,
  };

  // Add geo coordinates if available
  if (venueData.latitude && venueData.longitude) {
    placeSchema.geo = {
      '@type': 'GeoCoordinates',
      latitude: venueData.latitude,
      longitude: venueData.longitude,
    };
  }

  // Add events listing if there are upcoming events
  if (upcomingEvents.length > 0) {
    placeSchema.event = upcomingEvents.slice(0, 5).map((event) => ({
      '@type': 'DanceEvent',
      name: event.title || event.shortTitle,
      startDate: event.venueStartDisplay || event.startTime,
      endDate: event.venueEndDisplay || event.endTime,
      url: `${baseUrl}/event/${event._id}`,
    }));
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />

      {/* Client component for interactive content */}
      <VenuePageClient
        venueData={venueData}
        upcomingEvents={upcomingEvents}
      />
    </>
  );
}

VenuePage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
