// SEO Landing Page - Client Component
// Interactive elements for the /tango landing page

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SchoolIcon from '@mui/icons-material/School';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

// Category colors matching EventPageClient
const categoryColors = {
  Milonga: '#FF6B6B',
  Practica: '#4ECDC4',
  Class: '#45B7D1',
  Workshop: '#96CEB4',
  Festival: '#FFEAA7',
  Concert: '#DDA0DD',
  Show: '#F39C12',
  Other: '#95A5A6',
};

// Format date for display
function formatEventDate(dateString) {
  if (!dateString) return '';
  const [datePart] = dateString.split('T');
  if (!datePart) return '';
  const [year, month, day] = datePart.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// Regional highlights data
const REGIONS = [
  { name: 'Northeast', cities: ['New York', 'Boston', 'Philadelphia', 'Washington DC'] },
  { name: 'Southeast', cities: ['Miami', 'Atlanta', 'Charlotte', 'Tampa'] },
  { name: 'Midwest', cities: ['Chicago', 'Detroit', 'Minneapolis', 'Cleveland'] },
  { name: 'Southwest', cities: ['Austin', 'Houston', 'Dallas', 'Phoenix'] },
  { name: 'West', cities: ['Los Angeles', 'San Francisco', 'Seattle', 'Denver'] },
];

// FAQ data
const FAQS = [
  {
    question: 'Is TangoTiempo free to use?',
    answer:
      'Yes! TangoTiempo is completely free for dancers to search and find events. Organizers can also list their events for free.',
  },
  {
    question: 'How do I find tango events near me?',
    answer:
      'Simply visit our calendar page and allow location access, or select your region from the menu. You can filter by event type (milonga, practica, class, workshop, festival) and date range.',
  },
  {
    question: 'How do I list my tango events on TangoTiempo?',
    answer:
      'Create a free account, then apply to become an organizer. Once approved (usually instant), you can add your events to the calendar.',
  },
  {
    question: 'What types of tango events are listed?',
    answer:
      'We list all types of Argentine tango events: milongas, practicas, classes, workshops, festivals, concerts, and shows.',
  },
  {
    question: 'Does TangoTiempo cover events nationwide?',
    answer:
      'Yes! TangoTiempo is the national calendar for Argentine tango in America. We have events listed from coast to coast.',
  },
];

export default function TangoLandingClient({ featuredEvents }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                Find Argentine Tango Events Near You
              </Typography>
              <Typography
                variant={isMobile ? 'body1' : 'h6'}
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Discover milongas, practicas, classes, workshops, and festivals across
                America. The free national calendar for the tango community.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{
                      bgcolor: '#FF6B6B',
                      '&:hover': { bgcolor: '#e55a5a' },
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Find Events Now
                  </Button>
                </Link>
                <Link href="/organizers/apply" passHref style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': { borderColor: '#ccc', bgcolor: 'rgba(255,255,255,0.1)' },
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    List Your Events
                  </Button>
                </Link>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={5}
              sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}
            >
              <Image
                src="/images/TangoTiempo3.jpg"
                alt="Argentine Tango"
                width={400}
                height={300}
                style={{
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
                priority
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Event Categories Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          What Are You Looking For?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Browse by event type to find exactly what you need
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {[
            { label: 'Milongas', icon: <MusicNoteIcon />, color: categoryColors.Milonga },
            { label: 'Practicas', icon: <MusicNoteIcon />, color: categoryColors.Practica },
            { label: 'Classes', icon: <SchoolIcon />, color: categoryColors.Class },
            { label: 'Workshops', icon: <SchoolIcon />, color: categoryColors.Workshop },
            { label: 'Festivals', icon: <CelebrationIcon />, color: categoryColors.Festival },
          ].map((category) => (
            <Grid item key={category.label}>
              <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
                <Chip
                  icon={category.icon}
                  label={category.label}
                  clickable
                  sx={{
                    bgcolor: category.color,
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 3,
                    px: 1,
                    '& .MuiChip-icon': { color: '#000' },
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s',
                  }}
                />
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Events Section */}
      {featuredEvents && featuredEvents.length > 0 && (
        <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
              Upcoming Tango Events
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 4 }}
            >
              Discover what&apos;s happening in the tango community
            </Typography>
            <Grid container spacing={3}>
              {featuredEvents.slice(0, 6).map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <Link
                    href={`/event/${event._id}`}
                    passHref
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 140,
                          bgcolor: categoryColors[event.categoryFirst] || 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {event.eventImage ? (
                          <Image
                            src={event.eventImage}
                            alt={event.title || event.shortTitle}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <MusicNoteIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
                        )}
                      </CardMedia>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatEventDate(event.venueStartDisplay || event.startTime)}
                        </Typography>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {event.shortTitle || event.title}
                        </Typography>
                        {event.categoryFirst && (
                          <Chip
                            label={event.categoryFirst}
                            size="small"
                            sx={{
                              bgcolor: categoryColors[event.categoryFirst] || 'grey.300',
                              color: '#000',
                              fontWeight: 'bold',
                              mr: 1,
                            }}
                          />
                        )}
                        {event.venueMasteredCityName && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <LocationOnIcon fontSize="small" />
                            {event.venueMasteredCityName}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CalendarMonthIcon />}
                  sx={{ py: 1.5, px: 4 }}
                >
                  View All Events
                </Button>
              </Link>
            </Box>
          </Container>
        </Box>
      )}

      {/* Regional Highlights Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Tango Coast to Coast
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Find events in your region
        </Typography>
        <Grid container spacing={2}>
          {REGIONS.map((region) => (
            <Grid item xs={12} sm={6} md={4} key={region.name}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {region.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {region.cities.map((city) => (
                    <Chip
                      key={city}
                      label={city}
                      size="small"
                      variant="outlined"
                      sx={{ '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* For Dancers Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                For Dancers
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Whether you&apos;re a seasoned milonguero or just starting your tango
                journey, TangoTiempo helps you find the perfect events:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Search by location, date, or event type
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Discover new milongas when traveling
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Find classes and workshops to improve your skills
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Never miss a festival or special event
                </Typography>
              </Box>
              <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Start Exploring
                </Button>
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                For Organizers, DJs & Teachers
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Promote your tango events to dancers across America — completely free:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  List milongas, practicas, classes, and festivals
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Reach dancers searching by location
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Manage your events with an easy-to-use dashboard
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Build your organizer profile and reputation
                </Typography>
              </Box>
              <Link href="/organizers/apply" passHref style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Apply to List Events
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Everything you need to know about TangoTiempo
        </Typography>
        <Box>
          {FAQS.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Final CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Discover Your Next Milonga?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join thousands of tango dancers finding events on TangoTiempo
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CalendarMonthIcon />}
                sx={{ py: 1.5, px: 4, width: { xs: '100%', sm: 'auto' } }}
              >
                View Calendar
              </Button>
            </Link>
            <Link href="/about" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{ py: 1.5, px: 4, width: { xs: '100%', sm: 'auto' } }}
              >
                Learn More
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Footer Note */}
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          TangoTiempo - The Free National Argentine Tango Calendar
        </Typography>
      </Box>
    </Box>
  );
}

TangoLandingClient.propTypes = {
  featuredEvents: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      shortTitle: PropTypes.string,
      eventImage: PropTypes.string,
      venueStartDisplay: PropTypes.string,
      startTime: PropTypes.string,
      categoryFirst: PropTypes.string,
      venueMasteredCityName: PropTypes.string,
    })
  ),
};

TangoLandingClient.defaultProps = {
  featuredEvents: [],
};
