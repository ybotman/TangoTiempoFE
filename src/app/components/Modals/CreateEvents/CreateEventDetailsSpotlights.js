/**
 * CreateEventDetailsSpotlights.js
 * TIEMPO-388: Spotlights tab for Edit Event Modal
 *
 * For REPEATING events (series):
 *   - DJ, Instructor, Performer only
 *   - Use "Edit This Date" for per-occurrence overrides
 *
 * For SINGLE (non-repeating) events:
 *   - DJ, Instructor, Performer, Orchestra, Note, Canceled
 *
 * For multi-day events (>24hr), spotlights apply to ALL days.
 */

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

// Base spotlight types (for all events)
const BASE_SPOTLIGHT_OPTIONS = [
  { value: 'dj', label: 'DJ', color: 'primary', maxLength: 19, requiresName: true },
  { value: 'instructor', label: 'Instructor', color: 'secondary', maxLength: 19, requiresName: true },
  { value: 'performer', label: 'Performer', color: 'info', maxLength: 19, requiresName: true }
];

// Additional spotlight types (for single/non-repeating events only)
const SINGLE_EVENT_SPOTLIGHT_OPTIONS = [
  { value: 'orchestra', label: 'Orchestra', color: 'success', maxLength: 19, requiresName: true },
  { value: 'note', label: 'Special Note', color: 'default', maxLength: 19, requiresName: true },
  { value: 'canceled', label: 'Canceled', color: 'error', maxLength: 19, requiresName: false }
];

const CreateEventDetailsSpotlights = forwardRef(({ eventData, setEventData, isMultiDay = false, isRepeating = false }, ref) => {
  // Determine available spotlight options based on event type
  // Single (non-repeating) events get additional options: Orchestra, Note, Canceled
  const SPOTLIGHT_OPTIONS = isRepeating
    ? BASE_SPOTLIGHT_OPTIONS
    : [...BASE_SPOTLIGHT_OPTIONS, ...SINGLE_EVENT_SPOTLIGHT_OPTIONS];

  // Local state for adding new spotlights
  const [newSpotlightType, setNewSpotlightType] = useState('');
  const [newSpotlightName, setNewSpotlightName] = useState('');

  // Get current spotlights from eventData (default to empty array)
  // Support both 'spotlights' and legacy 'features' field
  const spotlights = eventData.spotlights || eventData.features || [];

  // Expose flushPending so parent can auto-add unsaved spotlight on Save
  useImperativeHandle(ref, () => ({
    flushPending: () => {
      if (!newSpotlightType) return;
      const spotlightOption = SPOTLIGHT_OPTIONS.find(s => s.value === newSpotlightType);
      const requiresName = spotlightOption?.requiresName !== false;
      const maxLength = spotlightOption?.maxLength || 19;
      let name = newSpotlightName.trim();
      if (requiresName && !name) return;
      if (maxLength > 0 && name.length > maxLength) name = name.substring(0, maxLength);
      if (newSpotlightType === 'canceled' && spotlights.some(s => s.type === 'canceled')) return;
      const newSpotlights = [...spotlights, { type: newSpotlightType, name }];
      const updates = { spotlights: newSpotlights, features: newSpotlights };
      if (newSpotlightType === 'canceled') {
        updates.isCanceled = true;
        updates.cancelReason = name || '';
      }
      setEventData(prevData => ({ ...prevData, ...updates }));
      setNewSpotlightType('');
      setNewSpotlightName('');
    }
  }));

  const handleAddSpotlight = () => {
    if (!newSpotlightType) return;

    // Get the spotlight option for max length and name requirement
    const spotlightOption = SPOTLIGHT_OPTIONS.find(s => s.value === newSpotlightType);
    const maxLength = spotlightOption?.maxLength || 19;
    const requiresName = spotlightOption?.requiresName !== false;

    // Build the spotlight name
    let name = newSpotlightName.trim();

    // Enforce max length
    if (maxLength > 0 && name.length > maxLength) {
      name = name.substring(0, maxLength);
    }

    // Require name only for types that need it
    if (requiresName && !name) {
      alert('Please enter a name for the spotlight');
      return;
    }

    // Prevent duplicate canceled entries
    if (newSpotlightType === 'canceled' && spotlights.some(s => s.type === 'canceled')) {
      alert('Event is already marked as canceled');
      return;
    }

    // Add the new spotlight
    const newSpotlights = [...spotlights, { type: newSpotlightType, name }];

    // For canceled spotlight, also set isCanceled flag for backward compatibility
    const updates = {
      spotlights: newSpotlights,
      features: newSpotlights // Keep features for backward compatibility
    };
    if (newSpotlightType === 'canceled') {
      updates.isCanceled = true;
      updates.cancelReason = name || '';
    }

    setEventData(prevData => ({
      ...prevData,
      ...updates
    }));

    // Reset input fields
    setNewSpotlightType('');
    setNewSpotlightName('');
  };

  const handleRemoveSpotlight = (index) => {
    const removedSpotlight = spotlights[index];
    const newSpotlights = spotlights.filter((_, i) => i !== index);

    const updates = {
      spotlights: newSpotlights,
      features: newSpotlights // Keep features for backward compatibility
    };

    // If removing canceled spotlight, also clear isCanceled flag
    if (removedSpotlight?.type === 'canceled') {
      updates.isCanceled = false;
      updates.cancelReason = '';
    }

    setEventData(prevData => ({
      ...prevData,
      ...updates
    }));
  };

  // Get spotlight option - includes fallback for legacy types (orchestra, note, etc.)
  const getSpotlightOption = (type) =>
    SPOTLIGHT_OPTIONS.find(s => s.value === type) || { label: type, color: 'default' };

  return (
    <Box>
      {/* Multi-day info alert */}
      {isMultiDay && (
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            <strong>Multi-day event:</strong> Spotlights will apply to ALL days of this event.
            Need different spotlights per day? Create as a daily repeating event instead.
          </Typography>
        </Alert>
      )}

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {isRepeating ? 'Series Spotlights' : 'Event Spotlights'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isRepeating
          ? 'Add DJ, Instructor, or Performer that apply to ALL dates. Use "Edit This Date" for per-date overrides.'
          : 'Add spotlights to highlight special aspects of this event. You can also mark the event as canceled.'}
      </Typography>

      {/* Current Spotlights Display */}
      {spotlights.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {spotlights.map((spotlight, index) => {
            const option = getSpotlightOption(spotlight.type);
            return (
              <Chip
                key={index}
                label={
                  spotlight.type === 'canceled' ? (spotlight.name ? `❌ CANCELED: ${spotlight.name}` : '❌ CANCELED') :
                  spotlight.type === 'note' ? `📝 ${spotlight.name}` :
                  spotlight.type === 'orchestra' ? `🎵 Orch: ${spotlight.name}` :
                  `${option.label}: ${spotlight.name}`
                }
                color={option.color}
                onDelete={() => handleRemoveSpotlight(index)}
                size="small"
              />
            );
          })}
        </Box>
      )}

      {spotlights.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          No spotlights set. Add spotlights below to highlight special aspects of this event.
        </Typography>
      )}

      {/* Add Spotlight Controls */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Add Spotlight</InputLabel>
          <Select
            value={newSpotlightType}
            onChange={(e) => setNewSpotlightType(e.target.value)}
            label="Add Spotlight"
          >
            {SPOTLIGHT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {newSpotlightType && (() => {
          const spotlightOption = SPOTLIGHT_OPTIONS.find(s => s.value === newSpotlightType);
          const requiresName = spotlightOption?.requiresName !== false;
          const maxLength = spotlightOption?.maxLength || 19;

          // Get placeholder based on type
          const getPlaceholder = () => {
            switch (newSpotlightType) {
              case 'dj': return 'e.g., DJ Carlos';
              case 'instructor': return 'e.g., Pablo & Maria';
              case 'performer': return 'e.g., Special Guest';
              case 'orchestra': return 'e.g., Color Tango';
              case 'note': return 'e.g., Starts 30 min early!';
              case 'canceled': return 'Reason (optional)';
              default: return 'Name';
            }
          };

          return (
            <TextField
              value={newSpotlightName}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= maxLength) {
                  setNewSpotlightName(value);
                } else {
                  setNewSpotlightName(value.substring(0, maxLength));
                }
              }}
              label={requiresName ? 'Name' : 'Reason (optional)'}
              placeholder={getPlaceholder()}
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              helperText={`${newSpotlightName.length}/${maxLength}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSpotlight();
                }
              }}
            />
          );
        })()}

        <Tooltip title="Add spotlight">
          <span>
            <Button
              variant="outlined"
              onClick={handleAddSpotlight}
              disabled={!newSpotlightType || (
                SPOTLIGHT_OPTIONS.find(s => s.value === newSpotlightType)?.requiresName !== false &&
                !newSpotlightName.trim()
              )}
              sx={{ height: 40, minWidth: 'auto', px: 2 }}
            >
              <AddIcon />
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Helpful info */}
      <Typography variant="caption" color="text.secondary">
        {isRepeating
          ? 'Spotlights will display as "DJ: Name" on the calendar.'
          : 'Spotlights display on the calendar. Canceled events show with a warning badge.'}
      </Typography>
    </Box>
  );
});

CreateEventDetailsSpotlights.displayName = 'CreateEventDetailsSpotlights';

CreateEventDetailsSpotlights.propTypes = {
  eventData: PropTypes.shape({
    spotlights: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      name: PropTypes.string
    })),
    features: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      name: PropTypes.string
    }))
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
  isMultiDay: PropTypes.bool,
  isRepeating: PropTypes.bool
};

export default CreateEventDetailsSpotlights;
