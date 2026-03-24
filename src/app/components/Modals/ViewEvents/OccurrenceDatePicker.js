/**
 * OccurrenceDatePicker.js
 * TIEMPO-362: Component showing all upcoming occurrences of a recurring event
 *
 * Allows user to:
 * - See list of upcoming dates
 * - Click a date to fast-track to edit/cancel for that specific occurrence
 * - See which dates already have modifications or cancellations
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  IconButton
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import ImageIcon from '@mui/icons-material/Image';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { format, addMonths, subWeeks, startOfDay, isSameDay } from 'date-fns';
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
  maxOccurrences = 25,
  initialSelectedDate = null // The date user clicked on calendar
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const selectedRowRef = useRef(null);
  const listContainerRef = useRef(null);

  // Scroll to selected date when modal opens
  useEffect(() => {
    if (open && selectedRowRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        selectedRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [open]);

  // Parse RRULE and generate occurrences (from event start to future)
  const allDates = useMemo(() => {
    if (!recurrenceRule || !startDate) return [];

    try {
      // Build RRULE string
      const dtstart = new Date(startDate);
      const rruleStr = `DTSTART:${format(dtstart, "yyyyMMdd'T'HHmmss")}\nRRULE:${recurrenceRule}`;

      const rule = RRule.fromString(rruleStr);

      // Get occurrences: from event's original start date to 6 months from now
      // This allows seeing ALL past occurrences, not just recent ones
      const now = new Date();
      const startRange = dtstart; // Start from event's original start date
      const endRange = addMonths(now, 6);

      const occurrences = rule.between(
        startRange,
        endRange,
        true // inclusive
      ).slice(0, maxOccurrences);

      // Map to objects with override status
      return occurrences.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dateKey = date.toISOString();
        const isPast = date < startOfDay(now);

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

        // Determine what type of modification this is
        const patch = override?.patch;
        const hasSpotlight = patch?.features?.length > 0 || patch?.djName || patch?.orchestraName || patch?.instructorName || patch?.performerName || patch?.specialNote || patch?.isCanceled;
        const hasImageChange = !!patch?.eventImage;
        const hasSpecialNote = !!patch?.specialNote;

        return {
          date,
          dateStr,
          dateKey,
          isPast,
          hasOverride: !!override,
          overrideType: override?.overrideType || null,
          isExcluded,
          isCanceled: override?.overrideType === 'cancel',
          isRemoved: isExcluded || override?.overrideType === 'exclude',
          isModified: override?.overrideType === 'modify',
          hasSpotlight,
          hasImageChange,
          hasSpecialNote,
          override: override || null
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

  // Check if this is the initially selected date (from calendar click)
  const isInitialDate = (occurrence) => {
    if (!initialSelectedDate) return false;
    return isSameDay(occurrence.date, new Date(initialSelectedDate));
  };

  // Get spotlight summary text for display (shows all spotlight types including Canceled and Note)
  const getSpotlightSummary = (occurrence) => {
    if (!occurrence.override?.patch) return null;

    const patch = occurrence.override.patch;
    const parts = [];

    // Check for canceled first
    if (patch.isCanceled || occurrence.isCanceled) {
      parts.push(`⚠️ CANCELED${patch.cancelReason ? `: ${patch.cancelReason.substring(0, 15)}` : ''}`);
    }

    // New array format
    if (patch.features && Array.isArray(patch.features)) {
      patch.features.forEach(f => {
        if (f.type === 'dj') parts.push(`DJ: ${f.name?.substring(0, 12) || '?'}`);
        else if (f.type === 'orchestra') parts.push(`Orch: ${f.name?.substring(0, 12) || '?'}`);
        else if (f.type === 'instructor') parts.push(`Inst: ${f.name?.substring(0, 12) || '?'}`);
        else if (f.type === 'performer') parts.push(`Perf: ${f.name?.substring(0, 12) || '?'}`);
        else if (f.type === 'note') parts.push(`📝 ${f.name?.substring(0, 15) || 'Note'}`);
      });
    } else {
      // Legacy format
      if (patch.djName) parts.push(`DJ: ${patch.djName.substring(0, 12)}`);
      if (patch.orchestraName) parts.push(`Orch: ${patch.orchestraName.substring(0, 12)}`);
      if (patch.instructorName) parts.push(`Inst: ${patch.instructorName.substring(0, 12)}`);
      if (patch.performerName) parts.push(`Perf: ${patch.performerName.substring(0, 12)}`);
      if (patch.specialNote) parts.push(`📝 ${patch.specialNote.substring(0, 15)}`);
    }

    return parts.length > 0 ? parts.join(' | ') : null;
  };

  // Get status chip (just one for the type)
  const getStatusChip = (occurrence) => {
    if (occurrence.isRemoved) {
      return (
        <Chip
          key="excluded"
          label="Excluded"
          size="small"
          color="default"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      );
    }

    if (occurrence.isCanceled) {
      return (
        <Chip
          key="canceled"
          label="Canceled"
          size="small"
          color="error"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      );
    }

    if (occurrence.hasSpotlight) {
      return (
        <Chip
          key="spotlight"
          label="★"
          size="small"
          color="info"
          variant="filled"
          sx={{ height: 18, minWidth: 18, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.5 } }}
        />
      );
    }

    if (occurrence.hasImageChange) {
      return (
        <Chip
          key="image"
          label="📷"
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ height: 18, minWidth: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }}
        />
      );
    }

    return null;
  };

  // Find the index where "now" starts (for the visual divider)
  const nowIndex = allDates.findIndex(o => !o.isPast);

  // Scroll navigation handlers
  const scrollToTop = () => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    listContainerRef.current?.scrollTo({ top: listContainerRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { maxHeight: '70vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <CalendarMonthIcon color="primary" fontSize="small" />
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">All Dates</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {eventTitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent ref={listContainerRef} dividers sx={{ p: 0 }}>
        {allDates.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No occurrences found
          </Typography>
        ) : (
          <List sx={{ pt: 0, pb: 0 }} dense>
            {allDates.map((occurrence, index) => {
              const isSelected = selectedDate?.toISOString() === occurrence.date.toISOString();
              const isInitial = isInitialDate(occurrence);
              const statusChip = getStatusChip(occurrence);
              const spotlightSummary = getSpotlightSummary(occurrence);

              // Show "Today & Upcoming" divider
              const showNowDivider = index === nowIndex && nowIndex > 0;

              return (
                <React.Fragment key={occurrence.dateStr}>
                  {showNowDivider && (
                    <Box sx={{ px: 2, py: 0.5, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      <Typography variant="caption" fontWeight="bold">
                        ↓ Today & Upcoming
                      </Typography>
                    </Box>
                  )}
                  <ListItem
                    ref={isInitial ? selectedRowRef : null}
                    disablePadding
                    secondaryAction={statusChip}
                    sx={{
                      bgcolor: isInitial ? 'action.selected' : 'transparent',
                      borderLeft: isInitial ? '3px solid' : 'none',
                      borderLeftColor: 'primary.main'
                    }}
                  >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleSelectDate(occurrence)}
                      disabled={occurrence.isRemoved}
                      sx={{
                        py: 0.5,
                        opacity: occurrence.isRemoved ? 0.4 : occurrence.isPast ? 0.6 : occurrence.isCanceled ? 0.7 : 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            component="span"
                            variant="body2"
                            fontWeight={isInitial ? 'bold' : 'medium'}
                            sx={{
                              textDecoration: (occurrence.isRemoved || occurrence.isCanceled) ? 'line-through' : 'none',
                              color: occurrence.isCanceled ? 'error.main' : occurrence.isPast ? 'text.secondary' : 'inherit'
                            }}
                          >
                            {format(occurrence.date, 'EEE, MMM d')} • {format(occurrence.date, 'h:mm a')}
                          </Typography>
                        }
                        secondary={spotlightSummary && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              color: 'info.main',
                              fontWeight: 'medium',
                              display: 'block',
                              mt: 0.25
                            }}
                          >
                            {spotlightSummary}
                          </Typography>
                        )}
                        sx={{ my: 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={scrollToTop}
            size="small"
            title="Scroll to earliest dates"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <KeyboardArrowUpIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={scrollToBottom}
            size="small"
            title="Scroll to latest dates"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <KeyboardArrowDownIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {allDates.length} dates
          </Typography>
        </Box>
        <Box>
          <Button onClick={onClose} size="small">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            size="small"
            disabled={!selectedDate}
          >
            Select
          </Button>
        </Box>
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
  maxOccurrences: PropTypes.number,
  initialSelectedDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ])
};

export default OccurrenceDatePicker;
