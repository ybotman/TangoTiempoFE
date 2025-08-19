/**
 * TIEMPO-239: Venue Timezone Display Utilities
 * 
 * CRITICAL: These functions handle venue timezone display WITHOUT browser conversion.
 * All times are displayed in the VENUE's local timezone, not the user's browser timezone.
 * 
 * DO NOT use Date() objects on display times - they cause browser timezone conversion.
 */

/**
 * Format a venue time string for display
 * @param {string} timeString - ISO time string from display object (no Z suffix)
 * @param {string} timezoneAbbr - Timezone abbreviation (EDT, PST, etc)
 * @returns {object} Formatted time components
 */
export function formatVenueTime(timeString, timezoneAbbr = '') {
  if (!timeString) return { time: '', date: '', full: '' };
  
  // Parse the string directly without Date object to avoid timezone conversion
  // Format: "2025-06-28T19:30:00"
  const [datePart, timePart] = timeString.split('T');
  if (!timePart) return { time: '', date: '', full: '' };
  
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  
  // Convert to 12-hour format
  const hourNum = parseInt(hour, 10);
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  
  // Format components
  const timeFormatted = `${displayHour}:${minute} ${ampm}`;
  const dateFormatted = `${month}/${day}/${year}`;
  
  return {
    time: timeFormatted,
    date: dateFormatted,
    full: `${timeFormatted}${timezoneAbbr ? ` ${timezoneAbbr}` : ''}`,
    hour: displayHour,
    minute,
    ampm,
    timezone: timezoneAbbr
  };
}

/**
 * Format time range for event display
 * @param {string} startTime - Start time from display object
 * @param {string} endTime - End time from display object
 * @param {string} timezoneAbbr - Timezone abbreviation
 * @returns {string} Formatted time range
 */
export function formatVenueTimeRange(startTime, endTime, timezoneAbbr = '') {
  if (!startTime) return '';
  
  const start = formatVenueTime(startTime, timezoneAbbr);
  const end = endTime ? formatVenueTime(endTime, timezoneAbbr) : null;
  
  if (!end) return start.full;
  
  // If same AM/PM, only show it once
  if (start.ampm === end.ampm) {
    return `${start.hour}:${start.minute}-${end.hour}:${end.minute} ${end.ampm}${timezoneAbbr ? ` ${timezoneAbbr}` : ''}`;
  }
  
  return `${start.time} - ${end.time}${timezoneAbbr ? ` ${timezoneAbbr}` : ''}`;
}

/**
 * Get display times from event, with fallback to UTC
 * @param {object} event - Event object
 * @returns {object} Display times and timezone info
 */
export function getEventDisplayTimes(event) {
  // TIEMPO-252: Use NEW clean field names from backend
  if (event.venueStartDisplay) {
    return {
      startTime: event.venueStartDisplay,
      endTime: event.venueEndDisplay,
      timezone: event.venueTZ,
      timezoneAbbr: event.venueAbbr || '',
      isDST: false,
      hasVenueTimezone: true
    };
  }
  
  // Final fallback to UTC times (migration period)
  return {
    startTime: event.startDate,
    endTime: event.endDate,
    timezone: 'UTC',
    timezoneAbbr: 'UTC',
    isDST: false,
    hasVenueTimezone: false
  };
}

/**
 * Format date for display (venue local date)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatVenueDate(dateString) {
  if (!dateString) return '';
  
  const [datePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(month, 10) - 1];
  
  return `${monthName} ${parseInt(day, 10)}, ${year}`;
}

/**
 * Check if event display should use venue timezone
 * @param {object} event - Event object
 * @returns {boolean} True if venue timezone should be used
 */
export function shouldUseVenueTimezone(event) {
  return !!(
    (event.display && event.display.startTime) ||
    event.displayStartTime ||
    event.venueTimezone
  );
}