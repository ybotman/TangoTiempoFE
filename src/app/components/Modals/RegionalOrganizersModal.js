// src/components/Modals/RegionalOrganizersModal.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab, Button } from '@mui/material';
import RegionalOrganizersName from './RegionalOrganizersName';
import RegionalOrganizersDemographic from './RegionalOrganizersDemographic';
import RegionalOrganizersAddress from './RegionalOrganizersAddress';
import RegionalOrganizersPrimaryLocations from './RegionalOrganizersPrimaryLocations';
import RegionalOrganizersSearch from './RegionalOrganizersSearch';

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

const RegionalOrganizersModal = ({ open, onClose }) => {
  const [currentTab, setCurrentTab] = useState('name');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" component="h2" gutterBottom>
          Regional Organizer Settings
        </Typography>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="Regional Organizer Settings Tabs"
          variant="scrollable"
        >
          <Tab label="Name" value="name" />
          <Tab label="Demographic" value="demographic" />
          <Tab label="Address" value="address" />
          <Tab label="Primary Locations" value="primaryLocations" />
          <Tab label="Search" value="search" />
        </Tabs>

        {/* Tab Panels */}
        {currentTab === 'name' && <RegionalOrganizersName />}
        {currentTab === 'demographic' && <RegionalOrganizersDemographic />}
        {currentTab === 'address' && <RegionalOrganizersAddress />}
        {currentTab === 'primaryLocations' && (
          <RegionalOrganizersPrimaryLocations />
        )}
        {currentTab === 'search' && <RegionalOrganizersSearch />}

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

RegionalOrganizersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegionalOrganizersModal;
