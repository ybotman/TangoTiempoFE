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
  ListItemSecondaryAction,
  IconButton,
  Button,
  Autocomplete,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';

const UserSettingsFavorites = ({ userData, updateUserData }) => {
  const [favoriteOrganizers, setFavoriteOrganizers] = useState(
    userData?.localUserInfo?.favoriteOrganizers || []
  );
  const [subscribedEvents, setSubscribedEvents] = useState(
    userData?.localUserInfo?.subscribedEvents || []
  );
  const [isDirty, setIsDirty] = useState(false);

  const [organizerOptions, setOrganizerOptions] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // Function to fetch organizers based on search input
  const fetchOrganizers = async (searchText) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/search`,
        {
          params: { q: searchText },
        }
      );
      setOrganizerOptions(response.data);
    } catch (error) {
      console.error('Error fetching organizers:', error);
    }
  };

  // Function to fetch events based on search input
  const fetchEvents = async (searchText) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/search`,
        {
          params: { q: searchText },
        }
      );
      setEventOptions(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch organizers when organizerSearch changes
  useEffect(() => {
    if (organizerSearch) {
      fetchOrganizers(organizerSearch);
    } else {
      setOrganizerOptions([]);
    }
  }, [organizerSearch]);

  // Fetch events when eventSearch changes
  useEffect(() => {
    if (eventSearch) {
      fetchEvents(eventSearch);
    } else {
      setEventOptions([]);
    }
  }, [eventSearch]);

  const handleAddOrganizer = (organizer) => {
    if (!favoriteOrganizers.find((org) => org._id === organizer._id)) {
      setFavoriteOrganizers([...favoriteOrganizers, organizer]);
      setIsDirty(true);
    }
  };

  const handleAddEvent = (event) => {
    if (!subscribedEvents.find((e) => e._id === event._id)) {
      setSubscribedEvents([...subscribedEvents, event]);
      setIsDirty(true);
    }
  };

  const handleRemoveOrganizer = (organizerId) => {
    const updatedOrganizers = favoriteOrganizers.filter(
      (org) => org._id !== organizerId
    );
    setFavoriteOrganizers(updatedOrganizers);
    setIsDirty(true);
  };

  const handleRemoveEvent = (eventId) => {
    const updatedEvents = subscribedEvents.filter(
      (event) => event._id !== eventId
    );
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
      <Typography variant="h6">Favorite Organizers</Typography>
      {/* Autocomplete to add organizers */}
      <Autocomplete
        options={organizerOptions}
        getOptionLabel={(option) => option.name}
        onInputChange={(event, newInputValue) => {
          setOrganizerSearch(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            handleAddOrganizer(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Add Organizer" variant="outlined" />
        )}
      />
      {favoriteOrganizers.length > 0 ? (
        <List>
          {favoriteOrganizers.map((organizer) => (
            <ListItem key={organizer._id}>
              <ListItemText primary={organizer.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="remove"
                  onClick={() => handleRemoveOrganizer(organizer._id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No favorite organizers added.</Typography>
      )}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Subscribed Events
      </Typography>
      {/* Autocomplete to add events */}
      <Autocomplete
        options={eventOptions}
        getOptionLabel={(option) => option.title}
        onInputChange={(event, newInputValue) => {
          setEventSearch(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            handleAddEvent(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Add Event" variant="outlined" />
        )}
      />
      {subscribedEvents.length > 0 ? (
        <List>
          {subscribedEvents.map((event) => (
            <ListItem key={event._id}>
              <ListItemText primary={event.title} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="remove"
                  onClick={() => handleRemoveEvent(event._id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No subscribed events added.</Typography>
      )}
      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!isDirty}
        >
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
