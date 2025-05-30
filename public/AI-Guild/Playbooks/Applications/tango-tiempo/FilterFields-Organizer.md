# Event Filter Fields: Organizer

This document summarizes all event fields used for organizer-based filtering on the opening page of the TangoTiempo calendar.

## API-Level Filtering Fields
- `organizerId` (ObjectId/String): Organizer identifier (primary filter)

## Event Object Fields (transformed/used in UI)
- `ownerOrganizerID` (ObjectId/String): Main organizer ID
- `ownerOrganizerName` (String): Main organizer name
- `grantedOrganizerID` (ObjectId/String): Additional organizer ID (if present)
- `grantedOrganizerName` (String): Additional organizer name
- `alternateOrganizerID` (ObjectId/String): Alternate organizer ID (if present)
- `alternateOrganizerName` (String): Alternate organizer name

## Notes
- Filtering is primarily by ID, but names are used for display and selection in the UI.
- Organizer selection UI uses both ID and name for mapping.
- Organizer fields are present in both API and transformed event objects.

---
See also: `public/AI-Guild/Playbooks/Applications/calendar-be/API Summary.md` and `src/app/hooks/usePostFilter.js` for implementation details.
