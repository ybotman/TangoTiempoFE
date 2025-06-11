// src/components/Modals/UserSettings/UserSettingsModal.js
'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab } from '@mui/material';
import ModalHeader from '@/components/UI/ModalHeader';
import UserSettingsName from '@/components/Modals/UserSettings/UserSettingsName';
import UserSettingsFavorites from '@/components/Modals/UserSettings/UserSettingsFavorites';
import UserSettingsNotifications from '@/components/Modals/UserSettings/UserSettingsNotifications';
import UserSettingsApply from '@/components/Modals/UserSettings/UserSettingsApply';
import UserSettingsGeoLocation from '@/components/Modals/UserSettings/UserSettingsGeoLocation';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
};

const UserSettingsModal = ({ open, onClose }) => {
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const geoLocation = useGeoLocation();
  const { userData, loading, error, updateUserData } = useUsers();
  const [currentTab, setCurrentTab] = useState('name');

  useEffect(() => {
    if (!user) {
      console.log('User is not authenticated or AuthContext is not initialized yet.');
    }
  }, [user]);

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <ModalHeader 
          title="User Settings" 
          onClose={onClose}
        />

        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Tab Navigation */}
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="User Settings Tabs" variant="scrollable">
            <Tab label="Name" value="name" />
            <Tab label="Favs" value="favorites" />
            <Tab label="Notifications" value="notifications" />
            <Tab label="Location" value="geolocation" />
            <Tab label="Apply" value="apply" />
          </Tabs>

          {/* Content Based on Selected Tab */}
          <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">Error loading user data</Typography>
            ) : (
              <>
                {currentTab === 'name' && <UserSettingsName userData={userData} updateUserData={updateUserData} />}
                {currentTab === 'favorites' && (
                  <UserSettingsFavorites userData={userData} updateUserData={updateUserData} />
                )}
                {currentTab === 'notifications' && (
                  <UserSettingsNotifications userData={userData} updateUserData={updateUserData} />
                )}
                {currentTab === 'geolocation' && (
                  <UserSettingsGeoLocation userData={userData} geoLocation={geoLocation} />
                )}
                {currentTab === 'apply' && <UserSettingsApply userData={userData} />}
              </>
            )}
          </Box>
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
