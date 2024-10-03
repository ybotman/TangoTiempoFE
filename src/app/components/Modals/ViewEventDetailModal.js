import React from 'react';
import { Box, Modal, Typography, Button } from '@mui/material';

const ViewEventDetailModal = ({ open, onClose, eventDetails }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: '8px', width: 400, margin: 'auto' }}>
        <Typography variant="h6">Event Details</Typography>
        <Typography variant="body1">
          {eventDetails ? eventDetails.title : 'No details available'}
        </Typography>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewEventDetailModal;