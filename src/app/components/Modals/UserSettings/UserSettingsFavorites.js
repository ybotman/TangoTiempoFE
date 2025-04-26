// src/components/Modals/UserSettings/UserSettingsFavorites.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Button, useMediaQuery } from '@mui/material';
import { Delete } from '@mui/icons-material';

const UserSettingsFavorites = ({ userData, updateUserData }) => {
  const [favoriteOrganizers, setFavoriteOrganizers] = useState(userData?.localUserInfo?.favoriteOrganizers || []);
  const [subscribedEvents, setSubscribedEvents] = useState(userData?.localUserInfo?.subscribedEvents || []);
  const [isDirty, setIsDirty] = useState(false);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const handleRemoveOrganizer = (organizerId) => {
    const updatedOrganizers = favoriteOrganizers.filter((org) => org._id !== organizerId);
    setFavoriteOrganizers(updatedOrganizers);
    setIsDirty(true);
  };

  const handleRemoveEvent = (eventId) => {
    const updatedEvents = subscribedEvents.filter((event) => event._id !== eventId);
    setSubscribedEvents(updatedEvents);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateUserData({
        favoriteOrganizers: favoriteOrganizers.map((org) => org._id),
        subscribedEvents: subscribedEvents.map((event) => event._id),
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Favorites</Typography>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} sx={{ mt: 2 }}>
        <Box flex={1}>
          <Typography variant="subtitle1">Subscribed Events</Typography>
          {subscribedEvents.length > 0 ? (
            <List>
              {subscribedEvents.map((event) => (
                <ListItem
                  key={event._id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveEvent(event._id)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={event.title} />
                </ListItem>
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
              {favoriteOrganizers.map((organizer) => (
                <ListItem
                  key={organizer._id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveOrganizer(organizer._id)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={organizer.fullName || organizer.name} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No favorite organizers.</Typography>
          )}
        </Box>
      </Box>
      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={!isDirty}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

UserSettingsFavorites.propTypes = {
  userData: PropTypes.object.isRequired,
  updateUserData: PropTypes.func.isRequired,
};

export default UserSettingsFavorites;
