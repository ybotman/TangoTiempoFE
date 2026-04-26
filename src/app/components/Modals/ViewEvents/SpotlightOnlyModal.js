/**
 * SpotlightOnlyModal.js
 * TIEMPO-431 / TIEMPO-433: Stripped-down modal for the Spotlighter (SL) role
 * to add/remove spotlights on any event.
 *
 * Each add/remove fires PATCH /api/events/{eventId}/spotlights. For recurring
 * events the click event already targets a specific occurrence (mirrors the
 * RO Edit-This-Date pattern), so we pass the occurrence's start as
 * `instanceKey` and the BE writes via instanceOverrides — spotlight applies
 * to that one night only, not the master series.
 *
 * All five spotlight types (DJ / Instructor / Performer / Orchestra / Note)
 * are available regardless of recurrence — per-occurrence semantics make the
 * old "repeating gets only 3" rule moot.
 */

'use client';

import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import ModalHeader from '@/components/UI/ModalHeader';

// TIEMPO-433: All five types always available — SL is per-occurrence so the
// old "repeating limited to DJ/Instructor/Performer" rule no longer applies.
const SPOTLIGHT_OPTIONS = [
  { value: 'dj', label: 'DJ', maxLength: 19 },
  { value: 'instructor', label: 'Instructor', maxLength: 19 },
  { value: 'performer', label: 'Performer', maxLength: 19 },
  { value: 'orchestra', label: 'Orchestra', maxLength: 19 },
  { value: 'note', label: 'Special Note', maxLength: 19 },
];

const getModalStyle = (isMobile) => ({
  position: isMobile ? 'fixed' : 'absolute',
  top: isMobile ? 0 : '50%',
  left: isMobile ? 0 : '50%',
  transform: isMobile ? 'none' : 'translate(-50%, -50%)',
  width: isMobile ? '100vw' : '90%',
  maxWidth: isMobile ? '100%' : '500px',
  height: isMobile ? '100vh' : 'auto',
  maxHeight: isMobile ? '100vh' : '85vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 1400,
});

const SpotlightOnlyModal = ({ open, onClose, eventDetails, onSpotlightsChanged }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getIdToken } = useContext(AuthContext);

  const eventId = eventDetails?.extendedProps?._id;
  const eventTitle = eventDetails?.extendedProps?.shortTitle || eventDetails?.title || 'Event';
  const eventFullTitle = eventDetails?.title || eventTitle;
  const isRepeating = !!(eventDetails?.extendedProps?.isRecurring || eventDetails?.extendedProps?.recurrenceRule);

  // TIEMPO-433: Event summary for verification — SL skips View Event modal,
  // so the spotlight modal is now the only confirmation they have.
  const eventStart = eventDetails?.start;
  const formattedDate = eventStart
    ? new Date(eventStart).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const venueName =
    eventDetails?.extendedProps?.venueName ||
    eventDetails?.extendedProps?.venueShortName ||
    '';
  const venueCity = eventDetails?.extendedProps?.venueCityName || eventDetails?.extendedProps?.masteredCityName || '';

  // TIEMPO-433: For recurring events the click identifies a specific
  // occurrence — pass that as `instanceKey` so BE writes via instanceOverrides
  // (one night only). Mirrors how RO Edit-This-Date works.
  const instanceKey = isRepeating && eventStart
    ? (typeof eventStart === 'string' ? eventStart : new Date(eventStart).toISOString())
    : null;

  // Existing spotlights for THIS occurrence — for recurring events, prefer
  // any instanceOverride matching the occurrence date over the master array.
  const masterSpotlights =
    eventDetails?.extendedProps?.spotlights ||
    eventDetails?.extendedProps?.features ||
    [];
  const initialSpotlights = (() => {
    if (!isRepeating || !instanceKey) return masterSpotlights;
    const overrides = eventDetails?.extendedProps?.instanceOverrides || [];
    const occurrenceDateStr = new Date(instanceKey).toISOString().split('T')[0];
    const match = overrides.find((ov) => {
      try {
        return new Date(ov.instanceKey).toISOString().split('T')[0] === occurrenceDateStr;
      } catch {
        return false;
      }
    });
    if (match?.patch) {
      return match.patch.spotlights || match.patch.features || [];
    }
    return [];
  })();

  const [spotlights, setSpotlights] = useState(initialSpotlights);
  const [newType, setNewType] = useState('');
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedOption = SPOTLIGHT_OPTIONS.find((o) => o.value === newType);
  const maxLength = selectedOption?.maxLength || 19;

  const callSpotlightApi = async (action, spotlight) => {
    const token = await getIdToken();
    const url = `${getApiBaseUrl()}/api/events/${eventId}/spotlights`;
    const body = instanceKey ? { action, spotlight, instanceKey } : { action, spotlight };
    return axios.patch(url, body, { headers: { Authorization: `Bearer ${token}` } });
  };

  const handleAdd = async () => {
    setError(null);
    if (!newType) {
      setError('Pick a spotlight type.');
      return;
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Enter a name.');
      return;
    }
    if (spotlights.some((s) => s.type === newType && s.name === trimmed)) {
      setError('That spotlight is already added.');
      return;
    }
    const name = trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
    setSubmitting(true);
    try {
      await callSpotlightApi('add', { type: newType, name });
      setSpotlights((prev) => [...prev, { type: newType, name }]);
      setNewType('');
      setNewName('');
      if (onSpotlightsChanged) onSpotlightsChanged();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add spotlight.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (s) => {
    setError(null);
    setSubmitting(true);
    try {
      await callSpotlightApi('remove', { type: s.type, name: s.name });
      setSpotlights((prev) => prev.filter((x) => !(x.type === s.type && x.name === s.name)));
      if (onSpotlightsChanged) onSpotlightsChanged();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to remove spotlight.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={getModalStyle(isMobile)}>
        <ModalHeader title="Add Spotlight" onClose={onClose} />

        <Box sx={{ flex: 1, overflow: 'auto', p: isMobile ? 2 : 3 }}>
          {/* TIEMPO-433: Event summary at top so SL can verify the right event */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {eventFullTitle}
            </Typography>
            {(formattedDate || venueName || venueCity) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {[formattedDate, venueName, venueCity].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </Box>

          {isRepeating && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Recurring event — spotlights you add here apply to <strong>this date only</strong>, not the rest of the series.
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {isRepeating ? 'Spotlights for this date' : 'Current spotlights'}
          </Typography>
          {spotlights.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No spotlights yet.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {spotlights.map((s, i) => (
                <Box
                  key={`${s.type}-${s.name}-${i}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Chip label={s.type} size="small" />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {s.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(s)}
                    disabled={submitting}
                    aria-label="remove"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Add a spotlight
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newType}
                label="Type"
                onChange={(e) => setNewType(e.target.value)}
                disabled={submitting}
              >
                {SPOTLIGHT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              fullWidth
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              inputProps={{ maxLength }}
              helperText={`Max ${maxLength} chars`}
              disabled={submitting}
            />
            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
              onClick={handleAdd}
              disabled={submitting || !newType || !newName.trim()}
            >
              Add Spotlight
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

SpotlightOnlyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventDetails: PropTypes.object,
  onSpotlightsChanged: PropTypes.func,
};

export default SpotlightOnlyModal;
