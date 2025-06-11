// @/components/Modals/SystemAdmin/SystemAdminModal.js
'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Tabs, Tab, Modal } from '@mui/material';
import ModalHeader from '@/components/UI/ModalHeader';
import SystemAdminUserLogin from './SystemAdminUserLogin';
import SystemAdminRegionalOrganizer from './SystemAdminRegionalOrganizer';
import SystemAdminRegionalAdmin from './SystemAdminRegionalAdmin';

export default function SystemAdminModal({ open, onClose }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <ModalHeader 
          title="SYSTEM ADMINISTRATION" 
          onClose={onClose}
        />
        
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
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
            <Tab label="UserLogin" />
            <Tab label="Regional Organizer Info" />
            <Tab label="Regional Admin" />
          </Tabs>

          <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
            {selectedTab === 0 && <SystemAdminUserLogin />}
            {selectedTab === 1 && <SystemAdminRegionalOrganizer />}
            {selectedTab === 2 && <SystemAdminRegionalAdmin />}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

// PropTypes validation
SystemAdminModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
