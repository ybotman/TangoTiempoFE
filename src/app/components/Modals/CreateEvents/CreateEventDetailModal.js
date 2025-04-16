import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, Tabs, Tab, Switch, FormControlLabel, Alert, Chip, CircularProgress } from '@mui/material';
import CreateEventDetailsBasic from './CreateEventDetailsBasic';
import CreateEventDetailsImage from './CreateEventDetailsImage';
import CreateEventDetailsOther from './CreateEventDetailsOther';
import CreateEventDetailsRepeating from './CreateEventDetailsRepeating';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useCreateEvent } from '@/hooks/useEvents';
import PropTypes from 'prop-types';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CreateEventModal = ({ open, onClose, selectedDate }) => {
  const { nearestCity } = useMasteredLocation();
  const { selectedLocation } = useGeoLocation();
  const [currentTab, setCurrentTab] = useState('basic');
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: selectedDate || new Date(),
    endDate: selectedDate || new Date(),
    cost: '',
    locationID: '',
    categoryFirst: '',
    categorySecond: '',
    categoryThird: '',
    grantedOrganizer: '',
    isRepeating: false,
    imageFile: null,
    shortName: '',
    // Use mastered location fields from GeoLocationContext first, then fall back to MasteredLocationContext
    masteredRegionName: selectedLocation.region.name || (nearestCity?.regionName || ''),
    masteredDivisionName: selectedLocation.division.name || (nearestCity?.divisionName || ''),
    masteredCityName: selectedLocation.city.name || (nearestCity?.cityName || ''),
    // Keep old fields for backward compatibility
    selectedRegion: selectedLocation.region.name || (nearestCity?.regionName || ''),
    selectedRegionID: selectedLocation.region.id || (nearestCity?.regionID || ''),
  });

  // Refresh event data when modal opens to get latest selected location
  useEffect(() => {
    if (open) {
      setEventData(prev => ({
        ...prev,
        masteredRegionName: selectedLocation.region.name || (nearestCity?.regionName || ''),
        masteredDivisionName: selectedLocation.division.name || (nearestCity?.divisionName || ''),
        masteredCityName: selectedLocation.city.name || (nearestCity?.cityName || ''),
        // Keep old fields for backward compatibility
        selectedRegion: selectedLocation.region.name || (nearestCity?.regionName || ''),
        selectedRegionID: selectedLocation.region.id || (nearestCity?.regionID || ''),
      }));
    }
  }, [open, selectedLocation, nearestCity]);

  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Import useCreateEvent hook
  const createEvent = useCreateEvent();

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Validate required fields
      if (!eventData.title) {
        throw new Error('Event title is required');
      }
      if (!eventData.masteredRegionName) {
        throw new Error('Region is required');
      }
      if (!eventData.categoryFirst) {
        throw new Error('Category is required');
      }
      
      console.log('Saving event data:', eventData);
      
      // Call the create event function from the hook
      await createEvent(eventData);
      
      // Close the modal on successful save
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setSaveError(error.message || 'Error saving event');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleToggleRepeating = () => {
    setEventData((prevData) => ({
      ...prevData,
      isRepeating: !prevData.isRepeating,
    }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h5" component="h2">
            Create Event
          </Typography>
          <FormControlLabel
            control={<Switch checked={eventData.isRepeating} onChange={handleToggleRepeating} color="primary" />}
            label="Repeating"
            labelPlacement="start"
          />
        </Box>

        {/* Display Current Location Hierarchy */}
        <Box sx={{ my: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`Region: ${eventData.masteredRegionName || 'Not selected'}`} 
            color="primary" 
            variant={eventData.masteredDivisionName ? "outlined" : "filled"}
            size="small"
          />
          {eventData.masteredDivisionName && (
            <Chip 
              label={`Division: ${eventData.masteredDivisionName}`} 
              color="primary" 
              variant={eventData.masteredCityName ? "outlined" : "filled"}
              size="small"
            />
          )}
          {eventData.masteredCityName && (
            <Chip 
              label={`City: ${eventData.masteredCityName}`} 
              color="primary" 
              variant="filled"
              size="small"
            />
          )}
        </Box>

        {/* Error message */}
        {saveError && (
          <Alert severity="error" sx={{ my: 1 }}>
            {saveError}
          </Alert>
        )}

        {/* Tabs for different sections */}
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="event details tabs" sx={{ mb: 2 }}>
          <Tab label="Basic" value="basic" />
          <Tab label="Image" value="image" />
          <Tab label="Other" value="other" />
          {eventData.isRepeating && <Tab label="Repeating" value="repeating" />}
        </Tabs>

        {/* Render tab content conditionally */}
        {currentTab === 'basic' && <CreateEventDetailsBasic eventData={eventData} setEventData={setEventData} />}
        {currentTab === 'image' && <CreateEventDetailsImage eventData={eventData} setEventData={setEventData} />}
        {currentTab === 'other' && <CreateEventDetailsOther eventData={eventData} setEventData={setEventData} />}
        {currentTab === 'repeating' && (
          <CreateEventDetailsRepeating eventData={eventData} setEventData={setEventData} />
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {saving ? 'Saving...' : 'Save Event'}
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

CreateEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  // selectedRegion prop removed - now using GeoLocationContext
};

export default CreateEventModal;
