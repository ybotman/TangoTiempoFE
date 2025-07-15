import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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

// Custom MaterialUISwitch definition
const MaterialUISwitch = styled(Switch)(() => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><text x="2" y="15" font-size="14" font-family="Arial" fill="${encodeURIComponent(
          '#fff'
        )}">#</text></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="${encodeURIComponent(
        '#fff'
      )}" stroke-width="1" stroke="${encodeURIComponent('#fff')}" /><line x1="7" y1="3" x2="7" y2="17" stroke="${encodeURIComponent(
        '#fff'
      )}" stroke-width="1" /><line x1="13" y1="3" x2="13" y2="17" stroke="${encodeURIComponent(
        '#fff'
      )}" stroke-width="1" /><line x1="3" y1="7" x2="17" y2="7" stroke="${encodeURIComponent(
        '#fff'
      )}" stroke-width="1" /><line x1="3" y1="13" x2="17" y2="13" stroke="${encodeURIComponent(
        '#fff'
      )}" stroke-width="1" /></svg>')`, // Grid icon for month
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
  },
}));

const RepeatingEventDetails = ({ eventData = {}, setEventData }) => {
  // Default to weekly if monthly is selected (since monthly is disabled)
  const initialType = eventData.recurrenceType === 'monthly' ? 'weekly' : (eventData.recurrenceType || 'weekly');
  const [recurrenceType, setRecurrenceType] = useState(initialType);
  const [recurrenceDays, setRecurrenceDays] = useState(eventData.recurrenceDays || []);
  const [monthlyDays, setMonthlyDays] = useState(eventData.monthlyDays || []);
  const [monthlyWeeks, setMonthlyWeeks] = useState(eventData.monthlyWeeks || []);
  const [excludeDates, setExcludeDates] = useState(eventData.excludeDatesString || eventData.excludeDates || '');
  const [endDate, setEndDate] = useState(eventData.recurrenceEndDate || '');
  const [occurrences, setOccurrences] = useState(eventData.recurrenceCount || '');
  // sendReminder feature removed - was not implemented

  // State to handle switching between End Date and Occurrences
  const [useEndDate, setUseEndDate] = useState(eventData.useEndDate !== undefined ? eventData.useEndDate : true);

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
        // If the date has 'Z' suffix, remove it to treat as local
        const localIsoDate = isoDate.endsWith('Z') ? isoDate.slice(0, -1) : isoDate;
        const date = new Date(localIsoDate);
        const year = date.getFullYear(); // Use local methods, not UTC
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        console.log('Exclude date conversion:', { isoDate, localIsoDate, year, month, day });
        return `${year}-${month}-${day}`;
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

  // Handle Recurrence Type Change
  const handleRecurrenceTypeChange = (e) => {
    // Prevent selection of monthly (it's disabled but just in case)
    if (e.target.value === 'monthly') {
      return;
    }
    setRecurrenceType(e.target.value);
    setRecurrenceDays([]);
    setMonthlyDays([]);
    setMonthlyWeeks([]);
  };

  // Handle switching between End Date and Occurrences
  const handleSwitchChange = () => {
    setUseEndDate(!useEndDate);
    setEndDate(''); // Clear the value of endDate when switching
    setOccurrences(''); // Clear occurrences when switching
  };

  // Convert date to RRULE format (YYYYMMDDTHHMMSS - local time)
  const dateToRRuleFormat = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Use local end of day (23:59:59) not UTC
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
    const untilMatch = rrule.match(/UNTIL=(\w+)/);
    if (untilMatch && !/^\d{8}T\d{6}Z$/.test(untilMatch[1])) {
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
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(trimmed)) {
        // Don't log during typing, only return null
        return null;
      }
      
      // Parse YYYY-MM-DD format and keep as local time
      const parsedDate = new Date(trimmed + 'T00:00:00');
      
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        // Don't log during typing, only return null
        return null;
      }
      
      // Return ISO string without Z suffix to maintain local time
      return parsedDate.toISOString().slice(0, -1);
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
        Configure how often this event repeats. The event's duration (from Basic tab) stays the same for each occurrence.
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
            Starting from: {new Date(eventData.startDate).toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {/* End Date vs Number of Occurrences */}
      <Box marginTop={3}>
        <Typography variant="subtitle2" gutterBottom>
          When should the recurrence end?
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Repeat Until Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!useEndDate}
            helperText={useEndDate ? "Events will repeat until this date" : ""}
            sx={{ opacity: useEndDate ? 1 : 0.5 }}
          />
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="caption" color={useEndDate ? "primary" : "text.secondary"}>
              Until Date
            </Typography>
            <MaterialUISwitch 
              checked={!useEndDate} 
              onChange={() => handleSwitchChange()} 
            />
            <Typography variant="caption" color={!useEndDate ? "primary" : "text.secondary"}>
              Count
            </Typography>
          </Box>
          <TextField
            label="Number of Occurrences"
            type="number"
            inputProps={{ min: 1, max: 365 }}
            value={occurrences}
            onChange={(e) => setOccurrences(e.target.value)}
            sx={{ width: '180px', opacity: !useEndDate ? 1 : 0.5 }}
            disabled={useEndDate}
            helperText={!useEndDate ? "Repeat this many times" : ""}
          />
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

      {/* Exclude Dates - Backend now supports this! */}
      <Box marginTop={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Beta Feature:</strong> Exclude dates are now supported! Enter specific dates to skip in your recurring series. 
            Dates must be in YYYY-MM-DD format (e.g., 2025-10-10).
          </Typography>
        </Alert>
        <TextField
          fullWidth
          label="Exclude Dates (comma separated, format: YYYY-MM-DD)"
          value={excludeDates}
          onChange={(e) => setExcludeDates(e.target.value)}
          onBlur={handleExcludeDatesBlur}
          helperText="Enter dates to skip in YYYY-MM-DD format, separated by commas (e.g., 2024-12-25, 2024-12-31)"
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
