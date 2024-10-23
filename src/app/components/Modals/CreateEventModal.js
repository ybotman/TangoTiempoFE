import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Tabs, Tab, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import NextImage from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ViewEventDetailsBasic from '@/components/Modals/ViewEventDetailsBasic';
import ViewEventDetailsRepeating from '@/components/Modals/ViewEventDetailsRepeating';
import ViewEventDetailsMore from '@/components/Modals/ViewEventDetailsMore';
import ViewEventDetailsImage from '@/components/Modals/ViewEventDetailsImage';
import ViewEventDetailsOrganizerOther from '@/components/Modals/ViewEventDetailsOrganizerOther';
import ViewEventDetailsLocationOther from '@/components/Modals/ViewEventDetailsLocationOther';
import PropTypes from 'prop-types';

const ViewEventDetailModal = ({ open, onClose, eventDetails }) => {
  const [currentTab, setCurrentTab] = useState('Basic');
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [showImageTab, setShowImageTab] = useState(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', md: '80%', lg: '60%' }, // Adjust for different screen sizes
    maxWidth: '600px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    maxHeight: '80vh', // Reduce the height a bit
    overflowY: 'auto',
  };

  useEffect(() => {
    if (open) {
      setCurrentTab('Basic');
      setShowFullTitle(false); // Reset title expansion when modal is reopened
    }
  }, [open]);

  useEffect(() => {
    if (eventDetails?.extendedProps?.eventImage) {
      const img = new Image();
      img.src = eventDetails.extendedProps.eventImage;

      img.onload = function () {
        if (img.width > img.height) {
          setImageSrc(eventDetails.extendedProps.eventImage);
          setShowImageTab(true);
        } else {
          setImageSrc('/Submit16by9Please.jpeg');
          setShowImageTab(true);
        }
      };
    } else {
      setImageSrc('/tangohandsWide.jpeg');
      setShowImageTab(true);
    }
  }, [eventDetails]);

  if (!eventDetails) {
    return null;
  }

  const eventTitle = eventDetails?.title || 'Event Details';
  const startDate = eventDetails?._instance?.range?.start || null;
  const endDate = eventDetails?._instance?.range?.end || null;
  const allDay = eventDetails?.allDay || false;

  // Function to truncate the title to 30 characters
  const truncatedTitle =
    eventTitle.length > 30 && !showFullTitle
      ? eventTitle.slice(0, 30) + '...'
      : eventTitle;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Title and Date */}
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={8}>
            <Typography variant="h5" component="h2">
              {truncatedTitle}
              {eventTitle.length > 30 && (
                <Button
                  size="small"
                  onClick={() => setShowFullTitle(!showFullTitle)}
                  sx={{ ml: 1 }}
                >
                  {showFullTitle ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </Typography>
            <Button
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: '2px',
                right: '8px',
                zIndex: '1000',
                fontSize: '0.575rem',
              }}
            >
              Close
            </Button>
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'right' }}>
            <Typography variant="h5" component="h5">
              {startDate && new Date(startDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        {/* Time Range */}
        {!allDay && startDate && endDate && (
          <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Time:{' '}
              {new Date(startDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
            <ArrowForwardIcon sx={{ verticalAlign: 'middle', mx: 1 }} />
            <Typography variant="h6" color="textSecondary">
              {new Date(endDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
        )}

        {/* Image */}
        {imageSrc && showImageTab && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <NextImage
              src={imageSrc}
              alt="Event"
              height={300}
              width={500} // Adjust as needed for higher resolution
              layout="intrinsic"
              objectFit="contain"
            />
          </Box>
        )}

        {/* Tabs */}
        <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          <Tab label="Basic" value="Basic" />
          <Tab label="More" value="More" />
          <Tab label="Images" value="Images" />
          <Tab label="Repeating" value="repeating" />
          <Tab label="Organizer" value="Organizer" />
          <Tab label="Location" value="Location" />
        </Tabs>

        {/* Tab Content */}
        {currentTab === 'Basic' && (
          <ViewEventDetailsBasic eventDetails={eventDetails} />
        )}
        {currentTab === 'Images' && (
          <ViewEventDetailsImage eventDetails={eventDetails} />
        )}
        {currentTab === 'repeating' && (
          <ViewEventDetailsRepeating eventDetails={eventDetails} />
        )}
        {currentTab === 'More' && (
          <ViewEventDetailsMore eventDetails={eventDetails} />
        )}
        {currentTab === 'Organizer' && (
          <ViewEventDetailsOrganizerOther eventDetails={eventDetails} />
        )}
        {currentTab === 'Location' && (
          <ViewEventDetailsLocationOther eventDetails={eventDetails} />
        )}
      </Box>
    </Modal>
  );
};

ViewEventDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventDetails: PropTypes.shape({
    title: PropTypes.string,
    allDay: PropTypes.bool,
    extendedProps: PropTypes.shape({
      eventImage: PropTypes.string,
    }),
    _instance: PropTypes.shape({
      range: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
      }),
    }),
  }),
};

export default ViewEventDetailModal;
