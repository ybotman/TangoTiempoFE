// src/components/Modals/UserSettings/UserSettingsFavorites.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const UserSettingsFavorites = ({ userData, updateUserData }) => {
  const [favoriteOrganizers, setFavoriteOrganizers] = useState([]);
  const [subscribedEvents, setSubscribedEvents] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get theme first, then use it with useMediaQuery
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize state from props and handle prop changes
  useEffect(() => {
    // Ensure we have arrays even if data is missing or malformed
    const organizers = userData?.localUserInfo?.favoriteOrganizers;
    const events = userData?.localUserInfo?.subscribedEvents;

    setFavoriteOrganizers(Array.isArray(organizers) ? organizers : []);
    setSubscribedEvents(Array.isArray(events) ? events : []);
    setIsDirty(false);
  }, [userData]);

  const handleRemoveOrganizer = (organizerId) => {
    if (!organizerId) return;

    const updatedOrganizers = favoriteOrganizers.filter((org) => org && org._id !== organizerId);
    setFavoriteOrganizers(updatedOrganizers);
    setIsDirty(true);
  };

  const handleRemoveEvent = (eventId) => {
    if (!eventId) return;

    const updatedEvents = subscribedEvents.filter((event) => event && event._id !== eventId);
    setSubscribedEvents(updatedEvents);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create safe arrays with proper error handling
      const organizerIds = favoriteOrganizers
        .filter(org => org && org._id)
        .map(org => org._id);

      const eventIds = subscribedEvents
        .filter(event => event && event._id)
        .map(event => event._id);

      await updateUserData({
        localUserInfo: {
          favoriteOrganizers: organizerIds,
          subscribedEvents: eventIds,
        }
      });

      setIsDirty(false);
    } catch (error) {
      console.error('Error updating favorites:', error);
      setError(error.message || 'Failed to update favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe access for item properties with fallbacks
  const getOrganizerName = (organizer) => {
    if (!organizer) return 'Unknown Organizer';
    return organizer.fullName || organizer.name || 'Unnamed Organizer';
  };

  const getEventTitle = (event) => {
    if (!event) return 'Unknown Event';
    return event.title || 'Untitled Event';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Favorites</Typography>

      {/* Error message display */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} sx={{ mt: 2 }}>
        <Box flex={1}>
          <Typography variant="subtitle1">Subscribed Events</Typography>
          {subscribedEvents.length > 0 ? (
            <List>
              {subscribedEvents.map((event, index) => (
                event && event._id ? (
                  <ListItem
                    key={event._id || `event-${index}`}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveEvent(event._id)}
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={getEventTitle(event)} />
                  </ListItem>
                ) : null
              ))}
            </List>
          ) : (
            <Typography>No subscribed events.</Typography>
          )}
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle1">Favorite Organizers</Typography>
          {favoriteOrganizers.length > 0 ? (
            <List>
              {favoriteOrganizers.map((organizer, index) => (
                organizer && organizer._id ? (
                  <ListItem
                    key={organizer._id || `organizer-${index}`}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveOrganizer(organizer._id)}
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={getOrganizerName(organizer)} />
                  </ListItem>
                ) : null
              ))}
            </List>
          ) : (
            <Typography>No favorite organizers.</Typography>
          )}
        </Box>
      </Box>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!isDirty || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

UserSettingsFavorites.propTypes = {
  userData: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
};

export default UserSettingsFavorites;
