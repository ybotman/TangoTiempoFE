# Deployment Tracking - v1.9.5
**Date:** September 23, 2025
**Version:** 1.9.5 (Patch Release)

---

## Release Summary
**TIEMPO-284**: Fix Organizer Profile Validation - Frontend fetches from wrong location

### Changes Made:
1. **CreateEventDetailModal.js**
   - Fixed validation to fetch organizer data from correct collection
   - Now properly validates shortName and description from organizers collection
   - Removed debug console.log statements

2. **RegionalOrganizersModal.js**
   - Added 409 conflict handling for duplicate shortName errors
   - User-friendly error messages when name is taken

### Technical Details:
- **Problem**: Validation expected shortName/description in userLogins.regionalOrganizerInfo
- **Solution**: Fetch from organizers collection where data actually exists
- **Impact**: Users with complete profiles can now edit events

### Deployment Sequence:
1. ✅ Backend deployed to TEST (CALBE-60)
2. 🔄 Frontend deploying to TEST (TIEMPO-284)
3. ⏳ Production deployment after TEST validation

### Testing:
- **DEVL**: ✅ Tested successfully
- **TEST**: 🔄 In progress
- **PROD**: ⏳ Pending

### Affected Users:
- Tango Affair (Simonida Cekovic-Vuletic)
- All Regional Organizers with complete profiles

### Risk Assessment:
- **Risk Level**: LOW
- **Confidence**: 92%
- **Rollback Plan**: Revert to v1.9.4 if issues arise

---

## Commit History
- fix(TIEMPO-284): Fix organizer profile validation - fetch from correct collection
- chore: Remove debug console.log statements
- chore: Bump version to 1.9.5

## JIRA References:
- Frontend: [TIEMPO-284](https://hdtsllc.atlassian.net/browse/TIEMPO-284)
- Backend: [CALBE-60](https://hdtsllc.atlassian.net/browse/CALBE-60)