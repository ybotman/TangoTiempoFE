import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Tooltip,
  Button,
} from '@mui/material';

import { styled } from '@mui/material/styles';

// Custom MaterialUISwitch definition
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
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
  const [recurrenceType, setRecurrenceType] = useState(
    eventData.recurrenceType || 'weekly'
  );
  const [recurrenceDays, setRecurrenceDays] = useState(
    eventData.recurrenceDays || []
  );
  const [monthlyDays, setMonthlyDays] = useState(eventData.monthlyDays || []);
  const [monthlyWeeks, setMonthlyWeeks] = useState(
    eventData.monthlyWeeks || []
  );
  const [excludeDates, setExcludeDates] = useState(
    eventData.excludeDates || ''
  );
  const [endDate, setEndDate] = useState(eventData.endDate || '');
  const [occurrences, setOccurrences] = useState(eventData.occurrences || '');
  const [sendReminder, setSendReminder] = useState(
    eventData.sendReminder || false
  );

  // State to handle switching between End Date and Occurrences
  const [useEndDate, setUseEndDate] = useState(true); // Default to using End Date

  // Handle Recurrence Type Change
  const handleRecurrenceTypeChange = (e) => {
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

  // Generate RRULE Text
  const generateRRule = () => {
    let rrule = `FREQ=${recurrenceType.toUpperCase()};`;
    if (
      recurrenceType === 'daily' ||
      recurrenceType === 'weekly' ||
      recurrenceType === 'monthly'
    ) {
      if (recurrenceType === 'weekly' && recurrenceDays.length > 0) {
        rrule += `BYDAY=${recurrenceDays.join(',')};`;
      } else if (
        recurrenceType === 'monthly' &&
        monthlyDays.length > 0 &&
        monthlyWeeks.length > 0
      ) {
        const weekdaysMap = {
          Su: 'SU',
          Mo: 'MO',
          Tu: 'TU',
          We: 'WE',
          Th: 'TH',
          Fr: 'FR',
          Sa: 'SA',
        };
        const byDay = monthlyWeeks
          .map((week) => monthlyDays.map((day) => `${week}${weekdaysMap[day]}`))
          .flat();
        rrule += `BYDAY=${byDay.join(',')};`;
      }
      if (useEndDate && endDate) {
        rrule += `UNTIL=${endDate};`;
      } else if (!useEndDate && occurrences) {
        rrule += `COUNT=${occurrences};`;
      }
    }
    return rrule;
  };

  return (
    <Box>
      <Typography variant="h6">Repeating Rules</Typography>

      {/* Date and Recurrence Type on one line */}
      <Box display="flex" flexWrap="wrap" gap={2} marginTop={2}>
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={
            eventData.startDate
              ? eventData.startDate.toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            setEventData({ ...eventData, startDate: new Date(e.target.value) })
          }
        />
        <TextField
          label="Recurrence Type"
          select
          value={recurrenceType}
          onChange={handleRecurrenceTypeChange}
        >
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </TextField>
      </Box>

      {/* End Date, Number of Occurrences, and Switch on one line */}
      <Box display="flex" alignItems="center" gap={2} marginTop={2}>
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={!useEndDate}
        />
        <MaterialUISwitch checked={useEndDate} onChange={handleSwitchChange} />
        <TextField
          label="Number of Occurrences"
          type="number"
          inputProps={{ min: 1, max: 52 }}
          value={occurrences}
          onChange={(e) => setOccurrences(e.target.value)}
          sx={{ width: '150px' }}
          disabled={useEndDate}
        />
      </Box>

      {/* Send Reminder Switch */}
      <Box marginTop={2}>
        <Tooltip title="Send a reminder 1 month before the end date">
          <FormControlLabel
            control={
              <Switch
                checked={sendReminder}
                onChange={(e) => setSendReminder(e.target.checked)}
                color="primary"
              />
            }
            label="Send Reminder"
          />
        </Tooltip>
      </Box>

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
                        prev.includes(day)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day]
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
                      setMonthlyDays((prev) =>
                        prev.includes(day)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day]
                      );
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
                        prev.includes(week)
                          ? prev.filter((w) => w !== week)
                          : [...prev, week]
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

      {/* Exclude Clause */}
      <Box marginTop={2}>
        <TextField
          fullWidth
          label="Exclude Dates (comma separated)"
          value={excludeDates}
          onChange={(e) => setExcludeDates(e.target.value)}
        />
      </Box>

      {/* Display Generated RRULE */}
      <Box marginTop={2}>
        <Typography variant="subtitle1" color="textSecondary">
          Generated RRULE:
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {generateRRule()}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box marginTop={2} display="flex" justifyContent="space-between">
        <Button variant="contained" color="success">
          Verify
        </Button>
      </Box>
    </Box>
  );
};

export default RepeatingEventDetails;
