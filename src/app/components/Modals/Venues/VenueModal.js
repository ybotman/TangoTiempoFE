// @/components/Modals/Venues/VenueModal.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import ModalHeader from '@/components/UI/ModalHeader';
import { useVenues } from '@/hooks/useVenues';
import VenueModalList from './VenueModalList';
import VenueModalAdd from './VenueModalAdd';
import VenueModalEdit from './VenueModalEdit';
import VenueModalMap from './VenueModalMap';
import modalStyle from '@/components/Styles/modalStyles';

const VenueModal = ({ open, onClose, defaultCityId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { venues, fetchVenues, addVenue, updateVenue, deactivateVenue } = useVenues();
  const [currentTab, setCurrentTab] = useState('list');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(defaultCityId || '');
  const [activeFilter, setActiveFilter] = useState(true);

  useEffect(() => {
    if (open) {
      setCurrentTab('list');
      setSelectedVenue(null);
      fetchVenues(selectedCityId, activeFilter);
    }
  }, [open, selectedCityId, activeFilter, fetchVenues]);

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  const handleEditVenue = (venue) => {
    setSelectedVenue(venue);
    setCurrentTab('edit');
  };

  const handleListRefresh = () => {
    fetchVenues(selectedCityId, activeFilter);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(isMobile)}>
        <ModalHeader 
          title="Venues Management" 
          onClose={onClose}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="Venues Management Tabs"
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
            <Tab label="List" value="list" />
            <Tab label="Add" value="add" />
            <Tab label="Edit" value="edit" disabled={!selectedVenue} />
            <Tab label="Map" value="map" />
          </Tabs>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
            }}
          >
            {currentTab === 'list' && (
              <VenueModalList
                venues={venues}
                onEdit={handleEditVenue}
                onDelete={deactivateVenue}
                selectedCityId={selectedCityId}
                onCityChange={(cid) => setSelectedCityId(cid)}
                activeFilter={activeFilter}
                onActiveFilterChange={(val) => setActiveFilter(val)}
                refreshList={handleListRefresh}
              />
            )}
            {currentTab === 'add' && (
              <VenueModalAdd onAdd={addVenue} refreshList={handleListRefresh} onDone={() => setCurrentTab('list')} />
            )}
            {currentTab === 'edit' && selectedVenue && (
              <VenueModalEdit
                venue={selectedVenue}
                onUpdate={updateVenue}
                refreshList={handleListRefresh}
                onDone={() => {
                  setSelectedVenue(null);
                  setCurrentTab('list');
                }}
              />
            )}
            {currentTab === 'map' && <VenueModalMap venues={venues} />}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

VenueModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  defaultCityId: PropTypes.string,
};

export default VenueModal;
