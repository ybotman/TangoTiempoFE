// /tango/[country]/[city] — City-level tango SEO landing page
// Adaptive: "organizer-acquisition" mode (<7 organizers) vs "user-acquisition" (≥7)
// Data: Fulton's /api/seo/city-page endpoint (single fetch, pre-assembled)
// Server Component, ISR 1hr, generateStaticParams from geo-summary

import Link from 'next/link';
import { Box, Container, Typography, Button, Chip, Avatar, Grid, Card, CardContent } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import { notFound } from 'next/navigation';

const API_URL = getApiBaseUrl();
const BASE_URL = 'https://tangotiempo.com';

async function getGeoSummary() {
  try {
    const res = await fetch(`${API_URL}/api/seo/geo-summary?appId=1`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getCityPage(countrySlug, citySlug) {
  try {
    const res = await fetch(
      `${API_URL}/api/seo/city-page?appId=1&regionSlug=${countrySlug}&citySlug=${citySlug}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateStaticParams() {
  const summary = await getGeoSummary();
  if (!summary) return [];
  return summary.cities.map((c) => ({ country: c.countrySlug, city: c.citySlug }));
}

export async function generateMetadata({ params }) {
  const data = await getCityPage(params.country, params.city);
  if (!data) return {};
  const { city, summary } = data;
  return {
    title: `Argentine Tango Events in ${city.cityName}, ${city.countryName} | TangoTiempo`,
    description: `Find milongas, practicas, workshops, and tango classes in ${city.cityName}. ${summary.futureEventCount} upcoming events. Free Argentine tango calendar.`,
    openGraph: {
      title: `Tango Events in ${city.cityName}, ${city.countryName} | TangoTiempo`,
      description: `Discover Argentine tango in ${city.cityName} — milongas, practicas, classes, and workshops near you.`,
      url: `${BASE_URL}/tango/${params.country}/${params.city}`,
      siteName: 'TangoTiempo',
      type: 'website',
      images: [{ url: `${BASE_URL}/brand/Brand-MCB-Light-V-WIDE-1.png`, width: 1200 }],
    },
    alternates: { canonical: `${BASE_URL}/tango/${params.country}/${params.city}` },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params }) {
  const data = await getCityPage(params.country, params.city);
  if (!data) notFound();

  const { city, mode, summary, categories, topOrganizers, topEvents, cta, mapCenterUrl, nearbyCities, classifierLabels } = data;
  const isAcquisition = mode === 'organizer-acquisition';

  // Event structured data
  const allTopEvents = [...(topEvents.travelWorthy || []), ...(topEvents.forBeginners || [])];
  const eventSchema = {
    '@context': 'https://schema.org',
    '@graph': allTopEvents.map((e) => ({
      '@type': 'Event',
      name: e.title || e.name,
      startDate: e.startDate,
      location: {
        '@type': 'Place',
        name: e.venueName || city.cityName,
        address: { '@type': 'PostalAddress', addressLocality: city.cityName, addressRegion: city.countryName, addressCountry: 'US' },
      },
      organizer: { '@type': 'Organization', name: e.ownerOrganizerName || 'TangoTiempo', url: BASE_URL },
      image: e.featuredImage || `${BASE_URL}/brand/Brand-Simple-Light-WIDE-1.png`,
      url: `${BASE_URL}/calendar`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    })),
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />

      {/* Brand hero */}
      <Box
        component="img"
        src="/brand/Brand-MCB-Light-V-WIDE-1.png"
        alt="TangoTiempo — Move. Connect. Belong."
        sx={{ width: '100%', maxHeight: { xs: 100, md: 140 }, objectFit: 'cover', borderRadius: 2, mb: 3 }}
      />

      <Grid container spacing={4}>
        {/* Main column */}
        <Grid item xs={12} md={8}>

          {/* Hero */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Argentine Tango in {city.cityName}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {summary.futureEventCount} upcoming events · {city.cityName}, {city.countryName}
            </Typography>
            <Button component={Link} href={mapCenterUrl} variant="contained" startIcon={<CalendarMonthIcon />} size="large">
              Browse {city.cityName} Events
            </Button>
          </Box>

          {/* Adaptive CTA block */}
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3, borderRadius: 2, mb: 4, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>{cta.headline}</Typography>
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>{cta.body}</Typography>
            {isAcquisition ? (
              <Button component={Link} href={cta.applyPath} variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
                {cta.applyLabel}
              </Button>
            ) : (
              <Button component={Link} href={cta.loginPath} variant="contained"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
                {cta.loginLabel}
              </Button>
            )}
          </Box>

          {/* Event counts by category */}
          {categories?.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {categories.map((cat) => (
                <Chip key={cat.name} label={`${cat.label}: ${cat.count}`} variant="outlined" />
              ))}
            </Box>
          )}

          {/* Travel-worthy events */}
          {topEvents.travelWorthy?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {classifierLabels.travelWorthy} in {city.cityName}
              </Typography>
              {topEvents.travelWorthy.map((e) => (
                <Box key={e._id || e.name} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold">{e.title || e.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{e.venueName}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Beginner-friendly events */}
          {topEvents.forBeginners?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {classifierLabels.forBeginners} in {city.cityName}
              </Typography>
              {topEvents.forBeginners.map((e) => (
                <Box key={e._id || e.name} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold">{e.title || e.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{e.venueName}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Organizers */}
          {topOrganizers?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {isAcquisition ? `Organizers Already in ${city.cityName}` : `Tango Organizers in ${city.cityName}`}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {topOrganizers.map((org) => (
                  <Box key={org.organizerId} component={Link} href={`/organizers/${org.shortName}`}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit',
                      p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Avatar sx={{ width: 28, height: 28 }}><PersonIcon fontSize="small" /></Avatar>
                    <Typography variant="body2" fontWeight="bold">{org.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>

          {/* Summary stats */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>At a glance</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">{summary.futureEventCount} upcoming events</Typography>
                {summary.travelWorthyCount > 0 && <Typography variant="body2">{summary.travelWorthyCount} travel-worthy</Typography>}
                {summary.forBeginnersCount > 0 && <Typography variant="body2">{summary.forBeginnersCount} beginner-friendly</Typography>}
                <Typography variant="body2">{summary.organizerCount} local organizers</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Nearby cities */}
          {nearbyCities?.length > 0 && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Tango Nearby</Typography>
                {nearbyCities.map((nc) => (
                  <Box key={nc.cityId} component={Link}
                    href={`/tango/${params.country}/${nc.citySlug}`}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1, textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PlaceIcon fontSize="small" color="disabled" />
                      <Typography variant="body2">{nc.cityName}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{Math.round(nc.distanceMiles)} mi</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Secondary CTA */}
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>Not an organizer?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Share TangoTiempo with your local tango community.
            </Typography>
            <Button component={Link} href="/calendar" size="small" variant="outlined" fullWidth>
              Find Events Near Me
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Breadcrumb */}
      <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          <Link href="/tango" style={{ color: 'inherit' }}>Tango Events USA</Link>
          {' → '}
          <Link href={`/tango/${params.country}`} style={{ color: 'inherit' }}>{city.countryName}</Link>
          {' → '}{city.cityName}
        </Typography>
      </Box>
    </Container>
  );
}
