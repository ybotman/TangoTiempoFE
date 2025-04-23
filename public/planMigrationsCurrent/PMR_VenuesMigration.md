# PMR: Venues Migration

## Summary
This Platform Migration Report documents the transition from the legacy "Locations" concept to a fully venue-based system in TangoTiempo. The migration standardizes terminology, improves data models, and reduces confusion between geographic locations (regions/divisions/cities) and physical venues where events occur.

## Scope
### Included:
- Complete removal of locations collection/API from backend
- Update of all frontend components to reference venues
- Standardization of field names (venueId/venueName instead of locationID/locationName)
- Ensuring proper linking between venues and geoLocations

### Excluded:
- Changes to the GeoLocation system (separate migration path)
- UI redesign beyond terminology updates
- Changes to core event functionality beyond venue references

## Motivation
1. **Conceptual Clarity**: Clear distinction between geographic regions and physical venues
2. **Data Model Integrity**: Eliminate duplicative concepts in the data model
3. **Code Maintainability**: Unified approach to venues across the platform
4. **Preparation for Launch**: Clean architecture required before full public launch
5. **Consistency**: Align terminology across all application components
6. **Proper Geospatial Support**: Enable better geolocation features with proper venue model

## Changes

### Backend Changes
- Remove locations collection from MongoDB completely
- Update Events schema to use venueId/venueName instead of locationID/locationName
- Add venueGeolocation field to support geographic queries
- Update validation to reject requests using legacy field names
- Remove any locations API endpoints (already completed)

### Frontend Model & API Changes
- Remove useLocations.js hook entirely
- Update API integration to use venueId/venueName consistently
- Update transformEvents.js for venue field mapping
- Update event creation/editing to send venueId/venueName

### Component Updates
- Update ViewEventDetailsMore.js to use useVenues and venueId
- Rename ViewEventDetailsLocationOther.js to ViewEventDetailsVenueOther.js
- Update CreateEventDetailsBasic.js to use venueId/venueName
- Update PropTypes definitions in all components
- Change UI text from "location" to "venue"

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Data loss during migration | High | Low | Create database backup before changes; Run data validation scripts |
| Breaking API changes | High | Medium | Test API endpoints thoroughly; Have rollback plan ready |
| Incomplete UI updates | Medium | Medium | Comprehensive component testing; Create test plan for UI validation |
| Inconsistent terminology | Low | Medium | Code review focused on terminology; Search codebase for remaining references |
| Component failures | High | Low | Unit tests for each affected component; Integration testing before deployment |

## Rollback Strategy
1. **Restore Database**: If migration causes data issues, restore from pre-migration backup
2. **Revert Code**: Keep a branch with pre-migration code that can be deployed
3. **Staged Rollback**:
   - If frontend issues: Revert frontend changes while keeping backend dual-field support
   - If backend issues: Restore database and revert backend schema changes
4. **Monitoring**: Implement monitoring to quickly detect issues post-migration
5. **Field Mapping Fallback**: In worst case, deploy API middleware to map between field names

## Dependencies
- MongoDB Events collection
- Venues API endpoints
- Event creation/viewing components
- GeoLocation system (integration point but not changing)
- Backend validation for API endpoints

## Owner
Ybot - Platform Engineering Lead

## Timeline
- Phase 1 (Backend Updates): Already partially complete, remaining work scheduled for completion
- Phase 2 (Frontend Model & API Updates): To be implemented after backend updates
- Phase 3 (Component Updates): To follow API updates
- Phase 4 (Testing & Validation): Final verification before Phase 5
- Phase 5 (Cleanup & Documentation): Final phase after all testing passes

## Post-Migration Tasks
1. Monitor API performance post-migration
2. Verify all venue selections and displays are working correctly
3. Run database validation scripts to ensure data integrity
4. Clean up any temporary compatibility code
5. Update documentation to reflect new venue-based system
6. Perform code audit to remove any remaining references to locations
7. Verify all event creation flows work with venues
8. Update any external integrations to use venue terminology