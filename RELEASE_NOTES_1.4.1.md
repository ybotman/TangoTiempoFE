# Release Notes - Version 1.4.1

## Bug Fixes

### Category Updates
- Removed Virtual category from the system
- Added Marathon category with Orange color
- Updated category ordering to better reflect event types:
  - Milonga, Practica, Class now appear first
  - Marathon positioned after Class
  - Festival, Workshop, DayWorkshop follow
  - Trip, Virtual, Other, Unknown at the end

### Technical Details
- Updated `categoryColors.js` to remove Virtual and add Marathon
- Modified `PostFilter.js` to reorder categories
- No database or backend changes required

## Version Information
- Version: 1.4.1
- Type: Bug fix
- Date: 2025-07-15