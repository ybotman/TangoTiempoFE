# Retrospective Playbook

## Session: 2025-08-21 - Performance Investigation TIEMPO-257

### Key Learnings

#### 1. JIRA API Direct Access Pattern ✅
**CRITICAL PROCESS OVERRIDE**: When user says "use API not MPC" or "token in security":
```bash
curl -X POST \
  -H "Authorization: Basic $(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)" \
  -H "Content-Type: application/json" \
  -d '{"body": "comment text"}' \
  "${JIRA_BASE_URL}/rest/api/2/issue/TICKET-ID/comment"
```
- Environment variables: JIRA_EMAIL, JIRA_API_TOKEN, JIRA_BASE_URL
- More reliable than MCP for high-volume operations
- Always use direct API when explicitly requested

#### 2. HAR File Performance Analysis Success
- Parse HAR files with jq for performance metrics
- Extract slowest requests: `jq '.log.entries | sort_by(.time) | reverse'`
- Group by endpoint to find duplicates
- Identified 80+ seconds of redundant API calls from 6.8MB HAR file

#### 3. Duplicate API Call Pattern Recognition
**Critical Finding**: Multiple hooks fetching same data independently
- AuthContext.js: Fetches /api/userlogins on auth state change
- useUsers.js: DUPLICATES same /api/userlogins call
- useEvents.js: 13-item dependency array causes constant re-fetches
- Result: 17 userlogin calls, 6 event calls, 6 venue calls

#### 4. React Hook Optimization Needed
- Massive dependency arrays cause re-render cascades
- No request deduplication or caching
- Components fetch data independently instead of sharing
- Missing singleton pattern for API requests

### What Worked Well
1. Direct JIRA API with environment variables
2. HAR file analysis with jq
3. Systematic Scout investigation
4. Clear JIRA documentation with metrics

### What Needs Improvement
1. Implement request deduplication singleton
2. Add response caching with TTL
3. Optimize React hook dependencies
4. Create shared data context pattern

### Metrics Target
- API calls: 37 → 5-7 (85% reduction)
- Data transfer: 6.8MB → <1MB
- Page load: 7+ seconds → <2 seconds

### Process Improvements for Future Sessions
1. **Always check for "API DIRECT" or "token in security" mentions** - Override MCP
2. Create reusable JIRA API wrapper functions
3. Use HAR file analysis for all performance investigations
4. Document duplicate call patterns in hooks immediately

## Previous Session Learnings

### Timezone Implementation (TIEMPO-246, TIEMPO-252)
- Display all events in venue timezone, not browser timezone
- Use string manipulation to avoid Date() conversions
- Backend provides venueStartDisplay, venueEndDisplay fields
- Set FullCalendar timezone="UTC" to prevent conversions

### Profile Management (TIEMPO-253, TIEMPO-254)
- Centralized state management across modal tabs
- Event emitter pattern for cross-component communication
- Proper "Next Steps" dialog flow after application
- Check isEnabled status for profile completion

### Git Strategy
- Always commit to feature branches first
- Merge to TEST for testing
- Never push directly to MAIN
- Include JIRA ticket numbers in commit messages