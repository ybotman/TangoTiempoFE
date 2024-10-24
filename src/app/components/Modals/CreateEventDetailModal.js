import React, { useContext, useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import CreateEventDetailsBasic from './CreateEventDetailsBasic';
import CreateEventDetailsImage from './CreateEventDetailsImage';
import CreateEventDetailsOther from './CreateEventDetailsOther';
import CreateEventDetailsRepeating from './CreateEventDetailsRepeating';
import { RegionsContext } from '@/contexts/RegionsContext';
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
  const { selectedRegion, selectedRegionID } = useContext(RegionsContext);
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
    selectedRegion: selectedRegion || '', // Store selectedRegion
    selectedRegionID: selectedRegionID || '', // Store selectedRegionID
  });

  useEffect(() => {}, [open]);

  const handleSave = async () => {
    console.log('Saving event data:', eventData);
    // Save logic for the event data
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
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h5" component="h2">
            {`Create Event in: ${selectedRegion || 'Unknown Region'}`}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={eventData.isRepeating}
                onChange={handleToggleRepeating}
                color="primary"
              />
            }
            label="Repeating"
            labelPlacement="start"
          />
        </Box>

        {/* Tabs for different sections */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="event details tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="Basic" value="basic" />
          <Tab label="Image" value="image" />
          <Tab label="Other" value="other" />
          {eventData.isRepeating && <Tab label="Repeating" value="repeating" />}
        </Tabs>

        {/* Render tab content conditionally */}
        {currentTab === 'basic' && (
          <CreateEventDetailsBasic
            eventData={eventData}
            setEventData={setEventData}
          />
        )}
        {currentTab === 'image' && (
          <CreateEventDetailsImage
            eventData={eventData}
            setEventData={setEventData}
          />
        )}
        {currentTab === 'other' && (
          <CreateEventDetailsOther
            eventData={eventData}
            setEventData={setEventData}
          />
        )}
        {currentTab === 'repeating' && (
          <CreateEventDetailsRepeating
            eventData={eventData}
            setEventData={setEventData}
          />
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Event
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
};

export default CreateEventModal;
