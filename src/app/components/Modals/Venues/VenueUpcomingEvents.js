'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const VenueUpcomingEvents = ({ venue }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!venue?._id) return;

    const fetchUpcomingEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TIEMPO-246: Use ISO string without timezone conversion
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00.000Z`;
        
        const params = {
          appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
          venueID: venue._id,
          startDateFrom: todayStr,
          limit: 15,
          sort: 'startDate'
        };

// TIEMPO-276: Security cleanup - removed logging
        
        const response = await axios.get(
          `${getApiBaseUrl()}/api/events/`,
          { params }
        );

        if (response.data && response.data.events) {
          setEvents(response.data.events.slice(0, 15)); // Ensure max 15 events
// TIEMPO-276: Security cleanup - removed logging
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching venue events:', err);
        setError('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [venue]);

  if (!venue) return null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight="bold">
          {venue.name || venue.shortName}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {venue.address1}, {venue.city}, {venue.state}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <EventIcon sx={{ mr: 1, fontSize: 20 }} />
        Upcoming Events {events.length > 0 && `(${events.length})`}
      </Typography>

      {events.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No upcoming events at this venue
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {events.map((event) => {
            // TIEMPO-246: Compare dates without timezone conversion
            const eventDateStr = (event.startDate || '').split('T')[0];
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const isToday = eventDateStr === todayStr;
            
            return (
              <ListItem key={event._id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {event.title}
                      </Typography>
                      {isToday && (
                        <Chip label="Today" size="small" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {(() => {
                          // TIEMPO-246: Format date and time without timezone conversion
                          const [datePart, timePart] = (event.startDate || '').split('T');
                          if (!datePart) return 'Date not available';
                          
                          const [year, month, day] = datePart.split('-');
                          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          
                          // Calculate day of week
                          const dateObj = new Date(year, month - 1, day);
                          const weekday = weekdays[dateObj.getDay()];
                          const dateStr = `${weekday}, ${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
                          
                          if (timePart) {
                            const [hour, minute] = timePart.split(':');
                            const hourNum = parseInt(hour, 10);
                            const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                            const suffix = hourNum >= 12 ? 'PM' : 'AM';
                            return `${dateStr} at ${displayHour}:${minute} ${suffix}`;
                          }
                          return dateStr;
                        })()}
                      </Typography>
                      {event.organizerName && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Organized by: {event.organizerName}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

VenueUpcomingEvents.propTypes = {
  venue: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    shortName: PropTypes.string,
    address1: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string
  })
};

export default VenueUpcomingEvents;