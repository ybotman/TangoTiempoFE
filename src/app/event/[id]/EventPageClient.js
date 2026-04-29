// TIEMPO-256: Client component for event deep linking
// Handles redirect to calendar page with event modal open
// Also provides fallback display for users without JavaScript

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShareIcon from '@mui/icons-material/Share';
import Image from 'next/image';

// Default event image (header image) when no event image exists
const DEFAULT_EVENT_IMAGE = '/brand/Brand-Simple-Light-WIDE-1.png';

// TIEMPO-256: Inline category colors to avoid importing utils that may pull in leaflet
const categoryColors = {
  'Milonga': '#FF6B6B',
  'Practica': '#4ECDC4',
  'Class': '#45B7D1',
  'Workshop': '#96CEB4',
  'Festival': '#FFEAA7',
  'Concert': '#DDA0DD',
  'Show': '#F39C12',
  'Other': '#95A5A6',
};

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

  // Option A: immediately open the calendar with the event modal — no intermediate page for humans.
  // Social scrapers (Facebook, iMessage, etc.) see the server-rendered OG tags before JS runs.
  useEffect(() => {
    router.replace(`/calendar?event=${eventId}`);
  }, [router, eventId]);

  // Extract event image with fallback to default
  const initialImage = eventData?.eventImage || eventData?.imageUrl || DEFAULT_EVENT_IMAGE;
  const [imageSrc, setImageSrc] = useState(initialImage);

  // Get dynamic base URL for sharing
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tangotiempo.com';

  // Handle share button click
  const handleShare = async () => {
    const shareUrl = `${baseUrl}/event/${eventId}`;
    const shareTitle = eventData?.title || eventData?.shortTitle || 'Tango Event';
    const shareText = eventData?.description?.substring(0, 100) || 'Check out this tango event!';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
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

  // Handle "View on Calendar" button - navigates to calendar with this event
  const handleViewOnCalendar = () => {
    // Use URL query param instead of sessionStorage (more reliable)
    router.push(`/calendar?event=${eventId}`);
  };

  // Handle image load error - fallback to default
  const handleImageError = () => {
    if (imageSrc !== DEFAULT_EVENT_IMAGE) {
      setImageSrc(DEFAULT_EVENT_IMAGE);
    }
  };

  // Extract event details
  const title = eventData?.title || eventData?.shortTitle || 'Tango Event';
  const shortTitle = eventData?.shortTitle || title;
  const description = eventData?.description || '';
  const venueName = eventData?.venueName || eventData?.venue?.name || '';
  const venueCity = eventData?.venueMasteredCityName || eventData?.venue?.city || '';
  const organizerName = eventData?.ownerOrganizerName || eventData?.organizer?.name || '';
  const venueStart = eventData?.venueStartDisplay || eventData?.startTime || '';
  const venueEnd = eventData?.venueEndDisplay || eventData?.endTime || '';
  const categoryFirst = eventData?.categoryFirst || '';
  const categorySecond = eventData?.categorySecond || '';
  const categoryThird = eventData?.categoryThird || '';

  // TIEMPO-256: Always show event details - no auto-redirect
  // This page serves as the shareable landing page for social media
  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        {/* TIEMPO-256: Prominent "View Full Calendar" button at top */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<CalendarMonthIcon />}
          onClick={handleViewOnCalendar}
          sx={{
            mb: 2,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          View Full Event in Calendar
        </Button>

        {/* Event Image - always show with fallback to default */}
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
            src={imageSrc}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            priority
            onError={handleImageError}
          />
        </Box>

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

        {/* Action Buttons - Share only (View Calendar is at top) */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
