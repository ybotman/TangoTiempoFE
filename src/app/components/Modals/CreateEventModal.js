import React, { useState, useContext } from 'react';
import { Modal, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import BasicEventDetails from '@/components/Modals/EventDetailsBasic';
import OtherEventDetails from '@/components/Modals/EventDetailsOther';
import RepeatingEventDetails from '@/components/Modals/EventDetailsRepeating';
import ImageEventDetails from '@/components/Modals/EventDetailsImage';
import { RegionsContext } from '@/contexts/RegionsContext';
import { useLocations } from '@/hooks/useLocations';
import useCategories from '@/hooks/useCategories';
import { useCreateEvent } from '@/hooks/useEvents';
import { validateEvent } from '@/utils/EventCreateRules';

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

const CreateEventModal = ({ open, onClose, selectedDate, onCreate }) => {
  const { selectedRegionID } = useContext(RegionsContext);
  const {
    locations,
    loading: loadingLocations,
    error: locationsError,
  } = useLocations(selectedRegionID);
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useCategories();
  const createEvent = useCreateEvent();

  // State variables
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
    imageFile: null, // New state for image file
  });

  const handleSave = async () => {
    // Handle the event save logic
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography
          id="create-event-title"
          variant="h6"
          component="h2"
          sx={{ mb: 2 }}
        >
          Create Single Event
        </Typography>

        {/* Tab Navigation */}
        <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          <Tab label="Basic" value="basic" />
          <Tab label="Image" value="image" />
          <Tab label="Other" value="other" />
          {eventData.isRepeating && <Tab label="Repeating" value="rrule" />}
        </Tabs>

        {/* Basic Tab */}
        {currentTab === 'basic' && (
          <BasicEventDetails
            eventData={eventData}
            setEventData={setEventData}
          />
        )}

        {/* Image Tab */}
        {currentTab === 'image' && (
          <ImageEventDetails
            imageFile={eventData.imageFile}
            setImageFile={(file) =>
              setEventData({ ...eventData, imageFile: file })
            }
          />
        )}

        {/* Other Tab */}
        {currentTab === 'other' && (
          <OtherEventDetails
            eventData={eventData}
            setEventData={setEventData}
          />
        )}

        {/* Repeating Tab */}
        {currentTab === 'rrule' && (
          <RepeatingEventDetails
            eventData={eventData}
            setEventData={setEventData}
          />
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateEventModal;
