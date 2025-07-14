import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PropTypes from 'prop-types';

const ViewEventDetailsRepeating = ({ eventDetails }) => {
  // Get the recurrence rule from event details
  const recurrenceRule = eventDetails?.extendedProps?.recurrenceRule || '';
  
  // Parse RRULE to human-readable format
  const parseRRuleToEnglish = (rrule) => {
    if (!rrule) return 'No recurrence rule defined';
    
    const parts = rrule.split(';');
    const rules = {};
    
    // Parse each part of the RRULE
    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        rules[key] = value;
      }
    });
    
    let description = 'This event repeats ';
    
    // Frequency
    switch (rules.FREQ?.toLowerCase()) {
      case 'daily':
        description += 'daily';
        break;
      case 'weekly':
        description += 'weekly';
        break;
      case 'monthly':
        description += 'monthly';
        break;
      case 'yearly':
        description += 'yearly';
        break;
      default:
        description += rules.FREQ?.toLowerCase() || 'with unknown frequency';
    }
    
    // Days of week (for weekly/monthly)
    if (rules.BYDAY) {
      const dayMap = {
        'MO': 'Monday',
        'TU': 'Tuesday',
        'WE': 'Wednesday',
        'TH': 'Thursday',
        'FR': 'Friday',
        'SA': 'Saturday',
        'SU': 'Sunday'
      };
      
      const days = rules.BYDAY.split(',').map(day => {
        // Handle monthly patterns like "2TU" (second Tuesday)
        const match = day.match(/^(-?\d+)?([A-Z]{2})$/);
        if (match) {
          const [, position, dayCode] = match;
          const dayName = dayMap[dayCode] || dayCode;
          if (position) {
            const posNum = parseInt(position);
            if (posNum === -1) return `the last ${dayName}`;
            return `the ${getOrdinal(posNum)} ${dayName}`;
          }
          return dayName;
        }
        return day;
      });
      
      description += ' on ' + days.join(', ');
    }
    
    // Interval
    if (rules.INTERVAL && rules.INTERVAL !== '1') {
      description = description.replace('repeats ', `repeats every ${rules.INTERVAL} `);
      description = description.replace('daily', 'days');
      description = description.replace('weekly', 'weeks');
      description = description.replace('monthly', 'months');
      description = description.replace('yearly', 'years');
    }
    
    // End condition
    if (rules.UNTIL) {
      const untilDate = parseRRuleDate(rules.UNTIL);
      description += ` until ${untilDate.toLocaleDateString()}`;
    } else if (rules.COUNT) {
      description += ` for ${rules.COUNT} occurrence${rules.COUNT === '1' ? '' : 's'}`;
    } else {
      description += ' indefinitely';
    }
    
    return description;
  };
  
  // Helper function for ordinal numbers
  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  // Parse RRULE date format
  const parseRRuleDate = (dateStr) => {
    // Handle YYYYMMDDTHHMMSSZ format
    if (dateStr.length >= 15) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateStr);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Repeating Event Details
      </Typography>
      
      {recurrenceRule ? (
        <>
          {/* English description */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Schedule:
            </Typography>
            <Typography variant="body1">
              {parseRRuleToEnglish(recurrenceRule)}
            </Typography>
          </Paper>
          
          {/* RRULE code */}
          <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              RRULE Code:
            </Typography>
            <Box sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.9rem',
              backgroundColor: '#e8e8e8',
              p: 1,
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              {recurrenceRule}
            </Box>
          </Paper>
          
          {/* Additional event info */}
          {eventDetails?.extendedProps?.startDate && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                First occurrence: {new Date(eventDetails.extendedProps.startDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Typography variant="body1" color="text.secondary">
            This event does not have a recurrence rule defined.
          </Typography>
        </Paper>
      )}
      
      {/* Note about the feature */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Note:</strong> Recurring events are currently in beta. The calendar will display individual occurrences based on the RRULE pattern above.
        </Typography>
      </Box>
    </Box>
  );
};

ViewEventDetailsRepeating.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      recurrenceRule: PropTypes.string,
      startDate: PropTypes.string,
    })
  })
};

export default ViewEventDetailsRepeating;