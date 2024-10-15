import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Tabs,
  Tab,
  CardMedia,
  Button,
  Divider,
} from '@mui/material';
import {
  //LocationOn as LocationOnIcon,
  Event as EventIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import './ViewEventDetailModal.css'; // Import the CSS file

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

//function a11yProps(index) {
//  return {
//    id: `event-tab-${index}`,
//    'aria-controls': `event-tabpanel-${index}`,
//  };
//}
const ViewEventDetailModal = ({ open, onClose, eventDetails }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!eventDetails) {
    console.log('!eventDetails');
    return null;
  }

  const {
    title,
    eventImage,
    categoryFirst,
    description,
    startDate,
    endDate,
    locationName,
    locationAddress,
    ownerOrganizerName,
  } = eventDetails;

  // Log the dates to check their validity
  console.log('ViewEventDetailsModal Start Date:', startDate);
  console.log('ViewEventDetailsModal End Date:', endDate);
  console.log('Event Details:', eventDetails);

  // Format dates safely
  const formatDateTime = (date) => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? 'Date not available'
      : parsedDate.toLocaleString();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="event-details-modal-title"
      aria-describedby="event-details-modal-description"
      closeAfterTransition
    >
      <Box className="modalBox">
        <Typography variant="h5" component="h2" id="event-details-modal-title">
          {title}
        </Typography>

        {eventImage && (
          <CardMedia
            component="img"
            height="200"
            image={eventImage}
            alt={title}
            className="eventImage"
          />
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mt: 2 }}
        >
          <Tab label="Details" />
          <Tab label="More" />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* Categories */}
          <Box display="flex" alignItems="center" mt={1}>
            <CategoryIcon fontSize="small" />
            <Typography variant="body2" ml={1}>
              {categoryFirst}
            </Typography>
          </Box>

          {/* Description */}
          <Box mt={2}>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </Box>

          {/* Date and Time */}
          <Box display="flex" alignItems="center" mt={2}>
            <EventIcon fontSize="small" />
            <Typography variant="body2" ml={1}>
              {formatDateTime(startDate)} - {formatDateTime(endDate)}
            </Typography>
          </Box>

          {/* Location Details */}
          {locationName && (
            <Box mt={2}>
              <Divider />
              <Typography variant="h6" mt={2}>
                Location
              </Typography>
              <Typography variant="body1">{locationName}</Typography>
              {locationAddress && (
                <Typography variant="body2" color="textSecondary">
                  {locationAddress}
                </Typography>
              )}

              <Box className="mapPlaceholder">
                <Typography variant="body2">
                  Map Placeholder for {locationAddress || locationName}
                </Typography>
              </Box>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Organizer</Typography>
          <Typography variant="body1">{ownerOrganizerName}</Typography>
        </TabPanel>
        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewEventDetailModal;
