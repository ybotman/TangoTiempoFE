// src/components/Modals/UserSettings/UserSettingsModal.js
'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab } from '@mui/material';
import ModalHeader from '@/components/UI/ModalHeader';
import UserSettingsName from '@/components/Modals/UserSettings/UserSettingsName';
// Removed UserSettingsLocationPreferences - using UnifiedLocationModal instead
import UserSettingsApply from '@/components/Modals/UserSettings/UserSettingsApply';
import UserSettingsBookmarks from '@/components/Modals/UserSettings/UserSettingsBookmarks';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';

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

const UserSettingsModal = ({ open, onClose, defaultTab }) => {
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const { userData, loading, error, updateUserData, refreshUserData } = useUsers();
  const [currentTab, setCurrentTab] = useState('name');

  // Map tab names to actual tab values
  const tabMapping = {
    'general': 'name',
    'bookmarks': 'bookmarks',
    'apply': 'apply'
  };

  useEffect(() => {
    if (!user) {
      console.log('User is not authenticated or AuthContext is not initialized yet.');
    }
  }, [user]);

  // Update current tab when defaultTab changes
  useEffect(() => {
    if (defaultTab && open) {
      const mappedTab = tabMapping[defaultTab] || defaultTab;
      console.log('[UserSettingsModal] Setting tab to:', mappedTab);
      setCurrentTab(mappedTab);
    }
  }, [defaultTab, open]);

  // Refresh user data when modal opens
  useEffect(() => {
    if (open && refreshUserData) {
      console.log('[UserSettingsModal] Modal opened, refreshing user data');
      refreshUserData();
    }
  }, [open, refreshUserData]);

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
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="User Settings Tabs" 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTabs-scrollableX': {
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              },
              '& .MuiTabs-scroller': {
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }
            }}
          >
            <Tab label="Name" value="name" />
            <Tab label="Bookmarks" value="bookmarks" />
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
                {currentTab === 'bookmarks' && (
                  <UserSettingsBookmarks 
                    userData={userData} 
                    updateUserData={updateUserData} 
                    onSaveSuccess={onClose}
                  />
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
  defaultTab: PropTypes.string,
};

export default UserSettingsModal;
