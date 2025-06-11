# JIRA Strategy for AI-Guild

## STARTUP TEST (Important First STEP to JIRA connection)
**You must TEST the JIRA tools to check connection when you have read this document**

### Quick Connection Test
```bash
# Run from project root
source .jira-config
./public/AI-Guild/Scripts/jira-tools/jira-search.sh "assignee=currentUser()"
```

### Authentication Setup
- The `.jira-config` is in the project root
- **API token is stored in macOS keychain** (not in .jira-config file)
- Scripts handle authentication automatically via `jira-common.sh`

### Full Authentication Flow (if needed)
```bash
source .jira-config && JIRA_API_TOKEN=$(security find-generic-password -a "$(whoami)" -s "jira-api-token" -w)
```

---

## 🔧 How to Use JIRA Tools Correctly

### Script Usage (Always run from project root)
```bash
# Comments
./public/AI-Guild/Scripts/jira-tools/jira-comment.sh TIEMPO-60 CRK "Your comment"

# Worklog
./public/AI-Guild/Scripts/jira-tools/jira-worklog.sh add TIEMPO-60 Builder "2h" "Fixed modal"

# Search
./public/AI-Guild/Scripts/jira-tools/jira-search.sh "assignee=currentUser()"

# Ticket Summary
./public/AI-Guild/Scripts/jira-tools/jira-ticket-summary.sh TIEMPO-60
```

### What Happens Behind the Scenes
1. `jira-common.sh` sources `.jira-config`
2. Gets the token from keychain as `JIRA_TOKEN`
3. All scripts use this `JIRA_TOKEN` internally
4. **No need to set JIRA_API_TOKEN manually**

### Known "Error" Messages (Ignore These)
- **"JSON parsing error"** is cosmetic - the `jq` command parsing the response
- **As long as you see "✅ Comment added" or "✅ Logged time", it worked**
- **No fix needed - just ignore the JSON error message**

---

## Core Concepts

### JIRA Issue Types
- **Bug**: Defects, fixes, small improvements (replaces IFE Issues)
- **Task**: Technical work items, refactoring, documentation
- **Story**: User-facing features and enhancements (replaces IFE Features)
- **Epic**: Large multi-phase efforts with architectural impact (replaces IFE Epics)

### JIRA Workflow States
1. **To Do**: Work not yet started
2. **In Progress**: Actively being worked on
3. **In Review**: Code complete, awaiting review
4. **Done**: Completed and verified

### Labeling Strategy
Every ticket should have:
1. **Work Type Label**: `broken`, `new-feature`, `enhancement`, `tech-debt`
2. **Domain Label**: `domain-events`, `domain-venues`, `domain-users`, `domain-auth`, etc.
3. **Additional Labels**: `frontend`, `backend`, `api`, `database` as appropriate

---

## Creating Work Items

### When to Create Each Type

| Situation | JIRA Type | Example |
|-----------|-----------|---------|
| Something is broken | Bug | "Login button not responding on mobile" |
| New user-facing capability | Story | "Add event filtering by date range" |
| Technical work (non-user facing) | Task | "Refactor context providers" |
| Multi-phase architectural change | Epic | "Migrate to new authentication system" |

### Using jira-create-classified.sh
```bash
# Bug fix
./jira-create-classified.sh "Fix login button on mobile" "broken" "auth" "Button doesn't respond to clicks on iOS devices"

# New feature
./jira-create-classified.sh "Add date range filter" "new-feature" "events" "Users need to filter events by custom date ranges" "Story"

# Technical task
./jira-create-classified.sh "Refactor auth context" "tech-debt" "auth" "Consolidate duplicate auth logic" "Task"
```

---

## Git Integration

### Branch Naming Convention
| JIRA Type | Branch Format | Example |
|-----------|---------------|---------|
| Bug | `bugfix/PROJ-123-short-description` | `bugfix/TIEMPO-101-fix-login-mobile` |
| Task | `task/PROJ-123-short-description` | `task/TIEMPO-102-refactor-auth` |
| Story | `feature/PROJ-123-short-description` | `feature/TIEMPO-103-date-filter` |
| Epic | `epic/PROJ-123-phase-N-description` | `epic/TIEMPO-104-phase-1-db-migration` |

### Git Workflow
1. **Start from DEVL branch**
2. **Create feature branch** with JIRA ticket number
3. **First commit** must reference JIRA ticket
4. **Update JIRA status** as work progresses
5. **Log time by role** using jira-worklog.sh
6. **Create PR** with JIRA ticket in title
7. **Merge to DEVL** after review
8. **Update JIRA to Done**

### Commit Message Format
```
TIEMPO-123: Brief description of change

- Detailed point 1
- Detailed point 2

AI-Guild Role: Builder
```

---

## AI-Guild Role Integration

### Time Logging by Role
Always log work with the appropriate AI-Guild role:

```bash
# Scout investigation
./jira-worklog.sh add "TIEMPO-123" "Scout" "30m" "Investigated existing code and requirements"

# Architect design
./jira-worklog.sh add "TIEMPO-123" "Architect" "1h" "Designed component architecture and data flow"

# Builder implementation
./jira-worklog.sh add "TIEMPO-123" "Builder" "2h" "Implemented feature with tests"

# CRK review
./jira-worklog.sh add "TIEMPO-123" "CRK" "45m" "Code review and knowledge documentation"
```

### Role Workflow in JIRA
1. **Scout**: Investigation phase (To Do → In Progress)
2. **Architect**: Design phase (add design notes to ticket)
3. **Builder**: Implementation (main development work)
4. **CRK**: Review phase (In Progress → In Review → Done)

---

## Epic Management

### Epic Structure in JIRA
Epics in JIRA maintain the phased approach from IFE:

1. **Create Epic** with clear phases defined in description
2. **Create child tickets** for each phase
3. **Work one phase at a time**
4. **Complete phase** before starting next

### Epic Documentation
Store detailed Epic documentation in the codebase:
- Location: `/docs/epics/EPIC-{number}-{title}/`
- Include: Architecture diagrams, phase plans, rollback strategies
- Reference in JIRA Epic description

### Phase Tracking
Use JIRA's Epic functionality:
- Epic contains all phase tickets
- Each phase is a separate Story/Task under the Epic
- Track progress through JIRA's Epic burndown

---

## Daily Workflow

### Start of Day
```bash
# Check your in-progress work
./jira-search.sh "assignee=currentUser() AND status='In Progress'"

# Check tickets in review
./jira-search.sh "project=TIEMPO AND status='In Review'"
```

### Taking New Work
1. Check for high-priority items first
2. Assign ticket to yourself in JIRA
3. Transition to "In Progress"
4. Create feature branch
5. Start logging time by role

### Completing Work
1. Ensure all tests pass
2. Create PR with JIRA reference
3. Transition to "In Review"
4. Log final time entries
5. After merge, transition to "Done"

---

## Search Queries (JQL)

### Common Searches
```bash
# My open tickets
./jira-search.sh "assignee=currentUser() AND status NOT IN ('Done', 'Closed')"

# Broken items in frontend
./jira-search.sh "labels IN (broken, frontend) AND status != 'Done'"

# This sprint's work
./jira-search.sh "sprint in openSprints() AND project=TIEMPO"

# Unassigned high priority
./jira-search.sh "priority = High AND assignee is EMPTY"
```

---

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### "Scripts return no output"
- **Cause**: Running from wrong directory
- **Solution**: Always run from project root where `.jira-config` exists

#### "Authentication errors"
- **Cause**: Token not in keychain or config issues
- **Solution**: 
  ```bash
  # Check if token exists
  security find-generic-password -a "$(whoami)" -s "jira-api-token" -w
  
  # Re-source config
  source .jira-config
  ```

#### "Empty search results"
- **Cause**: JQL syntax or status name issues
- **Solution**: Start simple, then add complexity
  ```bash
  # Start with basic query
  ./jira-search.sh "assignee=currentUser()"
  
  # Filter results with jq instead of complex JQL
  ./jira-search.sh "project=TIEMPO" | jq '.issues[] | select(.fields.status.name == "To Do")'
  ```

#### "JSON parsing errors in output"
- **Cause**: Cosmetic jq parsing issue in script output
- **Solution**: **Ignore these - look for ✅ success messages**

### Best Practices for Debugging
1. **Start simple**: Use basic queries first
2. **Check from root**: Always run scripts from project root
3. **Use jq filtering**: Filter large result sets locally instead of complex JQL
4. **Trust success messages**: ✅ indicators mean it worked despite JSON errors
5. **Check ticket IDs**: Verify ticket numbers exist and are accessible

---

## Tools and Scripts

### Essential Scripts (Run from project root)
- `jira-search.sh` - Find tickets with JQL
- `jira-create-classified.sh` - Create properly labeled tickets
- `jira-transition.sh` - Update ticket status
- `jira-worklog.sh` - Log time by AI-Guild role
- `jira-ticket-summary.sh` - View complete ticket history
- `jira-comment.sh` - Add comments to tickets

### Configuration Requirements
- `.jira-config` must be in project root
- API token must be in macOS keychain
- Scripts handle authentication automatically

---

## Migration from IFE to JIRA

### IFE Timeline
- In Jun 2025 we migrated from the IFE (Issues, Features, Epics) to JIRA
- Migration occurred and the old IFE is deprecated
- You may see legacy JIRA tickets from this migration

### Mapping IFE to JIRA

| IFE Type | JIRA Type | Number Range | Notes |
|----------|-----------|--------------|--------|
| Issue (1001+) | Bug/Task | N/A | Use JIRA auto-numbering |
| Feature (3001+) | Story | N/A | Add feature labels |
| Epic (5001+) | Epic | N/A | Maintain phased approach |

### Historical Reference
- Keep completed IFE docs for reference
- New work uses JIRA exclusively
- No new IFE documents created

---

## Summary

JIRA provides a robust, industry-standard approach to work tracking that integrates seamlessly with the AI-Guild workflow. The tools work reliably when used correctly from the project root, and authentication is handled automatically through the keychain integration.
