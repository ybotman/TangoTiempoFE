/**
 * EditOccurrenceModal.js
 * TIEMPO-362: Modal for editing a single occurrence of a recurring event
 *
 * WHAT CAN CHANGE for a single occurrence:
 * - Special note (appended description for this date)
 * - Guest DJ / Orchestra (alternate performer)
 * - Time adjustment (earlier/later start)
 * - Title suffix (e.g., "Weekly Milonga - LIVE ORCHESTRA")
 *
 * WHAT CANNOT CHANGE:
 * - Base title (use "Edit All" for that)
 * - Venue (too complex, use "Edit All")
 * - Categories (use "Edit All")
 *
 * Only changed fields are sent as "patch" to backend
 */

import React, { useState, useEffect } from 'react';
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
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import NotesIcon from '@mui/icons-material/Notes';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LabelIcon from '@mui/icons-material/Label';
import { format } from 'date-fns';

const EditOccurrenceModal = ({
  open,
  onClose,
  onSave,
  eventTitle,
  occurrenceDate,
  currentValues = {},
  isLoading = false
}) => {
  // Override values - only fields that CAN change for single occurrence
  const [titleSuffix, setTitleSuffix] = useState('');
  const [notes, setNotes] = useState('');
  const [djOrOrchestra, setDjOrOrchestra] = useState('');
  const [timeAdjustment, setTimeAdjustment] = useState('none'); // 'none', 'earlier', 'later', 'custom'
  const [customStartTime, setCustomStartTime] = useState(null);
  const [customEndTime, setCustomEndTime] = useState(null);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open) {
      // Check if there are existing overrides
      const hasExistingOverrides = currentValues._hasOverride;

      if (hasExistingOverrides && currentValues.patch) {
        // Pre-populate with existing override values
        setTitleSuffix(currentValues.patch.titleSuffix || '');
        setNotes(currentValues.patch.notes || '');
        setDjOrOrchestra(currentValues.patch.djName || '');

        if (currentValues.patch.startDate) {
          setTimeAdjustment('custom');
          setCustomStartTime(new Date(currentValues.patch.startDate));
          setCustomEndTime(currentValues.patch.endDate ? new Date(currentValues.patch.endDate) : null);
        } else {
          setTimeAdjustment('none');
        }
      } else {
        // Reset to defaults
        setTitleSuffix('');
        setNotes('');
        setDjOrOrchestra('');
        setTimeAdjustment('none');
        setCustomStartTime(null);
        setCustomEndTime(null);
      }

      // Initialize time pickers from current event times
      if (!currentValues._hasOverride && currentValues.startDate) {
        setCustomStartTime(new Date(currentValues.startDate));
      }
      if (!currentValues._hasOverride && currentValues.endDate) {
        setCustomEndTime(new Date(currentValues.endDate));
      }
    }
  }, [open, currentValues]);

  const handleSave = () => {
    // Build patch object with only filled-in fields
    const patch = {};

    if (titleSuffix.trim()) {
      patch.titleSuffix = titleSuffix.trim();
    }

    if (notes.trim()) {
      patch.notes = notes.trim();
    }

    if (djOrOrchestra.trim()) {
      patch.djName = djOrOrchestra.trim();
    }

    if (timeAdjustment === 'custom' && customStartTime) {
      patch.startDate = customStartTime.toISOString();
      if (customEndTime) {
        patch.endDate = customEndTime.toISOString();
      }
    }

    // Only save if there are actual changes
    if (Object.keys(patch).length === 0) {
      alert('Please fill in at least one field to modify this date');
      return;
    }

    onSave({
      instanceKey: occurrenceDate,
      overrideType: 'modify',
      patch
    });
  };

  // Check if any field has been filled
  const hasChanges = titleSuffix.trim() || notes.trim() || djOrOrchestra.trim() || timeAdjustment === 'custom';

  const handleClose = () => {
    // Reset state
    setOverrideNotes(false);
    setOverrideTime(false);
    setOverrideDJ(false);
    setNotes('');
    setDjName('');
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
        sx: { borderTop: '4px solid', borderColor: 'primary.main' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditIcon color="primary" />
        Edit This Occurrence
      </DialogTitle>

      <DialogContent>
        {/* Event context */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              bgcolor: 'primary.50',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {eventTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
            {currentValues._hasOverride && (
              <Chip
                label="Already modified"
                size="small"
                color="info"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Changes apply <strong>only to {formattedDate}</strong>.
          Other dates in the series remain unchanged.
        </Alert>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Fill in only what&apos;s different for this date:
        </Typography>

        {/* Special Note for this date */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <NotesIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              Special Note
            </Typography>
          </Box>
          <TextField
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Live orchestra tonight! Birthday celebration for Juan."
            fullWidth
            multiline
            rows={2}
            size="small"
            helperText="Shown to users viewing this specific date"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Guest DJ / Orchestra */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MusicNoteIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              Guest DJ / Orchestra
            </Typography>
          </Box>
          <TextField
            value={djOrOrchestra}
            onChange={(e) => setDjOrOrchestra(e.target.value)}
            placeholder="e.g., DJ Carlos, Sexteto Milonguero"
            fullWidth
            size="small"
            helperText={
              currentValues.regularDjName
                ? `Regular: ${currentValues.regularDjName}`
                : 'Leave empty to use regular DJ'
            }
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Title Suffix (optional) */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LabelIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              Title Addition <Chip label="Optional" size="small" sx={{ ml: 1 }} />
            </Typography>
          </Box>
          <TextField
            value={titleSuffix}
            onChange={(e) => setTitleSuffix(e.target.value)}
            placeholder="e.g., - LIVE ORCHESTRA, - NYE Special"
            fullWidth
            size="small"
            helperText={`Will show as: "${eventTitle}${titleSuffix ? ' ' + titleSuffix : ''}"`}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Time Adjustment */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              Time Change
            </Typography>
          </Box>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Adjust time?</InputLabel>
            <Select
              value={timeAdjustment}
              onChange={(e) => setTimeAdjustment(e.target.value)}
              label="Adjust time?"
            >
              <MuiMenuItem value="none">No change - same time as usual</MuiMenuItem>
              <MuiMenuItem value="custom">Different time this date</MuiMenuItem>
            </Select>
          </FormControl>

          {timeAdjustment === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="Start Time"
                  value={customStartTime}
                  onChange={setCustomStartTime}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
                <TimePicker
                  label="End Time"
                  value={customEndTime}
                  onChange={setCustomEndTime}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
              </Box>
            </LocalizationProvider>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={isLoading || !hasChanges}
          startIcon={<EditIcon />}
        >
          {isLoading ? 'Saving...' : 'Save This Date'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditOccurrenceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  eventTitle: PropTypes.string.isRequired,
  occurrenceDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  currentValues: PropTypes.shape({
    _hasOverride: PropTypes.bool,
    patch: PropTypes.object,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    regularDjName: PropTypes.string
  }),
  isLoading: PropTypes.bool
};

export default EditOccurrenceModal;
