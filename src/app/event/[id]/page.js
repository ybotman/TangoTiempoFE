// TIEMPO-256: Individual Event Deep Linking for Social Media Sharing
// This page enables:
// - Direct sharing via social media (WhatsApp, Facebook, Twitter)
// - Rich previews with event image, title, date, venue
// - Bookmarking specific events
// - SEO indexing of individual events

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import PropTypes from 'prop-types';
import EventPageClient from './EventPageClient';

// Get dynamic base URL from request headers (supports proxy domains)
function getBaseUrl() {
  const headersList = headers();
  const host = headersList.get('host') || 'tangotiempo.com';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

// Backend API URL
const BE_URL = process.env.NEXT_PUBLIC_BE_URL || 'https://calendarbe-prod-a7b3ahe3bteqa6a7.eastus-01.azurewebsites.net';

// Fetch event data from backend
async function getEventData(eventId) {
  try {
    // Validate eventId format (MongoDB ObjectId is 24 hex characters)
    if (!eventId || !/^[a-fA-F0-9]{24}$/.test(eventId)) {
      return null;
    }

    const response = await fetch(`${BE_URL}/api/events/id/${eventId}?appId=1`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching event data:', error);
    return null;
  }
}

// Format date for display
function formatEventDate(dateString) {
  if (!dateString) return '';

  // Handle ISO string format
  const [datePart] = dateString.split('T');
  if (!datePart) return '';

  const [year, month, day] = datePart.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// Format time for display
function formatEventTime(startStr, endStr) {
  if (!startStr) return '';

  const formatTime = (timeStr) => {
    const [, timePart] = timeStr.split('T');
    if (!timePart) return '';
    const [hour, minute] = timePart.split(':');
    const hourNum = parseInt(hour, 10);
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const suffix = hourNum >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minute} ${suffix}`;
  };

  const startTime = formatTime(startStr);
  const endTime = endStr ? formatTime(endStr) : '';

  return endTime ? `${startTime} - ${endTime}` : startTime;
}

// Generate metadata for SEO and social media sharing
export async function generateMetadata({ params }) {
  const { id } = params;
  const eventData = await getEventData(id);

  if (!eventData) {
    return {
      title: 'Event Not Found | TangoTiempo',
      description: 'This event could not be found.',
    };
  }

  // Extract event details - handle both direct response and nested structure
  const event = eventData.event || eventData;
  const meta = eventData.meta || {};

  const title = event.title || event.name || 'Tango Event';
  const shortTitle = event.shortTitle || title;
  const description = event.description || meta.description || '';
  const eventImage = event.eventImage || event.imageUrl || meta.image || '';

  // Get venue and organizer info
  const venueName = event.venueName || event.venue?.name || '';
  const venueCity = event.venueMasteredCityName || event.venue?.city || '';
  const organizerName = event.ownerOrganizerName || event.organizer?.name || '';

  // Format date and time for description
  const venueStart = event.venueStartDisplay || event.startTime || '';
  const venueEnd = event.venueEndDisplay || event.endTime || '';
  const dateStr = formatEventDate(venueStart);
  const timeStr = formatEventTime(venueStart, venueEnd);

  // Build social media description
  let socialDescription = '';
  if (dateStr) socialDescription += dateStr;
  if (timeStr) socialDescription += ` at ${timeStr}`;
  if (venueName) socialDescription += ` | ${venueName}`;
  if (venueCity) socialDescription += `, ${venueCity}`;
  if (organizerName) socialDescription += ` | Hosted by ${organizerName}`;

  // Truncate description for social media
  const truncatedDesc = description.length > 200
    ? description.substring(0, 197) + '...'
    : description;

  const fullDescription = socialDescription
    ? `${socialDescription}. ${truncatedDesc}`
    : truncatedDesc;

  // Dynamic URL based on request host (supports proxy domains)
  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/event/${id}`;

  return {
    title: `${shortTitle} | TangoTiempo`,
    description: fullDescription || 'View event details on TangoTiempo - The Argentine Tango Calendar',

    // OpenGraph for Facebook, WhatsApp, LinkedIn
    openGraph: {
      title: shortTitle,
      description: fullDescription,
      url: canonicalUrl,
      siteName: 'TangoTiempo',
      type: 'website',
      images: eventImage ? [
        {
          url: eventImage,
          width: 1200,
          height: 630,
          alt: shortTitle,
        },
      ] : [
        {
          url: `${baseUrl}/TT-Logo-Image.png`,
          width: 1200,
          height: 630,
          alt: 'TangoTiempo',
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: eventImage ? 'summary_large_image' : 'summary',
      title: shortTitle,
      description: fullDescription,
      images: eventImage ? [eventImage] : [`${baseUrl}/TT-Logo-Image.png`],
    },

    // Additional metadata
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

// The page component - Server Component
export default async function EventPage({ params }) {
  const { id } = params;
  const eventData = await getEventData(id);

  if (!eventData) {
    notFound();
  }

  // Extract event details
  const event = eventData.event || eventData;
  const meta = eventData.meta || {};

  // Get dynamic base URL for this request
  const baseUrl = getBaseUrl();

  // Create structured data for SEO (Event schema)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DanceEvent',
    name: event.title || event.name,
    description: event.description || '',
    startDate: event.venueStartDisplay || event.startTime,
    endDate: event.venueEndDisplay || event.endTime,
    eventStatus: event.isCanceled ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venueName || event.venue?.name || '',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.venueMasteredCityName || event.venue?.city || '',
        addressRegion: event.venueMasteredDivisionName || event.venue?.state || '',
        addressCountry: 'US',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: event.ownerOrganizerName || event.organizer?.name || '',
    },
    image: event.eventImage || event.imageUrl || meta.image || '',
    url: `${baseUrl}/event/${id}`,
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client component handles the redirect to calendar with modal */}
      <EventPageClient eventId={id} eventData={event} />
    </>
  );
}

EventPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
