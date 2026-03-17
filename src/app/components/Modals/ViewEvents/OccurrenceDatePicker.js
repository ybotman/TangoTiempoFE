/**
 * OccurrenceDatePicker.js
 * TIEMPO-362: Component showing all upcoming occurrences of a recurring event
 *
 * Allows user to:
 * - See list of upcoming dates
 * - Click a date to fast-track to edit/cancel for that specific occurrence
 * - See which dates already have modifications or cancellations
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { format, addMonths, startOfDay } from 'date-fns';
import { RRule } from 'rrule';

const OccurrenceDatePicker = ({
  open,
  onClose,
  onSelectDate,
  eventTitle,
  recurrenceRule,
  startDate,
  instanceOverrides = [],
  excludedDates = [],
  maxOccurrences = 20
}) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Parse RRULE and generate upcoming occurrences
  const upcomingDates = useMemo(() => {
    if (!recurrenceRule || !startDate) return [];

    try {
      // Build RRULE string
      const dtstart = new Date(startDate);
      const rruleStr = `DTSTART:${format(dtstart, "yyyyMMdd'T'HHmmss")}\nRRULE:${recurrenceRule}`;

      const rule = RRule.fromString(rruleStr);

      // Get occurrences for next 6 months
      const now = new Date();
      const endRange = addMonths(now, 6);

      const occurrences = rule.between(
        startOfDay(now),
        endRange,
        true // inclusive
      ).slice(0, maxOccurrences);

      // Map to objects with override status
      return occurrences.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dateKey = date.toISOString();

        // Check if this date has an override
        const override = instanceOverrides.find(ov => {
          const ovDate = new Date(ov.instanceKey);
          return format(ovDate, 'yyyy-MM-dd') === dateStr;
        });

        // Check if this date is excluded (simple cancellation)
        const isExcluded = excludedDates.some(exDate => {
          const exDateStr = format(new Date(exDate), 'yyyy-MM-dd');
          return exDateStr === dateStr;
        });

        return {
          date,
          dateStr,
          dateKey,
          hasOverride: !!override,
          overrideType: override?.overrideType || null,
          isExcluded,
          isCanceled: override?.overrideType === 'cancel',
          isRemoved: isExcluded || override?.overrideType === 'exclude',
          isModified: override?.overrideType === 'modify',
          override: override || null // Full override object for display
        };
      });
    } catch {
      console.error('Failed to parse RRULE for date picker');
      return [];
    }
  }, [recurrenceRule, startDate, instanceOverrides, excludedDates, maxOccurrences]);

  const handleSelectDate = (occurrence) => {
    setSelectedDate(occurrence.date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onSelectDate(selectedDate);
      onClose();
    }
  };

  const getStatusChip = (occurrence) => {
    if (occurrence.isRemoved) {
      return (
        <Chip
          label="Excluded"
          size="small"
          color="default"
          variant="outlined"
          icon={<EventBusyIcon />}
        />
      );
    }
    if (occurrence.isCanceled) {
      return (
        <Chip
          label="Tonight: Canceled"
          size="small"
          color="error"
          variant="outlined"
          icon={<EventBusyIcon />}
        />
      );
    }
    if (occurrence.isModified) {
      return (
        <Chip
          label="Modified"
          size="small"
          color="info"
          variant="outlined"
          icon={<EditIcon />}
        />
      );
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarMonthIcon color="primary" />
        Upcoming Dates
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {eventTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Select a date to edit or cancel that specific occurrence
          </Typography>
        </Box>

        {upcomingDates.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No upcoming occurrences found
          </Typography>
        ) : (
          <List sx={{ pt: 0 }} dense>
            {upcomingDates.map((occurrence, index) => {
              // Build override info from new array format
              const patch = occurrence.override?.patch;
              const featureLabels = { dj: 'DJ', orchestra: 'Orchestra', instructor: 'Instructor', performer: 'Performer', live: 'LIVE' };

              // Build feature display (excluding LIVE which goes on its own)
              let featuresText = '';
              let hasLive = false;

              if (patch?.features && Array.isArray(patch.features)) {
                // New array format
                const nonLiveFeatures = patch.features
                  .filter(f => f.type !== 'live')
                  .map(f => `${featureLabels[f.type] || f.type}: ${f.name}`);
                featuresText = nonLiveFeatures.join(' | ');
                hasLive = patch.features.some(f => f.type === 'live');
              } else if (patch) {
                // Legacy formats
                const overrideInfo = [];
                if (patch.djName) overrideInfo.push(`DJ: ${patch.djName}`);
                if (patch.orchestraName) overrideInfo.push(`Orchestra: ${patch.orchestraName}`);
                if (patch.instructorName) overrideInfo.push(`Instructor: ${patch.instructorName}`);
                if (patch.performerName) overrideInfo.push(`Performer: ${patch.performerName}`);
                if (patch.featureType && patch.featureName) {
                  const label = featureLabels[patch.featureType] || patch.featureType;
                  overrideInfo.push(`${label}: ${patch.featureName}`);
                }
                featuresText = overrideInfo.join(' | ');
                hasLive = patch.isLive;
              }

              // Build secondary text based on state
              let secondaryText = null;
              if (occurrence.isRemoved) {
                secondaryText = 'Excluded from calendar';
              } else if (occurrence.isCanceled || patch?.isCanceled) {
                // Canceled shows ONLY canceled + reason (no features)
                secondaryText = `CANCELED${patch?.cancelReason ? `: ${patch.cancelReason}` : ''}`;
              } else {
                // Build display: features on line 2, LIVE on line 3
                const parts = [];
                if (featuresText) parts.push(featuresText);
                if (hasLive) parts.push('🎵 LIVE');
                if (patch?.specialNote) {
                  const note = patch.specialNote;
                  parts.push(note.length > 30 ? note.substring(0, 30) + '...' : note);
                }
                secondaryText = parts.length > 0 ? parts.join(' | ') : null;
              }

              return (
                <React.Fragment key={occurrence.dateStr}>
                  <ListItem
                    disablePadding
                    secondaryAction={getStatusChip(occurrence)}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemButton
                      selected={selectedDate?.toISOString() === occurrence.date.toISOString()}
                      onClick={() => handleSelectDate(occurrence)}
                      disabled={occurrence.isRemoved}
                      sx={{
                        py: 0.5,
                        opacity: occurrence.isRemoved ? 0.4 : occurrence.isCanceled ? 0.7 : 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            component="span"
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              textDecoration: (occurrence.isRemoved || occurrence.isCanceled) ? 'line-through' : 'none',
                              color: occurrence.isCanceled ? 'error.main' : 'inherit'
                            }}
                          >
                            {format(occurrence.date, 'EEE, MMM d')} | {format(occurrence.date, 'h:mm a')} | {eventTitle}
                          </Typography>
                        }
                        secondary={secondaryText ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color={occurrence.isRemoved ? 'text.disabled' : occurrence.isCanceled ? 'error.main' : 'text.secondary'}
                          >
                            {secondaryText}
                          </Typography>
                        ) : null}
                        sx={{ my: 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < upcomingDates.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}

        {upcomingDates.length >= maxOccurrences && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Showing next {maxOccurrences} occurrences
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedDate}
        >
          Select This Date
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OccurrenceDatePicker.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  eventTitle: PropTypes.string.isRequired,
  recurrenceRule: PropTypes.string,
  startDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  instanceOverrides: PropTypes.arrayOf(
    PropTypes.shape({
      instanceKey: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      overrideType: PropTypes.string,
      patch: PropTypes.object
    })
  ),
  excludedDates: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  ),
  maxOccurrences: PropTypes.number
};

export default OccurrenceDatePicker;
