# TangoTiempo Timezone Handling Recommendations

## Executive Summary

Based on the comprehensive analysis of the date/timezone logic in TangoTiempo, this document provides actionable recommendations to fix the inconsistent timezone handling that's causing issues with recurring events and excluded dates.

## Core Principle

**"The browser's Date object should always work with local time. UTC with Z suffix should only exist in storage and transmission, never in display logic."**

## 1. Immediate Fixes (High Priority)

### 1.1 Fix transformEvents.js - Apply timezone stripping to ALL events

**File**: `src/app/utils/transformEvents.js`

**Current Issue**: Regular events don't strip the Z suffix, but recurring events do.

**Fix**:
```javascript
// Line ~90-100: Apply stripping to regular events too
if (!cleanedRRule) {
  return {
    ...baseEvent,
    start: stripTimezoneIndicator(event.startDate),  // ADD THIS
    end: stripTimezoneIndicator(event.endDate),      // ADD THIS
  };
}
```

### 1.2 Fix excluded dates storage - Remove Z suffix before saving

**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js`

**Current Issue**: Excluded dates are converted to UTC with Z suffix.

**Fix**:
```javascript
// parseExcludedDates() function
const parseExcludedDates = (dateString) => {
  if (!dateString || !dateString.trim()) return [];
  
  return dateString.split(',').map(date => {
    const trimmed = date.trim();
    if (!trimmed) return null;
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmed)) {
      return null;
    }
    
    // Create as local date, not UTC
    const parsedDate = new Date(trimmed + 'T00:00:00');
    
    // Store without Z suffix to maintain local date
    return parsedDate.toISOString().slice(0, -1);
  }).filter(date => date !== null);
};
```

### 1.3 Fix RRULE UNTIL date format - Keep local timezone

**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js`

**Current Issue**: UNTIL date is converted to UTC which can shift the end date.

**Fix**:
```javascript
// dateToRRuleFormat() function
const dateToRRuleFormat = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // Use local date components, not UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Use local end of day (23:59:59) not UTC
  return `${year}${month}${day}T235959`;
};
```

### 1.4 Fix monthly RRULE parsing issue

**File**: `src/app/utils/transformEvents.js`

**Current Fix Applied**: Keep original BYDAY format for monthly patterns.

**Verify This Works**:
```javascript
// Already fixed in current code
case 'BYDAY':
  if (frequency === 'monthly') {
    // Keep original format (e.g., '2TH', '-1MO')
    rruleObj.byweekday = value.split(',');
  } else {
    // For weekly, convert to lowercase
    rruleObj.byweekday = value.split(',').map(day => day.toLowerCase());
  }
  break;
```

## 2. Strategic Improvements (Medium Priority)

### 2.1 Create a centralized date utility module

**New File**: `src/app/utils/dateTimeUtils.js`

```javascript
/**
 * Centralized date/time utilities for consistent timezone handling
 * Core principle: Always work with local time in the browser
 */

export const dateTimeUtils = {
  /**
   * Convert any date string to local Date object for display
   * Strips timezone indicators to ensure local time interpretation
   */
  toLocalDateTime: (dateString) => {
    if (!dateString) return null;
    
    // Handle dayjs objects
    if (dateString._isAMomentObject || dateString._isUTC) {
      return dateString.toDate();
    }
    
    // Handle Date objects
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Handle strings - strip timezone indicators
    const cleaned = String(dateString)
      .replace(/Z$/, '')                    // Remove Z suffix
      .replace(/[+-]\d{2}:\d{2}$/, '');    // Remove timezone offset
      
    return new Date(cleaned);
  },
  
  /**
   * Format date for backend storage (with Z suffix for UTC)
   */
  toStorageFormat: (date) => {
    if (!date) return null;
    const d = dateTimeUtils.toLocalDateTime(date);
    return d.toISOString(); // Includes Z suffix
  },
  
  /**
   * Format date for RRULE (YYYYMMDDTHHMMSS format, no Z)
   */
  toRRuleFormat: (date) => {
    if (!date) return null;
    const d = dateTimeUtils.toLocalDateTime(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  },
  
  /**
   * Format date for display
   */
  formatDate: (date, options = {}) => {
    if (!date) return '';
    const d = dateTimeUtils.toLocalDateTime(date);
    
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    });
  },
  
  /**
   * Format time for display (12-hour with am/pm)
   */
  formatTime: (date) => {
    if (!date) return '';
    const d = dateTimeUtils.toLocalDateTime(date);
    
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  },
  
  /**
   * Check if two dates are on the same day (ignoring time)
   */
  isSameDay: (date1, date2) => {
    const d1 = dateTimeUtils.toLocalDateTime(date1);
    const d2 = dateTimeUtils.toLocalDateTime(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
};
```

### 2.2 Update all components to use centralized utilities

1. **transformEvents.js**:
   ```javascript
   import { dateTimeUtils } from '@/utils/dateTimeUtils';
   
   // Use utilities instead of stripTimezoneIndicator
   start: dateTimeUtils.toLocalDateTime(event.startDate),
   end: dateTimeUtils.toLocalDateTime(event.endDate),
   ```

2. **CreateEventDetailsRepeating.js**:
   ```javascript
   import { dateTimeUtils } from '@/utils/dateTimeUtils';
   
   // Use for RRULE generation
   parts.push(`UNTIL=${dateTimeUtils.toRRuleFormat(endDate)}`);
   ```

3. **ViewEventDetailModal.js**:
   ```javascript
   import { dateTimeUtils } from '@/utils/dateTimeUtils';
   
   // Use for display
   {dateTimeUtils.formatDate(startDate)}
   {dateTimeUtils.formatTime(startDate)}
   ```

## 3. Testing Strategy

### 3.1 Manual Test Cases

1. **Regular Event Test**:
   - Create event at 8:00 PM
   - Verify displays as 8:00 PM in calendar
   - Verify displays as 8:00 PM in detail modal

2. **Recurring Event Test**:
   - Create weekly event at 8:00 PM
   - Verify all occurrences show 8:00 PM
   - Verify in different calendar views (month/week/list)

3. **Excluded Dates Test**:
   - Create daily recurring event
   - Exclude December 25th
   - Verify December 25th is excluded (not 24th or 26th)

4. **Month Boundary Test**:
   - Create event on last day of month at 11:00 PM
   - Verify doesn't shift to next month

5. **Edit Mode Test**:
   - Edit recurring event with excluded dates
   - Verify excluded dates load correctly
   - Save and verify no date shifts

### 3.2 Browser Timezone Testing

Test with browser timezone set to:
- PST (UTC-8)
- EST (UTC-5)
- GMT (UTC+0)
- JST (UTC+9)

## 4. Implementation Plan

### Phase 1 (Day 1-2): Emergency Fixes
- [ ] Apply timezone stripping to regular events in transformEvents.js
- [ ] Fix excluded dates Z suffix handling
- [ ] Fix RRULE UNTIL date format
- [ ] Test and verify monthly recurring events work

### Phase 2 (Day 3-4): Centralization
- [ ] Create dateTimeUtils.js
- [ ] Update transformEvents.js to use utilities
- [ ] Update CreateEventDetailsRepeating.js
- [ ] Update ViewEventDetailModal.js

### Phase 3 (Day 5-7): Comprehensive Testing
- [ ] Run through all manual test cases
- [ ] Test across different timezones
- [ ] Fix any edge cases discovered
- [ ] Document any remaining issues

## 5. Backend Considerations

### Current Backend Behavior (from documentation):
- Stores dates as MongoDB Date objects (UTC internally)
- Sends dates as ISO strings with Z suffix
- Expects dates in ISO format for updates

### Recommended Backend Updates:
1. **Consistent ISO format**: Always send dates with Z suffix
2. **Document timezone expectations**: Clear API documentation
3. **Consider timezone field**: Add user timezone preference

## 6. Long-term Recommendations

1. **Adopt a timezone library**:
   - Consider `date-fns-tz` for lightweight timezone support
   - Or `luxon` for more comprehensive date handling

2. **User timezone preferences**:
   - Add timezone selection to user settings
   - Store preference in user profile
   - Apply consistently across all date displays

3. **FullCalendar timezone plugin**:
   - FullCalendar has built-in timezone support
   - Could simplify recurring event timezone handling

## 7. Monitoring and Logging

Add strategic logging to track timezone issues:

```javascript
// In transformEvents.js
console.log('Event transformation:', {
  eventId: event._id,
  originalStart: event.startDate,
  transformedStart: stripTimezoneIndicator(event.startDate),
  hasZ: event.startDate?.endsWith('Z')
});

// In dateTimeUtils.js
console.log('Date conversion:', {
  input: dateString,
  output: cleaned,
  hadTimezone: dateString !== cleaned
});
```

## Conclusion

The root cause of TangoTiempo's timezone issues is inconsistent handling of the Z suffix. By implementing these recommendations in order of priority, the application will have predictable, consistent timezone behavior across all features. The key is ensuring that the browser's Date object always works with local time, reserving UTC format only for storage and transmission.