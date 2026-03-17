/**
 * CancelOccurrenceDialog.js
 * TIEMPO-362: Confirmation dialog for canceling a single occurrence of a recurring event
 *
 * Allows user to:
 * - Confirm cancellation of specific date
 * - Optionally provide a cancellation reason (shown to users)
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { format } from 'date-fns';

const CancelOccurrenceDialog = ({
  open,
  onClose,
  onConfirm,
  eventTitle,
  occurrenceDate,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || null);
    setReason(''); // Reset for next use
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  // Format the date for display
  const formattedDate = occurrenceDate
    ? format(new Date(occurrenceDate), 'EEEE, MMMM d, yyyy')
    : 'this date';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderTop: '4px solid', borderColor: 'warning.main' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventBusyIcon color="warning" />
        Cancel This Occurrence?
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            You are about to cancel:
          </Typography>
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              mt: 1
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {eventTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          This will cancel only this date. Other occurrences in the series will continue as scheduled.
        </Alert>

        <TextField
          label="Cancellation Reason (optional)"
          placeholder="e.g., Holiday closure, Venue unavailable"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
          helperText="This message will be shown to users viewing the canceled date"
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Keep Event
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={isLoading}
          startIcon={<EventBusyIcon />}
        >
          {isLoading ? 'Canceling...' : 'Cancel This Date'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CancelOccurrenceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  eventTitle: PropTypes.string.isRequired,
  occurrenceDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  isLoading: PropTypes.bool
};

export default CancelOccurrenceDialog;
