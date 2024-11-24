// src/components/Modals/UserSettings/UserSettingsModal.js
'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab, Button } from '@mui/material';
import UserSettingsName from '@/components/Modals/UserSettings/UserSettingsName';
import UserSettingsFavorites from '@/components/Modals/UserSettings/UserSettingsFavorites';
import UserSettingsNotifications from '@/components/Modals/UserSettings/UserSettingsNotifications';
import UserSettingsApply from '@/components/Modals/UserSettings/UserSettingsApply';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';

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
  const auth = useContext(AuthContext);
  const { user } = auth || {}; // Destructure user only if auth is defined
  const { userData, loading, error, updateUserData } = useUsers();
  const [currentTab, setCurrentTab] = useState('name'); // Manage active tab state

  // Log state if user is missing
  useEffect(() => {
    if (!user) {
      console.log(
        'User is not authenticated or AuthContext is not initialized yet.'
      );
    }
  }, [user]);

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" component="h2" gutterBottom>
          User Settings
        </Typography>

        {/* Tab Navigation */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="User Settings Tabs"
          variant="scrollable"
        >
          <Tab label="Name" value="name" />
          <Tab label="Favs" value="favorites" />
          <Tab label="Notifications" value="notifications" />
          <Tab label="Apply" value="apply" />
        </Tabs>

        {/* Content Based on Selected Tab */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Error loading user data</Typography>
        ) : (
          <>
            {currentTab === 'name' && (
              <UserSettingsName
                userData={userData}
                updateUserData={updateUserData}
              />
            )}
            {currentTab === 'favorites' && (
              <UserSettingsFavorites userData={userData} />
            )}
            {currentTab === 'notifications' && (
              <UserSettingsNotifications userData={userData} />
            )}
            {currentTab === 'apply' && (
              <UserSettingsApply userData={userData} />
            )}
          </>
        )}

        {/* Modal Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
          <Button onClick={onClose} color="secondary">
            Done
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
