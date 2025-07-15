# Release Notes - Version 1.4.0

**Release Date:** July 15, 2025  
**Release Type:** Minor Release

## New Features

### Enhanced View Event Modal
- **New Venue Tab** - Dedicated tab with detailed venue information and interactive map
  - Shows complete venue contact details (address, phone, website)
  - Displays venue location on an interactive map
  - Handles missing venue information gracefully
  
- **New Organizer Tab** - Dedicated tab with comprehensive organizer profile
  - Displays organizer profile image and contact information
  - Shows organizer type, location, and bio
  - Includes social media links (Facebook, website)
  - Handles missing organizer information gracefully

### UI Improvements
- **Simplified Tab Structure** - Removed redundant "More" and "Repeating" tabs
  - Cleaner, more focused user interface
  - Better organization of event information
  - Improved mobile experience with fewer tabs

## Technical Changes
- Created new ViewEventDetailsVenue component with map integration
- Created new ViewEventDetailsOrganizer component with profile display
- Removed ViewEventDetailsMore and ViewEventDetailsRepeating components
- Integrated venue and organizer API hooks for real-time data fetching
- Removed RRULE debug console logging for cleaner production logs

## Bug Fixes
- Fixed error handling for events with missing venue or organizer information
- Improved loading states for venue and organizer data fetching

## Known Issues
- Map may not display if venue coordinates are invalid or missing
- Organizer profile images may take time to load on slower connections

## Upgrade Notes
No breaking changes. This is a backward-compatible release that enhances the event viewing experience.

---
*Commit: Version 1.4.0 - Enhanced view event modal with dedicated venue and organizer tabs*