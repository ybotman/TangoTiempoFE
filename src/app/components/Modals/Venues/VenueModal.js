// @/components/Modals/Venues/VenueModal.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import ModalHeader from '@/components/UI/ModalHeader';
import { useVenues } from '@/hooks/useVenues';
import { useUsers } from '@/hooks/useUsers';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import VenueModalAddWithSearch from './VenueModalAddWithSearch';
import VenueModalEdit from './VenueModalEdit';
import VenueModalMap from './VenueModalMap';
import modalStyle from '@/components/Styles/modalStyles';

const VenueModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { venues, fetchVenues, addVenue, updateVenue } = useVenues();
  const { userData } = useUsers();
  const { currentLocation, savedLocation } = useGeoLocation();
  const [currentTab, setCurrentTab] = useState('map');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (open) {
      setCurrentTab('map');
      setSelectedVenue(null);
      
      // Use savedLocation (user's default) first, then currentLocation, then fallback
      const userLat = savedLocation?.lat || currentLocation?.lat;
      const userLng = savedLocation?.lng || currentLocation?.lng;
      const zoomRange = savedLocation?.zoomRange || currentLocation?.zoomRange || 50;

      if (userLat && userLng) {
        const location = { lat: userLat, lng: userLng, radius: zoomRange };
        setMapCenter(location);
        fetchVenues(null, location); // Fetch venues within radius
      } else {
        // Default to Boston if no location
        const defaultLocation = { lat: 42.3601, lng: -71.0589, radius: 20 };
        setMapCenter(defaultLocation);
        fetchVenues(null, defaultLocation);
      }
    }
  }, [open, fetchVenues, userData, currentLocation, savedLocation]);

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);


  const handleMapEditClick = (venue) => {
    setSelectedVenue(venue);
    setCurrentTab('edit');
  };

  const handleListRefresh = () => {
    fetchVenues(null, mapCenter); // Fetch venues for current map center
  };

  const handleMapMove = (newCenter) => {
    // When map moves, fetch venues for the new area
    const location = { 
      lat: newCenter.lat, 
      lng: newCenter.lng, 
      radius: 20 // Or calculate from bounds
    };
    setMapCenter(location);
    fetchVenues(null, location);
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
            <Tab label="Map" value="map" />
            <Tab label="Add" value="add" />
            <Tab label="Edit" value="edit" disabled={!selectedVenue} />
          </Tabs>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
            }}
          >
            {currentTab === 'add' && (
              <VenueModalAddWithSearch
                onAdd={addVenue}
                refreshList={handleListRefresh}
                onDone={() => setCurrentTab('map')}
                proximityLocation={mapCenter}
              />
            )}
            {currentTab === 'edit' && selectedVenue && (
              <VenueModalEdit
                venue={selectedVenue}
                onUpdate={updateVenue}
                refreshList={handleListRefresh}
                onDone={() => {
                  setSelectedVenue(null);
                  setCurrentTab('map');
                }}
              />
            )}
            {currentTab === 'map' && (
              <VenueModalMap 
                venues={venues} 
                selectedVenueId={selectedVenue?._id}
                onEditVenue={handleMapEditClick}
                initialCenter={mapCenter}
                onMapMove={handleMapMove}
              />
            )}
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
