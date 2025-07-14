# Release Notes - Version 1.3.0

**Release Date:** January 14, 2025  
**Release Type:** Minor Release

## New Features

### Recurring Events Enhancements
- **Monthly Recurrence** - Temporarily disabled with "Coming Soon" message
  - Users can see the option but cannot select it
  - Feature will be enabled in a future release

### Infrastructure Improvements
- **CloudFlare Geolocation** - Prepared infrastructure for IP-based geolocation
  - Added middleware support for CloudFlare headers
  - Created debug menu integration (requires CloudFlare activation)
  - Documentation added for setup process

## Bug Fixes

### Create Event Modal
- Fixed keyboard closing on every keystroke on mobile devices
- Improved input field stability during event creation
- Enhanced user experience for mobile users (85% of our traffic)

### Recurring Events
- Fixed exclude dates functionality for recurring events
- Resolved timezone display issues with excluded dates
- Fixed infinite re-render loop in repeating event details
- Improved exclude dates validation to prevent triggering on keystroke
- Fixed exclude dates not populating correctly in edit mode

## Technical Changes
- Updated middleware to process CloudFlare headers on all routes
- Added useCloudFlareData hook for geolocation data
- Created CloudFlareDebug component for monitoring

## Known Issues
- CloudFlare geolocation requires manual activation in CloudFlare dashboard
- City-level geolocation requires CloudFlare Enterprise plan

## Upgrade Notes
No breaking changes. This is a backward-compatible release.

---
*Commit: Version 1.3.0 - Minor release with recurring event improvements and bug fixes*