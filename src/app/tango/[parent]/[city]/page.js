// /tango/[parent]/[city] — City-level tango SEO landing page
// parent = state slug for US (e.g. "oregon", "massachusetts"), country slug for international (e.g. "australia")
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

async function getCityPage(parentSlug, citySlug) {
  try {
    const res = await fetch(
      `${API_URL}/api/seo/city-page?appId=1&parentSlug=${parentSlug}&citySlug=${citySlug}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateStaticParams() {
  const summary = await getGeoSummary();
  if (!summary) return [];
  // Defensive: skip cities missing parentSlug or citySlug. Empty parent produces
  // /tango//city which trips Next.js NormalizeError. PROD has ~14 international
  // city-states (Berlin, Rome, etc.) without parentSlug populated yet — pending
  // CALBEAF backfill ticket. They render via dynamic ISR if hit by URL.
  return summary.cities
    .filter((c) => c.parentSlug && c.citySlug)
    .map((c) => ({ parent: c.parentSlug, city: c.citySlug }));
}

export async function generateMetadata({ params }) {
  const data = await getCityPage(params.parent, params.city);
  if (!data) return {};
  const { city, summary } = data;
  return {
    title: `Argentine Tango Events in ${city.cityName}, ${city.countryName} | TangoTiempo`,
    description: `Find milongas, practicas, workshops, and tango classes in ${city.cityName}. ${summary.futureEventCount} upcoming events. Free Argentine tango calendar.`,
    openGraph: {
      title: `Tango Events in ${city.cityName}, ${city.countryName} | TangoTiempo`,
      description: `Discover Argentine tango in ${city.cityName} — milongas, practicas, classes, and workshops near you.`,
      url: `${BASE_URL}/tango/${params.parent}/${params.city}`,
      siteName: 'TangoTiempo',
      type: 'website',
      images: [{ url: `${BASE_URL}/brand/Brand-MCB-Light-V-WIDE-1.png`, width: 1200 }],
    },
    alternates: { canonical: `${BASE_URL}/tango/${params.parent}/${params.city}` },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params }) {
  const data = await getCityPage(params.parent, params.city);
  if (!data) notFound();

  const { city, mode, summary, categories, topOrganizers, topEvents, cta, mapCenterUrl, nearbyCities, classifierLabels } = data;
  const isAcquisition = mode === 'organizer-acquisition';

  // TIEMPO-449: compose calendar URL from city geo so the Browse button lands
  // centered on the city. Falls back to API-supplied mapCenterUrl when geo missing.
  // Will be superseded by CALBEAF-164 once BE composes mapCenterUrl with geo.
  const calendarUrl = (typeof city.lat === 'number' && typeof city.lng === 'number')
    ? `/calendar?lat=${city.lat.toFixed(4)}&lng=${city.lng.toFixed(4)}&radius=125&cityName=${encodeURIComponent(city.cityName)}`
    : mapCenterUrl;

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

      {/* Brand hero — full-width banner, shown on all viewports */}
      <Box component="img" src="/brand/Brand-MCB-Light-FlowingWIDE-2.png" alt="TangoTiempo"
        sx={{ width: '100%', maxHeight: { xs: 160, md: 280 }, objectFit: 'contain', borderRadius: 2, mb: 3, display: 'block' }} />

      <Grid container spacing={4}>
        {/* Main column */}
        <Grid item xs={12} md={8}>

          {/* Hero */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Argentine Tango in {city.cityName}
            </Typography>
          </Box>

          {/* Featured Events — paid placements, surfaced above the fold */}
          {topEvents.featured?.length > 0 && (
            <Box sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff8f5 0%, #fdf0f3 100%)',
              border: '2px solid',
              borderColor: 'secondary.main',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Featured Events in {city.cityName}
                </Typography>
                <Chip label="★ Featured" size="small" color="secondary" />
              </Box>
              {topEvents.featured.map((e, i) => (
                <Box
                  key={e.eventId || e._id || `ft-${i}`}
                  component={e.url ? Link : 'div'}
                  href={e.url || undefined}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    py: 1.5,
                    borderBottom: i < topEvents.featured.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': e.url ? { bgcolor: 'action.hover' } : {},
                    borderRadius: 1,
                    px: 1,
                  }}
                >
                  {e.featuredImage && (
                    <Box component="img" src={e.featuredImage} alt={e.title || e.name}
                      sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} />
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{e.title || e.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{e.venueName}</Typography>
                    {e.categoryFirst && <Chip label={e.categoryFirst} size="small" sx={{ mt: 0.5 }} />}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Upcoming events CTA box */}
          <Box sx={{
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 3,
            p: 4,
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fff 60%, #fdf0f3 100%)',
            boxShadow: '0 4px 20px rgba(139,21,56,0.12)',
          }}>
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              {summary.futureEventCount} Upcoming Events in {city.cityName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Milongas, practicas, classes and more — updated daily
            </Typography>
            <Button
              component={Link}
              href={calendarUrl}
              variant="contained"
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 99,
                boxShadow: '0 6px 24px rgba(139,21,56,0.5), 0 2px 8px rgba(0,0,0,0.2)',
                '&:hover': { boxShadow: '0 10px 32px rgba(139,21,56,0.6), 0 4px 12px rgba(0,0,0,0.25)', transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease',
              }}
              startIcon={
                <Box component="img" src="/brand/Brand-ICON-TT-Light-CRCL-1.png"
                  sx={{ width: 44, height: 44, borderRadius: '50%' }} />
              }
              endIcon={
                <Box component="img" src="/brand/Brand-ICON-TT-Light-CRCL-1.png"
                  sx={{ width: 44, height: 44, borderRadius: '50%' }} />
              }
            >
              <Box sx={{ textAlign: 'center', lineHeight: 1.2 }}>
                <Box sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Browse Events</Box>
                <Box sx={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: 1.5, opacity: 0.85 }}>
                  IN {city.cityName.toUpperCase()}
                </Box>
              </Box>
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
              {topEvents.travelWorthy.map((e, i) => (
                <Box key={e.eventId || e._id || `tw-${i}`} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" fontWeight="bold">{e.title || e.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{e.venueName}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Organizers — sorted by event count desc */}
          {topOrganizers?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {isAcquisition ? `Organizers Already in ${city.cityName}` : `Tango Organizers in ${city.cityName}`}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {topOrganizers.map((org) => (
                  <Box key={org.organizerId} component={Link} href={`/organizers/${(org.shortName || '').toLowerCase()}`}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit',
                      p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' } }}>
                    <Avatar src={org.imageUrl} sx={{ width: 36, height: 36 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{org.name}</Typography>
                      {org.eventCount > 0 && (
                        <Typography variant="caption" color="text.secondary">{org.eventCount} events</Typography>
                      )}
                    </Box>
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
                    href={`/tango/${nc.parentSlug || params.parent}/${nc.citySlug}`}
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
          <Link href="/tango" style={{ color: 'inherit' }}>Argentine Tango Events Worldwide</Link>
          {' → '}
          <Link href={`/tango/${params.parent}`} style={{ color: 'inherit', textTransform: 'capitalize' }}>
            {params.parent.replace(/-/g, ' ')}
          </Link>
          {' → '}{city.cityName}
        </Typography>
      </Box>
    </Container>
  );
}
