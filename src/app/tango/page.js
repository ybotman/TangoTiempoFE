// SEO Landing Page - Phase 1
// Search-optimized entry point for organic traffic
// Target keywords: "argentine tango events near me", "find milonga", "tango calendar USA"

import { headers } from 'next/headers';
import TangoLandingClient from './TangoLandingClient';
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

// Fetch featured events for the landing page
async function getFeaturedEvents() {
  try {
    // Get events starting from today, limit to 6 for featured section
    const now = new Date();
    const startDate = now.toISOString();

    // End date: 2 months from now
    const endDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `${API_URL}/api/events?appId=1&start=${startDate}&end=${endDate}&limit=6`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes (ISR)
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch featured events:', response.status);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata() {
  const baseUrl = getBaseUrl();

  return {
    title: 'Find Argentine Tango Events Near You | TangoTiempo',
    description:
      'Discover milongas, practicas, classes, workshops, and festivals across America. TangoTiempo is the free national calendar for Argentine tango dancers and organizers.',
    keywords: [
      'argentine tango events',
      'tango events near me',
      'find milonga',
      'tango calendar USA',
      'practica near me',
      'tango classes',
      'tango festivals',
      'tango workshops',
      'milonga calendar',
      'argentine tango community',
    ].join(', '),

    // OpenGraph
    openGraph: {
      title: 'Find Argentine Tango Events Near You',
      description:
        'Discover milongas, practicas, classes, and festivals across America. Free national tango calendar.',
      url: `${baseUrl}/tango`,
      siteName: 'TangoTiempo',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/brand/Brand-MCB-Light-V-WIDE-1.png`,
          width: 1200,
          alt: 'TangoTiempo — Move. Connect. Belong.',
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: 'Find Argentine Tango Events Near You | TangoTiempo',
      description:
        'Discover milongas, practicas, classes, and festivals across America. Free national tango calendar.',
      images: [`${baseUrl}/images/TangoTiempo3.jpg`],
    },

    // Canonical URL
    alternates: {
      canonical: `${baseUrl}/tango`,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

// Server Component - SEO Landing Page
export default async function TangoLandingPage() {
  const baseUrl = getBaseUrl();
  const featuredEvents = await getFeaturedEvents();

  // WebSite structured data with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TangoTiempo',
    url: baseUrl,
    description: 'The free national calendar for Argentine tango events in America',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/calendar?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Organization structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TangoTiempo',
    url: baseUrl,
    logo: `${baseUrl}/images/TangoTiempo3.jpg`,
    description:
      'TangoTiempo is the free national hub for Argentine tango events in America.',
    sameAs: ['https://www.facebook.com/tangotiempo'],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'admin@tangotiempo.com',
      contactType: 'customer service',
    },
  };

  // FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is TangoTiempo free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! TangoTiempo is completely free for dancers to search and find events. Organizers can also list their events for free.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find tango events near me?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply visit our calendar page and allow location access, or select your region from the menu. You can filter by event type (milonga, practica, class, workshop, festival) and date range.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I list my tango events on TangoTiempo?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Create a free account, then apply to become an organizer. Once approved (usually instant), you can add your events to the calendar.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of tango events are listed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We list all types of Argentine tango events: milongas, practicas, classes, workshops, festivals, concerts, and shows. Events are organized by region and can be filtered by type.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does TangoTiempo cover events nationwide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! TangoTiempo is the national calendar for Argentine tango in America. We have events listed from coast to coast, with active organizers in most major cities.',
        },
      },
    ],
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Client component for interactive content */}
      <TangoLandingClient featuredEvents={featuredEvents} />
    </>
  );
}

