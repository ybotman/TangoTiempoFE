# Sarah Session Notes - 2026-01-29

## TEST Release v1.15.2 → v1.15.3 Summary

### v1.15.2 (already in TEST)
- fix: Pass ISO strings to FullCalendar rrule exdate (fixes timeZoneOffset crash)
  - Root cause: FullCalendar rrule plugin's parseMarker() expects ISO strings, not Date objects
  - Passing Date objects caused parseMarker to return null → null.timeZoneOffset TypeError

### v1.15.3 (pending merge to TEST)
- feat: Re-enable all tracking (login, visitor, MapCenter) - previously disabled as hot fix for Google API cost overrun ($300)
  - Login tracking in AuthContext.js - re-enabled with localhost skip
  - Visitor tracking in layout.js - re-enabled with localhost skip, 24hr geo cache
  - MapCenter tracking in layout.js - re-enabled with localhost skip, 1hr geo cache
- chore: Clean up excessive console.log noise across tracking files
  - visitorTracking.js - removed 7 console.log statements (visit count, visitor ID, welcome modal, map center)
  - geolocationHelper.js - removed 4 console.log statements (GPS status, API fallback messages)
  - Kept console.warn for actual failures (important for debugging)

### TODO: JIRA Updates (API token expired - needs reset)
- Update JIRA tickets for all changes above once API token is reconfigured
- Tickets to update: TIEMPO-313, TIEMPO-323, TIEMPO-324, TIEMPO-329
- Note: JIRA MCP API token has expired and needs to be reset before we can make updates
