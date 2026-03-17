/**
 * EditOccurrenceModal.js
 * TIEMPO-362: Modal for editing a single occurrence of a recurring event
 *
 * SIMPLIFIED MODEL - Additive attributes only:
 * - Tonight's Feature: DJ, Orchestra, Instructor, Performer, or Canceled
 * - Feature Name: Free text for the name/details
 * - Special Note: Time changes, announcements, etc.
 *
 * Core attributes (venue, category, base title) use "Edit All"
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';

// Feature types for "Tonight's" dropdown
const FEATURE_TYPES = [
  { value: '', label: 'No special feature' },
  { value: 'dj', label: "Tonight's DJ" },
  { value: 'orchestra', label: "Tonight's Orchestra" },
  { value: 'instructor', label: "Tonight's Instructor" },
  { value: 'performer', label: "Tonight's Performer" },
  { value: 'canceled', label: 'Canceled Tonight' }
];

// Labels for the name field based on feature type
const FEATURE_NAME_LABELS = {
  dj: 'DJ Name',
  orchestra: 'Orchestra Name',
  instructor: 'Instructor Name',
  performer: 'Performer Name',
  canceled: 'Cancellation Reason'
};

const EditOccurrenceModal = ({
  open,
  onClose,
  onSave,
  eventTitle,
  occurrenceDate,
  currentValues = {},
  isLoading = false
}) => {
  const [featureType, setFeatureType] = useState('');
  const [featureName, setFeatureName] = useState('');
  const [specialNote, setSpecialNote] = useState('');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open) {
      if (currentValues._hasOverride && currentValues._overridePatch) {
        // Pre-populate with existing override values
        setFeatureType(currentValues._overridePatch.featureType || '');
        setFeatureName(currentValues._overridePatch.featureName || '');
        setSpecialNote(currentValues._overridePatch.specialNote || '');
      } else {
        // Reset to defaults
        setFeatureType('');
        setFeatureName('');
        setSpecialNote('');
      }
    }
  }, [open, currentValues]);

  const handleSave = () => {
    // Build patch object
    const patch = {};

    if (featureType) {
      patch.featureType = featureType;
      if (featureName.trim()) {
        patch.featureName = featureName.trim();
      }
    }

    if (specialNote.trim()) {
      patch.specialNote = specialNote.trim();
    }

    // Determine override type
    const overrideType = featureType === 'canceled' ? 'cancel' : 'modify';

    // Only save if there are actual changes
    if (Object.keys(patch).length === 0) {
      alert('Please select a feature type or add a special note');
      return;
    }

    onSave({
      instanceKey: occurrenceDate,
      overrideType,
      patch
    });
  };

  const handleClose = () => {
    setFeatureType('');
    setFeatureName('');
    setSpecialNote('');
    onClose();
  };

  // Check if any field has been filled
  const hasChanges = featureType || specialNote.trim();

  // Format the date for display
  const formattedDate = occurrenceDate
    ? format(new Date(occurrenceDate), 'EEEE, MMMM d, yyyy')
    : 'this date';

  // Get the appropriate label for the name field
  const nameFieldLabel = FEATURE_NAME_LABELS[featureType] || 'Name / Details';
  const isCanceled = featureType === 'canceled';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: '4px solid',
          borderColor: isCanceled ? 'error.main' : 'primary.main'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isCanceled ? <CancelIcon color="error" /> : <EditIcon color="primary" />}
        {isCanceled ? 'Cancel This Date' : 'Edit This Date'}
      </DialogTitle>

      <DialogContent>
        {/* Event context */}
        <Box sx={{ mb: 3, mt: 1 }}>
          <Box
            sx={{
              bgcolor: isCanceled ? 'error.50' : 'primary.50',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: isCanceled ? 'error.200' : 'primary.200'
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

        <Alert severity={isCanceled ? 'warning' : 'info'} sx={{ mb: 3 }}>
          {isCanceled
            ? `This will mark ${formattedDate} as CANCELED.`
            : `Changes apply only to ${formattedDate}. Other dates unchanged.`
          }
        </Alert>

        {/* Tonight's Feature Type */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tonight&apos;s Feature</InputLabel>
            <Select
              value={featureType}
              onChange={(e) => {
                setFeatureType(e.target.value);
                // Clear name if switching away from a type
                if (!e.target.value) setFeatureName('');
              }}
              label="Tonight's Feature"
            >
              {FEATURE_TYPES.map((type) => (
                <MuiMenuItem key={type.value} value={type.value}>
                  {type.label}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Feature Name - only show if a type is selected */}
        {featureType && (
          <Box sx={{ mb: 3 }}>
            <TextField
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              label={nameFieldLabel}
              placeholder={
                isCanceled
                  ? 'e.g., Venue closed, Weather, Holiday'
                  : 'e.g., DJ Carlos, Sexteto Milonguero'
              }
              fullWidth
              size="small"
              helperText={isCanceled ? 'Optional reason for cancellation' : 'Type the name or leave empty'}
            />
          </Box>
        )}

        {/* Special Note - always visible */}
        <Box sx={{ mb: 2 }}>
          <TextField
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            label="Special Note"
            placeholder="e.g., Starts 30 min early! Birthday celebration for Juan."
            fullWidth
            multiline
            rows={2}
            size="small"
            helperText="Time changes, announcements, or any other info for this date"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color={isCanceled ? 'error' : 'primary'}
          disabled={isLoading || !hasChanges}
          startIcon={isCanceled ? <CancelIcon /> : <EditIcon />}
        >
          {isLoading
            ? 'Saving...'
            : isCanceled
              ? 'Cancel This Date'
              : 'Save This Date'
          }
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
    _overridePatch: PropTypes.shape({
      featureType: PropTypes.string,
      featureName: PropTypes.string,
      specialNote: PropTypes.string
    })
  }),
  isLoading: PropTypes.bool
};

export default EditOccurrenceModal;
