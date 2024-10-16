import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Tabs, Tab, Grid } from '@mui/material';
import ViewEventDetailsBasic from '@/components/Modals/ViewEventDetailsBasic';
import ImageEventDetails from '@/components/Modals/ViewEventDetailsImage';
import RepeatingEventDetails from '@/components/Modals/ViewEventDetailsRepeating';
import OtherEventDetails from '@/components/Modals/ViewEventDetailsOther';

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

  // Reset the tab to 'basic' each time the modal is opened
  useEffect(() => {
    if (open) {
      setCurrentTab('basic');
    }
  }, [open]);

  useEffect(() => {
    console.log('EventDetails (Modal):', eventDetails);
  }, [eventDetails]);

  // If eventDetails is null, don't render the modal content
  if (!eventDetails) {
    return null;
  }

  const eventTitle = eventDetails?.title || 'Event Details';
  const startDate = eventDetails?._instance?.range?.start || null;
  const endDate = eventDetails?._instance?.range?.end || null;
  const allDay = eventDetails?.allDay || false;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Title and Date in a Grid layout */}
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={8}>
            <Typography variant="h4" component="h2">
              {eventTitle}
            </Typography>
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'right' }}>
            <Typography variant="h5" component="h5">
              {startDate && new Date(startDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        {/* Time Range (only if not an all-day event) */}
        {!allDay && startDate && endDate && (
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="body1" color="textSecondary">
                Time:{' '}
                {new Date(startDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" color="textSecondary">
                {new Date(endDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Display End Date (small text) */}
        {endDate &&
          startDate &&
          new Date(startDate).toLocaleDateString() !==
            new Date(endDate).toLocaleDateString() && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {`Ends on: ${new Date(endDate).toLocaleDateString()}`}
            </Typography>
          )}

        {/* Tab Navigation */}
        <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          <Tab label="Basic" value="basic" />
          <Tab label="Images" value="images" />
          <Tab label="Repeating" value="repeating" />
          <Tab label="Other" value="other" />
        </Tabs>

        {/* Tab Content */}
        {currentTab === 'basic' && (
          <ViewEventDetailsBasic eventDetails={eventDetails} />
        )}
        {currentTab === 'images' && (
          <ImageEventDetails eventDetails={eventDetails} />
        )}
        {currentTab === 'repeating' && (
          <RepeatingEventDetails eventDetails={eventDetails} />
        )}
        {currentTab === 'other' && (
          <OtherEventDetails eventDetails={eventDetails} />
        )}
      </Box>
    </Modal>
  );
};

export default ViewEventDetailModal;
