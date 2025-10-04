import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ViewAIEventDetailsTab from './ViewAIEventDetailsTab';

const ViewAIEventDetails = ({ open, onClose, eventDetails }) => {
  if (!eventDetails) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      data-testid="ai-event-modal"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          AI-Discovered Event Details
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          data-testid="ai-event-modal-close"
          sx={{
            color: 'grey.500',
            '&:hover': {
              backgroundColor: 'grey.200',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0 }}>
        <ViewAIEventDetailsTab eventDetails={eventDetails} />
      </DialogContent>
    </Dialog>
  );
};

ViewAIEventDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventDetails: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    extendedProps: PropTypes.shape({
      eventDescription: PropTypes.string,
      discoveryDate: PropTypes.string,
      sourceLink: PropTypes.string,
      isDiscovered: PropTypes.bool,
    }),
  }),
};

export default ViewAIEventDetails;