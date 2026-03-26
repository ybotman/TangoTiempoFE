/**
 * CreateEventDetailsSpotlights.js
 * TIEMPO-388: Spotlights tab for Edit Event Modal
 *
 * For ALL events (repeating and non-repeating):
 *   - DJ, Instructor, Performer only
 *
 * For per-occurrence overrides ("Edit This Date"):
 *   - Additional types available (Orchestra, Note, Description, Canceled)
 *   - Handled in ViewEventOccurrenceModal, not here
 *
 * For multi-day events (>24hr), spotlights apply to ALL days.
 */

import React, { useState } from 'react';
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

// Event-level spotlight types (for both repeating series and non-repeating events)
// Orchestra, Note, Description, Canceled are only available in per-occurrence overrides
const SPOTLIGHT_OPTIONS = [
  { value: 'dj', label: 'DJ', color: 'primary', maxLength: 19 },
  { value: 'instructor', label: 'Instructor', color: 'secondary', maxLength: 19 },
  { value: 'performer', label: 'Performer', color: 'info', maxLength: 19 }
];

const CreateEventDetailsSpotlights = ({ eventData, setEventData, isMultiDay = false, isRepeating = false }) => {
  // SPOTLIGHT_OPTIONS is now a constant - same 3 options for all event types
   
  const _isRepeating = isRepeating; // Keep prop for future use if needed
  // Local state for adding new spotlights
  const [newSpotlightType, setNewSpotlightType] = useState('');
  const [newSpotlightName, setNewSpotlightName] = useState('');

  // Get current spotlights from eventData (default to empty array)
  // Support both 'spotlights' and legacy 'features' field
  const spotlights = eventData.spotlights || eventData.features || [];

  const handleAddSpotlight = () => {
    if (!newSpotlightType) return;

    // Get the spotlight option for max length
    const spotlightOption = SPOTLIGHT_OPTIONS.find(s => s.value === newSpotlightType);
    const maxLength = spotlightOption?.maxLength || 19;

    // Build the spotlight name
    let name = newSpotlightName.trim();

    // Enforce max length
    if (maxLength > 0 && name.length > maxLength) {
      name = name.substring(0, maxLength);
    }

    // Require name for DJ, Instructor, Performer
    if (!name) {
      alert('Please enter a name for the spotlight');
      return;
    }

    // Add the new spotlight
    const newSpotlights = [...spotlights, { type: newSpotlightType, name }];
    setEventData(prevData => ({
      ...prevData,
      spotlights: newSpotlights,
      features: newSpotlights // Keep features for backward compatibility
    }));

    // Reset input fields
    setNewSpotlightType('');
    setNewSpotlightName('');
  };

  const handleRemoveSpotlight = (index) => {
    const newSpotlights = spotlights.filter((_, i) => i !== index);
    setEventData(prevData => ({
      ...prevData,
      spotlights: newSpotlights,
      features: newSpotlights // Keep features for backward compatibility
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
          : 'Add DJ, Instructor, or Performer spotlights that will display on the calendar.'}
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
                  spotlight.type === 'canceled' ? (spotlight.name ? `CANCELED: ${spotlight.name}` : 'CANCELED') :
                  spotlight.type === 'note' ? `Note: ${spotlight.name}` :
                  spotlight.type === 'description' ? `${spotlight.name.length > 30 ? spotlight.name.substring(0, 30) + '...' : spotlight.name}` :
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

        {newSpotlightType && (
          <TextField
            value={newSpotlightName}
            onChange={(e) => {
              const value = e.target.value;
              const maxLength = 19;
              if (value.length <= maxLength) {
                setNewSpotlightName(value);
              } else {
                setNewSpotlightName(value.substring(0, maxLength));
              }
            }}
            label="Name"
            placeholder="e.g., DJ Carlos"
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            helperText={`${newSpotlightName.length}/19`}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSpotlight();
              }
            }}
          />
        )}

        <Tooltip title="Add spotlight">
          <span>
            <Button
              variant="outlined"
              onClick={handleAddSpotlight}
              disabled={!newSpotlightType || !newSpotlightName.trim()}
              sx={{ height: 40, minWidth: 'auto', px: 2 }}
            >
              <AddIcon />
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Helpful info */}
      <Typography variant="caption" color="text.secondary">
        Spotlights will display as &quot;DJ: Name&quot; on the calendar.
      </Typography>
    </Box>
  );
};

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
