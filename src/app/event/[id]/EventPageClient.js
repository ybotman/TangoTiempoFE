// TIEMPO-256: Client component for event deep linking
// Handles redirect to calendar page with event modal open
// Also provides fallback display for users without JavaScript

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Typography, Button, CircularProgress, Paper, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShareIcon from '@mui/icons-material/Share';
import Image from 'next/image';
import { categoryColors } from '@/utils/categoryColors';

// Format date for display
function formatEventDate(dateString) {
  if (!dateString) return '';
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

export default function EventPageClient({ eventId, eventData }) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Store event ID in sessionStorage so calendar can open the modal
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('openEventId', eventId);

      // Redirect to calendar after a brief moment
      // This allows the meta tags to be served for social media crawlers
      const timer = setTimeout(() => {
        router.push('/calendar');
      }, 100);

      // Show fallback content if redirect takes too long
      const fallbackTimer = setTimeout(() => {
        setShowFallback(true);
        setIsRedirecting(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [eventId, router]);

  // Handle share button click
  const handleShare = async () => {
    const shareUrl = `https://tangotiempo.com/event/${eventId}`;
    const shareTitle = eventData?.title || eventData?.shortTitle || 'Tango Event';
    const shareText = eventData?.description?.substring(0, 100) || 'Check out this tango event!';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fallback to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Event link copied to clipboard!');
    }).catch(() => {
      alert(`Share this link: ${url}`);
    });
  };

  // Handle "View on Calendar" button
  const handleViewOnCalendar = () => {
    sessionStorage.setItem('openEventId', eventId);
    router.push('/calendar');
  };

  // Extract event details
  const title = eventData?.title || eventData?.shortTitle || 'Tango Event';
  const shortTitle = eventData?.shortTitle || title;
  const description = eventData?.description || '';
  const eventImage = eventData?.eventImage || eventData?.imageUrl || '';
  const venueName = eventData?.venueName || eventData?.venue?.name || '';
  const venueCity = eventData?.venueMasteredCityName || eventData?.venue?.city || '';
  const organizerName = eventData?.ownerOrganizerName || eventData?.organizer?.name || '';
  const venueStart = eventData?.venueStartDisplay || eventData?.startTime || '';
  const venueEnd = eventData?.venueEndDisplay || eventData?.endTime || '';
  const categoryFirst = eventData?.categoryFirst || '';
  const categorySecond = eventData?.categorySecond || '';
  const categoryThird = eventData?.categoryThird || '';

  // Show loading state while redirecting
  if (isRedirecting && !showFallback) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading event details...
        </Typography>
      </Box>
    );
  }

  // Fallback content - full event display if redirect fails or for crawlers
  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        {/* Event Image */}
        {eventImage && (
          <Box
            sx={{
              width: '100%',
              height: { xs: 200, sm: 300 },
              position: 'relative',
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Image
              src={eventImage}
              alt={title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </Box>
        )}

        {/* Event Title */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {shortTitle}
        </Typography>

        {shortTitle !== title && (
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
        )}

        {/* Categories */}
        {(categoryFirst || categorySecond || categoryThird) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {[categoryFirst, categorySecond, categoryThird].filter(Boolean).map((category, index) => (
              <Chip
                key={index}
                label={category}
                sx={{
                  backgroundColor: categoryColors[category] || 'lightGrey',
                  color: '#000',
                  fontWeight: 'bold',
                }}
                size="small"
              />
            ))}
          </Box>
        )}

        {/* Date and Time */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="primary">
            {formatEventDate(venueStart)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatEventTime(venueStart, venueEnd)}
          </Typography>
        </Box>

        {/* Venue */}
        {venueName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Venue
            </Typography>
            <Typography variant="body1">
              {venueName}
              {venueCity && `, ${venueCity}`}
            </Typography>
          </Box>
        )}

        {/* Organizer */}
        {organizerName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Hosted by
            </Typography>
            <Typography variant="body1">{organizerName}</Typography>
          </Box>
        )}

        {/* Description */}
        {description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              About this event
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {description}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            onClick={handleViewOnCalendar}
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            View on Calendar
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            Share Event
          </Button>
        </Box>
      </Paper>

      {/* TangoTiempo Branding */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Powered by{' '}
          <a href="https://tangotiempo.com" style={{ color: '#1976d2', textDecoration: 'none' }}>
            TangoTiempo
          </a>
          {' '}- The Argentine Tango Calendar
        </Typography>
      </Box>
    </Box>
  );
}

EventPageClient.propTypes = {
  eventId: PropTypes.string.isRequired,
  eventData: PropTypes.shape({
    title: PropTypes.string,
    shortTitle: PropTypes.string,
    description: PropTypes.string,
    eventImage: PropTypes.string,
    imageUrl: PropTypes.string,
    venueName: PropTypes.string,
    venueMasteredCityName: PropTypes.string,
    ownerOrganizerName: PropTypes.string,
    venueStartDisplay: PropTypes.string,
    venueEndDisplay: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    categoryFirst: PropTypes.string,
    categorySecond: PropTypes.string,
    categoryThird: PropTypes.string,
    venue: PropTypes.shape({
      name: PropTypes.string,
      city: PropTypes.string,
    }),
    organizer: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
};
