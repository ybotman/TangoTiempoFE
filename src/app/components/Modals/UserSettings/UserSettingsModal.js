// src/components/Modals/UserSettings/UserSettingsModal.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab, Button } from '@mui/material';
import UserSettingsName from '@/components/Modals/UserSettings/UserSettingsName';
import UserSettingsEvents from '@/components/Modals/UserSettings/UserSettingsEvents';
import UserSettingsOrganizers from '@/components/Modals/UserSettings/UserSettingsOrganizers';
import UserSettingsNotifications from '@/components/Modals/UserSettings/UserSettingsNotifications';
import UserSettingsOther from '@/components/Modals/UserSettings/UserSettingsOther';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
};

const UserSettingsModal = ({ open, onClose }) => {
  const [currentTab, setCurrentTab] = useState('name');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" component="h2" gutterBottom>
          User Settings
        </Typography>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="User Settings Tabs"
          variant="scrollable"
        >
          <Tab label="Name" value="name" />
          <Tab label="Events" value="events" />
          <Tab label="Organizer" value="organizer" />
          <Tab label="Notifications" value="notifications" />
          <Tab label="Other" value="other" />
        </Tabs>

        {/* Tab Panels */}
        {currentTab === 'name' && <UserSettingsName />}
        {currentTab === 'events' && <UserSettingsEvents />}
        {currentTab === 'organizer' && <UserSettingsOrganizers />}
        {currentTab === 'notifications' && <UserSettingsNotifications />}
        {currentTab === 'other' && <UserSettingsOther />}

        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// PropTypes validation
UserSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserSettingsModal;
