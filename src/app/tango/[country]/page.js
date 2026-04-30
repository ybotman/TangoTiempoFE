// /tango/[country] — State-level tango SEO landing page
// Server Component, ISR 1hr, pre-rendered via generateStaticParams
// Slugs are server-computed by Fulton's geo-summary — never roll your own

import Link from 'next/link';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import { notFound } from 'next/navigation';

const API_URL = getApiBaseUrl();
const BASE_URL = 'https://tangotiempo.com';

async function getGeoSummary(params = '') {
  try {
    const res = await fetch(`${API_URL}/api/seo/geo-summary?appId=1${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getCountryEvents(countryId) {
  try {
    const now = new Date().toISOString();
    const end = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(
      `${API_URL}/api/events?appId=1&masteredCountryId=${countryId}&start=${now}&end=${end}&limit=6`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch { return []; }
}

export async function generateStaticParams() {
  const summary = await getGeoSummary();
  if (!summary?.cities?.length) return [];
  const seen = new Set();
  return summary.cities
    .filter((c) => { if (seen.has(c.countrySlug)) return false; seen.add(c.countrySlug); return true; })
    .map((c) => ({ country: c.countrySlug }));
}

export async function generateMetadata({ params }) {
  const summary = await getGeoSummary(`&countrySlug=${params.country}`);
  if (!summary?.cities?.length) return {};
  const countryName = summary.cities[0].countryName;
  const totalEvents = summary.cities.reduce((n, c) => n + c.futureEventCount, 0);
  return {
    title: `Argentine Tango Events in ${countryName} | TangoTiempo`,
    description: `Find milongas, practicas, workshops, and tango festivals across ${countryName}. ${totalEvents}+ upcoming events. Free tango calendar.`,
    openGraph: {
      title: `Tango Events in ${countryName} | TangoTiempo`,
      description: `Discover Argentine tango in ${countryName} — milongas, practicas, classes, and festivals.`,
      url: `${BASE_URL}/tango/${params.country}`,
      siteName: 'TangoTiempo',
      type: 'website',
      images: [{ url: `${BASE_URL}/brand/Brand-MCB-Light-V-WIDE-1.png`, width: 1200 }],
    },
    alternates: { canonical: `${BASE_URL}/tango/${params.country}` },
    robots: { index: true, follow: true },
  };
}

export default async function CountryPage({ params }) {
  const summary = await getGeoSummary(`&countrySlug=${params.country}`);
  if (!summary?.cities?.length) notFound();

  const cities = summary.cities;
  const countryName = cities[0].countryName;
  const totalEvents = cities.reduce((n, c) => n + c.futureEventCount, 0);
  const events = await getCountryEvents(cities[0].countryId);

  const eventSchema = events.slice(0, 5).map((e) => ({
    '@type': 'Event',
    name: e.title,
    startDate: e.startDate,
    location: {
      '@type': 'Place',
      name: e.venueName || countryName,
      address: { '@type': 'PostalAddress', addressRegion: countryName, addressCountry: 'US' },
    },
    organizer: { '@type': 'Organization', name: e.ownerOrganizerName || 'TangoTiempo' },
    url: `${BASE_URL}/calendar`,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': eventSchema }) }} />

      {/* Brand hero — full-width banner */}
      <Box component="img" src="/brand/Brand-MCB-Light-FlowingWIDE-2.png" alt="TangoTiempo"
        sx={{ width: '100%', maxHeight: { xs: 160, md: 280 }, objectFit: 'contain', borderRadius: 2, mb: 3, display: 'block' }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Argentine Tango Events in {countryName}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          {totalEvents} upcoming events across {cities.length} cities
        </Typography>
        <Button component={Link} href="/calendar" variant="contained" startIcon={<CalendarMonthIcon />} size="large">
          Browse Full Calendar
        </Button>
      </Box>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Tango Cities in {countryName}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {cities.sort((a, b) => b.futureEventCount - a.futureEventCount).map((city) => (
          <Grid item xs={6} sm={4} md={3} key={city.cityId}>
            <Card component={Link} href={`/tango/${params.country}/${city.citySlug}`}
              sx={{ textDecoration: 'none', '&:hover': { boxShadow: 3 } }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{city.cityName}</Typography>
                  <Typography variant="caption" color="text.secondary">{city.futureEventCount} events</Typography>
                </Box>
                <PlaceIcon color="primary" fontSize="small" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {events.length > 0 && (
        <>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Upcoming Tango Events in {countryName}
          </Typography>
          <Box sx={{ mb: 4 }}>
            {events.map((event) => (
              <Box key={event._id} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.venueName}
                  {event.categoryFirst && <Chip label={event.categoryFirst} size="small" sx={{ ml: 1 }} />}
                </Typography>
              </Box>
            ))}
          </Box>
          <Button component={Link} href="/calendar" variant="outlined">
            See all {countryName} tango events →
          </Button>
        </>
      )}

      <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          <Link href="/tango" style={{ color: 'inherit' }}>Argentine Tango Events Worldwide</Link>
          {' → '}{countryName}
        </Typography>
      </Box>
    </Container>
  );
}
