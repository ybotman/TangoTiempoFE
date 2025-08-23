// src/components/Modals/UserSettings/UserSettingsExternal.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Edit as EditIcon,
  LocationCity as CityIcon,
  Event as EventIcon,
  Group as OrganizerIcon,
  Done as DoneIcon
} from '@mui/icons-material';

const UserSettingsBookmarks = ({ userData, updateUserData, onSaveSuccess }) => {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  
  // Mock data - will be replaced with userData.localUserInfo.bookmarks
  const [bookmarkedItems, setBookmarkedItems] = useState({
    events: [
      { id: '1', name: 'Buenos Aires Tango Festival 2025', date: '2025-03-15', location: 'Buenos Aires' },
      { id: '2', name: 'Milonga del Corazón', date: '2025-02-10', location: 'San Francisco' },
      { id: '3', name: 'Tango Workshop with Masters', date: '2025-04-20', location: 'New York' },
      { id: '4', name: 'Summer Tango Nights', date: '2025-06-15', location: 'Paris' },
    ],
    organizers: [
      { id: '1', name: 'Tango Buenos Aires Organization', eventCount: 45 },
      { id: '2', name: 'SF Tango Collective', eventCount: 23 },
      { id: '3', name: 'NYC Tango Society', eventCount: 67 },
      { id: '4', name: 'Paris Milonga Network', eventCount: 34 },
    ],
    cities: [
      { id: '1', name: 'Buenos Aires', country: 'Argentina', eventCount: 234 },
      { id: '2', name: 'San Francisco', country: 'USA', eventCount: 89 },
      { id: '3', name: 'Paris', country: 'France', eventCount: 156 },
      { id: '4', name: 'Berlin', country: 'Germany', eventCount: 98 },
      { id: '5', name: 'Tokyo', country: 'Japan', eventCount: 45 },
    ]
  });

  // Track removed items for saving
  const [removedItems, setRemovedItems] = useState({
    events: [],
    organizers: [],
    cities: []
  });

  // Load bookmarks from userData when available
  useEffect(() => {
    if (userData?.localUserInfo?.bookmarks) {
      setBookmarkedItems(userData.localUserInfo.bookmarks);
    }
  }, [userData]);

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setActiveTab(newValue);
    }
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode - save changes if any items were removed
      if (removedItems.events.length > 0 || removedItems.organizers.length > 0 || removedItems.cities.length > 0) {
        // Save logic would go here
// TIEMPO-276: Security cleanup - removed logging
      }
      setRemovedItems({ events: [], organizers: [], cities: [] });
    }
    setEditMode(!editMode);
  };

  const handleRemoveBookmark = (type, id) => {
    setBookmarkedItems(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
    
    setRemovedItems(prev => ({
      ...prev,
      [type]: [...prev[type], id]
    }));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'events':
        return <EventIcon />;
      case 'organizers':
        return <OrganizerIcon />;
      case 'cities':
        return <CityIcon />;
      default:
        return <BookmarkIcon />;
    }
  };

  const getItemCount = (type) => {
    return bookmarkedItems[type]?.length || 0;
  };

  const renderEventItem = (event) => (
    <ListItem key={event.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
      <ListItemText
        primary={event.name}
        secondary={`${event.date} • ${event.location}`}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
      {editMode && (
        <ListItemSecondaryAction>
          <IconButton 
            edge="end" 
            onClick={() => handleRemoveBookmark('events', event.id)}
            size="small"
            color="error"
          >
            <BookmarkIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );

  const renderOrganizerItem = (organizer) => (
    <ListItem key={organizer.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
      <ListItemText
        primary={organizer.name}
        secondary={`${organizer.eventCount} events`}
      />
      {editMode && (
        <ListItemSecondaryAction>
          <IconButton 
            edge="end" 
            onClick={() => handleRemoveBookmark('organizers', organizer.id)}
            size="small"
            color="error"
          >
            <BookmarkIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );

  const renderCityItem = (city) => (
    <ListItem key={city.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
      <ListItemText
        primary={city.name}
        secondary={`${city.country} • ${city.eventCount} events`}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
      {editMode && (
        <ListItemSecondaryAction>
          <IconButton 
            edge="end" 
            onClick={() => handleRemoveBookmark('cities', city.id)}
            size="small"
            color="error"
          >
            <BookmarkIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Bookmarks
        </Typography>
        <IconButton 
          onClick={handleToggleEditMode}
          color={editMode ? "primary" : "default"}
          sx={{ 
            bgcolor: editMode ? 'primary.light' : 'transparent',
            '&:hover': {
              bgcolor: editMode ? 'primary.light' : 'action.hover'
            }
          }}
        >
          {editMode ? <DoneIcon /> : <EditIcon />}
        </IconButton>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your bookmarked events, organizers, and cities. {editMode && "Click on bookmarks to remove them."}
      </Typography>

      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={handleTabChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="events" sx={{ textTransform: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon fontSize="small" />
            <Typography variant="body2">Events</Typography>
            <Chip label={getItemCount('events')} size="small" />
          </Box>
        </ToggleButton>
        <ToggleButton value="organizers" sx={{ textTransform: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OrganizerIcon fontSize="small" />
            <Typography variant="body2">Organizers</Typography>
            <Chip label={getItemCount('organizers')} size="small" />
          </Box>
        </ToggleButton>
        <ToggleButton value="cities" sx={{ textTransform: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CityIcon fontSize="small" />
            <Typography variant="body2">Cities</Typography>
            <Chip label={getItemCount('cities')} size="small" />
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2, minHeight: 300, maxHeight: 400, overflow: 'auto' }}>
        {activeTab === 'events' && (
          <List sx={{ p: 0 }}>
            {bookmarkedItems.events.length > 0 ? (
              bookmarkedItems.events.map(renderEventItem)
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No bookmarked events yet
              </Typography>
            )}
          </List>
        )}

        {activeTab === 'organizers' && (
          <List sx={{ p: 0 }}>
            {bookmarkedItems.organizers.length > 0 ? (
              bookmarkedItems.organizers.map(renderOrganizerItem)
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No bookmarked organizers yet
              </Typography>
            )}
          </List>
        )}

        {activeTab === 'cities' && (
          <List sx={{ p: 0 }}>
            {bookmarkedItems.cities.length > 0 ? (
              bookmarkedItems.cities.map(renderCityItem)
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                No bookmarked cities yet
              </Typography>
            )}
          </List>
        )}
      </Paper>

      {editMode && removedItems[activeTab].length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {removedItems[activeTab].length} {activeTab} will be removed when you exit edit mode
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary">
        Bookmark items by clicking the bookmark icon on events, organizer profiles, or city pages throughout the app.
      </Typography>
    </Box>
  );
};

UserSettingsBookmarks.propTypes = {
  userData: PropTypes.object,
  updateUserData: PropTypes.func,
  onSaveSuccess: PropTypes.func,
};

export default UserSettingsBookmarks;