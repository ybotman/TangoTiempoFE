# JIRA Strategy for AI-Guild

## STARTUP TEST (Important First STEP to JIRA connection)
**You must TEST the JIRA tools to check connection when you have read this document**
- Add you your check list the JIRA TEST

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

### PROJECT Configuration in .jira-config
- **Default variable**: `PROJECT` - This is your main JIRA project for regular work
- **Additional projects**: Users may define `PROJECT_FRONTEND`, `PROJECT_BACKEND`, `PROJECT_INFRA`, etc.
- **Guild project**: `PROJECTGUILD` - Reserved for AI-Guild system improvement tickets

### Intelligent Project Selection
- As you work through issues, I will suggest if work might belong in a different project
- For example: "This infrastructure task might belong in PROJECT_INFRA instead of main PROJECT"
- You can define multiple PROJECT variables in .jira-config for different work streams
- I'll help track which project is most appropriate based on the work type

### NOTE: Guild-Specific Tickets
- Some users may have the ability to add tickets to the AI-Guild JIRA project
- Use the `PROJECTGUILD` value from `.jira-config` for Guild improvement tickets
- This is separate from your main project tickets and is used for AI-Guild system improvements
- Most users will only use the main `PROJECT` value for their work tickets

### Full Authentication Flow (if needed)
```bash
source .jira-config && JIRA_API_TOKEN=$(security find-generic-password -a "$(whoami)" -s "jira-api-token" -w)
```

---

## 📝 JIRA Comment Best Practices

### ✅ What Works - Use This Format:

**Comment Format: `./jira-comment.sh <ticket> <ROLE> <comment>`**
```bash
# ❌ Wrong: ./jira-comment.sh TIEMPO-60 "Comment text"
# ✅ Right: ./jira-comment.sh TIEMPO-60 Scout "Investigated login issue. Root cause: session timeout."

./jira-comment.sh TIEMPO-60 Architect "Design decision: Use Material-UI Dialog. Benefits: mobile responsive."
./jira-comment.sh TIEMPO-60 Builder "Implementation complete. Added CSS fixes for modal headers."
```

### ❌ What Fails - Avoid These:
```bash
# Multi-line comments with newlines
"Investigation findings:\n1. CSS issue\n2. Mobile viewport\n3. Z-index conflict"

# Numbered lists or bullet points  
"Steps taken: • Reviewed code • Tested mobile • Found solution"

# Complex formatting or special characters
"Analysis:\n- Issue A\n- Issue B\n\nRecommendation: Fix X"
```

### 🚨 Important: Always Verify Comments
- **If you see "JSON parsing error" + "✅ Comment added"** → Check JIRA to confirm
- **The comment MAY NOT have been added** despite success message
- **Break complex information into multiple simple comments**

### 📏 Comment Format Template:
```
Role: Brief action or finding. Key points: A, B, C.
```

**Examples:**
- `Scout: Reproduced bug on iOS Safari. Issue occurs during form submission.`
- `Architect: Recommending context refactor. Current state: fragmented, proposed: unified provider.`
- `Builder: Feature implemented with tests. Changes: component updates, API integration, validation.`

---

## 🔧 How to Use JIRA Tools Correctly

### Script Usage (Always run from project root)

#### **🚨 CRITICAL: ROLE Parameter Required**
**All worklog and comment commands REQUIRE the AI-Guild role parameter in specific positions**

```bash
# JIRA WORKLOG - Format: ./jira-worklog.sh add <ticket> <ROLE> <time> <description>
# ❌ Wrong: ./jira-worklog.sh add TIEMPO-60 15m "Description"
# ✅ Right: ./jira-worklog.sh add TIEMPO-60 Builder 15m "Description"

# JIRA COMMENT - Format: ./jira-comment.sh <ticket> <ROLE> <comment>
# ❌ Wrong: ./jira-comment.sh TIEMPO-60 "Comment text"  
# ✅ Right: ./jira-comment.sh TIEMPO-60 Builder "Comment text"

# Examples with different roles:
./public/AI-Guild/Scripts/jira-tools/jira-comment.sh TIEMPO-60 Scout "Investigated modal issue. Found CSS z-index conflict."
./public/AI-Guild/Scripts/jira-tools/jira-worklog.sh add TIEMPO-60 Architect "1h" "Designed solution architecture"

# Search and Summary (no role needed)
./public/AI-Guild/Scripts/jira-tools/jira-search.sh "assignee=currentUser()"
./public/AI-Guild/Scripts/jira-tools/jira-ticket-summary.sh TIEMPO-60
```

#### **Valid AI-Guild Roles:**
- `Scout` - Investigation and research
- `Architect` - Design and planning
- `Builder` - Implementation and coding
- `CRK` - Code review and verification
- `Kanban` - Process management

### What Happens Behind the Scenes
1. `jira-common.sh` sources `.jira-config`
2. Gets the token from keychain as `JIRA_TOKEN`
3. All scripts use this `JIRA_TOKEN` internally
4. **No need to set JIRA_API_TOKEN manually**

### Known "Error" Messages (Important Details)
- **"JSON parsing error"** appears with complex comment formatting
- **If you see "JSON parsing error" + "✅ Comment added"** - the comment MAY have worked
- **Always check JIRA to verify** if the comment was actually added
- **Use simple formatting** to avoid JSON parsing issues

---

## Core Concepts

### JIRA Issue Types
- **Bug**: Defects, fixes, small improvements
- **Task**: Technical work items, refactoring, documentation
- **Story**: User-facing features and enhancements
- **Epic**: Large multi-phase efforts with architectural impact

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
1. **Start from DEVELOPMENT branch (as defined in .guild-config)**
2. **Create feature branch** with JIRA ticket number
3. **First commit** must reference JIRA ticket
4. **Update JIRA status** as work progresses
5. **Log time by role** using jira-worklog.sh
6. **Create PR** with JIRA ticket in title
7. **Merge to DEVELOPMENT branch** after review
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
**Format: `./jira-worklog.sh add <ticket> <ROLE> <time> <description>`**

Always log work with the appropriate AI-Guild role:

```bash
# Scout investigation
./jira-worklog.sh add TIEMPO-123 Scout "30m" "Investigated existing code and requirements"

# Architect design
./jira-worklog.sh add TIEMPO-123 Architect "1h" "Designed component architecture and data flow"

# Builder implementation
./jira-worklog.sh add TIEMPO-123 Builder "2h" "Implemented feature with tests"

# CRK review
./jira-worklog.sh add TIEMPO-123 CRK "45m" "Code review and knowledge documentation"
```

### Role Workflow in JIRA
1. **Scout**: Investigation phase (To Do → In Progress)
2. **Architect**: Design phase (add design notes to ticket)
3. **Builder**: Implementation (main development work)
4. **CRK**: Review phase (In Progress → In Review → Done)

---

## Epic Management

### Epic Structure in JIRA
Epics in JIRA maintain a phased approach:

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

#### "Missing parameters" errors
- **Cause**: Omitting the required ROLE parameter in worklog or comment commands
- **Root Issue**: ROLE must be in specific position in parameter list
- **Solution**: Always include the AI-Guild role in the correct position

**Common Mistakes:**
```bash
# WORKLOG ERRORS:
# ❌ Wrong: ./jira-worklog.sh add TIEMPO-60 15m "Description"
# ✅ Right: ./jira-worklog.sh add TIEMPO-60 Builder 15m "Description"

# COMMENT ERRORS:  
# ❌ Wrong: ./jira-comment.sh TIEMPO-60 "Comment text"
# ✅ Right: ./jira-comment.sh TIEMPO-60 Builder "Comment text"

# The ROLE parameter (Builder, Scout, Architect, CRK, Kanban) cannot be omitted
```
#### "JSON parsing errors in output"
- **Cause**: Complex comment formatting with newlines, lists, or special characters
- **Solution**: 
  - **Use simple, single-line comments under 200 characters**
  - **Always check JIRA to verify comment was added**
  - **If comment failed, repost with simpler formatting**
  ```bash
  # Correct format with required ROLE parameter:
  ./jira-comment.sh TIEMPO-60 Scout "Found CSS conflict in mobile viewport affecting modal z-index"
  ```

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


### Historical Reference
- Keep completed documentation for reference
- All work uses JIRA exclusively
- Track all work items through JIRA

---

## Summary

JIRA provides a robust, industry-standard approach to work tracking that integrates seamlessly with the AI-Guild workflow. The tools work reliably when used correctly from the project root, and authentication is handled automatically through the keychain integration.
