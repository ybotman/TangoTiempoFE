# Merge Documentation - v1.7.3
**Date**: 2025-08-15
**Branch**: DEVL → TEST
**Developer**: El Gotan / Ybot

## Summary
Merging UI improvements and bug fixes for Event Organizer Settings and Artists+ features.

## Commits Included (10 commits)
1. `84e5081` - feat: complete UI improvements for Event Organizer and Artists+
2. `cbccc61` - fix: update success message for enabled profiles  
3. `3025a4d` - feat: improve save buttons and add auto-refresh
4. `fb9e939` - feat: improve Event Organizer Settings UI layout
5. `8a5f014` - fix: improve validation feedback for Short Name and Description
6. `cd0e0ff` - fix: update UserSettingsApply status messaging
7. `885c34b` - feat: redesign Event Organizer Settings (TIEMPO-237)
8. `9aec0ef` - feat: complete Apply process refinements (TIEMPO-238)
9. `babb53e` - fix(TIEMPO-230): implement unified location modal for map settings
10. `4929f84` - fix: add retry logic for map ref attachment

## Features Added
### Event Organizer Settings
- Renamed "Regional Organizer Settings" to "Event Organizer Settings"
- Removed city selection functionality completely
- Reorganized Status tab: Profile Activation at top, Mandatory Requirements middle, User Info bottom
- Moved Save buttons to top of Status and Profile pages
- Added auto-refresh when enabling profile
- Dynamic success messages based on enabled state

### Event Creation Modal
- Updated short title limit from 15 to 21 characters
- Added red error states for all mandatory fields (Category, Venue, Description, Title, Short Title, Dates)

### Artists+ Page
- Created new standalone Artists+ page at `/artists-plus`
- Duplicated accordion-style layout from /organizers/apply
- Added colorful icons and backgrounds for each artist type
- Added "Coming Soon" chips for future features
- Added to Information section in hamburger menu

### UI/UX Improvements
- Hide "Apply as Organizer" in hamburger when user is approved and enabled
- Improved validation messages with specific error details
- Better user flow with clear next steps instructions

## Files Modified
- `src/app/components/Modals/CreateEvents/CreateEventDetailsBasic.js`
- `src/app/components/Modals/RegionalOrganizers/RegionalOrganizersModal.js`
- `src/app/components/Modals/RegionalOrganizers/RegionalOrganizersStatus.js`
- `src/app/components/Modals/RegionalOrganizers/RegionalOrganizersProfile.js`
- `src/app/components/Modals/RegionalOrganizers/RegionalOrganizersSettings.js`
- `src/app/components/Modals/UserSettings/UserSettingsApply.js`
- `src/app/components/UI/SidebarDrawer.js`
- `src/app/artists-plus/page.js` (NEW FILE)

## Testing Checklist
- [ ] Event Organizer Settings modal opens correctly
- [ ] Save buttons appear at top of Status and Profile pages
- [ ] Auto-refresh works when enabling profile
- [ ] Validation shows red for incomplete mandatory fields
- [ ] Short title accepts up to 21 characters
- [ ] Artists+ page accessible from hamburger menu
- [ ] Accordion functionality works on Artists+ page
- [ ] "Apply as Organizer" hidden when user is approved/enabled

## Known Issues
None identified

## Rollback Instructions
If rollback is needed:
```bash
git checkout TEST
git reset --hard <previous-commit-hash>
git push --force origin TEST
```

## Next Steps
1. Deploy to TEST environment
2. Perform smoke testing
3. Update JIRA tickets
4. Prepare for PROD deployment if tests pass