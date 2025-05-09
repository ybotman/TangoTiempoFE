# PMR_Geolocation_Hierarchy

## Summary
This Platform Migration Report documents the implementation of event-venue geolocation integration, ensuring that every event inherits and maintains the correct geolocation hierarchy data from its associated venue. The implementation leverages existing geocoded venue data (managed by CalOps) to denormalize geolocation hierarchy IDs directly onto events.

## Scope
### Included:
- Update of event model to include venue's geolocation hierarchy fields
- Integration of CRUD operations to maintain venue-event geolocation relationships
- Update of event creation/editing workflow to inherit venue geolocation data
- Cascade updates when venue location data changes
- API updates to support querying events by geolocation hierarchy

### Excluded:
- Venue geocoding implementation (handled by CalOps)
- Changes to the GeoLocation user detection system
- Migration of legacy location data formats
- Advanced geospatial features (radius search, proximity sorting)
- User location preferences and settings

## Motivation
1. **Data Integrity**: Ensure events always have correct and consistent geolocation data
2. **Search Efficiency**: Enable optimized filtering of events by geographic hierarchy
3. **UI Consistency**: Provide reliable location context across the application
4. **User Experience**: Enable intuitive geographic browsing of events
5. **Future Features**: Lay foundation for advanced geospatial features
6. **Maintenance**: Reduce data inconsistencies between venues and events

## Changes

### Backend Changes
- Extend event schema to include denormalized fields from venue geolocation hierarchy
- Add cascade update mechanism when venue geolocation data changes
- Update API endpoints to support filtering by mastered location IDs
- Create data validation and repair utilities

### Frontend Model & API Changes
- Update event creation/editing workflow to inherit venue's location hierarchy
- Enhance API integration to use geolocation hierarchy fields (IDs and coordinates)
- Update transformEvents.js to include ObjectID references and geolocation points
- Support both legacy name-based and new ID-based filters in useEvents hook
- Add frontend validation for venue-derived geolocation data

### Component Updates
- Update event creation components to properly handle venue geolocation data
- Enhance event filtering with geolocation hierarchy parameters
- Update event display to show consistent location information

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Data inconsistency during transition | Run validation scripts before and after implementation |
| Performance impact of cascade updates | Implement background processing for venue location changes |
| Missing venue references | Add validation and fallback handling for events without valid venue data |
| Race conditions during updates | Implement proper locking mechanisms for concurrent operations |
| API compatibility issues | Maintain backward compatibility with existing endpoints |

## Rollback Strategy
1. Create database backup before implementation
2. Maintain clear feature branches with revert points
3. Implement changes in distinct phases that can be individually rolled back
4. Use feature flags to disable new functionality if issues arise
5. Prepare scripts to restore events to pre-migration state

## Dependencies
- Existing venue data with complete geolocation hierarchy fields
- MasteredLocation collections (regions, divisions, cities)
- Completed Venues Migration (from previous PMR)
- CalOps geocoding functionality

## Linked PMRs
- [Frontend Locations to Venues](/public/PMR_Current/FRONTEND_LOCATIONS_TO_VENUES.md) (Prerequisite)

## Owner
Engineering Team Lead

## Timeline
- Start: 2025-04-23
- Implementation: 2025-04-23 to 2025-05-14
- Testing & Validation: 2025-05-14 to 2025-05-21
- Final Review: 2025-05-22

## Post-Migration Tasks
1. Create admin tools to verify and fix inconsistent geolocation data
2. Optimize query performance for location-based event filtering
3. Clean up any legacy location reference code
4. Update documentation to reflect the new geolocation model
5. Monitor system performance with the new data model

# Phase 1: Event Schema Updates

### Goals
Update the event data model to include denormalized geolocation hierarchy fields from venues.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| ✅ Complete | Extend event schema with masteredCityId, masteredDivisionId, masteredRegionId, countryCode | 2025-04-23 |
| ✅ Complete | Add venueGeolocation field with lat/lng coordinates | 2025-04-23 |
| ✅ Complete | Create database migration script | 2025-04-23 |
| ✅ Complete | Update event validation middleware | 2025-04-23 |
| ✅ Complete | Add backward compatibility handling for legacy fields | 2025-04-23 |
| ✅ Complete | Create test suite for schema validation | 2025-04-23 |

### Rollback (if needed)
1. Run database script to remove new fields from events collection
2. Revert schema changes in codebase
3. Restore original validation middleware

### Notes
- The event schema now maintains both venue and geolocation data for integrity
- MongoDB schema validation has been implemented to ensure data consistency
- All changes maintain backward compatibility with code using legacy field names
- Implementation details documented in "Events GeoLocation Enhancement" document
- Indexes have been added for masteredRegionId, masteredDivisionId, masteredCityId
- GeoSpatial indexes added for venueGeolocation and masteredCityGeolocation

# Phase 2: Event CRUD Integration

### Goals
Modify event creation and update operations to properly handle geolocation hierarchy data.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| ⏳ Pending | Update event creation endpoint to populate geolocation fields from venue | 2025-04-23 |
| ⏳ Pending | Modify event update endpoint to handle venue changes | 2025-04-23 |
| ⏳ Pending | Implement data validation for geolocation consistency | 2025-04-23 |
| ⏳ Pending | Add logging for geolocation data changes | 2025-04-23 |
| ⏳ Pending | Write tests for CRUD operations with geolocation data | 2025-04-23 |
| ⏳ Pending | Create data repair utility for inconsistent records | 2025-04-23 |

### Rollback (if needed)
1. Revert API endpoint changes
2. Roll back to previous validation middleware
3. Disable new geolocation data handling

### Notes
- When a venue is selected for an event, we'll immediately fetch and denormalize its geolocation data
- Special handling for events with missing or invalid venue references
- All geolocation field changes will be logged for auditing purposes

# Phase 3: Cascade Update Implementation

### Goals
Create a system to propagate venue geolocation changes to all associated events.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| ⏳ Pending | Create venue change detection middleware | 2025-04-23 |
| ⏳ Pending | Implement background job for updating related events | 2025-04-23 |
| ⏳ Pending | Add progress tracking and error handling | 2025-04-23 |
| ⏳ Pending | Develop notification system for large update operations | 2025-04-23 |
| ⏳ Pending | Implement concurrency control for multiple venue updates | 2025-04-23 |
| ⏳ Pending | Create admin interface for monitoring cascade updates | 2025-04-23 |

### Rollback (if needed)
1. Disable venue change detection middleware
2. Stop any in-progress update jobs
3. Roll back event collection to pre-update state

### Notes
- Updates will be processed in batches to avoid performance issues
- We'll implement a queuing system for large venue changes
- Admin notifications will be sent for any failed updates that require manual intervention

# Phase 4: Data Migration

### Goals
Populate geolocation hierarchy data for all existing events based on their venue.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| ✅ Complete | Create data migration script with batch processing | 2025-04-23 |
| ✅ Complete | Implement validation to verify data integrity | 2025-04-23 |
| ✅ Complete | Add reporting for migration progress and issues | 2025-04-23 |
| ✅ Complete | Create handling for events with invalid venue references | 2025-04-23 |
| ✅ Complete | Set up monitoring for migration performance | 2025-04-23 |
| ✅ Complete | Prepare rollback script in case of migration failure | 2025-04-23 |

### Migration Implementation
- Created and executed `scripts/migrateEventsGeoLocation.js` with configurable batch size
- Migration script successfully populated all events with available geolocation data
- The script handles:
  - Finding events without the new fields populated
  - Looking up corresponding mastered location objects by name
  - Extracting ObjectIDs and geolocation coordinates
  - Updating events with the new data without default values

### Migration Results
- Processed all existing events in the database
- For each event with a valid venue, added:
  - masteredRegionId, masteredDivisionId, masteredCityId
  - venueGeolocation (where available)
  - masteredCityGeolocation (where available)
- Events with missing venue information were logged for manual review

### Rollback (if needed)
1. Stop migration process
2. Run rollback script to remove added geolocation data
3. Restore events collection from backup if necessary

### Notes
- The migration ran in configurable batch sizes to minimize system impact
- A detailed report was generated for events that couldn't be updated
- Special handling was implemented for events with missing venue data

# Phase 5: API Enhancement

### Goals
Update API endpoints to support filtering and sorting by geolocation hierarchy.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| ✅ Complete | Extend events API with geolocation hierarchy filter parameters | 2025-04-23 |
| ✅ Complete | Implement MongoDB query optimization for geolocation fields | 2025-04-23 |
| ✅ Complete | Create backward compatibility layer for legacy parameters | 2025-04-23 |
| ✅ Complete | Add documentation for new API parameters | 2025-04-23 |
| ✅ Complete | Write tests for API filtering and sorting | 2025-04-23 |
| 🚧 In Progress | Monitor performance of geolocation-based queries | 2025-04-23 |

### API Enhancements Implemented
- Backend now supports filtering events by `masteredCityId`, `masteredDivisionId`, `masteredRegionId`
- Added geospatial query support for `venueGeolocation` and `masteredCityGeolocation`
- Indexes created for all geolocation hierarchy fields and combined date indexes
- Query optimization implemented for location-based event filtering
- All existing string-based parameters (`masteredRegionName`, etc.) continue to work

### Rollback (if needed)
1. Revert API endpoint changes
2. Roll back to previous query implementation
3. Restore original documentation

### Notes
- New filter parameters include `masteredCityId`, `masteredDivisionId`, `masteredRegionId`
- Geospatial query support added for proximity-based searches 
- Indexes optimize geolocation-based queries for both ID-based and coordinate-based filters
- Documentation has been updated to explain the new filtering capabilities

# Phase 6: Frontend Integration

### Goals
Update frontend components to use the enhanced geolocation data provided by the backend event schema updates.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| 🚧 In Progress | Update transformEvents.js to handle new geolocation hierarchy fields | 2025-04-23 |
| 🚧 In Progress | Update useEvents hook to support filtering by masteredRegionId, masteredDivisionId, masteredCityId | 2025-04-23 |
| ⏳ Pending | Modify createEvent and updateEvent to properly handle venue geolocation | 2025-04-23 |
| ⏳ Pending | Enhance event creation/editing components to inherit venue geolocation data | 2025-04-23 |
| ⏳ Pending | Update event display components to show consistent geolocation information | 2025-04-23 |
| ⏳ Pending | Integrate new fields with GeoLocationContext for improved filtering | 2025-04-23 |
| ⏳ Pending | Create end-to-end tests for location-based workflows | 2025-04-23 |

### Implementation Details
The frontend implementation will support the following backend schema changes:
- ObjectID references: `masteredRegionId`, `masteredDivisionId`, `masteredCityId`
- Geolocation coordinates: `masteredCityGeolocation`, `venueGeolocation`
- Maintaining backward compatibility with existing string name fields

### Rollback (if needed)
1. Revert frontend component changes
2. Roll back to previous hooks implementation
3. Restore original UI behavior

### Notes
- The implementation will maintain compatibility with the existing GeoLocationContext
- We will upgrade API calls to utilize both name-based and ID-based filtering
- When a venue is selected for an event, we'll automatically inherit its geolocation hierarchy 
- The calendar view will be optimized to handle the enhanced data model

# Phase 7: Testing & Validation

### Goals
Comprehensive testing of the complete geolocation hierarchy integration.

### Tasks
| Status | Task | Last Updated |
|--------|------|--------------|
| ⏳ Pending | Create test suite for end-to-end location workflows | 2025-04-23 |
| ⏳ Pending | Perform data integrity validation | 2025-04-23 |
| ⏳ Pending | Test venue update cascade functionality | 2025-04-23 |
| ⏳ Pending | Verify API filtering and performance | 2025-04-23 |
| ⏳ Pending | Conduct UI testing for location-based navigation | 2025-04-23 |
| ⏳ Pending | Create monitoring dashboard for system health | 2025-04-23 |

### Rollback (if needed)
Document any issues found and prepare targeted fixes rather than full rollback at this stage.

### Notes
- Testing will cover both happy paths and edge cases
- Performance testing will simulate high-volume venue updates
- UI testing will verify all location-based workflows work correctly