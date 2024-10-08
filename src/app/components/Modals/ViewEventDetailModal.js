import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Tabs,
  Tab,
  CardMedia,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Facebook as FacebookIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styles for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '8px',
};

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
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `event-tab-${index}`,
    'aria-controls': `event-tabpanel-${index}`,
  };
}

const ViewEventDetailModal = ({ open, onClose, eventDetails }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!eventDetails) {
    return null; // Optionally, add a loader here
  }

  const {
    title,
    eventImage,
    categoryFirst,
    categorySecond,
    categoryThird,
    description,
    startDate,
    endDate,
    recurrenceRule,
    locationName,
    locationAddress,
    ownerOrganizerName,
    organizerPhone,
    organizerEmail,
    // Additional fields can be added here
    tmpCreator,
    tmpVenueId,
    tmpEventOrgId,
    tmpUrl,
    tmpMix,
  } = eventDetails;

  // Format date and time
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  // Function to parse recurrenceRule (if using RRULE)
  const getRecurrenceDescription = (rrule) => {
    // Implement logic to parse RRULE and return a human-readable description
    // For now, we'll return the raw rule
    return rrule;
  };

  // Map component placeholder
  const MapView = ({ address }) => {
    return (
      <Box
        height="200px"
        bgcolor="grey.200"
        mt={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="8px"
      >
        <Typography variant="body2">Map Placeholder for {address}</Typography>
      </Box>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="event-details-modal-title"
      aria-describedby="event-details-modal-description"
    >
      <Box sx={modalStyle}>
        {/* Event Title */}
        <Typography variant="h5" component="h2" id="event-details-modal-title">
          {title}
        </Typography>

        {/* Event Image */}
        {eventImage && (
          <CardMedia
            component="img"
            height="200"
            image={eventImage}
            alt={title}
            sx={{ objectFit: 'cover', mt: 2, borderRadius: '8px' }}
          />
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="event details tabs"
          variant="fullWidth"
          sx={{ mt: 2 }}
        >
          <Tab label="Details" {...a11yProps(0)} />
          <Tab label="More" {...a11yProps(1)} />
          <Tab label="TMP" {...a11yProps(2)} />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* Categories */}
          <Box display="flex" alignItems="center" mt={1}>
            <CategoryIcon fontSize="small" />
            <Typography variant="body2" ml={1}>
              {categoryFirst}
              {categorySecond && `, ${categorySecond}`}
              {categoryThird && `, ${categoryThird}`}
            </Typography>
          </Box>

          {/* Description */}
          <Box mt={2}>
            <Typography variant="body1">{description}</Typography>
          </Box>

          {/* Date and Time */}
          <Box display="flex" alignItems="center" mt={2}>
            <EventIcon fontSize="small" />
            <Typography variant="body2" ml={1}>
              {formatDateTime(startDate)} - {formatDateTime(endDate)}
            </Typography>
          </Box>

          {/* Recurrence Information */}
          {recurrenceRule && (
            <Box display="flex" alignItems="center" mt={1}>
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2" ml={1}>
                {getRecurrenceDescription(recurrenceRule)}
              </Typography>
            </Box>
          )}

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

              {/* Map Placeholder */}
              <MapView address={locationAddress || locationName} />

              {/* Directions Button */}
              {/* Uncomment and implement when ready */}
              {/* <Button
                variant="contained"
                color="primary"
                startIcon={<LocationOnIcon />}
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  locationAddress || locationName
                )}`}
                target="_blank"
                sx={{ mt: 2 }}
              >
                Get Directions
              </Button> */}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Organizer Contact Information */}
          <Typography variant="h6">Organizer</Typography>
          <Typography variant="body1">{ownerOrganizerName}</Typography>
          {organizerPhone && (
            <Box display="flex" alignItems="center" mt={1}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2" ml={1}>
                {organizerPhone}
              </Typography>
            </Box>
          )}
          {organizerEmail && (
            <Box display="flex" alignItems="center" mt={1}>
              <EmailIcon fontSize="small" />
              <Typography variant="body2" ml={1}>
                {organizerEmail}
              </Typography>
            </Box>
          )}

          {/* Image Gallery Placeholder */}
          <Box mt={4}>
            <Typography variant="h6">Image Gallery</Typography>
            <Box
              height="150px"
              bgcolor="grey.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mt={1}
              borderRadius="8px"
            >
              <Typography variant="body2">Image Gallery Placeholder</Typography>
            </Box>
          </Box>

          {/* Social Media Interaction */}
          <Box mt={4}>
            <Typography variant="h6"></Typography>
            <Box mt={1}>
              {/* Uncomment and implement when ready */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<FacebookIcon />}
                onClick={() => {
                  // Implement Facebook Share functionality
                }}
              >
                Share on Facebook
              </Button>
              <Typography variant="body2"></Typography>
            </Box>
          </Box>

          {/* Other Events by Organizer */}
          <Box mt={4}>
            <Typography variant="h6">
              Other Events by {ownerOrganizerName}
            </Typography>
            <Box
              height="150px"
              bgcolor="grey.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mt={1}
              borderRadius="8px"
            >
              <Typography variant="body2">
                Organizer's Events Placeholder
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* TMP Data */}
          <Typography variant="h6">Temporary Data</Typography>
          <Box mt={2}>
            <Typography variant="body2">
              <strong>tmpCreator:</strong> {tmpCreator}
            </Typography>
            <Typography variant="body2">
              <strong>tmpVenueId:</strong> {tmpVenueId}
            </Typography>
            <Typography variant="body2">
              <strong>tmpEventOrgId:</strong> {tmpEventOrgId}
            </Typography>
            <Typography variant="body2">
              <strong>tmpUrl:</strong> {tmpUrl}
            </Typography>
            {tmpMix && (
              <Box mt={2}>
                <Typography variant="body2">
                  <strong>tmpMix:</strong>
                </Typography>
                <pre>{JSON.stringify(tmpMix, null, 2)}</pre>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Close Button */}
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
