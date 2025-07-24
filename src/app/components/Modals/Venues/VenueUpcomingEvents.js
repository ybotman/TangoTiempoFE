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
import { format } from 'date-fns';

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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const params = {
          appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
          venueID: venue._id,
          startDateFrom: today.toISOString(),
          limit: 15,
          sort: 'startDate'
        };

        console.log('Fetching events for venue:', venue.name, 'with params:', params);
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/events/`,
          { params }
        );

        if (response.data && response.data.events) {
          setEvents(response.data.events.slice(0, 15)); // Ensure max 15 events
          console.log(`Found ${response.data.events.length} upcoming events for venue`);
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
            const eventDate = new Date(event.startDate);
            const isToday = eventDate.toDateString() === new Date().toDateString();
            
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
                        {format(eventDate, 'EEE, MMM d, yyyy')} at {format(eventDate, 'h:mm a')}
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