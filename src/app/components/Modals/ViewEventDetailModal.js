import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Tabs, Tab, Grid, Button } from '@mui/material';
import NextImage from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ViewEventDetailsBasic from '@/components/Modals/ViewEventDetailsBasic';
import ViewEventDetailsRepeating from '@/components/Modals/ViewEventDetailsRepeating';
import ViewEventDetailsMore from '@/components/Modals/ViewEventDetailsMore';
import ViewEventDetailsImage from '@/components/Modals/ViewEventDetailsImage';
import ViewEventDetailsOrganizerOther from '@/components/Modals/ViewEventDetailsOrganizerOther';
import ViewEventDetailsLocationOther from '@/components/Modals/ViewEventDetailsLocationOther';
import DOMPurify from 'dompurify'; // If needed for description sanitization

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

const ViewEventDetailModal = ({ open, onClose, eventDetails }) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [showImageTab, setShowImageTab] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const description =
    eventDetails?.extendedProps?.description || 'No description available';
  const sanitizedDescription = DOMPurify.sanitize(description);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionPreviewStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 15,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  useEffect(() => {
    if (open) {
      setCurrentTab('Basic');
      setShowFullTitle(false);
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
      setImageSrc('/tangoHandsWide.jpeg');
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
  const categoryFirst =
    eventDetails?.extendedProps?.categoryFirst || 'Category not available';

  const truncatedTitle =
    eventTitle.length > 30 && !showFullTitle
      ? eventTitle.slice(0, 30) + '...'
      : eventTitle;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
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
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'right' }}>
            <Typography variant="h5" component="h5">
              {startDate && new Date(startDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" color="textSecondary" gutterBottom>
          {categoryFirst}
        </Typography>

        {/* Time Range */}
        {!allDay && startDate && endDate && (
          <Box display="flex" alignItems="center">
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
              height={100}
              width={200}
              layout="intrinsic"
              objectFit="contain"
            />
          </Box>
        )}

        {endDate &&
          startDate &&
          new Date(startDate).toLocaleDateString() !==
            new Date(endDate).toLocaleDateString() && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {`Ends on: ${new Date(endDate).toLocaleDateString()}`}
            </Typography>
          )}

        {/* Tabs */}
        <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          <Tab label="Basic" value="Basic" />
          <Tab label="More" value="More" />
          <Tab label="Images" value="Images" />
          <Tab label="Repeating" value="repeating" />
          <Tab label="Organzier" value="Organzier" />
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
        {currentTab === 'Organzier' && (
          <ViewEventDetailsOrganizerOther eventDetails={eventDetails} />
        )}
        {currentTab === 'Location' && (
          <ViewEventDetailsLocationOther eventDetails={eventDetails} />
        )}
      </Box>
    </Modal>
  );
};

export default ViewEventDetailModal;
