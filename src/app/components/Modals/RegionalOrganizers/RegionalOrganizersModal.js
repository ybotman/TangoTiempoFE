'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab, useMediaQuery, useTheme, AppBar, Toolbar, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import RegionalOrganizersName from './RegionalOrganizersName';
import RegionalOrganizersAddress from './RegionalOrganizersAddress';
import RegionalOrganizersDelegated from './RegionalOrganizersDelegated';
import RegionalOrganizersProfileImages from './RegionalOrganizersProfileImages';
import RegionalOrganizerTypes from './RegionalOrganizersTypes';
import RegionalOrganizersStatus from './RegionalOrganizersStatus';
import RegionalOrganizersSettings from './RegionalOrganizersSettings';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';
import modalStyle from '@/components/Styles/modalStyles';

const RegionalOrganizersModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const { organizers, organizer, loading, error, fetchOrganizerById, updateOrganizer } = useOrganizers();
  const [currentTab, setCurrentTab] = useState('status');

  useEffect(() => {
    if (open) {
      setCurrentTab('status');

      const organizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;

      if (organizerId) {
        try {
          fetchOrganizerById(organizerId);
        } catch (error) {
          console.error('Error calling fetchOrganizerById:', error);
        }
      } else {
        console.warn('No Organizer ID available. Skipping fetch.');
      }
    }
  }, [open, user, fetchOrganizerById]);

  const handleTabChange = (event, newValue) => {
    // For now, just switch tabs. In a future update, we could add unsaved changes detection
    setCurrentTab(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(isMobile)}>
        {/* Header with Close Button */}
        <AppBar position="static" color="default">
          <Toolbar variant="dense">
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Regional Organizer Settings
            </Typography>
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {user?.backendInfo.regionalOrganizerInfo?.organizerId && (
          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ p: 1 }}>
            Organizer ID: {user.backendInfo.regionalOrganizerInfo.organizerId}
          </Typography>
        )}

        {user?.backendInfo.regionalOrganizerInfo?.organizerId ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="Regional Organizer Settings Tabs"
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
              <Tab label="Status" value="status" />
              <Tab label="Settings" value="settings" />
              <Tab label="Name" value="name" />
              <Tab label="Address" value="address" />
              <Tab label="Types" value="types" />
              <Tab label="Delegated" value="delegated" />
              <Tab label="Profile Images" value="profileImages" />
            </Tabs>

            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">Error loading organizer data</Typography>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  p: 2,
                }}
              >
                {currentTab === 'status' && (
                  <RegionalOrganizersStatus
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                  />
                )}
                {currentTab === 'settings' && (
                  <RegionalOrganizersSettings
                    organizerId={organizer?._id}
                    organizer={organizer}
                  />
                )}
                {currentTab === 'name' && (
                  <RegionalOrganizersName
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                  />
                )}
                {currentTab === 'address' && (
                  <RegionalOrganizersAddress
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                  />
                )}
                {currentTab === 'types' && (
                  <RegionalOrganizerTypes
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                  />
                )}
                {currentTab === 'delegated' && (
                  <RegionalOrganizersDelegated
                    organizerId={organizer?._id || ''}
                    delegatedOrganizerIds={organizer && Array.isArray(organizer.delegatedOrganizerIds)
                      ? organizer.delegatedOrganizerIds
                      : []}
                    organizers={Array.isArray(organizers) ? organizers : []}
                    updateOrganizer={updateOrganizer}
                  />
                )}
                {currentTab === 'profileImages' && (
                  <RegionalOrganizersProfileImages
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                  />
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="textSecondary" gutterBottom sx={{ p: 2 }}>
            No organizer information available.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

RegionalOrganizersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegionalOrganizersModal;
