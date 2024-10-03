// src/components/ViewEventDetailsModal.jsx

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
  Grid,
} from '@mui/material';
import { Facebook, Favorite } from '@mui/icons-material';
import Map from 'react-google-maps'; // Placeholder import for map
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
  p: 3,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const ViewEventDetailsModal = ({ open, onClose, eventData }) => {
  const [currentTab, setCurrentTab] = useState('primary');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (!eventData) {
    return null; // You can add a loader here
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
    location,
    organizer,
  } = eventData;

  // Format date and time
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  // Generate recurrence description from recurrenceRule
  const getRecurrenceDescription = (rrule) => {
    // Implement logic to parse RRULE and return a human-readable description
    return 'Occurs every Monday and Wednesday';
  };

  // Map component placeholder
  const MapView = ({ address }) => {
    return (
      <Box height="200px" bgcolor="grey.200" mt={2} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2">Map Placeholder for {address}</Typography>
      </Box>
    );
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="event-details-modal">
      <Box sx={modalStyle}>
        {/* Tab Navigation */}
        <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Details" value="primary" />
          <Tab label="More" value="alternate" />
        </Tabs>

        {/* Primary Tab Content */}
        {currentTab === 'primary' && (
          <Box mt={2}>
            {/* Title and Image */}
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
            {eventImage && (
              <CardMedia
                component="img"
                height="200"
                image={eventImage}
                alt={title}
                sx={{ objectFit: 'cover', mb: 2 }}
              />
            )}

            {/* Categories */}
            <Typography variant="subtitle1">
              <strong>{categoryFirst}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {categorySecond} {categoryThird}
            </Typography>

            {/* Description */}
            <Box mt={2} mb={2} maxHeight="200px" overflow="auto">
              <Typography variant="body1">{description}</Typography>
            </Box>

            {/* Date and Time */}
            <Typography variant="body1">
              <strong>Date and Time:</strong> {formatDateTime(startDate)} - {formatDateTime(endDate)}
            </Typography>

            {/* Recurrence Description */}
            {recurrenceRule && (
              <Typography variant="body1">
                <strong>Recurrence:</strong> {getRecurrenceDescription(recurrenceRule)}
              </Typography>
            )}

            {/* Location Information */}
            {location && (
              <Box mt={2}>
                <Typography variant="h6">Location</Typography>
                <Typography variant="body1">
                  {location.name}
                  <br />
                  {location.address_1}
                  {location.address_2 && <>, {location.address_2}</>}
                  {location.address_3 && <>, {location.address_3}</>}
                  <br />
                  {location.city}, {location.state} {location.zip}
                </Typography>

                {/* Map View */}
                <MapView
                  address={`${location.address_1}, ${location.city}, ${location.state} ${location.zip}`}
                />

                {/* Directions Button */}
                <Button
                  variant="contained"
                  color="primary"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${location.address_1}, ${location.city}, ${location.state} ${location.zip}`
                  )}`}
                  target="_blank"
                  sx={{ mt: 1 }}
                >
                  Get Directions
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Alternate Tab Content */}
        {currentTab === 'alternate' && (
          <Box mt={2}>
            {/* Contact Organizer */}
            {organizer && (
              <Box>
                <Typography variant="h6">Contact Organizer</Typography>
                <Typography variant="body1">
                  {organizer.name}
                  <br />
                  {organizer.phone && (
                    <>
                      Phone: {organizer.phone}
                      <br />
                    </>
                  )}
                  {organizer.publicEmail && (
                    <>
                      Email: {organizer.publicEmail}
                      <br />
                    </>
                  )}
                </Typography>
              </Box>
            )}

            {/* Image Gallery Placeholder */}
            <Box mt={2}>
              <Typography variant="h6">Image Gallery</Typography>
              <Box
                height="150px"
                bgcolor="grey.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="body2">Image Gallery Placeholder</Typography>
              </Box>
            </Box>

            {/* Social Media Buttons */}
            <Box mt={2}>
              <Typography variant="h6">Share</Typography>
              <IconButton
                color="primary"
                onClick={() => {
                  // Implement Facebook Like functionality
                }}
                aria-label="Like on Facebook"
              >
                <Favorite />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Facebook />}
                onClick={() => {
                  // Implement Facebook "I am going!" post
                }}
                sx={{ ml: 1 }}
              >
                I am going!
              </Button>
            </Box>

            {/* Organizer's Events Placeholder */}
            <Box mt={2}>
              <Typography variant="h6">Other Events by {organizer.name}</Typography>
              <Box
                height="150px"
                bgcolor="grey.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="body2">Organizer's Events Placeholder</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Close Button */}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="outlined" color="secondary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewEventDetailsModal;