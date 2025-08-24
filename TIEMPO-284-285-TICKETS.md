# JIRA Tickets for Manual Creation

## TIEMPO-284: Event-driven auth architecture

**Type:** Task
**Priority:** High
**Sprint:** Current Sprint
**Labels:** auth, architecture, event-driven

### Summary
Event-driven auth architecture

### Description

#### Background
Currently, AuthContext and useUsers operate independently, creating race conditions where:
- User creation may conflict with user fetching operations
- Failed user creation doesn't properly communicate back to useUsers
- Cache invalidation isn't coordinated between auth operations

#### Requirements
Implement event-driven coordination where:

1. **AuthContext signals "user creating"** → useUsers pauses fetching operations
2. **AuthContext signals "user created"** → useUsers invalidates cache and refetches
3. **AuthContext signals "creation failed"** → useUsers uses exponential backoff retry logic

#### Benefits
- Eliminates race conditions between auth and user data operations
- Provides cleaner separation of concerns
- Improves reliability of auth flow
- Better error handling and recovery

#### Related Work
- TIEMPO-283 (hotfix) is already complete and merged to TEST

---

## TIEMPO-285: Admin user sync tools

**Type:** Task
**Priority:** Medium
**Sprint:** Next Sprint
**Labels:** admin-tools, user-sync, firebase, mongodb

### Summary
Admin user sync tools

### Description

#### Background
Manual data cleanup and system migrations can create orphaned users where Firebase auth records exist without corresponding MongoDB user documents, or vice versa.

#### Requirements
Create comprehensive admin tools for user synchronization:

1. **Firebase → MongoDB sync function**
   - Scan for Firebase users missing in MongoDB
   - Create corresponding MongoDB user documents
   - Handle edge cases and data validation

2. **Admin UI for sync management**
   - Dashboard showing sync status and mismatches
   - Manual trigger for sync operations
   - Resolution tools for orphaned users

3. **Monitoring and alerting**
   - Detect auth mismatches automatically
   - Alert admins to sync issues
   - Provide reports on user data integrity

4. **Error handling and logging**
   - Comprehensive logging of sync operations
   - Rollback capabilities for failed syncs
   - Audit trail for admin actions

#### Benefits
- Resolves user authentication issues caused by data inconsistencies
- Provides tools for ongoing maintenance
- Prevents manual data cleanup from breaking auth
- Improves system reliability

#### Related Work
- TIEMPO-283 (hotfix) is already complete and merged to TEST
- TIEMPO-284 should be completed first as it establishes the event-driven foundation

---

## Implementation Order
1. **TIEMPO-283** ✅ COMPLETE - Hotfix user 404 cache (merged to TEST)
2. **TIEMPO-284** 🔴 HIGH - Event-driven auth architecture (This Sprint)
3. **TIEMPO-285** 🟡 MEDIUM - Admin user sync tools (Next Sprint)

## Action Required
Please create these tickets manually in JIRA with the above specifications.