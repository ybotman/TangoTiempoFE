import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link, Divider } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';

const ViewAIEventDetailsTab = ({ eventDetails }) => {
  if (!eventDetails) return null;

  const formatDateRange = (start, end) => {
    // TIEMPO-246: Format dates without timezone conversion
    const formatFullDate = (dateStr) => {
      if (dateStr instanceof Date) dateStr = dateStr.toISOString();
      const [datePart] = (dateStr || '').split('T');
      if (!datePart) return '';
      const [year, month, day] = datePart.split('-');
      const date = new Date(year, month - 1, day);
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
      const weekday = weekdays[date.getDay()];
      return `${weekday}, ${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    };

    const startStr = formatFullDate(start);
    const endStr = end ? formatFullDate(end) : startStr;

    // Same day event
    if (startStr === endStr) {
      return startStr;
    }

    // Multi-day event
    return `${startStr} - ${endStr}`;
  };

  const ext = eventDetails.extendedProps || {};

  // Build location line: State, Nearest City, Actual City
  const locationParts = [];
  if (ext.masteredDivisionName) locationParts.push(ext.masteredDivisionName);
  if (ext.masteredCityName) locationParts.push(`Nearest: ${ext.masteredCityName}`);
  // venueCityName is the actual city from the venue, fall back to city if available
  const actualCity = ext.venueCityName || ext.city;
  if (actualCity && actualCity !== ext.masteredCityName) {
    locationParts.push(`City: ${actualCity}`);
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* RED AI Disclaimer */}
      <Box sx={{
        backgroundColor: '#ffebee',
        border: '1px solid #f44336',
        borderRadius: 1,
        p: 2,
        mb: ext.isExtrapolated ? 1 : 3
      }}>
        <Typography
          variant="body2"
          sx={{
            color: '#c62828',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          This event was discovered from public information, analyzed, and loaded periodically by AI. Details may be inaccurate.
        </Typography>
      </Box>

      {/* ORANGE Extrapolation Disclaimer - shown for AI-projected recurring events */}
      {ext.isExtrapolated && (
        <Box sx={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: 1,
          p: 2,
          mb: 3
        }}>
          <Typography
            variant="body2"
            sx={{
              color: '#e65100',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            This appears to be a recurring event. This specific date was extrapolated by AI based on the detected pattern. The organizer did not post this instance individually. Date and details may change or be cancelled.
          </Typography>
        </Box>
      )}

      {/* Category */}
      {ext.categoryFirst && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: '#1976d2', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
              Category
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ ml: 3.5 }}>
            {ext.categoryFirst}
            {ext.categorySecond && ` / ${ext.categorySecond}`}
          </Typography>
        </Box>
      )}

      {/* Location: State, Nearest City, Actual City */}
      {locationParts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ color: '#666', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
              Location
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ ml: 3.5 }}>
            {locationParts.join(' • ')}
          </Typography>
        </Box>
      )}

      {/* Venue Name */}
      {ext.venueName && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ ml: 3.5, fontWeight: 'medium' }}>
            Venue: {ext.venueName}
          </Typography>
        </Box>
      )}

      {/* Date Range */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon sx={{ color: '#666', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
            Event Date
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ ml: 3.5 }}>
          {formatDateRange(eventDetails.start, eventDetails.end)}
        </Typography>
      </Box>

      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        {eventDetails.title || 'Untitled Event'}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Event Image */}
      {ext.eventImage && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            component="img"
            src={ext.eventImage}
            alt={eventDetails.title || 'Event image'}
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 1,
              objectFit: 'contain',
            }}
          />
        </Box>
      )}

      {/* Description */}
      {ext.eventDescription && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {ext.eventDescription}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Source Link */}
      {ext.sourceLink && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon sx={{ color: '#1976d2', fontSize: 18 }} />
          <Link
            href={ext.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#1976d2',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            View original source
          </Link>
        </Box>
      )}
    </Box>
  );
};

ViewAIEventDetailsTab.propTypes = {
  eventDetails: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    extendedProps: PropTypes.shape({
      eventDescription: PropTypes.string,
      discoveryDate: PropTypes.string,
      sourceLink: PropTypes.string,
      categoryFirst: PropTypes.string,
      categorySecond: PropTypes.string,
      venueName: PropTypes.string,
      venueCityName: PropTypes.string,
      city: PropTypes.string,
      masteredCityName: PropTypes.string,
      masteredDivisionName: PropTypes.string,
      eventImage: PropTypes.string,
      isExtrapolated: PropTypes.bool,
    }),
  }),
};

export default ViewAIEventDetailsTab;
