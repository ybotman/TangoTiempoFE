// Venue Detail Page - Client Component
// Interactive elements for venue detail display

'use client';

import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import EventIcon from '@mui/icons-material/Event';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

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

export default function VenuePageClient({ venueData, upcomingEvents }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!venueData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" color="error">
          Venue not found
        </Typography>
      </Container>
    );
  }

  const venueName = venueData.name || 'Unknown Venue';
  const address = venueData.address || '';
  const city = venueData.masteredCityName || venueData.city || '';
  const state = venueData.masteredDivisionName || venueData.state || '';
  const zip = venueData.zip || '';
  const description = venueData.description || '';
  const latitude = venueData.latitude;
  const longitude = venueData.longitude;

  // Build full address
  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

  // Google Maps directions URL
  const mapsUrl = latitude && longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header with back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link href="/calendar" passHref>
          <IconButton size="small">
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Typography variant="body2" color="text.secondary">
          Back to Calendar
        </Typography>
      </Box>

      {/* Venue Details Card */}
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          fontWeight="bold"
          gutterBottom
        >
          {venueName}
        </Typography>

        {/* Address */}
        {fullAddress && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            <LocationOnIcon color="action" sx={{ mt: 0.3 }} />
            <Box>
              <Typography variant="body1">{address}</Typography>
              <Typography variant="body1" color="text.secondary">
                {[city, state, zip].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Get Directions Button */}
        <Button
          variant="contained"
          startIcon={<DirectionsIcon />}
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mb: 3 }}
        >
          Get Directions
        </Button>

        {/* Description */}
        {description && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              About this Venue
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {description}
            </Typography>
          </>
        )}
      </Paper>

      {/* Upcoming Events Section */}
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <EventIcon color="primary" />
          <Typography variant="h5" component="h2">
            Upcoming Events at this Venue
          </Typography>
        </Box>

        {upcomingEvents && upcomingEvents.length > 0 ? (
          <Grid container spacing={2}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} key={event._id}>
                <Link
                  href={`/event/${event._id}`}
                  passHref
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: categoryColors[event.categoryFirst] || 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MusicNoteIcon sx={{ fontSize: 36, color: 'white', opacity: 0.8 }} />
                    </Box>
                    <CardContent sx={{ flex: 1, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatEventDate(event.venueStartDisplay || event.startTime)}
                        {' '}
                        {formatEventTime(
                          event.venueStartDisplay || event.startTime,
                          event.venueEndDisplay || event.endTime
                        )}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.shortTitle || event.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {event.categoryFirst && (
                          <Chip
                            label={event.categoryFirst}
                            size="small"
                            sx={{
                              bgcolor: categoryColors[event.categoryFirst] || 'grey.300',
                              color: '#000',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                        {event.ownerOrganizerName && (
                          <Typography variant="body2" color="text.secondary">
                            by {event.ownerOrganizerName}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No upcoming events scheduled at this venue.
            </Typography>
            <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                sx={{ mt: 2 }}
              >
                Browse All Events
              </Button>
            </Link>
          </Box>
        )}

        {/* View All Events CTA */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link href="/calendar" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<CalendarMonthIcon />}
              >
                View Full Calendar
              </Button>
            </Link>
          </Box>
        )}
      </Paper>

      {/* TangoTiempo Branding */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Powered by{' '}
          <a
            href="https://tangotiempo.com"
            style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
          >
            TangoTiempo
          </a>
          {' '}- The Argentine Tango Calendar
        </Typography>
      </Box>
    </Container>
  );
}

VenuePageClient.propTypes = {
  venueData: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    masteredCityName: PropTypes.string,
    state: PropTypes.string,
    masteredDivisionName: PropTypes.string,
    zip: PropTypes.string,
    description: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  upcomingEvents: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      shortTitle: PropTypes.string,
      venueStartDisplay: PropTypes.string,
      venueEndDisplay: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      categoryFirst: PropTypes.string,
      ownerOrganizerName: PropTypes.string,
    })
  ),
};

VenuePageClient.defaultProps = {
  venueData: null,
  upcomingEvents: [],
};
