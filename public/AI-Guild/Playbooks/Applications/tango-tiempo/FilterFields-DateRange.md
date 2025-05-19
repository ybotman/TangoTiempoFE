# Event Filter Fields: Date Range

This document summarizes all event fields used for date-based filtering on the opening page of the TangoTiempo calendar.

## API-Level Filtering Fields
- `start` (ISO date string): Start of date range
- `end` (ISO date string): End of date range

## Event Object Fields (transformed/used in UI)
- `startDate` (Date/String): Event start date (from API)
- `endDate` (Date/String): Event end date (from API)
- `start` (Date/String): Mapped from `startDate` for FullCalendar
- `end` (Date/String): Mapped from `endDate` for FullCalendar

## Notes
- Date range is always required for event fetching and filtering.
- FullCalendar provides the date range for the API request.
- Filtering is always by date (from/to) using ISO date strings.

---
See also: `public/calendar_event_fetching_summary.md` and `src/app/hooks/useEvents.js` for implementation details.
