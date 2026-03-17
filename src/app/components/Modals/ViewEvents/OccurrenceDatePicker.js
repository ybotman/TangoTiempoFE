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
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format, addMonths, isBefore, isAfter, startOfDay } from 'date-fns';
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
          isCanceled: isExcluded || override?.overrideType === 'cancel',
          isModified: override?.overrideType === 'modify',
          overrideNotes: override?.patch?.notes
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
    if (occurrence.isCanceled) {
      return (
        <Chip
          label="Canceled"
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
          <List sx={{ pt: 0 }}>
            {upcomingDates.map((occurrence, index) => (
              <React.Fragment key={occurrence.dateStr}>
                <ListItem
                  disablePadding
                  secondaryAction={getStatusChip(occurrence)}
                >
                  <ListItemButton
                    selected={selectedDate?.toISOString() === occurrence.date.toISOString()}
                    onClick={() => handleSelectDate(occurrence)}
                    disabled={occurrence.isCanceled}
                    sx={{
                      opacity: occurrence.isCanceled ? 0.5 : 1,
                      textDecoration: occurrence.isCanceled ? 'line-through' : 'none'
                    }}
                  >
                    <ListItemIcon>
                      {occurrence.isModified ? (
                        <EditIcon color="info" />
                      ) : occurrence.isCanceled ? (
                        <EventBusyIcon color="error" />
                      ) : (
                        <EventIcon color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={format(occurrence.date, 'EEEE, MMMM d, yyyy')}
                      secondary={
                        occurrence.overrideNotes
                          ? occurrence.overrideNotes.substring(0, 50) + (occurrence.overrideNotes.length > 50 ? '...' : '')
                          : format(occurrence.date, 'h:mm a')
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < upcomingDates.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
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
