# TangoTiempo Date/Time Logic Map - Complete "As-Is" State

## Executive Summary

This document maps all date/time handling logic in the TangoTiempo frontend React/Next.js application, from event creation (PUT/POST) to user presentation. The focus is on understanding how Zulu (UTC) vs local time is handled, especially for recurring events (RRULE), and identifying inconsistencies that cause timezone display issues.

## Key Finding: The Core Issue

**The main problem is inconsistent handling of the "Z" (Zulu/UTC) suffix in date strings:**
- Some functions strip the "Z" to treat dates as local time
- Other functions don't strip it, causing UTC interpretation
- This creates a patchwork of timezone handling that breaks recurring events and excluded dates

---

## 1. EVENT CREATION FLOW

### 1.1 Date Picker Component (CreateEventDetailsBasic.js)
**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`

```javascript
// Uses MUI DateTimePicker with dayjs adapter
<DateTimePicker
  label="Start Date & Time"
  value={eventData.startDate}  // dayjs object
  onChange={handleStartDateChange}
/>
```

**Date Handling**:
- Input: dayjs objects (local timezone)
- Validation: Ensures end date is not before start date
- Output: dayjs objects stored in `eventData.startDate` and `eventData.endDate`

### 1.2 Recurring Events Setup (CreateEventDetailsRepeating.js)
**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailsRepeating.js`

**RRULE Generation**:
```javascript
const generateRRule = () => {
  let parts = [`FREQ=${recurrenceType.toUpperCase()}`];
  // ... build RRULE parts
  if (useEndDate && endDate) {
    parts.push(`UNTIL=${dateToRRuleFormat(endDate)}`);
  }
  return parts.join(';');
};

const dateToRRuleFormat = (dateString) => {
  const date = new Date(dateString);
  date.setUTCHours(23, 59, 59, 999);  // ⚠️ CONVERTS TO UTC
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};
```

**Excluded Dates Handling**:
```javascript
// USER INPUT: "2024-12-25, 2024-12-31" (YYYY-MM-DD format)
const parseExcludedDates = (dateString) => {
  return dateString.split(',').map(date => {
    const parsedDate = new Date(trimmed + 'T00:00:00Z');  // ⚠️ ADDS Z SUFFIX
    return parsedDate.toISOString();  // ⚠️ RETURNS WITH Z
  });
};
```

**🚨 ISSUE 1**: Excluded dates are converted to UTC with Z suffix, but other parts of the system expect local time.

### 1.3 Event Data Preparation (CreateEventDetailModal.js)
**File**: `src/app/components/Modals/CreateEvents/CreateEventDetailModal.js`

```javascript
// Event data is prepared with dayjs objects
const eventToSave = {
  title: eventData.title,
  startDate: eventData.startDate,    // dayjs object
  endDate: eventData.endDate,        // dayjs object
  recurrenceRule: eventData.recurrenceRule,  // RRULE string
  excludedDates: eventData.excludedDates,    // Array of ISO strings with Z
  isRepeating: eventData.isRepeating
};
```

---

## 2. BACKEND STORAGE

**From Documentation** (`public/Playbook/calendar-be/backend models.md`):
```javascript
// MongoDB Event Schema
{
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  recurrenceRule: { type: String, required: false },
  excludedDates: [{ type: Date }],  // Array of Date objects
  isRepeating: { type: Boolean, default: false }
}
```

**Storage Format**: Backend stores dates as MongoDB Date objects (UTC internally, but timezone-aware).

---

## 3. EVENT RETRIEVAL & TRANSFORMATION FLOW

### 3.1 API Response Format
**From Backend**: Events come back with ISO date strings (likely with Z suffix for UTC).

### 3.2 Event Transformation (transformEvents.js)
**File**: `src/app/utils/transformEvents.js`

This is the **CRITICAL TRANSFORMATION LAYER** where most timezone issues occur.

#### 3.2.1 Timezone Stripping Function
```javascript
function stripTimezoneIndicator(dateString) {
  // Handle ISO string format with Z suffix
  if (typeof dateString === 'string' && dateString.endsWith('Z')) {
    return dateString.slice(0, -1);  // ⚠️ STRIPS Z TO MAKE LOCAL
  }
  
  // Handle other timezone indicators like +00:00
  if (typeof dateString === 'string' && /[+-]\d{2}:\d{2}$/.test(dateString)) {
    return dateString.replace(/[+-]\d{2}:\d{2}$/, '');
  }
  
  return dateString;
}
```

#### 3.2.2 Regular (Non-Recurring) Events
```javascript
// For non-recurring events
return {
  ...baseEvent,
  start: event.startDate,  // ⚠️ NO TIMEZONE STRIPPING HERE
  end: event.endDate,      // ⚠️ NO TIMEZONE STRIPPING HERE
};
```

**🚨 ISSUE 2**: Regular events DON'T strip timezone, so they might display in UTC if backend sends Z suffix.

#### 3.2.3 Recurring Events (RRULE)
```javascript
// For recurring events with RRULE
const rruleObj = parseRRuleToObject(cleanedRRule, event.startDate, event.endDate);

function parseRRuleToObject(rruleString, startDate, endDate) {
  const rruleObj = {
    dtstart: stripTimezoneIndicator(startDate)  // ✅ STRIPS Z FOR LOCAL TIME
  };
  
  // ... parse RRULE parts
  
  case 'UNTIL':
    const isoDate = convertRRuleDateToISO(value);
    rruleObj.until = stripTimezoneIndicator(isoDate);  // ✅ STRIPS Z
    break;
}
```

#### 3.2.4 Excluded Dates for Recurring Events
```javascript
// Add exdate if there are excluded dates
if (event.excludedDates && Array.isArray(event.excludedDates)) {
  const eventStartTime = event.startDate.split('T')[1]; // Gets "23:00:00.000Z"
  
  recurringEvent.exdate = event.excludedDates.map(excludedDate => {
    const excludedDateOnly = excludedDate.split('T')[0]; // Gets "2025-10-10"
    const exdateWithTime = `${excludedDateOnly}T${eventStartTime}`;
    return stripTimezoneIndicator(exdateWithTime);  // ✅ STRIPS Z
  });
}
```

**🚨 ISSUE 3**: The logic assumes `event.startDate` contains the Z suffix to extract, but this may not always be true depending on backend format.

---

## 4. CALENDAR DISPLAY (FullCalendar)

### 4.1 Calendar Configuration (calendar/page.js)
**File**: `src/app/calendar/page.js`

```javascript
// FullCalendar with RRULE plugin
<FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, rrulePlugin]}
  events={transformedEvents}  // From transformEvents.js
  // ... other config
/>
```

### 4.2 Time Formatting Functions
```javascript
// Format time display without AM/PM for monthly view
const formatTimeForMonthly = (start, end) => {
  const formatTime = (date) => {
    const hours = date.getHours();    // ⚠️ Uses local getHours()
    const minutes = date.getMinutes(); // ⚠️ Uses local getMinutes()
    // ... formatting logic
  };
};

// Format time display with p/a suffix for list view
const formatTimeForListView = (start, end) => {
  const formatTime = (date) => {
    const hours = date.getHours();    // ⚠️ Uses local getHours()
    const minutes = date.getMinutes(); // ⚠️ Uses local getMinutes()
    // ... formatting logic
  };
};
```

**Key Point**: Calendar display functions use `.getHours()` and `.getMinutes()` which return local time if the Date object was created with local time (no Z suffix).

---

## 5. EVENT DETAIL MODAL DISPLAY

### 5.1 Event Detail Modal (ViewEventDetailModal.js)
**File**: `src/app/components/Modals/ViewEvents/ViewEventDetailModal.js`

```javascript
// Date extraction (FIXED after timezone bug)
const startDate = eventDetails?.start || eventDetails?._instance?.range?.start || null;
const endDate = eventDetails?.end || eventDetails?._instance?.range?.end || null;
```

**Previous Bug** (now fixed): Was using `_instance.range` first, which had timezone offset issues.

```javascript
// Date display
{startDate && startDate.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

// Time display for non-all-day events
const hours = startDate.getHours();    // ⚠️ Uses local getHours()
const minutes = startDate.getMinutes(); // ⚠️ Uses local getMinutes()
```

### 5.2 Recurring Event Details (ViewEventDetailsRepeating.js)
**File**: `src/app/components/Modals/ViewEvents/ViewEventDetailsRepeating.js`

```javascript
// Parse RRULE date format
const parseRRuleDate = (dateStr) => {
  if (dateStr.length >= 15) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`);  // ⚠️ NO TIMEZONE HANDLING
  }
  return new Date(dateStr);
};
```

**🚨 ISSUE 4**: RRULE date parsing doesn't account for timezone indicators.

---

## 6. EDIT MODE FLOW

### 6.1 Loading Event for Edit (CreateEventDetailModal.js)
```javascript
// If this is a recurring event, parse the RRULE to populate the repeating fields
if (eventToEdit.recurrenceRule) {
  const recurrenceFields = parseRRuleToUIFields(eventToEdit.recurrenceRule, eventToEdit);
  setEventData(prevData => ({
    ...prevData,
    ...recurrenceFields
  }));
}
```

### 6.2 RRULE Parsing for Edit (CreateEventDetailsRepeating.js)
```javascript
export function parseRRuleToUIFields(rruleString, eventData) {
  // Handle excluded dates from eventData
  if (eventData && eventData.excludedDates && Array.isArray(eventData.excludedDates)) {
    const dateStrings = eventData.excludedDates.map(isoDate => {
      // Strip Z suffix if present to treat as local
      const localIsoDate = isoDate.endsWith('Z') ? isoDate.slice(0, -1) : isoDate;
      const date = new Date(localIsoDate);  // ✅ STRIPS Z FOR LOCAL
      
      const year = date.getFullYear();    // ✅ Uses local methods
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    setExcludeDates(dateStrings.join(', '));
  }
}
```

**✅ GOOD**: Edit mode properly strips Z suffix for excluded dates display.

---

## 7. IDENTIFIED ISSUES & INCONSISTENCIES

### 🚨 Issue 1: Excluded Dates UTC Conversion
**Location**: `CreateEventDetailsRepeating.js` - `parseExcludedDates()`
**Problem**: User enters "2024-12-25" but it gets converted to UTC with Z suffix
**Impact**: Excluded dates may shift by one day in local timezone

### 🚨 Issue 2: Regular Events No Timezone Stripping
**Location**: `transformEvents.js` - non-recurring event path
**Problem**: Regular events don't strip Z suffix, recurring events do
**Impact**: Inconsistent timezone display between regular and recurring events

### 🚨 Issue 3: Assumption About Start Date Format
**Location**: `transformEvents.js` - excluded dates processing
**Problem**: Code assumes `event.startDate` has Z suffix to extract time portion
**Impact**: May fail if backend doesn't include Z suffix

### 🚨 Issue 4: RRULE Date Parsing No Timezone Handling
**Location**: `ViewEventDetailsRepeating.js` - `parseRRuleDate()`
**Problem**: Creates Date objects without considering timezone
**Impact**: RRULE dates may display incorrectly

### 🚨 Issue 5: Inconsistent stripTimezoneIndicator Usage
**Location**: Multiple files
**Problem**: `stripTimezoneIndicator()` is used in some places but not others
**Impact**: Creates a patchwork of timezone handling

---

## 8. RECOMMENDED FIXES

### 8.1 Standardize Timezone Stripping
**Goal**: Ensure ALL date strings have Z suffix stripped before creating Date objects for display

**Changes Needed**:

1. **Fix transformEvents.js** - Strip timezone for ALL events:
```javascript
// For non-recurring events
return {
  ...baseEvent,
  start: stripTimezoneIndicator(event.startDate),  // ✅ ADD STRIPPING
  end: stripTimezoneIndicator(event.endDate),      // ✅ ADD STRIPPING
};
```

2. **Fix parseExcludedDates()** - Don't add Z suffix:
```javascript
const parseExcludedDates = (dateString) => {
  return dateString.split(',').map(date => {
    // DON'T add Z suffix - treat as local date
    const parsedDate = new Date(trimmed + 'T00:00:00');  // ✅ NO Z
    return parsedDate.toISOString().slice(0, -1);        // ✅ STRIP Z BEFORE STORING
  });
};
```

3. **Fix ViewEventDetailsRepeating.js** - Add timezone handling:
```javascript
const parseRRuleDate = (dateStr) => {
  if (dateStr.length >= 15) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    // Create as local date, not UTC
    return new Date(`${year}-${month}-${day}T00:00:00`);  // ✅ NO Z
  }
  // Strip timezone indicator if present
  const cleanDateStr = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
  return new Date(cleanDateStr);
};
```

### 8.2 Create Centralized Date Utility
**Goal**: Centralize all date/timezone logic in one place

```javascript
// src/app/utils/dateUtils.js
export const dateUtils = {
  // Strip timezone indicators to treat as local time
  toLocalDate: (dateString) => {
    if (!dateString) return null;
    
    if (typeof dateString === 'string') {
      // Remove Z suffix or timezone offset
      const cleaned = dateString.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
      return new Date(cleaned);
    }
    
    return new Date(dateString);
  },
  
  // Format for display consistently
  formatDateTime: (date, options = {}) => {
    if (!date) return '';
    const localDate = dateUtils.toLocalDate(date);
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    });
  },
  
  // Format time for display
  formatTime: (date) => {
    if (!date) return '';
    const localDate = dateUtils.toLocalDate(date);
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const suffix = hours >= 12 ? 'p' : 'a';
    return `${displayHours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}${suffix}`;
  }
};
```

### 8.3 Update All Components to Use dateUtils
Replace direct Date manipulation with centralized utility calls throughout:
- `transformEvents.js`
- `ViewEventDetailModal.js`
- `CreateEventDetailsRepeating.js`
- `ViewEventDetailsRepeating.js`
- `calendar/page.js`

---

## 9. TESTING STRATEGY

### 9.1 Test Cases for Timezone Consistency
1. **Regular Event**: Create event at 8:00 PM, verify it displays as 8:00 PM in all views
2. **Recurring Event**: Create weekly recurring event at 8:00 PM, verify all occurrences show 8:00 PM
3. **Excluded Dates**: Create recurring event, exclude a date, verify excluded date is correct day
4. **Edit Mode**: Edit recurring event, verify excluded dates display in correct format
5. **Cross-Timezone**: Test with different browser timezone settings

### 9.2 Validation Points
- FullCalendar display vs Event Detail Modal display matches
- Recurring event occurrences show correct times
- Excluded dates exclude the correct days
- Edit mode loads correct values
- Create mode saves correct values

---

## 10. CURRENT STATE SUMMARY

**What Works**:
- Single event creation and display (mostly)
- Basic RRULE generation and parsing
- FullCalendar RRULE integration
- Edit mode for most fields

**What's Broken**:
- Inconsistent timezone handling between regular and recurring events
- Excluded dates may shift by one day due to UTC conversion
- RRULE date parsing doesn't handle timezones
- Patchwork of timezone stripping creates unpredictable behavior

**Root Cause**: Lack of consistent timezone handling strategy across the application. Some components strip the Z suffix, others don't, creating a fragmented experience.

**Solution**: Implement centralized date utilities and ensure ALL date strings are stripped of timezone indicators before creating Date objects for display purposes.
