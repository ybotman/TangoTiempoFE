/**
 * CreateEventDetailsSpotlights.js
 * TIEMPO-388: Spotlights tab for Edit Event Modal
 *
 * Allows setting DJ, Orchestra, Instructor, Performer, Special Note,
 * Tonight's Description for non-repeating events (same as EditOccurrenceModal
 * but for the event itself rather than a specific occurrence).
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

// Available spotlight types - same as EditOccurrenceModal
const SPOTLIGHT_OPTIONS = [
  { value: 'dj', label: 'DJ', color: 'primary', maxLength: 19 },
  { value: 'orchestra', label: 'Orchestra', color: 'success', maxLength: 19 },
  { value: 'instructor', label: 'Instructor', color: 'secondary', maxLength: 19 },
  { value: 'performer', label: 'Performer', color: 'info', maxLength: 19 },
  { value: 'note', label: 'Special Note', color: 'default', maxLength: 19 },
  { value: 'description', label: "Tonight's Description", color: 'default', maxLength: 200 },
  { value: 'canceled', label: 'Event Canceled', color: 'error', maxLength: 19 }
];

const CreateEventDetailsSpotlights = ({ eventData, setEventData, isMultiDay = false }) => {
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

    // Require name for most spotlight types
    if (!name && newSpotlightType !== 'canceled') {
      alert('Please enter a name for the spotlight');
      return;
    }

    // Prevent duplicate canceled entries
    if (newSpotlightType === 'canceled' && spotlights.some(s => s.type === 'canceled')) {
      alert('Event is already marked as canceled');
      return;
    }

    // Prevent duplicate description entries
    if (newSpotlightType === 'description' && spotlights.some(s => s.type === 'description')) {
      alert('Only one description allowed');
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

  const getSpotlightOption = (type) =>
    SPOTLIGHT_OPTIONS.find(s => s.value === type) || { label: type, color: 'default' };

  // Check if event is canceled
  const isCanceled = spotlights.some(s => s.type === 'canceled');

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

      {/* Canceled warning */}
      {isCanceled && (
        <Alert severity="error" sx={{ mb: 2 }}>
          This event will show as CANCELED on the calendar.
        </Alert>
      )}

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Event Spotlights
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add spotlights like DJ, Orchestra, or special notes that will display on the calendar.
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
            onChange={(e) => {
              setNewSpotlightType(e.target.value);
              if (e.target.value === 'canceled') {
                setNewSpotlightName('');
              }
            }}
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
          const maxLength = spotlightOption?.maxLength || 19;
          const isDescription = newSpotlightType === 'description';
          return (
            <TextField
              value={newSpotlightName}
              onChange={(e) => {
                const value = e.target.value;
                // Enforce max length on input
                if (maxLength > 0 && value.length <= maxLength) {
                  setNewSpotlightName(value);
                } else if (maxLength > 0) {
                  setNewSpotlightName(value.substring(0, maxLength));
                } else {
                  setNewSpotlightName(value);
                }
              }}
              label={
                isDescription ? "Description" :
                newSpotlightType === 'note' ? 'Note text' :
                newSpotlightType === 'canceled' ? 'Reason (optional)' :
                'Name'
              }
              placeholder={
                isDescription ? 'Special info about this event...' :
                newSpotlightType === 'note' ? 'e.g., Starts 30 min early!' :
                newSpotlightType === 'canceled' ? 'e.g., Venue closed' :
                'e.g., DJ Carlos'
              }
              size="small"
              multiline={isDescription}
              rows={isDescription ? 3 : 1}
              sx={{ flex: 1, minWidth: 200 }}
              helperText={maxLength > 0 ? `${newSpotlightName.length}/${maxLength}` : ''}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isDescription) {
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
              disabled={!newSpotlightType || (newSpotlightType !== 'canceled' && !newSpotlightName.trim())}
              sx={{ height: 40, minWidth: 'auto', px: 2 }}
            >
              <AddIcon />
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Helpful info */}
      <Typography variant="caption" color="text.secondary">
        Spotlights like DJ and Orchestra will display as &quot;TONIGHTS DJ: Name&quot; on the calendar.
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
  isMultiDay: PropTypes.bool
};

export default CreateEventDetailsSpotlights;
