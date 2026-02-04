import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link, Divider } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

  const formatDiscoveryDate = (discoveryDate) => {
    if (!discoveryDate) return 'Unknown';
    
    // TIEMPO-246: Format discovery date without timezone conversion
    const [datePart, timePart] = (discoveryDate || '').split('T');
    if (!datePart) return 'Unknown';
    
    const [year, month, day] = datePart.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let result = `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    
    if (timePart) {
      const [hour, minute] = timePart.split(':');
      const hourNum = parseInt(hour, 10);
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const suffix = hourNum >= 12 ? 'PM' : 'AM';
      result += ` ${displayHour}:${minute} ${suffix}`;
    }
    
    return result;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Source Link */}
      {eventDetails.extendedProps?.sourceLink && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LinkIcon sx={{ color: '#1976d2', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
              Source
            </Typography>
          </Box>
          <Link
            href={eventDetails.extendedProps.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#1976d2',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {eventDetails.extendedProps.sourceLink}
          </Link>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {eventDetails.title || 'Untitled Event'}
        </Typography>
      </Box>

      {/* Date Range */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <EventIcon sx={{ color: '#666', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
            Event Date
          </Typography>
        </Box>
        <Typography variant="body1">
          {formatDateRange(eventDetails.start, eventDetails.end)}
        </Typography>
      </Box>

      {/* Description */}
      {eventDetails.extendedProps?.eventDescription && (
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
            {eventDetails.extendedProps.eventDescription}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Discovery Date */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AccessTimeIcon sx={{ color: '#666', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
            Discovered
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {formatDiscoveryDate(eventDetails.extendedProps?.discoveryDate)}
        </Typography>
      </Box>
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
    }),
  }),
};

export default ViewAIEventDetailsTab;