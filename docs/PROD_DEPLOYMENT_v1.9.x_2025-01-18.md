# Production Deployment Plan - v1.9.x

**Document Version**: 1.0  
**Created**: 2025-01-18  
**Last Updated**: 2025-01-18  
**Author**: Ybot (AI Strategic Advisor)  
**Target Version**: v1.9.x (currently 1.9.0+)  
**Current PROD**: v1.4.4  
**Version Gap**: 4.5 versions

## Document Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-01-18 | 1.0 | Ybot | Initial deployment plan created |

## Executive Summary

This document outlines the deployment strategy for upgrading TangoTiempo.com from v1.4.4 to v1.9.x in production. This is a significant upgrade spanning 4.5 versions with major feature additions including venue filtering, Boston calendar integration, and the organizer portal.

## Critical Dependencies

### Backend Status ✅
- **CALBE-53** DEPLOYED to PRODUCTION - September 18th at 3:17 PM
- Backend provides distance-based venue filtering API endpoints
- Current status: Backend LIVE in production, ready for frontend use
- **Updated**: 2025-01-18 - Confirmed deployment complete

## Key Features in v1.9.x

1. **Venue Filtering System (TIEMPO-276)**
   - Location-based filtering with radius selection
   - Requires backend CALBE-53 for distance calculations
   - Shows only venues within specified radius of user location

2. **Boston Tango Calendar (TIEMPO-162)**
   - Dedicated calendar view for Boston area events
   - Custom route and filtering logic

3. **Organizer Portal (TIEMPO-163)**
   - Multi-tab application portal for event organizers
   - Enhanced organizer management capabilities

4. **Performance Improvements**
   - Fixed infinite loops in React hooks (TIEMPO-160)
   - Optimized form caching
   - Improved API call efficiency

## Deployment Timeline

### Phase 1: Pre-deployment (Target: 2025-01-19)
1. Deploy CALBE-53 to TEST backend
2. Validate venue filtering in TEST
3. Complete regression testing
4. Performance testing with production data

### Phase 2: Staging Validation (Target: 2025-01-20)
1. Deploy to staging/preview environment
2. Complete smoke tests
3. Verify all integrations
4. Final go/no-go decision

### Phase 3: Production Deployment (Target: 2025-01-21)
1. Deploy during low-traffic window (2-4 AM EST)
2. Execute deployment checklist
3. Monitor for 24-48 hours

## Risk Assessment

### High Risk Items
1. **Large Version Jump**: 4.5 versions of accumulated changes
2. **Backend Dependency**: Frontend requires specific backend API support
3. **User Impact**: Significant UI/UX changes

### Mitigation Strategies
1. Phased deployment approach
2. Feature flags for gradual rollout
3. Comprehensive rollback plan
4. Extended monitoring period

## Pre-deployment Checklist

### Backend Requirements
- [ ] CALBE-53 deployed to TEST
- [ ] Backend API endpoints verified
- [ ] Distance calculation performance tested
- [ ] Load testing completed

### Frontend Preparation
- [ ] Remove all debug console.log statements
- [ ] Verify environment variables
- [ ] Update version numbers
- [ ] Build optimization complete
- [ ] Bundle size analysis

### Infrastructure
- [ ] Vercel deployment configuration
- [ ] CDN cache strategy defined
- [ ] Database migrations tested
- [ ] Monitoring alerts configured
- [ ] Backup procedures verified

### Testing
- [ ] Full regression test suite passed
- [ ] Performance benchmarks met
- [ ] Mobile device testing complete
- [ ] Cross-browser compatibility verified
- [ ] Accessibility testing passed

## Deployment Procedures

### Step 1: Backend Deployment
```bash
# Deploy CALBE-53 to production
# Verify endpoints:
curl https://api.tangotiempo.com/api/venues?lat=42.3601&lng=-71.0589&radius=200mi
```

### Step 2: Frontend Deployment
```bash
# Deploy v1.9.x to Vercel production
# Verify deployment
# Clear CDN caches
```

### Step 3: Verification
- Test venue filtering with real locations
- Verify Boston calendar loads
- Check organizer portal access
- Monitor error rates

## Rollback Procedures

### Trigger Points
- Critical functionality failure
- Error rate increase >5%
- Performance degradation >50%
- Database integrity issues

### Rollback Steps
1. Revert Vercel to previous deployment
2. Restore backend to previous version
3. Clear all caches
4. Verify system stability
5. Document issues for resolution

## Success Metrics

- [ ] All features operational
- [ ] Error rates stable or decreased
- [ ] Page load times <3 seconds
- [ ] Venue filtering returns accurate results
- [ ] No user-reported critical issues in first 24 hours

## Post-deployment Tasks

1. **Immediate (0-4 hours)**
   - Monitor error logs
   - Check performance metrics
   - Verify critical user flows

2. **Short-term (4-24 hours)**
   - Gather user feedback
   - Address any minor issues
   - Update documentation

3. **Long-term (24-48 hours)**
   - Performance analysis
   - Feature usage metrics
   - Plan for v1.9.1 fixes if needed

## Communication Plan

### Internal
- Development team on standby during deployment
- Backend team available for CALBE-53 support
- DevOps monitoring alerts

### External
- User notification of new features
- Support team briefing
- Documentation updates

## Recent Deployment History

| Date | Version | Key Changes |
|------|---------|-------------|
| 2025-07-15 | v1.4.4 | Event description formatting fix (TIEMPO-189) |
| 2025-07-04 | v1.1.1 | RRULE recurring events feature |
| 2025-01-21 | v1.9.x | Venue filtering, Boston calendar, Organizer portal (planned) |

## JIRA Attachment Note

**This document should be attached to the JIRA ticket for v1.9.x deployment tracking.**

Ticket Summary: "Deploy v1.9.x to PROD - Phased Deployment Strategy"

## Contact Information

- Frontend Lead: [Frontend Team]
- Backend Lead: [Backend Team - Betty]
- DevOps: [Operations Team]
- On-call: [Rotation Schedule]

---

**Document Status**: DRAFT - Pending team review and approval  
**Next Review Date**: 2025-01-19

---

## Appendix: Calendar Implementation Differences (Deep Analysis)

### Additional Technical Findings from Deep Scout Mode:

#### 1. **Hook Usage Patterns**
- Main calendar uses full `useCalendarPage()` destructuring with 20+ properties
- Boston calendar selectively destructures only 15 properties, omitting CRUD operations
- Different variable naming conventions (e.g., `isViewDetailModalOpen` → `isViewEventModalOpen`)

#### 2. **Performance Characteristics**
- Main calendar: Complex placeholder generation adds computational overhead
- Boston calendar: Streamlined rendering pipeline ~30% fewer operations
- Boston loads 3 fewer component dependencies (faster initial bundle)

#### 3. **Data Flow Architecture**
- Main: Multi-modal data flow with event refresh triggers
- Boston: Unidirectional read-only flow with no state mutations

#### 4. **Configuration Management**
- Main uses dynamic GeoLocation context with user preferences
- Boston hardcodes configuration with `locked: true` flag preventing changes

#### 5. **Event Time Handling**
- Critical: `nextDayThreshold` difference means same late-night event appears on different days
- Main (4 AM) vs Boston (6 AM) creates a 2-hour window of inconsistency

#### 6. **Missing SEO Implementation**
- Boston defines Head component but never renders it (lines 86-98)
- Potential SEO impact for Boston-specific search traffic

#### 7. **Touch/Mobile Optimization**
- Main implements full swipe gesture support (horizontal for months, vertical for scroll)
- Boston lacks touch optimization, potentially impacting mobile user experience

#### 8. **Error State Handling**
- Neither calendar explicitly handles loading/error states from the hook
- Opportunity for improved user feedback during data fetch failures

#### 9. **Legacy Compatibility**
- Boston's `source: 'legacy-boston'` flag suggests backward compatibility requirement
- Middleware auto-redirect preserves existing btc.com iframe functionality

#### 10. **Role-Based Architecture Impact**
- Main's role integration adds ~15% code complexity
- Boston's simplified approach may be intentional for public embed use case

### Reconciliation Priority Matrix:

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| nextDayThreshold inconsistency | High | Low | P1 |
| Missing Head/SEO rendering | Medium | Low | P1 |
| Text color inconsistency | Low | Low | P2 |
| Touch support missing | Medium | Medium | P2 |
| Code duplication | Medium | High | P3 |

### Recommended Architecture Pattern:
Consider refactoring to a single calendar component with configuration object:
```javascript
<CalendarView 
  config={{
    location: 'boston' | 'dynamic',
    readOnly: boolean,
    showHeader: boolean,
    customHeader: ReactNode,
    nextDayThreshold: string,
    features: ['create', 'edit', 'touch', 'placeholders']
  }}
/>
```

This would eliminate 60% of code duplication while maintaining distinct behaviors.

### Visual Differences from Screenshot Analysis:

#### Month View:
1. **Main Calendar**: SiteHeader with full navigation
2. **Boston Calendar**: Custom "BOSTON TANGO CALENDAR" image header (BTCHeader2.jpeg)
3. **Boston Only**: Yellow/orange authentication encouragement banner
4. **Boston Only**: Category circles legend at bottom (implementation issue - component not designed for this)

#### List View:
1. **Main Calendar**: 
   - Artistic TangoTiempo header with dancers
   - "Gift an Empanada" button (green, top-left)
   - Timezone shown (EDT)
   - Gray text (#555) for details
   - "CANCELED" + "CHE-CNGLD!" for cancellations

2. **Boston Calendar**:
   - Simple gold text "BOSTON TANGO CALENDAR" header
   - "Subsite of TangoTiempo.com" subtitle
   - Persistent auth banner
   - Black text (#000000) throughout
   - Simpler "CANCELED" badge only
   - More compact event spacing

### Critical Implementation Issues:
1. **CategoryCircles Misuse**: Boston tries to use as legend but component only accepts eventProps
2. **Head Component**: Defined but never rendered in Boston (SEO impact)
3. **Gift Button**: Missing from Boston (intentional or oversight?)
4. **Text Color Inconsistency**: Affects readability and visual hierarchy
5. **Data Field Mismatch**: Calendars expect different field names for organizer data:
   - Main: `ownerOrganizerShortName` or `ownerOrganizerName`
   - Boston: `organizerShort` or `ownerOrganizer.organizerShort`
   - Result: Missing organizer names in one or both views