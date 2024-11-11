// src/app/components/Modals/RegionalOrganizers/RegionalOrganizersModal.js
'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import RegionalOrganizersName from './RegionalOrganizersName';
import RegionalOrganizersAddress from './RegionalOrganizersAddress';
import RegionalOrganizersDelegated from './RegionalOrganizersDelegated';
import RegionalOrganizersImages from './RegionalOrganizersImages';
import RegionalOrganizersProfileImages from './RegionalOrganizersProfileImages';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';
import modalStyle from '@/components/Styles/modalStyles';

const RegionalOrganizersModal = ({ open, onClose }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const {
    organizers,
    organizer,
    loading,
    error,
    fetchOrganizerById,
    updateOrganizer,
  } = useOrganizers();
  const [currentTab, setCurrentTab] = useState('name');

  useEffect(() => {
    if (open) {
      setCurrentTab('name');
      if (user?.backendInfo.regionalOrganizerInfo?.organizerId) {
        fetchOrganizerById(user.backendInfo.regionalOrganizerInfo.organizerId);
      }
    }
  }, [open, user, fetchOrganizerById]);

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(isMobile)}>
        {/* Header with Close Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            Regional Organizer Settings
          </Typography>
          <Button onClick={onClose}>
            <CloseIcon />
          </Button>
        </Box>

        {user?.backendInfo.regionalOrganizerInfo?.organizerId && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Organizer ID: {user.backendInfo.regionalOrganizerInfo.organizerId}
          </Typography>
        )}

        {user?.backendInfo.regionalOrganizerInfo?.organizerId ? (
          <>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="Regional Organizer Settings Tabs"
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
            >
              <Tab label="Name" value="name" />
              <Tab label="Address" value="address" />
              <Tab label="Delegated" value="delegated" />
              <Tab label="Images" value="images" />
              <Tab label="Profile Images" value="profileImages" />
            </Tabs>

            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">
                Error loading organizer data
              </Typography>
            ) : (
              <Box
                sx={{
                  mt: 2,
                  overflowY: 'auto',
                  flexGrow: 1,
                }}
              >
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
                {currentTab === 'delegated' && (
                  <RegionalOrganizersDelegated
                    organizerId={organizer?._id}
                    delegatedOrganizerIds={
                      organizer.delegatedOrganizerIds || []
                    }
                    organizers={organizers}
                    updateOrganizer={updateOrganizer}
                  />
                )}
                {currentTab === 'images' && (
                  <RegionalOrganizersImages
                    organizerId={organizer?._id}
                    organizer={organizer}
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
          </>
        ) : (
          <Typography color="textSecondary" gutterBottom>
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
