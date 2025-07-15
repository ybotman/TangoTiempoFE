# Release Notes - Version 1.4.2

## Bug Fixes

### Regional Admin Delete Button Fix
- Fixed missing delete button for Regional Admin (RA) users
- Added `venueMasteredCityID` field to event transformation
- Regional Admins can now properly delete events in their assigned cities

### Technical Details
- Updated `transformEvents.js` to include `venueMasteredCityID` from `event.masteredCityId`
- This field is required for RA permission checks in `ViewEventDetailModal.js`
- No backend changes required - the field was already available from the API

## Version Information
- Version: 1.4.2
- Type: Bug fix
- Date: 2025-07-15