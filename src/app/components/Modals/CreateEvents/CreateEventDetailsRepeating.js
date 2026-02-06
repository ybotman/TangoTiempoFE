import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
} from '@mui/material';
import PropTypes from 'prop-types';

// Parse RRULE string back to UI fields for editing
export function parseRRuleToUIFields(rruleString, eventData) {
  if (!rruleString) return {};
  
  const fields = {
    recurrenceType: 'weekly', // default
    recurrenceDays: [],
    monthlyDays: [],
    monthlyWeeks: [],
    recurrenceEndDate: '',
    recurrenceCount: '',
    useEndDate: true,
    excludeDates: '',
    excludeDatesString: ''
  };

  // Handle excluded dates from eventData
  if (eventData && eventData.excludedDates && Array.isArray(eventData.excludedDates)) {
    // Convert ISO dates back to YYYY-MM-DD format for display
    const dateStrings = eventData.excludedDates.map(isoDate => {
      // Parse as local date, not UTC - strip Z suffix if present
      const localIsoDate = isoDate.endsWith('Z') ? isoDate.slice(0, -1) : isoDate;
      const date = new Date(localIsoDate);
      const year = date.getFullYear(); // Use local methods, not UTC
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    fields.excludeDates = dateStrings.join(', ');
    fields.excludeDatesString = fields.excludeDates;
  }

  const parts = rruleString.split(';');
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    
    switch(key) {
      case 'FREQ':
        fields.recurrenceType = value.toLowerCase();
        break;
        
      case 'BYDAY':
        if (fields.recurrenceType === 'weekly') {
          // Convert SU,MO,TU to ['Su', 'Mo', 'Tu']
          fields.recurrenceDays = parseWeeklyDays(value);
        } else if (fields.recurrenceType === 'monthly') {
          // Parse monthly format like 1MO,3FR
          const { days, weeks } = parseMonthlyDays(value);
          fields.monthlyDays = days;
          fields.monthlyWeeks = weeks;
        }
        break;
        
      case 'UNTIL':
        fields.recurrenceEndDate = parseRRuleDate(value);
        fields.useEndDate = true;
        break;
        
      case 'COUNT':
        fields.recurrenceCount = value;
        fields.useEndDate = false;
        break;
    }
  });
  
  return fields;
}

// Helper: Convert RRULE day format to UI format
function parseWeeklyDays(dayString) {
  const dayMap = {
    'SU': 'Su',
    'MO': 'Mo',
    'TU': 'Tu',
    'WE': 'We',
    'TH': 'Th',
    'FR': 'Fr',
    'SA': 'Sa'
  };
  
  return dayString.split(',').map(day => dayMap[day.toUpperCase()] || day);
}

// Helper: Parse monthly BYDAY format (e.g., "1MO,3FR,-1SU")
function parseMonthlyDays(dayString) {
  const dayMap = {
    'SU': 'Su',
    'MO': 'Mo',
    'TU': 'Tu',
    'WE': 'We',
    'TH': 'Th',
    'FR': 'Fr',
    'SA': 'Sa'
  };
  
  const days = [];
  const weeks = [];
  
  const entries = dayString.split(',');
  entries.forEach(entry => {
    // Extract week number and day (e.g., "1MO" -> week="1", day="MO")
    const match = entry.match(/^(-?\d)([A-Z]{2})$/);
    if (match) {
      const [, week, day] = match;
      if (!weeks.includes(week)) {
        weeks.push(week);
      }
      const uiDay = dayMap[day];
      if (uiDay && !days.includes(uiDay)) {
        days.push(uiDay);
      }
    }
  });
  
  return { days, weeks };
}

// Helper: Convert RRULE date format to YYYY-MM-DD
function parseRRuleDate(rruleDate) {
  // Handle YYYYMMDDTHHMMSSZ format
  if (rruleDate.length >= 8) {
    const year = rruleDate.substring(0, 4);
    const month = rruleDate.substring(4, 6);
    const day = rruleDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  // Handle ISO format if already converted
  if (rruleDate.includes('-')) {
    return rruleDate.split('T')[0];
  }
  return rruleDate;
}

// Frequency-based limits for recurrence
const RECURRENCE_LIMITS = {
  daily: { maxCount: 10, maxMonths: 0, maxDays: 10 },
  weekly: { maxCount: 53, maxMonths: 13, maxDays: 0 },
  monthly: { maxCount: 13, maxMonths: 13, maxDays: 0 },
};

// Helper to get day abbreviation from date
const getDayAbbreviation = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return days[date.getDay()];
};

// Helper to calculate end date from count and frequency
const calculateEndDateFromCount = (startDate, count, frequency) => {
  if (!startDate || !count) return '';
  const start = new Date(startDate);
  const result = new Date(start);

  switch (frequency) {
    case 'daily':
      result.setDate(result.getDate() + (parseInt(count, 10) - 1));
      break;
    case 'weekly':
      result.setDate(result.getDate() + ((parseInt(count, 10) - 1) * 7));
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + (parseInt(count, 10) - 1));
      break;
    default:
      return '';
  }

  return result.toISOString().split('T')[0];
};

// Helper to calculate count from end date and frequency
const calculateCountFromEndDate = (startDate, endDate, frequency) => {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let count;
  switch (frequency) {
    case 'daily':
      count = diffDays + 1;
      break;
    case 'weekly':
      count = Math.ceil(diffDays / 7) + 1;
      break;
    case 'monthly':
      count = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      break;
    default:
      return '';
  }

  return Math.max(1, count).toString();
};

// Helper to get max end date based on frequency
const getMaxEndDate = (startDate, frequency) => {
  if (!startDate) return '';
  const start = new Date(startDate);
  const limits = RECURRENCE_LIMITS[frequency] || RECURRENCE_LIMITS.weekly;

  if (limits.maxDays > 0) {
    start.setDate(start.getDate() + limits.maxDays);
  } else if (limits.maxMonths > 0) {
    start.setMonth(start.getMonth() + limits.maxMonths);
  }

  return start.toISOString().split('T')[0];
};

const RepeatingEventDetails = ({ eventData = {}, setEventData }) => {
  // TIEMPO-250: Monthly re-enabled - use recurrence type as-is
  const initialType = eventData.recurrenceType || 'weekly';
  const [recurrenceType, setRecurrenceType] = useState(initialType);
  const [recurrenceDays, setRecurrenceDays] = useState(eventData.recurrenceDays || []);
  const [monthlyDays, setMonthlyDays] = useState(eventData.monthlyDays || []);
  const [monthlyWeeks, setMonthlyWeeks] = useState(eventData.monthlyWeeks || []);
  const [excludeDates, setExcludeDates] = useState(eventData.excludeDatesString || eventData.excludeDates || '');
  const [endDate, setEndDate] = useState(eventData.recurrenceEndDate || '');
  const [occurrences, setOccurrences] = useState(eventData.recurrenceCount || '');
  // Track if we've initialized the day checkbox from start date
  const [hasInitializedDay, setHasInitializedDay] = useState(false);

  // State to handle switching between End Date and Occurrences
  const [useEndDate, setUseEndDate] = useState(eventData.useEndDate !== undefined ? eventData.useEndDate : true);

  // Get current limits based on frequency
  const currentLimits = RECURRENCE_LIMITS[recurrenceType] || RECURRENCE_LIMITS.weekly;

  // Update local state when eventData changes (for edit mode)
  // Only run once when component mounts or eventData._id changes
  useEffect(() => {
    if (eventData.excludeDatesString !== undefined && eventData.excludeDatesString !== excludeDates) {
      setExcludeDates(eventData.excludeDatesString);
      // Also parse and validate the dates for immediate use
      const parsedDates = parseExcludedDates(eventData.excludeDatesString);
      setValidatedExcludeDates(parsedDates);
    } else if (eventData.excludedDates !== undefined && Array.isArray(eventData.excludedDates) && eventData.excludedDates.length > 0) {
      // If we have the array directly, use it and convert back to string
      setValidatedExcludeDates(eventData.excludedDates);
      // Convert ISO dates back to YYYY-MM-DD format for display
      const dateStrings = eventData.excludedDates.map(isoDate => {
        // Parse as local date, not UTC
        // TIEMPO-246: String-based date parsing without Date() conversion
        const localIsoDate = isoDate.endsWith('Z') ? isoDate.slice(0, -1) : isoDate;
        const [datePart] = localIsoDate.split('T');
// TIEMPO-276: Security cleanup - removed logging
        return datePart || '';
      });
      setExcludeDates(dateStrings.join(', '));
    }
    if (eventData.recurrenceType !== undefined) {
      setRecurrenceType(eventData.recurrenceType);
    }
    if (eventData.recurrenceDays !== undefined) {
      setRecurrenceDays(eventData.recurrenceDays);
    }
    if (eventData.monthlyDays !== undefined) {
      setMonthlyDays(eventData.monthlyDays);
    }
    if (eventData.monthlyWeeks !== undefined) {
      setMonthlyWeeks(eventData.monthlyWeeks);
    }
    if (eventData.recurrenceEndDate !== undefined) {
      setEndDate(eventData.recurrenceEndDate);
    }
    if (eventData.recurrenceCount !== undefined) {
      setOccurrences(eventData.recurrenceCount);
    }
    if (eventData.useEndDate !== undefined) {
      setUseEndDate(eventData.useEndDate);
    }
  }, [eventData._id]); // Only re-run when editing a different event

  // Pre-check day checkbox based on event start date (only for new events)
  useEffect(() => {
    if (!hasInitializedDay && eventData.startDate && recurrenceDays.length === 0 && monthlyDays.length === 0) {
      const dayAbbrev = getDayAbbreviation(eventData.startDate);
      if (dayAbbrev) {
        if (recurrenceType === 'weekly') {
          setRecurrenceDays([dayAbbrev]);
        } else if (recurrenceType === 'monthly') {
          setMonthlyDays([dayAbbrev]);
        }
        setHasInitializedDay(true);
      }
    }
  }, [eventData.startDate, recurrenceType, hasInitializedDay, recurrenceDays.length, monthlyDays.length]);

  // Handle Recurrence Type Change
  // TIEMPO-250: Monthly re-enabled - allow all recurrence types
  const handleRecurrenceTypeChange = (e) => {
    const newType = e.target.value;
    setRecurrenceType(newType);
    // Pre-select day based on start date for new frequency type
    const dayAbbrev = getDayAbbreviation(eventData.startDate);
    if (dayAbbrev) {
      if (newType === 'weekly') {
        setRecurrenceDays([dayAbbrev]);
        setMonthlyDays([]);
        setMonthlyWeeks([]);
      } else if (newType === 'monthly') {
        setMonthlyDays([dayAbbrev]);
        setRecurrenceDays([]);
        setMonthlyWeeks([]);
      } else {
        setRecurrenceDays([]);
        setMonthlyDays([]);
        setMonthlyWeeks([]);
      }
    } else {
      setRecurrenceDays([]);
      setMonthlyDays([]);
      setMonthlyWeeks([]);
    }
    // Clear and reset limits when changing frequency
    setEndDate('');
    setOccurrences('');
  };

  // Handle switching between End Date and Occurrences
  // Handle end date change with sync to occurrences
  // When user edits date, that becomes the "master" for RRULE (UNTIL)
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    const maxDate = getMaxEndDate(eventData.startDate, recurrenceType);

    setUseEndDate(true); // Date field edited → use UNTIL in RRULE

    // Enforce max date
    if (maxDate && newEndDate > maxDate) {
      setEndDate(maxDate);
      const syncedCount = calculateCountFromEndDate(eventData.startDate, maxDate, recurrenceType);
      setOccurrences(syncedCount);
    } else {
      setEndDate(newEndDate);
      // Sync count from date
      const syncedCount = calculateCountFromEndDate(eventData.startDate, newEndDate, recurrenceType);
      const limitedCount = Math.min(parseInt(syncedCount, 10) || 1, currentLimits.maxCount).toString();
      setOccurrences(limitedCount);
    }
  };

  // Handle occurrences change with sync to end date
  // When user edits count, that becomes the "master" for RRULE (COUNT)
  const handleOccurrencesChange = (e) => {
    let newCount = parseInt(e.target.value, 10) || '';

    setUseEndDate(false); // Count field edited → use COUNT in RRULE

    // Enforce max count
    if (newCount && newCount > currentLimits.maxCount) {
      newCount = currentLimits.maxCount;
    }

    setOccurrences(newCount.toString());

    // Sync end date from count
    if (newCount) {
      const syncedDate = calculateEndDateFromCount(eventData.startDate, newCount, recurrenceType);
      setEndDate(syncedDate);
    }
  };

  // Convert date to RRULE format (YYYYMMDDTHHMMSS - local time)
  // TIEMPO-250: Use LOCAL time format (no Z suffix) for proper DST handling
  // Per RFC 5545: Local time format allows rrule.js to handle DST transitions correctly
  // The venue's local time is preserved across DST boundaries
  const dateToRRuleFormat = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Use local end of day (23:59:59) - NO Z suffix for venue local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}T235959`;
  };

  // Validate RRULE format
  const validateRRule = (rrule) => {
    if (!rrule) return { isValid: false, error: 'No RRULE generated' };
    
    // Basic RRULE validation
    const errors = [];
    
    // Check for FREQ
    if (!rrule.includes('FREQ=')) {
      errors.push('Missing FREQ parameter');
    }
    
    // Check for valid frequency
    const validFreqs = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
    const freqMatch = rrule.match(/FREQ=(\w+)/);
    if (freqMatch && !validFreqs.includes(freqMatch[1])) {
      errors.push(`Invalid frequency: ${freqMatch[1]}`);
    }
    
    // If WEEKLY, check for BYDAY
    if (rrule.includes('FREQ=WEEKLY') && recurrenceDays.length === 0) {
      errors.push('Weekly recurrence requires at least one day selected');
    }
    
    // If MONTHLY, check for BYDAY
    if (rrule.includes('FREQ=MONTHLY') && (monthlyDays.length === 0 || monthlyWeeks.length === 0)) {
      errors.push('Monthly recurrence requires both week and day selection');
    }
    
    // Check for either UNTIL or COUNT (not both)
    if (rrule.includes('UNTIL=') && rrule.includes('COUNT=')) {
      errors.push('Cannot have both UNTIL and COUNT');
    }
    
    // Validate UNTIL date format if present
    // TIEMPO-250: Accept both with and without Z suffix (local time is valid per TIEMPO-239)
    const untilMatch = rrule.match(/UNTIL=(\w+)/);
    if (untilMatch && !/^\d{8}T\d{6}Z?$/.test(untilMatch[1])) {
      errors.push('Invalid UNTIL date format');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Generate RRULE Text
  const generateRRule = () => {
    let parts = [`FREQ=${recurrenceType.toUpperCase()}`];
    
    if (recurrenceType === 'daily' || recurrenceType === 'weekly' || recurrenceType === 'monthly') {
      if (recurrenceType === 'weekly' && recurrenceDays.length > 0) {
        // Convert day abbreviations to uppercase for RFC 5545 compliance
        const weekdaysMap = {
          Su: 'SU',
          Mo: 'MO',
          Tu: 'TU',
          We: 'WE',
          Th: 'TH',
          Fr: 'FR',
          Sa: 'SA',
        };
        const uppercaseDays = recurrenceDays.map(day => weekdaysMap[day] || day.toUpperCase());
        parts.push(`BYDAY=${uppercaseDays.join(',')}`);
      } else if (recurrenceType === 'monthly' && monthlyDays.length > 0 && monthlyWeeks.length > 0) {
        const weekdaysMap = {
          Su: 'SU',
          Mo: 'MO',
          Tu: 'TU',
          We: 'WE',
          Th: 'TH',
          Fr: 'FR',
          Sa: 'SA',
        };
        const byDay = monthlyWeeks.map((week) => monthlyDays.map((day) => `${week}${weekdaysMap[day]}`)).flat();
        parts.push(`BYDAY=${byDay.join(',')}`);
      }
      if (useEndDate && endDate) {
        parts.push(`UNTIL=${dateToRRuleFormat(endDate)}`);
      } else if (!useEndDate && occurrences) {
        parts.push(`COUNT=${occurrences}`);
      }
    }
    
    // Join parts with semicolon - no trailing semicolon
    return parts.join(';');
  };

  // State for validation
  const [rruleValidation, setRruleValidation] = useState({ isValid: true, errors: [] });

  // Helper function to parse excluded dates string to array
  const parseExcludedDates = (dateString) => {
    if (!dateString || !dateString.trim()) return [];
    
    return dateString.split(',').map(date => {
      const trimmed = date.trim();
      if (!trimmed) return null;
      
      // TIEMPO-246: Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(trimmed)) {
        // Don't log during typing, only return null
        return null;
      }
      
      // Validate date components
      const [, month, day] = trimmed.split('-').map(num => parseInt(num, 10));
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
      }
      
      // Return as ISO string format without timezone conversion
      return `${trimmed}T00:00:00`;
    }).filter(date => date !== null);
  };

  // State for validated exclude dates
  const [validatedExcludeDates, setValidatedExcludeDates] = useState([]);

  // Validate and parse exclude dates when user is done typing (on blur)
  const handleExcludeDatesBlur = () => {
    const parsedDates = parseExcludedDates(excludeDates);
    setValidatedExcludeDates(parsedDates);
  };

  // Update eventData with RRULE whenever relevant fields change
  useEffect(() => {
    const rrule = generateRRule();
    const validation = validateRRule(rrule);
    setRruleValidation(validation);
    
    // Only update eventData if RRULE is valid
    if (validation.isValid) {
      setEventData(prevData => ({
        ...prevData,
        recurrenceRule: rrule,
        excludedDates: validatedExcludeDates, // Use validated dates, not parsing on every keystroke
        // Store recurrence settings for editing
        recurrenceType,
        recurrenceDays,
        monthlyDays,
        monthlyWeeks,
        recurrenceEndDate: endDate,
        recurrenceCount: occurrences,
        useEndDate,
        // Don't send excludeDatesString to backend - it's only for UI state
      }));
    }
  }, [recurrenceType, recurrenceDays, monthlyDays, monthlyWeeks, endDate, occurrences, useEndDate, validatedExcludeDates]); // Use validatedExcludeDates instead

  return (
    <Box>
      <Typography variant="h6">Repeating Rules</Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        Configure how often this event repeats. The event&apos;s duration (from Basic tab) stays the same for each occurrence.
      </Typography>

      {/* Recurrence Type */}
      <Box display="flex" flexWrap="wrap" gap={2} marginTop={2}>
        <TextField 
          label="Recurrence Pattern" 
          select 
          value={recurrenceType} 
          onChange={handleRecurrenceTypeChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </TextField>
        {eventData.startDate && (
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            Starting from: {(() => {
              // TIEMPO-246: Format date without Date() conversion
              const dateStr = typeof eventData.startDate === 'string' 
                ? eventData.startDate 
                : eventData.startDate?.format ? eventData.startDate.format('YYYY-MM-DD') : '';
              const [year, month, day] = (dateStr.split('T')[0] || '').split('-');
              if (!year) return '';
              const months = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
              return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
            })()}
          </Typography>
        )}
      </Box>

      {/* End Date vs Number of Occurrences */}
      <Box marginTop={3}>
        <Typography variant="subtitle2" gutterBottom>
          How long should the series run?
        </Typography>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Edit either field — the other updates automatically.
          </Typography>
          <Chip
            label={useEndDate ? 'Using: Date' : 'Using: Count'}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box>
            <TextField
              label="Repeat Until Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={handleEndDateChange}
              inputProps={{
                min: eventData.startDate ? new Date(eventData.startDate).toISOString().split('T')[0] : undefined,
                max: getMaxEndDate(eventData.startDate, recurrenceType) || undefined,
              }}
              helperText={`Max: ${currentLimits.maxMonths > 0 ? `${currentLimits.maxMonths} months` : `${currentLimits.maxDays} days`}`}
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': useEndDate ? {
                  borderColor: 'primary.main',
                  '& fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                } : {}
              }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            or
          </Typography>
          <Box>
            <TextField
              label="Number of Occurrences"
              type="number"
              inputProps={{ min: 1, max: currentLimits.maxCount }}
              value={occurrences}
              onChange={handleOccurrencesChange}
              sx={{
                width: '180px',
                '& .MuiOutlinedInput-root': !useEndDate ? {
                  borderColor: 'primary.main',
                  '& fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                } : {}
              }}
              helperText={`Max: ${currentLimits.maxCount} occurrences`}
            />
          </Box>
        </Box>
      </Box>

      {/* Send Reminder feature removed - was not implemented */}

      {/* Weekly Options */}
      {recurrenceType === 'weekly' && (
        <Box marginTop={2}>
          <Typography>Select Days:</Typography>
          <FormGroup row>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurrenceDays.includes(day)}
                    onChange={() => {
                      setRecurrenceDays((prev) =>
                        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                      );
                    }}
                  />
                }
                label={day}
                key={day}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      {/* Monthly Options */}
      {recurrenceType === 'monthly' && (
        <Box marginTop={2}>
          <Typography>Select Days of the Week:</Typography>
          <FormGroup row>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={monthlyDays.includes(day)}
                    onChange={() => {
                      setMonthlyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
                    }}
                  />
                }
                label={day}
                key={day}
              />
            ))}
          </FormGroup>

          <Typography>Selected Week(s) of the Month:</Typography>
          <FormGroup row>
            {['1', '2', '3', '4', '-1'].map((week) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={monthlyWeeks.includes(week)}
                    onChange={() => {
                      setMonthlyWeeks((prev) =>
                        prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
                      );
                    }}
                  />
                }
                label={week === '-1' ? 'Last' : week}
                key={week}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      {/* Exclude Dates */}
      <Box marginTop={2}>
        <TextField
          fullWidth
          label="Exclude Dates (comma separated, format: YYYY-MM-DD)"
          value={excludeDates}
          onChange={(e) => {
            const newValue = e.target.value;
            setExcludeDates(newValue);
            // Parse dates on change as well to ensure they're captured before save
            const parsedDates = parseExcludedDates(newValue);
            setValidatedExcludeDates(parsedDates);
          }}
          onBlur={handleExcludeDatesBlur}
          helperText="Optional: Enter dates to skip (e.g., 2024-12-25, 2024-12-31)"
        />
      </Box>

      {/* Display Generated RRULE */}
      <Box marginTop={2}>
        <Typography variant="subtitle1" color="textSecondary">
          Generated RRULE:
        </Typography>
        <Typography 
          variant="body2" 
          color={rruleValidation.isValid ? "textSecondary" : "error"}
        >
          {generateRRule()}
        </Typography>
        {!rruleValidation.isValid && (
          <Box mt={1}>
            {rruleValidation.errors.map((error, index) => (
              <Typography key={index} variant="caption" color="error">
                • {error}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* Remove Action Buttons - not needed */}
    </Box>
  );
};

RepeatingEventDetails.propTypes = {
  eventData: PropTypes.shape({
    recurrenceType: PropTypes.string,
    recurrenceDays: PropTypes.arrayOf(PropTypes.string),
    monthlyDays: PropTypes.arrayOf(PropTypes.string),
    monthlyWeeks: PropTypes.arrayOf(PropTypes.string),
    excludeDates: PropTypes.string,
    endDate: PropTypes.string,
    occurrences: PropTypes.string,
    // sendReminder: PropTypes.bool, // Removed - feature not implemented
    startDate: PropTypes.instanceOf(Date),
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default RepeatingEventDetails;
