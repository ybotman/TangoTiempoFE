// Static server-rendered About page — optimised for Google indexing.
// No 'use client' so Next.js pre-renders full HTML and metadata is picked up.

import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box, Container, Typography, Button, Divider, Paper, Grid } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PeopleIcon from '@mui/icons-material/People';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import PublicIcon from '@mui/icons-material/Public';

export const metadata = {
  title: 'About TangoTiempo — Free Global Argentine Tango Calendar',
  description:
    'TangoTiempo is a free global calendar for Argentine tango events. Find local milongas, practicas, workshops, and travel-worthy festivals near you or around the world. Organizers can list events for free.',
  openGraph: {
    title: 'TangoTiempo — Free Global Argentine Tango Calendar',
    description:
      'Find tango events near you or travel-worthy festivals worldwide. Free for dancers. Free for organizers.',
    url: 'https://tangotiempo.com/about',
    siteName: 'TangoTiempo',
    type: 'website',
  },
};

const Section = ({ icon, heading, children }) => (
  <Box sx={{ mb: 5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
      {icon}
      <Typography variant="h5" component="h2" fontWeight="bold">
        {heading}
      </Typography>
    </Box>
    {children}
  </Box>
);

Section.propTypes = {
  icon: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>

      {/* ── Brand hero image ─────────────────────────────────────────────── */}
      <Box
        component="img"
        src="/brand/Brand-MCB-Light-V-WIDE-1.png"
        alt="TangoTiempo — Move. Connect. Belong."
        sx={{
          width: '100%',
          maxHeight: { xs: 140, md: 200 },
          objectFit: 'cover',
          borderRadius: 2,
          mb: 4,
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          TangoTiempo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
          The free global calendar for Argentine tango — helping dancers find events
          and organizers share them with the world.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/calendar"
            variant="contained"
            size="large"
            startIcon={<CalendarMonthIcon />}
          >
            See Local Events
          </Button>
          <Button
            component={Link}
            href="/explore"
            variant="outlined"
            size="large"
            startIcon={<ExploreIcon />}
          >
            Explore the World
          </Button>
        </Box>
      </Box>

      {/* ── Tagline callout ──────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
          px: { xs: 3, md: 5 },
          py: 3,
          mb: 5,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          We are Milongeros building things for the world of tango.
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          We never sell your data. Never.
        </Typography>
      </Box>

      {/* ── What we are ──────────────────────────────────────────────────── */}
      <Section
        icon={<PublicIcon color="primary" sx={{ fontSize: '2rem' }} />}
        heading="A free, open calendar for the tango world"
      >
        <Typography variant="body1" paragraph>
          TangoTiempo is a free, community-powered platform dedicated to Argentine tango events —
          milongas, practicas, classes, workshops, festivals, and encuentros. Whether you dance in
          your home city or follow the tango trail across continents, TangoTiempo helps you stay
          informed about what is happening and where.
        </Typography>
        <Typography variant="body1" paragraph>
          We believe tango is for everyone. Our platform is free to use for dancers, free to list
          events for organizers, and open to the global tango community. No paywalls. No hidden fees.
          Always free.
        </Typography>
      </Section>

      {/* ── For dancers ──────────────────────────────────────────────────── */}
      <Section
        icon={<PeopleIcon color="primary" sx={{ fontSize: '2rem' }} />}
        heading="For dancers — find your next tango"
      >
        <Typography variant="body1" paragraph>
          Use the <strong>Local</strong> calendar to browse milongas, practicas, and classes near
          you. Set your city and see everything happening this week, this month, or further ahead.
          Events are updated by organizers in real time.
        </Typography>
        <Typography variant="body1" paragraph>
          Ready to travel? The <strong>Explore</strong> view surfaces travel-worthy events —
          multi-day festivals, marathons, and encuentros from around the world — so you can plan
          your next tango trip months in advance.
        </Typography>
        <Typography variant="body1" paragraph>
          New to tango? The <strong>Beginner</strong> tab shows events specifically designed for
          newcomers — classes, introductory practicas, and welcoming social dances where you can
          take your first steps.
        </Typography>
        <Button component={Link} href="/calendar" variant="outlined" sx={{ mt: 1 }}>
          Open the Calendar
        </Button>
      </Section>

      {/* ── For organizers ───────────────────────────────────────────────── */}
      <Section
        icon={<EditCalendarIcon color="primary" sx={{ fontSize: '2rem' }} />}
        heading="For organizers — list your events for free"
      >
        <Typography variant="body1" paragraph>
          If you run milongas, teach classes, host festivals, or organize any tango event — your
          events belong on TangoTiempo. Listing is completely free and takes only a few minutes.
          Apply once, then create, edit, and manage your events whenever you need.
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
          <Grid container spacing={2}>
            {[
              ['Apply once', 'Create a free organizer account in minutes. Automatically approved.'],
              ['Full control', 'Create, edit, cancel, and delete your events at any time.'],
              ['Recurring events', 'Set up weekly milongas and practicas once — they repeat automatically.'],
              ['Spotlights', 'Highlight guest DJs, visiting teachers, and live orchestras on your event listing.'],
              ['Always free', 'No listing fees, no subscription, no commission. Free forever.'],
            ].map(([title, desc]) => (
              <Grid item xs={12} sm={6} key={title}>
                <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
                <Typography variant="body2" color="text.secondary">{desc}</Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Button
          component={Link}
          href="/organizers/apply"
          variant="contained"
          size="large"
          startIcon={<EditCalendarIcon />}
        >
          Apply as an Organizer — It&apos;s Free
        </Button>
      </Section>

      {/* ── AI discovery ─────────────────────────────────────────────────── */}
      <Section
        icon={<AutoAwesomeIcon color="primary" sx={{ fontSize: '2rem' }} />}
        heading="AI-powered event discovery"
      >
        <Typography variant="body1" paragraph>
          Tango happens everywhere — not just where organizers have found us yet. TangoTiempo uses
          AI to scan the web and discover tango events from community groups, social media, and local
          listings. Discovered events are clearly labelled so you always know the source.
        </Typography>
        <Typography variant="body1" paragraph>
          AI-discovered events complement organizer-posted listings and help ensure the calendar is
          as complete as possible. When an organizer claims their AI-discovered event, it becomes a
          fully managed listing under their control.
        </Typography>
      </Section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <Section
        icon={<PublicIcon color="primary" sx={{ fontSize: '2rem' }} />}
        heading="Our mission"
      >
        <Typography variant="body1" paragraph>
          Argentine tango is a living tradition shared across hundreds of cities and dozens of
          countries. We built TangoTiempo to make the global tango community more informed,
          connected, and accessible — for dancers at every level, and organizers of every size.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          TangoTiempo is free for the world. Always.
        </Typography>
      </Section>

      <Divider sx={{ mb: 5 }} />

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Everything you need to know about TangoTiempo
        </Typography>
        {[
          ['Is TangoTiempo free to use?',
            'Yes! TangoTiempo is completely free for dancers to search and find events. Organizers can also list their events for free.'],
          ['How do I find tango events near me?',
            'Visit our calendar page and allow location access, or select your region from the menu. Filter by event type (milonga, practica, class, workshop, festival) and date range.'],
          ['How do I list my tango events on TangoTiempo?',
            'Create a free account, then apply to become an organizer. Once approved (usually instant), you can add your events to the calendar.'],
          ['What types of tango events are listed?',
            'We list all types of Argentine tango events: milongas, practicas, classes, workshops, festivals, concerts, and shows.'],
          ['Does TangoTiempo cover events nationwide?',
            'Yes! TangoTiempo is the national calendar for Argentine tango in America. We have events listed from coast to coast.'],
        ].map(([q, a]) => (
          <Box
            key={q}
            component="details"
            sx={{
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 2,
              py: 1,
              '&[open]': { pb: 2 },
            }}
          >
            <Box component="summary" sx={{ cursor: 'pointer', fontWeight: 'bold', py: 1 }}>
              {q}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {a}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ── Footer CTAs ──────────────────────────────────────────────────── */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Ready to start?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={Link} href="/calendar" variant="contained" startIcon={<CalendarMonthIcon />}>
            Find Events Near Me
          </Button>
          <Button component={Link} href="/explore" variant="outlined" startIcon={<ExploreIcon />}>
            Explore Global Events
          </Button>
          <Button component={Link} href="/organizers/apply" variant="outlined" startIcon={<EditCalendarIcon />}>
            List My Events Free
          </Button>
        </Box>
      </Box>

    </Container>
  );
}
