# Production Deployment Plan - Version 1.9.x
**Date Created**: September 20, 2025
**Target Deployment**: September 21-22, 2025
**Current Version in Production**: v1.4.4
**Target Version**: v1.9.4

## Executive Summary
This deployment plan outlines the production release of TangoTiempo v1.9.4, representing a massive update with **86 TIEMPO tickets** completed since v1.4.4. This includes major architectural changes for venue filtering, Boston calendar, organizer portal, timezone handling, and extensive performance improvements.

## Pre-Deployment Checklist

### ✅ Backend Dependencies
- **CALBE-53**: Venue filtering API - **DEPLOYED** to production (Sept 18, 2025 @ 3:17 PM)
- Distance-based filtering endpoints available
- Geolocation search functionality operational

### ✅ Completed Features & Fixes (86 Total Tickets)

#### Core v1.9.x Features
- **TIEMPO-276**: Venue filtering system with radius selection
- **TIEMPO-162**: Boston Tango Calendar dedicated view
- **TIEMPO-163**: Organizer Portal with multi-tab interface
- **TIEMPO-160**: Performance improvements (React hook fixes)
- **TIEMPO-279**: Boston calendar visual parity fixes
- **TIEMPO-282**: Role-based route switching
- **TIEMPO-253**: Profile management reimplementation
- **TIEMPO-245**: Short title field support (21 char max)

#### Timezone Architecture Overhaul
- **TIEMPO-239**: Critical timezone display regression fixes
- **TIEMPO-246**: Venue timezone architecture v3
- **TIEMPO-252**: Calendar venue time display
- **TIEMPO-123**: Timezone display corrections
- **TIEMPO-102**: Timezone warnings in event details

#### Performance & Optimization
- **TIEMPO-257**: Request deduplication performance
- **TIEMPO-275**: Console.log cleanup for security
- **TIEMPO-273**: ESLint cleanup (PropTypes)
- **TIEMPO-168**: GeoLocationContext race condition fixes
- **TIEMPO-106**: Console logging reduction

#### Recurring Events Implementation
- **TIEMPO-170**: RRULE recurring events implementation
- **TIEMPO-171**: RRULE UI component integration
- **TIEMPO-172**: FullCalendar RRULE plugin integration
- **TIEMPO-177**: Recurring events exclude dates
- **TIEMPO-178**: Monthly recurrence disable
- **TIEMPO-180**: Recurring events fixes (3 fixes)

#### Regional Admin & Organizer Features
- **TIEMPO-237**: Event Organizer Settings redesign
- **TIEMPO-238**: Apply process refinements
- **TIEMPO-254**: Centralized save state management
- **TIEMPO-272**: Organization modal save fixes
- **TIEMPO-133**: Regional Admin city-level CRUD
- **TIEMPO-149**: RegionalAdmin event creation permissions
- **TIEMPO-159**: RA role permission checks
- **TIEMPO-187**: Regional Admin city validation
- **TIEMPO-219**: Automated organizer workflow

#### UI/UX Improvements
- **TIEMPO-226**: Mobile list view scaling
- **TIEMPO-227**: Menu visibility and text issues
- **TIEMPO-228**: Calendar placeholder text clarity
- **TIEMPO-229**: Map icon visibility
- **TIEMPO-230**: Map scale UI positioning
- **TIEMPO-231**: Settings save button mobile position
- **TIEMPO-232**: Role terminology consistency
- **TIEMPO-233**: Profile settings save buttons
- **TIEMPO-235**: Header image mobile presence
- **TIEMPO-236**: Milonger@ display name
- **TIEMPO-258**: Venue creation button in event modal
- **TIEMPO-259**: Map center menu item
- **TIEMPO-278**: Venue modal improvements
- **TIEMPO-188**: iPhone double-tap fixes
- **TIEMPO-198**: Hamburger menu redesign

#### Event Management Enhancements
- **TIEMPO-100**: Default event times and past date prevention
- **TIEMPO-124**: Cost field in CreateEvent modal
- **TIEMPO-125**: EditEvents with shortTitle support
- **TIEMPO-127**: Image replacement logic
- **TIEMPO-164**: Add event option in click submenu
- **TIEMPO-183**: Event image upload in UPDATE flow
- **TIEMPO-189**: Event description line breaks
- **TIEMPO-190**: Enhanced View Organizer tab
- **TIEMPO-220**: Event description display issues
- **TIEMPO-234**: Create event region selection error
- **TIEMPO-264**: Image handling improvements

#### Authentication & User Management
- **TIEMPO-157**: Firebase authentication Phase 1 & 2
- **TIEMPO-147**: Apple Sign-In user name capture
- **TIEMPO-156**: Email sign-up parameter fixes
- **TIEMPO-196**: Authentication and role change logging
- **TIEMPO-126**: User validation minimums
- **TIEMPO-283**: User 404 retry logic

#### Location & Geolocation
- **TIEMPO-205**: Regions context refactoring
- **TIEMPO-214**: Location API context architecture
- **TIEMPO-135**: Disable automatic location detection
- **TIEMPO-145**: IP geolocation removal
- **TIEMPO-179**: CloudFlare IP geolocation
- **TIEMPO-105**: Boston default location on startup

#### AI & Discovery Features
- **TIEMPO-138**: AI filter customization
- **TIEMPO-139**: AI event details modal

#### Bug Fixes & Validation
- **TIEMPO-101**: List view date visibility fixes
- **TIEMPO-103**: Regional Organizer validation errors
- **TIEMPO-104**: Event image upload 403 fixes
- **TIEMPO-107**: Image upload debugging
- **TIEMPO-153**: RO role event filtering
- **TIEMPO-176**: Category type-ahead and timezone fixes
- **TIEMPO-186**: Select component imports
- **TIEMPO-221**: Legacy region validation blocking
- **TIEMPO-280**: Explorer page API fixes

#### Other Improvements
- **TIEMPO-60**: Mobile modal responsive design
- **TIEMPO-62**: Geo-Diagnostic page in hamburger menu
- **TIEMPO-69**: Mobile responsiveness fixes
- **TIEMPO-99**: Time format standardization
- **TIEMPO-132**: BETA warning enhancements
- **TIEMPO-136**: Quick search functionality
- **TIEMPO-140**: About page updates and debug restrictions
- **TIEMPO-141**: MigratedOrganizer status page
- **TIEMPO-144**: Email beta warning and Facebook status
- **TIEMPO-146**: Release notes UI enhancements
- **TIEMPO-152**: Message Admin page implementation

### 🔄 Current Status
- **Frontend Version**: v1.9.4 (in DEVL/TEST branches)
- **Backend**: Compatible APIs deployed
- **Database**: No migrations required

## Deployment Schedule

### Phase 1: Pre-Production Validation (Sept 20, 2025)
**Time**: 6:00 PM - 8:00 PM EDT
- [ ] Run full test suite on TEST environment
- [ ] Verify all TIEMPO tickets functionality
- [ ] Performance testing with production-like load
- [ ] Security scan completion
- [ ] Backup production database
- [ ] Verify rollback procedures

### Phase 2: Production Deployment (Sept 21, 2025)
**Time**: 2:00 AM - 4:00 AM EDT (Low traffic window)

#### Step 1: Preparation (2:00 AM)
```bash
# Create production backup
npm run backup:prod

# Tag current production version
git tag -a v1.4.4-prod-backup -m "Pre v1.9.4 deployment backup"
git push origin v1.4.4-prod-backup
```

#### Step 2: Deploy Frontend (2:15 AM)
```bash
# Merge to main branch
git checkout main
git merge TEST --no-ff -m "Deploy v1.9.4 to production"

# Build production bundle
npm run build:prod

# Deploy to production
npm run deploy:prod

# Verify deployment
curl https://www.tangotiempo.com/api/health/version
```

#### Step 3: Post-Deployment Validation (2:45 AM)
- [ ] Verify version endpoint returns v1.9.4
- [ ] Test venue filtering functionality
- [ ] Verify Boston calendar loads correctly
- [ ] Check organizer portal access
- [ ] Monitor error rates in logs
- [ ] Performance metrics validation

### Phase 3: Monitoring & Stabilization (Sept 21-22, 2025)
- 24-hour enhanced monitoring period
- Error rate threshold: <0.5%
- Response time target: <2s for calendar load
- Rollback trigger: >2% error rate or critical bug

## Rollback Plan

### Immediate Rollback Procedure
If critical issues are detected within the first 4 hours:

```bash
# Quick rollback to v1.4.4
git checkout v1.4.4-prod-backup
npm run build:prod
npm run deploy:prod

# Verify rollback
curl https://www.tangotiempo.com/api/health/version
```

### Rollback Decision Criteria
- Error rate exceeds 2%
- Critical functionality broken (calendar not loading)
- Security vulnerability discovered
- Database corruption or data loss

## Feature Verification Checklist

### Venue Filtering (TIEMPO-276)
- [ ] Map center modal opens correctly
- [ ] Radius selection works (25, 50, 100, 200 miles)
- [ ] Events filter by distance properly
- [ ] Geolocation permissions handled gracefully

### Boston Calendar (TIEMPO-162, TIEMPO-279)
- [ ] Route `/calendar/boston` loads
- [ ] Visual parity with main calendar
- [ ] Event display matches main calendar format
- [ ] Category circles display correctly

### Organizer Portal (TIEMPO-163)
- [ ] Multi-tab interface functions
- [ ] Profile management works
- [ ] Event creation/editing operational
- [ ] Role-based permissions enforced

### Performance Improvements (TIEMPO-160)
- [ ] No infinite render loops
- [ ] useEvents hook performs efficiently
- [ ] No duplicate API calls
- [ ] Page load time <2 seconds

## Risk Assessment

### High Risk Items
1. **Version Gap**: Jumping 5 minor versions (1.4.4 → 1.9.4)
   - **Mitigation**: Extensive testing in TEST environment

2. **Multiple Major Features**: Several significant features in one deployment
   - **Mitigation**: Feature flags available for gradual rollout if needed

3. **User Experience Changes**: New UI elements and workflows
   - **Mitigation**: User documentation prepared

### Medium Risk Items
1. **Geolocation Permissions**: Browser permission handling
   - **Mitigation**: Graceful fallbacks implemented

2. **Performance Impact**: New features may affect load times
   - **Mitigation**: Performance testing completed, caching optimized

## Success Criteria
- ✅ All features functional in production
- ✅ Error rate <0.5% after 24 hours
- ✅ Page load times <2 seconds
- ✅ No critical bugs reported
- ✅ User adoption metrics positive

## Post-Deployment Tasks
- [ ] Update status page with new version
- [ ] Send deployment notification to stakeholders
- [ ] Update user documentation
- [ ] Schedule retrospective meeting
- [ ] Create JIRA tickets for any discovered issues

## Communication Plan
- **Stakeholders**: Email notification upon successful deployment
- **Users**: In-app notification about new features
- **Support Team**: Briefing on new functionality
- **Development Team**: Slack notification for deployment status

## Approval Sign-offs
- [ ] Development Lead: _________________
- [ ] QA Lead: _________________
- [ ] Product Owner: _________________
- [ ] DevOps: _________________

---
**Document Version**: 1.0
**Last Updated**: September 20, 2025
**Next Review**: Post-deployment retrospective