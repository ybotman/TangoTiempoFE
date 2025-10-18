# Retrospective Playbook

## Session: 2025-10-16 - Login Tracking Timezone Fix & Laptop/Desktop Sync Issue

### Key Learnings

#### Login Tracking Missing Timezone Data (TIEMPO-314) ⚠️
**PROBLEM**: Frontend sending timezone but NOT timezoneOffset, causing null local time fields in MongoDB

**Root Cause**:
- JIRA comment from Oct 16 AM said fix was applied to lines 101-104
- Code on laptop was missing the fix completely - no request body in login tracking call
- Frontend was only sending headers, no body with timezone data
- Backend requires both `timezone` and `timezoneOffset` to calculate `hourOfDayLocal` and `dayOfWeekLocal`

**Fix Applied** (src/app/contexts/AuthContext.js:101-104):
```javascript
body: JSON.stringify({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneOffset: -new Date().getTimezoneOffset() // Negate because JS returns opposite sign
})
```

**JavaScript Timezone Quirk**:
- `getTimezoneOffset()` returns OPPOSITE sign from UTC offset
- EDT (UTC-4) returns `240` minutes
- Must negate: `-new Date().getTimezoneOffset()` = `-240` for backend

**CRITICAL DISCOVERY - Laptop vs Desktop Sync Issue** 🚨:
- Previous JIRA comment said fix was applied, but code was missing on laptop
- Possible causes:
  1. Fix committed on desktop but not pushed to origin
  2. Laptop branch diverged from desktop branch
  3. Changes uncommitted on desktop
  4. Git status not checked before switching machines

**PROCESS FIX FOR FUTURE**:
1. Always run `git status` before leaving a machine
2. Always run `git fetch && git status` when switching machines
3. Check for uncommitted changes on both machines before starting work
4. Push frequently to keep laptop and desktop in sync
5. Use `git log origin/BRANCH..HEAD` to check if local commits need pushing

### What Worked Well
1. Patch Mode applied fix quickly
2. JIRA updated with clear documentation
3. Problem identified through Azure Function debug output

### What Needs Improvement
1. Better git workflow between laptop and desktop
2. Push commits more frequently
3. Verify JIRA comments match actual code state

### Process Improvements for Future Sessions
1. **ALWAYS check git status on both machines during sync**
2. Run `git status` before closing laptop/desktop session
3. Push all commits before switching machines
4. Use `git fetch` first thing when opening laptop/desktop
5. When JIRA says "fix applied" - verify code actually has the fix

---

## Session: 2025-10-12 - JIRA Tools API v3 Migration & Script Fixes

### Key Learnings

#### JIRA Tools Scripts Fixed for API v3 ✅
**SUCCESS**: Fixed 2 broken scripts and tested all 15 scripts

**Problem Discovered**: JIRA deprecated `/rest/api/3/search` endpoint in favor of `/rest/api/3/search/jql`

**Scripts Fixed**:
1. `.ybotbot/jira-tools/jira-search.sh` - Line 40 (endpoint + fields parameter)
2. `.ybotbot/jira-tools/jira-get-epic-issues.sh` - Line 38 (endpoint + fields parameter)

**Key Changes Made**:
```bash
# OLD (broken):
response=$(jira_request GET "/search?jql=$ENCODED_JQL&maxResults=$MAX_RESULTS")
TOTAL=$(echo "$response" | extract_field '.total')

# NEW (working):
response=$(jira_request GET "/search/jql?jql=$ENCODED_JQL&maxResults=$MAX_RESULTS&fields=key,summary,status,assignee,reporter,priority,created,updated")
TOTAL=$(echo "$response" | jq -r '.issues | length')
```

**Critical API v3 Discovery**:
- `/search/jql` returns ONLY `id` by default - MUST include `fields` parameter
- `.total` no longer exists in response - use `.issues.length` instead
- Pagination changed: `nextPageToken` and `isLast` instead of `startAt`

**Testing Results**:
- ✅ jira-search.sh: Returns full ticket data with fields
- ✅ jira-get.sh: Works correctly (already compatible)
- ✅ jira-get-epic-issues.sh: Finds epic children correctly
- ✅ All other 12 scripts: Already compatible (use different endpoints)

**Documentation Created**:
- `.ybotbot/jira-tools/MIGRATION_GUIDE_API_V3.md` (comprehensive guide)
- JIRA Ticket TIEMPO-309 created for tracking rollout to other projects

**CRITICAL INSTRUCTION FOR FUTURE SESSIONS**:
When using jira-tools scripts:
1. Always export authentication environment variables first:
   ```bash
   export JIRA_EMAIL="toby.balsley@gmail.com"
   export JIRA_API_TOKEN=$(security find-generic-password -a "toby.balsley@gmail.com" -s "jira-api-token" -w 2>/dev/null)
   export JIRA_BASE_URL="https://hdtsllc.atlassian.net"
   ```
2. Scripts are ready to use: `.ybotbot/jira-tools/jira-search.sh`, `jira-get.sh`, `jira-create.sh`, etc.
3. For direct API calls, MUST include `fields` parameter in `/search/jql` endpoint
4. See applicationPlaybook.md for updated JIRA integration patterns

### What Worked Well
1. Systematic research of all 15 scripts to identify issues
2. Grep to find all API endpoint usage patterns
3. Testing each script with real JIRA queries after fixes
4. Comprehensive migration guide for other projects
5. JIRA ticket created for tracking (TIEMPO-309)

### What Needs Improvement
1. Could have created tests to prevent future breakage
2. Should automate detection of deprecated API endpoints

### Process Improvements for Future Sessions
1. **ALWAYS check applicationPlaybook.md for JIRA patterns FIRST**
2. Use `.ybotbot/jira-tools/` scripts instead of direct API when possible
3. When scripts fail, check for JIRA API deprecations/changes
4. Update playbooks immediately after fixing systemic issues
5. Create JIRA tickets to track rollout of fixes to other projects

#### JIRA Comment Formatting Issues ⚠️
**PROBLEM**: jira-comment.sh fails with "There was an error parsing JSON" when comment text contains special formatting

**Failure Pattern** (2025-10-12 session):
```bash
# FAILED - Complex formatting with bullets, line breaks, special chars
.ybotbot/jira-tools/jira-comment.sh TIEMPO-311 "🧭 Scout Mode - Investigation Complete

**Calendar Page Structure** (src/app/calendar/page.js):
- Modal states available at lines 66-90:
  • isCreateModalOpen
  • isViewDetailModalOpen..."

# Error: "There was an error parsing JSON"
```

**Success Pattern**:
```bash
# SUCCEEDED - Simple single-line text, no special formatting
.ybotbot/jira-tools/jira-comment.sh TIEMPO-311 "Scout Mode - Investigation Complete. Calendar page has modal states at lines 66-90 (isCreateModalOpen, isViewDetailModalOpen, isAIDetailModalOpen). GeoLocationContext imported at line 50..."
```

**Root Cause**:
- jira-comment.sh uses ADF (Atlassian Document Format) via `text_to_adf` function
- Function wraps text in paragraph structure but doesn't handle:
  - Multi-line strings with actual line breaks
  - Special characters that need JSON escaping (quotes, bullets, etc.)
  - Markdown-style formatting (**, -, •)

**Working Solution**:
1. **Keep comments simple**: Single-line or continuous text
2. **Avoid special chars**: No bullets (•), no markdown (**), no unescaped quotes
3. **Use plain punctuation**: Commas and periods instead of bullets
4. **Test incrementally**: If comment fails, simplify and retry

**CRITICAL INSTRUCTION FOR FUTURE SESSIONS**:
When adding JIRA comments via jira-comment.sh:
1. Use plain text without special formatting
2. Convert bullets to comma-separated lists
3. Replace line breaks with periods/commas
4. Avoid emojis at start of text (can cause issues)
5. If error occurs, simplify text and retry immediately
6. For complex formatting, consider using JIRA web UI instead

**Example Conversion**:
```bash
# BAD - Will fail
"**Bold Text**
- Bullet point
• Another bullet"

# GOOD - Will work
"Bold Text. Bullet point. Another bullet."
```

---

## Session: 2025-10-05 - Geolocation Gap Analysis & JIRA API Authentication

### Key Learnings

#### JIRA API Authentication Issues ⚠️
**PROBLEM DISCOVERED**: Multiple authentication token formats in keychain causing confusion

**Keychain Entries Found:**
```bash
# Entry 1: "jira-api-token" with account "tobybalsley"
security find-generic-password -s "jira-api-token" -w
# Returns: ATATT3xFfGF0... (Bearer token format)

# Entry 2: "jira-email"
security find-generic-password -s "jira-email" -w
# Returns: tobybalsley@me.com

# Historical entry: account "toby.balsley@gmail.com" (from 2025-01-28 session)
```

**Authentication Errors Encountered:**
1. Bearer token format tried with Basic Auth → "Failed to parse Connect Session Auth Token"
2. Basic Auth with tobybalsley@me.com → "Client must be authenticated to access this resource"
3. Permission error → "You do not have permission to create issues in this project"

**ROOT CAUSE**: Token stored in keychain appears to be Bearer/OAuth format, not API token for Basic Auth

**CORRECT PATTERN** (from 2025-01-28 session):
```bash
# Use toby.balsley@gmail.com account (not tobybalsley@me.com)
JIRA_EMAIL="toby.balsley@gmail.com"
JIRA_API_TOKEN=$(security find-generic-password -a "toby.balsley@gmail.com" -s "jira-api-token" -w)

curl -X POST \
  -H "Authorization: Basic $(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)" \
  -H "Content-Type: application/json" \
  -d @payload.json \
  "https://hdtsllc.atlassian.net/rest/api/2/issue"
```

**KEY DISCOVERIES:**
- MCP JIRA tools confirmed broken - NEVER use them
- Multiple email accounts in keychain (tobybalsley@me.com vs toby.balsley@gmail.com)
- Must use account name flag `-a` when retrieving token from keychain
- REST API v2 works, v3 may have permission issues
- JIRA base URL is hdtsllc.atlassian.net (not tobybalsley.atlassian.net)

**CRITICAL INSTRUCTION FOR FUTURE SESSIONS:**
When user says "use API directly and mac security creds, NOT MCP":
1. Check retrospectivePlaybook for working pattern
2. Use toby.balsley@gmail.com account (from 2025-01-28 success)
3. Retrieve token with `-a "toby.balsley@gmail.com"` flag
4. Use /rest/api/2/ endpoint (v2), not v3
5. Always test auth with `/rest/api/2/myself` first
6. Never assume MCP tools work - they are broken

#### Geolocation Implementation Gap Analysis ✅
**SUCCESS**: Created comprehensive documentation for multi-LLM collaboration

**Documents Created:**
1. `docs/GEOLOCATION_GAP_ANALYSIS.md` (851 lines) - Complete gap analysis
2. `docs/JIRA_EPIC_Google_Geolocation_Spec.md` (850+ lines) - Full Epic specification
3. `docs/JIRA_CREATION_SUMMARY.md` - Executive summary
4. `docs/JIRA_QUICK_CREATE_GUIDE.md` - Copy-paste ready descriptions
5. `docs/JIRA_IMPORT_READY.json` - Structured JSON

**Multi-LLM Collaboration Features:**
- Self-contained stories (no conversation history needed)
- Clear acceptance criteria (testable, unambiguous)
- Step-by-step tasks (numbered with time estimates)
- Reference documents (all specs linked)
- Definition of done (measurable completion criteria)

**Key Finding**: Google Geolocation API guideline describes comprehensive implementation that was never built. Actual system used ipapi.co (removed Jun 2025), now fully manual map-based selection.

**Epic Structure:**
- Story 1: Google Cloud setup (0.5 days)
- Story 2: Backend /api/geo/ip-firstfix (2 days)
- Story 3: Frontend Band A/B/C logic (2 days)
- Story 4: FinalCenter persistence + telemetry (1.5 days)
- Story 5: Testing + cleanup (1 day)
- **Total: 7 days (1.4 developer-weeks)**

### What Worked Well
1. Comprehensive gap analysis with git history + documentation review
2. Self-contained story structure for multi-LLM handoff
3. Clear technical debt identification
4. Band-based accuracy gating design (A/B/C)

### What Needs Improvement
1. JIRA API authentication pattern needs clarification in keychain
2. Need single source of truth for JIRA credentials
3. Should test JIRA auth BEFORE attempting Epic creation
4. Consider storing working curl commands in `.ybotbot/jira-tools/`

### Process Improvements for Future Sessions
1. **ALWAYS check retrospectivePlaybook for JIRA auth pattern FIRST**
2. Test auth with `/rest/api/2/myself` before creating issues
3. Use `-a` flag with email when retrieving keychain passwords
4. Prefer /rest/api/2/ over /rest/api/3/ for compatibility
5. Document which email account has working JIRA permissions

---

## Session: 2025-01-28 - Participant Types Architecture & JIRA Integration

### Key Learnings

#### JIRA Integration with macOS Keychain ✅
**SUCCESS PATTERN**: Using security command to retrieve stored tokens:
```bash
# Tokens stored in macOS keychain (found 2 entries)
JIRA_API_TOKEN=$(security find-generic-password -a "toby.balsley@gmail.com" -s "jira-api-token" -w 2>/dev/null)
JIRA_EMAIL="toby.balsley@gmail.com"

# Create epic using direct API (MCP is broken)
curl -s -X POST \
  -H "Authorization: Basic $(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)" \
  -H "Content-Type: application/json" \
  -d '{"fields": {...}}' \
  "https://hdtsllc.atlassian.net/rest/api/2/issue"
```

**Key Discoveries:**
- MCP JIRA functions are broken - always use direct API
- Tokens stored with account name "toby.balsley@gmail.com" in keychain
- Successfully created TIEMPO-296 epic
- Bash scripts in `./.ybotbot/jira-tools/` need env vars but API calls work directly

**Process That Works:**
1. Check keychain for tokens: `security find-generic-password -s "jira-api-token"`
2. Use bash script with token retrieval from keychain
3. Parse response with jq: `| jq -r '.key // .errorMessages // .errors'`
4. Always use hdtsllc.atlassian.net (not tobybalsley.atlassian.net from .jira-config)

### Architecture Design Success
- Strategic advisor agent provided excellent framework
- Brainstorm agent generated creative participant type ideas
- Clear separation: flags on users, capabilities in code
- Document-first approach before implementation

---

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