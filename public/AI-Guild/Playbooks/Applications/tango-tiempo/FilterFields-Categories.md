# Event Filter Fields: Categories

This document summarizes all event fields used for category-based filtering on the opening page of the TangoTiempo calendar.

## API-Level Filtering Fields
- `categoryId` (ObjectId/String): Category identifier (primary filter)

## Event Object Fields (transformed/used in UI)
- `categoryFirstId`, `categorySecondId`, `categoryThirdId` (ObjectId/String): Category IDs (primary, secondary, tertiary)
- `categoryFirst`, `categorySecond`, `categoryThird` (String): Category names (for display and post-filtering)

## Notes
- Filtering is performed by both ID (API) and name (post-filter/UI).
- Multiple category fields are supported for fine-grained filtering.
- Category selection UI uses both ID and name for mapping.

---
See also: `public/AI-Guild/Playbooks/Applications/tango-tiempo/GetEvents-postFilters.md` and `src/app/hooks/usePostFilter.js` for implementation details.
