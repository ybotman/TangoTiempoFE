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

import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import { format, addMonths } from 'date-fns';
import { RRule } from 'rrule';
import { AuthContext } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import ModalHeader from '@/components/UI/ModalHeader';

// TIEMPO-438 / TIEMPO-440: 6 spotlight types for SL one-off path. nameLabel
// varies because the second field isn't always a "name" — for Note it's the
// message, for Canceled it's an optional reason.
const SPOTLIGHT_OPTIONS = [
  { value: 'dj',         label: 'DJ',           nameLabel: 'DJ name',           maxLength: 19, requiresName: true  },
  { value: 'instructor', label: 'Instructor',   nameLabel: 'Instructor name',   maxLength: 19, requiresName: true  },
  { value: 'performer',  label: 'Performer',    nameLabel: 'Performer name',    maxLength: 19, requiresName: true  },
  { value: 'orchestra',  label: 'Orchestra',    nameLabel: 'Orchestra name',    maxLength: 19, requiresName: true  },
  { value: 'note',       label: 'Special Note', nameLabel: 'Note',              maxLength: 19, requiresName: true  },
  { value: 'canceled',   label: 'Canceled',     nameLabel: 'Reason (optional)', maxLength: 30, requiresName: false },
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

  const venueName =
    eventDetails?.extendedProps?.venueName ||
    eventDetails?.extendedProps?.venueShortName ||
    '';
  const venueCity = eventDetails?.extendedProps?.venueCityName || eventDetails?.extendedProps?.masteredCityName || '';

  // TIEMPO-436: Build the occurrence list for recurring events so SL can
  // page << / >> through them inside the modal. Mirrors ViewEventDetailModal
  // / EditOccurrenceModal pattern.
  const recurrenceRule = eventDetails?.extendedProps?.recurrenceRule;
  const venueDisplayStartTime = eventDetails?.extendedProps?.displayStartTime;
  const eventStartDateRaw = eventDetails?.extendedProps?.originalStartDate || eventDetails?.start;

  const occurrenceDates = useMemo(() => {
    if (!isRepeating || !recurrenceRule) return [];
    const dtstartSource = venueDisplayStartTime || eventStartDateRaw;
    if (!dtstartSource) return [];
    try {
      let rruleStr;
      if (typeof venueDisplayStartTime === 'string' && !venueDisplayStartTime.endsWith('Z')) {
        const dtStartFormatted = venueDisplayStartTime.replace(/[-:]/g, '').replace('T', 'T').substring(0, 15);
        rruleStr = `DTSTART:${dtStartFormatted}\nRRULE:${recurrenceRule}`;
      } else {
        const dtstart = new Date(dtstartSource);
        rruleStr = `DTSTART:${format(dtstart, "yyyyMMdd'T'HHmmss")}\nRRULE:${recurrenceRule}`;
      }
      const rule = RRule.fromString(rruleStr);
      const dtstart = new Date(dtstartSource);
      const endRange = addMonths(new Date(), 6);
      return rule.between(dtstart, endRange, true).slice(0, 52);
    } catch {
      return [];
    }
  }, [isRepeating, recurrenceRule, venueDisplayStartTime, eventStartDateRaw]);

  // currentDateIndex tracks where the user has paged to. Initialize to the
  // clicked occurrence; reset whenever the underlying event changes.
  const initialIndex = useMemo(() => {
    if (!isRepeating || !occurrenceDates.length || !eventDetails?.start) return 0;
    const target = new Date(eventDetails.start).toISOString().split('T')[0];
    const idx = occurrenceDates.findIndex(
      (d) => new Date(d).toISOString().split('T')[0] === target
    );
    return idx >= 0 ? idx : 0;
  }, [isRepeating, occurrenceDates, eventDetails?.start]);

  const [currentDateIndex, setCurrentDateIndex] = useState(initialIndex);
  useEffect(() => {
    setCurrentDateIndex(initialIndex);
  }, [initialIndex]);

  // The "current" occurrence the SL is editing — either the rrule-derived
  // navigated date (recurring) or the click's start (single).
  const currentOccurrenceDate = isRepeating && occurrenceDates.length
    ? occurrenceDates[currentDateIndex]
    : eventDetails?.start;

  const formattedDate = currentOccurrenceDate
    ? new Date(currentOccurrenceDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const instanceKey = isRepeating && currentOccurrenceDate
    ? (typeof currentOccurrenceDate === 'string'
        ? currentOccurrenceDate
        : new Date(currentOccurrenceDate).toISOString())
    : null;

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

  // TIEMPO-436: Reset spotlights + form whenever the event OR the selected
  // occurrence changes (covers both event-switching AND prev/next nav).
  useEffect(() => {
    setSpotlights(initialSpotlights);
    setNewType('');
    setNewName('');
    setError(null);
    setSubmitting(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, instanceKey]);

  const handlePrevDate = () => {
    if (currentDateIndex > 0) setCurrentDateIndex((i) => i - 1);
  };
  const handleNextDate = () => {
    if (currentDateIndex < occurrenceDates.length - 1) setCurrentDateIndex((i) => i + 1);
  };
  const hasPrevDate = isRepeating && currentDateIndex > 0;
  const hasNextDate = isRepeating && currentDateIndex < occurrenceDates.length - 1;

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
    const requiresName = selectedOption?.requiresName !== false;
    const trimmed = newName.trim();
    if (requiresName && !trimmed) {
      setError('Enter a name.');
      return;
    }
    // TIEMPO-438: For 'canceled' the name is an optional reason — allow blank.
    if (spotlights.some((s) => s.type === newType && s.name === trimmed)) {
      setError(newType === 'canceled' ? 'This date is already canceled.' : 'That spotlight is already added.');
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
          {/* TIEMPO-436: Occurrence navigation arrows for recurring events.
              Mirrors EditOccurrenceModal pattern — click prev/next to page
              through the series without closing the modal. */}
          {isRepeating && occurrenceDates.length > 1 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
                px: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={handlePrevDate}
                disabled={!hasPrevDate || submitting}
                aria-label="previous occurrence"
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                Occurrence {currentDateIndex + 1} of {occurrenceDates.length}
              </Typography>
              <IconButton
                size="small"
                onClick={handleNextDate}
                disabled={!hasNextDate || submitting}
                aria-label="next occurrence"
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          )}

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
              label={selectedOption?.nameLabel || 'Name'}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              inputProps={{ maxLength }}
              helperText={`Max ${maxLength} chars`}
              disabled={submitting || !newType}
            />
            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={16} /> : <AddIcon />}
              onClick={handleAdd}
              disabled={submitting || !newType || (selectedOption?.requiresName !== false && !newName.trim())}
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

        {/* TIEMPO-433: Sticky footer with explicit Cancel — adds/removes commit
            individually, so Cancel just closes the modal without a confirm step. */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            p: isMobile ? 1.5 : 2,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={onClose} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
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
