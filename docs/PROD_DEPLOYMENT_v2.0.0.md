# PRODUCTION DEPLOYMENT v1.10.0
## TEST → PROD Migration Plan

### Executive Summary
- **Current PROD Version**: v1.4.5
- **Current TEST Version**: v1.9.0
- **Target PROD Version**: v1.10.0 (Feature bump only - Boston route)
- **Commits to Deploy**: 183
- **Files Changed**: 231 files (+21,649 insertions, -12,273 deletions)

### Major Features Included

#### 1. TIEMPO-279: Boston Calendar Route
- New `/calendar/boston` endpoint for iframe compatibility
- Full visual parity with main calendar
- 200-mile radius for New England coverage
- Required by bostontangocalendar.com

#### 2. TIEMPO-276: Venue Location Filtering
- Frontend: Distance-based venue filtering ✅
- User location integration ✅
- Performance improvements via dedupeFetch ✅
- **Backend Required**: TIEMPO-277 (venue API changes)

#### 3. Performance & Bug Fixes
- TIEMPO-283: User settings undefined errors
- TIEMPO-257: API call deduplication
- ESLint cleanup (199 errors fixed)
- Console error flood fixes

### Database Migration Requirements

#### MongoDB Collections Affected
1. **venues** collection
   - New fields: timezone, timezoneAbbr
   - Coordinate indexing for location queries
   
2. **events** collection
   - venueTimezone field additions
   - Legacy field compatibility (locationID → venueId)

#### Migration Scripts Required
```bash
# Backend migration scripts needed:
# 1. Add timezone fields to venues
# 2. Backfill timezone data from coordinates
# 3. Create geospatial indexes for venues
# 4. Update event venue references
```

### Pre-Deployment Checklist

#### Backend Requirements
- [ ] Deploy TIEMPO-277 backend (venue filtering API)
- [ ] Deploy TIEMPO-215 backend (map-based venue GET)
- [ ] Run MongoDB migration scripts
- [ ] Verify geospatial indexes created
- [ ] Test venue API with location parameters

#### Frontend Testing
- [ ] Test Boston route at test.tangotiempo.com/calendar/boston
- [ ] Verify venue dropdown with location filtering
- [ ] Check no console errors in TEST
- [ ] Test on mobile devices (85% of traffic)
- [ ] Verify iframe embedding works

### Deployment Steps

1. **Pre-deployment (1 hour before)**
   ```bash
   # Create database backup
   mongodump --uri="$MONGO_URI" --out=backup-$(date +%Y%m%d-%H%M%S)
   
   # Tag current PROD for rollback
   git tag -a prod-backup-v1.4.5 -m "PROD backup before v2.0.0"
   git push origin prod-backup-v1.4.5
   ```

2. **Backend Deployment**
   - Deploy backend changes for TIEMPO-277
   - Run MongoDB migration scripts
   - Verify API endpoints responding

3. **Frontend Deployment**
   ```bash
   # Create PR from TEST to PROD
   gh pr create --base PROD --head TEST --title "v2.0.0: Boston Calendar & Venue Filtering"
   
   # After approval, merge
   gh pr merge --merge
   
   # Deploy to Vercel
   vercel --prod
   ```

4. **Post-deployment Verification**
   - [ ] Test tangotiempo.com/calendar/boston
   - [ ] Verify bostontangocalendar.com iframe
   - [ ] Check venue filtering with location
   - [ ] Monitor error logs for 30 minutes
   - [ ] Test event creation with new venue selection

### Rollback Strategy

#### Immediate Rollback (< 5 minutes)
```bash
# Revert to previous PROD
git checkout PROD
git reset --hard prod-backup-v1.4.5
git push --force origin PROD

# Redeploy on Vercel
vercel --prod
```

#### Database Rollback
```bash
# Only if migration caused issues
mongorestore --uri="$MONGO_URI" --drop backup-[timestamp]/

# Remove new indexes if needed
mongo "$MONGO_URI" --eval "db.venues.dropIndex('location_2dsphere')"
```

#### Partial Feature Disable
If only Boston route causes issues:
1. Deploy hotfix to disable /calendar/boston route
2. Keep venue filtering active
3. Investigate and fix offline

### Risk Assessment

#### High Risk Items
1. **Venue API Performance**: New location queries may impact performance
   - Mitigation: Geospatial indexes, query optimization
   
2. **Boston Route Iframe**: Cross-origin issues possible
   - Mitigation: CORS headers configured, tested in TEST

#### Medium Risk Items
1. **Mobile Experience**: 85% of users on mobile
   - Mitigation: Extensive mobile testing completed
   
2. **MongoDB Migration**: Timezone field additions
   - Mitigation: Backward compatible, optional fields

#### Low Risk Items
1. **ESLint fixes**: Code quality improvements
2. **Performance optimizations**: dedupeFetch implementation

### Success Metrics
- [ ] No increase in error rate (< 0.1%)
- [ ] API response time < 2s for venue queries
- [ ] Boston calendar loads in < 3s
- [ ] No user complaints in first 24 hours

### Stakeholder Communication
1. **Pre-deployment** (2 hours before):
   - Email to admin team
   - Slack notification to #deployments
   
2. **During deployment**:
   - Update status in #deployments
   
3. **Post-deployment**:
   - Confirmation email with test links
   - Monitor #support for issues

### Emergency Contacts
- Frontend Lead: [Contact]
- Backend Lead: [Contact]  
- DevOps: [Contact]
- Product Owner: El Gotan

### Version History
- v1.4.5 → v2.0.0 (Major release)
- Justification: New Boston route is significant feature addition
- Next version: v2.1.0 (planned timezone improvements)