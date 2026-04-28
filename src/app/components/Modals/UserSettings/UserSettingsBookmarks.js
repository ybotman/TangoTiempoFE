'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import LocationCityIcon from '@mui/icons-material/LocationCity';

const TABS = [
  { value: 'events',     label: 'Events',     icon: <EventIcon fontSize="small" /> },
  { value: 'organizers', label: 'Organizers', icon: <GroupIcon fontSize="small" /> },
  { value: 'cities',     label: 'Cities',     icon: <LocationCityIcon fontSize="small" /> },
];

const UserSettingsBookmarks = () => {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <Box sx={{ mt: 2 }}>
      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={(_, v) => { if (v) setActiveTab(v); }}
        size="small"
        sx={{ mb: 2 }}
      >
        {TABS.map(({ value, label, icon }) => (
          <ToggleButton key={value} value={value} sx={{ gap: 0.5 }}>
            {icon} {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Alert severity="info">
        Bookmark {activeTab} to find them here quickly — coming soon.
      </Alert>
    </Box>
  );
};

UserSettingsBookmarks.propTypes = {
  userData: PropTypes.object,
  updateUserData: PropTypes.func,
};

export default UserSettingsBookmarks;
