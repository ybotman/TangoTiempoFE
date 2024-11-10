// src/components/Modals/RegionalOrganizers/RegionalOrganizersModal.js

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab, Button } from '@mui/material';
import RegionalOrganizersName from './RegionalOrganizersName';
import RegionalOrganizersAddress from './RegionalOrganizersAddress';
import RegionalOrganizersDelegated from './RegionalOrganizersDelegated';
import RegionalOrganizersImages from './RegionalOrganizersImages';
import RegionalOrganizersProfileImages from './RegionalOrganizersProfileImages'; // New component import
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
};

const RegionalOrganizersModal = ({ open, onClose }) => {
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
      <Box sx={modalStyle}>
        <Typography variant="h5" component="h2" gutterBottom>
          Regional Organizer Settings
        </Typography>

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
            >
              <Tab label="Name" value="name" />
              <Tab label="Address" value="address" />
              <Tab label="Delegated" value="delegated" />
              <Tab label="Images" value="images" />
              <Tab label="Profile Images" value="profileImages" />{' '}
              {/* New Profile Images tab */}
            </Tabs>

            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">
                Error loading organizer data
              </Typography>
            ) : (
              <>
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
              </>
            )}
          </>
        ) : (
          <Typography color="textSecondary" gutterBottom>
            No organizer information available.
          </Typography>
        )}

        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
          <Button onClick={onClose} color="secondary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

RegionalOrganizersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegionalOrganizersModal;
