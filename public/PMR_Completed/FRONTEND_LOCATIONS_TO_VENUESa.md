# PMR_FRONTEND_LOCATIONS_TO_VENUES

## Summary
Standardize the frontend codebase to use venues instead of locations, aligning with the completed backend migration and ensuring consistent terminology across the platform.

## Scope
**Includes:**
- Update all frontend components using `locationID`/`locationName` to `venueId`/`venueName`
- Deprecate and eventually remove `useLocations.js` hook
- Update event creation and display workflows
- Standardize prop types and interfaces
- Update data transformation logic

**Excludes:**
- GeoLocation functionality (separate system)
- Backend API changes (already completed)
- MasteredLocations functionality (geographic hierarchy system)
- Database schema changes (handled by backend PMR)

## Motivation
The backend has successfully migrated from the legacy "Locations" concept to the standardized "Venues" system. The frontend must now be updated to:
- Use consistent terminology across the platform
- Leverage the new venue-specific APIs and data models
- Remove duplicate code and legacy patterns
- Create a cleaner, more maintainable codebase
- Prepare for sunset of legacy APIs on December 31, 2025

## Changes
- **Components:** Update all components to reference venues instead of locations
- **Hooks:** Replace useLocations with useVenues across the application
- **Forms:** Update all venue selection interfaces in event forms
- **Data Models:** Standardize event data structure for venue references
- **Transformations:** Update data mapping functions for consistent venue terminology

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Breaking event creation flow | Implement and test changes incrementally with full regression testing |
| Data display issues for existing events | Ensure transformEvents handles both old and new field names |
| Missed location references | Comprehensive grep/search and thorough testing |
| API response format mismatches | Add response adapters where needed for backward compatibility |
| Regression in location filtering | Verify venue filtering works identically to location filtering |

## Rollback Strategy
Each phase includes its own rollback plan. For emergency full rollback:
1. Revert all component changes to use locationID/locationName
2. Restore useLocations as primary hook
3. Revert data transformations to original format

## Dependencies
- Completed backend migration (already finished per the migration notice)
- Existing venues collection with proper data
- Backend API supporting both field formats during transition

## Linked PMRs
- Backend: PMR_LocationToVenue.md (completed)

## Owner
Frontend Development Team

## Timeline
- Start: 2025-04-23
- Implementation Completed: 2025-05-15
- Validation & Testing: 2025-05-15 to 2025-05-31
- Completion: 2025-05-31

## Post-Migration Tasks
- Update documentation to consistently use venue terminology
- Remove any legacy location code comments
- Optimize component rendering with venue data
- Consider UI improvements for venue selection

# Phase 1: Assessment and Preparatory Work

### Goals
Complete inventory of all location references and establish migration patterns.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Complete inventory of all location references using grep | ✅ Complete | 2025-04-23 |
| Document component dependencies and update order | ✅ Complete | 2025-04-23 |
| Create test cases for all affected workflows | ✅ Complete | 2025-04-23 |
| Verify backend venues API provides all needed functionality | ✅ Complete | 2025-04-23 |
| Establish consistent naming conventions | ✅ Complete | 2025-04-23 |
| Create pattern for handling both field formats during transition | ✅ Complete | 2025-04-23 |

### Rollback (if needed)
No rollback needed for assessment phase.

### Notes
- Completed comprehensive inventory of all location references
- Identified 7 files that need to be updated:
  1. `/src/app/hooks/useLocations.js` - Core functionality that needs to be deprecated
  2. `/src/app/components/Modals/ViewEvents/ViewEventDetailsMore.js` - Uses locationID/Name and getLocationById
  3. `/src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js` - Uses locationID/Name for form fields
  4. `/src/app/components/Modals/CreateEvents/CreateEventDetailModal.js` - Contains locationID in event data model
  5. `/src/app/utils/transformEvents.js` - Maps locationID/Name in event data transformations
  6. `/src/app/utils/masterData.js` - Contains test data with locationID/Name fields
  7. `/src/app/components/Modals/ViewEvents/ViewEventDetailsLocationOther.js` - Component name and props need updating
  8. `/src/app/components/Modals/ViewEvents/ViewEventDetailModal.js` - Contains "Location" tab references

- All API calls already target `/api/venues` endpoints (no `/api/locations` found)
- Existing useVenues hook already has most functionality needed, but missing getVenueById
- Current CreateEventDetailsBasic.js already imports useVenues but still uses locationID/Name fields
- Transition pattern identified: keep both field names during migration, then remove legacy fields
- Comprehensive test cases created in VENUES_TEST_CASES.md

## Component Update Order:
1. useVenues.js - Add missing functionality from useLocations
2. transformEvents.js - Update to include both field sets during transition
3. Event creation components - Update forms and data models
4. Event viewing components - Update displays and prop types
5. useLocations.js - Convert to re-export from useVenues with deprecation notice

# Phase 2: Data Models and Transformation

### Goals
Update core data handling to standardize on venue terminology.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Update transformEvents.js to use venueId/venueName fields | ✅ Complete | 2025-04-23 |
| Modify event data structures in useEvents.js | ✅ Complete | 2025-04-23 |
| Update useVenues.js to include all needed functionality | ✅ Complete | 2025-04-23 |
| Create transition adapter in useVenues for backward compatibility | ✅ Complete | 2025-04-23 |
| Add field name mapping for both legacy and new field names | ✅ Complete | 2025-04-23 |
| Implement comprehensive event creation validation | ✅ Complete | 2025-04-23 |

### Rollback (if needed)
1. Revert changes to transformEvents.js
2. Restore original field mappings
3. Revert any changes to useEvents.js and useVenues.js

### Notes
- Updated transformEvents.js to handle both old and new field names
- Modified useVenues.js to include getVenueById function and backward compatibility exports
- Updated useLocations.js to import from useVenues with deprecation notice
- Added bidirectional field mapping in useEvents.js for both event creation and updating
- Updated masterData.js to use standardized venue terminology while maintaining compatibility
- Created a transition approach that ensures both old and new field names work during migration

# Phase 3: Component Updates - Event Creation

### Goals
Update all event creation components to use venue terminology.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Update CreateEventDetailsBasic.js to use venueId/venueName | ✅ Complete | 2025-04-23 |
| Update CreateEventDetailModal.js references | ✅ Complete | 2025-04-23 |
| Update form submission to use venue fields | ✅ Complete | 2025-04-23 |
| Update autocomplete and selection interfaces | ✅ Complete | 2025-04-23 |
| Update prop types definitions for venue fields | ✅ Complete | 2025-04-23 |
| Test event creation flow with venue data | ✅ Complete | 2025-04-23 |

### Rollback (if needed)
1. Revert component changes to use original location fields
2. Restore original form submission logic
3. Verify event creation works with original field names

### Notes
- Updated CreateEventDetailsBasic.js to use venueId/venueName fields
- Modified Autocomplete in CreateEventDetailsBasic.js to search and select venues
- Updated CreateEventDetailModal.js to include venueId/venueName in initial state
- Enhanced PropTypes to clearly document venue field requirements
- Maintained backward compatibility with locationID/locationName for transition period
- Fixed API response format handling for venues to handle various response formats

# Phase 4: Component Updates - Event Display

### Goals
Update all event viewing components to use venue terminology.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Update ViewEventDetailsMore.js to use useVenues | ✅ Complete | 2025-04-23 |
| Rename ViewEventDetailsLocationOther.js to ViewEventDetailsVenueOther.js | ✅ Complete | 2025-04-23 |
| Update component references in parent components | ✅ Complete | 2025-04-23 |
| Update UI text from "location" to "venue" | ✅ Complete | 2025-04-23 |
| Fix any references to locationDetails in display components | ✅ Complete | 2025-04-23 |
| Update PropTypes for all affected components | ✅ Complete | 2025-04-23 |
| Update "Location" tab in event details to "Venue" tab | ✅ Complete | 2025-04-23 |

### Rollback (if needed)
1. Revert component changes to use original location fields
2. Restore original component names and references
3. Verify event display works with original field names

### Notes
- Updated ViewEventDetailsMore.js to use useVenues and getVenueById
- Changed all variable names from locationDetails to venueDetails for consistency
- Renamed ViewEventDetailsLocationOther.js to ViewEventDetailsVenueOther.js
- Updated component to handle both legacy and new field naming patterns
- Enhanced PropTypes to include both venueId/venueName and legacy locationID/locationName
- Changed all UI text from "Location" to "Venue" for better user experience
- Updated the "Location" tab in ViewEventDetailModal.js to "Venue" tab
- Added backward compatibility handling for any location tab references

# Phase 5: Hook Migration and Cleanup

### Goals
Complete the transition to useVenues and remove legacy hooks.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Replace all imports of useLocations with useVenues | ✅ Complete | 2025-04-23 |
| Update useVenues to fully replace useLocations functionality | ✅ Complete | 2025-04-23 |
| Add deprecation notice to useLocations | ✅ Complete | 2025-04-23 |
| Remove any remaining location-specific code | ✅ Complete | 2025-04-23 |
| Clean up any location references in comments | ✅ Complete | 2025-04-23 |
| Final validation of venue-only codebase | ✅ Complete | 2025-04-23 |

### Rollback (if needed)
1. Restore useLocations imports and functionality
2. Revert any component changes that assumed useVenues
3. Verify all venue lookup and selection works properly

### Notes
- Verified no active imports of useLocations hook across the codebase
- All relevant components now use useVenues instead
- useLocations.js has been updated to re-export functionality from useVenues
- Added clear deprecation warning to useLocations.js
- API response format handling in useVenues.js has been fixed to handle all returned formats
- Search results show GeoLocation still uses "location" terminology but this is intentional - out of scope

# Phase 6: Comprehensive Testing

### Goals
Ensure all functionality works correctly with venue terminology.

### Tasks
| Task | Status | Last Updated |
|------|--------|--------------|
| Test event creation with venue selection | ✅ Complete | 2025-04-23 |
| Test event viewing with venue details | ✅ Complete | 2025-04-23 |
| Test venue filtering for events | ✅ Complete | 2025-04-23 |
| Test edge cases (events without venues) | ✅ Complete | 2025-04-23 |
| Verify no references to "location" remain in UI | ✅ Complete | 2025-04-23 |
| Check console for any location-related errors | ✅ Complete | 2025-04-23 |

### Rollback (if needed)
If significant issues are found, roll back all changes until fixed.

### Notes
- All functionality works correctly with venue terminology
- Event creation flow properly saves both venueId/venueName fields
- Events display correctly with venue information
- No errors in console related to venue/location confusion
- Fixed API response format handling to prevent console errors
- GeoLocation-related components still use "location" which is intentional and out of scope
- Event detail view now shows "Venue" tab instead of "Location" tab