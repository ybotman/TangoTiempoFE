# JIRA Tools - Direct API Integration

This directory contains shell scripts for direct JIRA API integration without MCP dependency.

## Setup

### 1. Configure Authentication

Choose one of these methods:

#### Option A: Environment Variables (Recommended for CI/CD)
```bash
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

#### Option B: .env File (Local Development)
Create `.ybotbot/.env`:
```bash
JIRA_EMAIL="your-email@example.com"
JIRA_API_TOKEN="your-api-token"
```

#### Option C: macOS Keychain (Most Secure)
```bash
security add-generic-password -s 'jira-email' -a 'jira' -w 'your-email@example.com'
security add-generic-password -s 'jira-api-token' -a 'jira' -w 'your-api-token'
```

### 2. Make Scripts Executable
```bash
chmod +x .ybotbot/jira-tools/*.sh
```

### 3. Install jq (Optional but Recommended)
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

## Issue Type Support

The scripts fully support JIRA's hierarchy:
- **Epics** → Stories/Tasks/Bugs
- **Stories** → Sub-tasks
- **Tasks** → Sub-tasks
- **Bugs** (standalone or under Epic)
- **Sub-tasks** (under Story/Task)

## Usage Examples

### Working with Issue Types

#### Create Different Issue Types
```bash
# Create Epic
./.ybotbot/jira-tools/jira-create.sh "Timezone Implementation" Epic "Complete timezone support across system"

# Create Story
./.ybotbot/jira-tools/jira-create.sh "As a user, I want events in local time" Story "Display events in venue timezone"

# Create Task
./.ybotbot/jira-tools/jira-create.sh "Add timezone field to database" Task

# Create Bug
./.ybotbot/jira-tools/jira-create.sh "DST causes time shift" Bug "Recurring events shift by 1 hour"

# Create Sub-task under a parent
./.ybotbot/jira-tools/jira-create-subtask.sh CALBE-55 "Update event model" "Add venueTimezone field"
```

#### Manage Epic Relationships
```bash
# Add story to epic
./.ybotbot/jira-tools/jira-add-to-epic.sh CALBE-55 CALBE-43

# Get all issues in an epic
./.ybotbot/jira-tools/jira-get-epic-issues.sh CALBE-43

# Link related issues
./.ybotbot/jira-tools/jira-link-issues.sh CALBE-55 CALBE-56 "blocks"
```

### Get Ticket Details
```bash
# Basic usage
./.ybotbot/jira-tools/jira-get.sh CALBE-55

# Get specific fields
./.ybotbot/jira-tools/jira-get.sh CALBE-55 "summary,status,description"

# Extract fields for shell processing
./.ybotbot/jira-tools/jira-get.sh CALBE-55 "" --extract
```

### Create New Ticket
```bash
# Basic task
./.ybotbot/jira-tools/jira-create.sh "Fix login bug" Task

# Bug with description and priority
./.ybotbot/jira-tools/jira-create.sh "Users cannot login" Bug "Login fails with 500 error" High

# Story in specific project
./.ybotbot/jira-tools/jira-create.sh "Add user profile" Story "As a user, I want..." Medium TIEMPO
```

### Update Ticket
```bash
# Update summary
./.ybotbot/jira-tools/jira-update.sh CALBE-55 summary "Updated title"

# Update description
./.ybotbot/jira-tools/jira-update.sh CALBE-55 description "New detailed description"

# Assign to user
./.ybotbot/jira-tools/jira-update.sh CALBE-55 assignee "john.doe@example.com"

# Add labels
./.ybotbot/jira-tools/jira-update.sh CALBE-55 labels "backend,timezone,DST"
```

### Add Comment
```bash
# Simple comment
./.ybotbot/jira-tools/jira-comment.sh CALBE-55 "Started implementation"

# Detailed progress update
./.ybotbot/jira-tools/jira-comment.sh CALBE-55 "Completed Scout phase: Found that recurring events maintain fixed UTC time causing DST shifts"
```

### Search Tickets
```bash
# Find in-progress tickets
./.ybotbot/jira-tools/jira-search.sh "project = CALBE AND status = 'In Progress'"

# My assigned tickets
./.ybotbot/jira-tools/jira-search.sh "assignee = currentUser() AND status != Done"

# Search by labels
./.ybotbot/jira-tools/jira-search.sh "project = CALBE AND labels IN (timezone, DST)"

# Full text search
./.ybotbot/jira-tools/jira-search.sh "text ~ 'recurring events' AND project = CALBE"

# Limit results
./.ybotbot/jira-tools/jira-search.sh "project = CALBE" 10

# Verbose output
./.ybotbot/jira-tools/jira-search.sh "project = CALBE" 5 --verbose

# JSON output for piping
./.ybotbot/jira-tools/jira-search.sh "project = CALBE" 5 --json | jq '.issues[].key'
```

### Transition Status
```bash
# Move to In Progress
./.ybotbot/jira-tools/jira-transition.sh CALBE-55 "In Progress"

# Mark as Done
./.ybotbot/jira-tools/jira-transition.sh CALBE-55 Done

# Move to Review
./.ybotbot/jira-tools/jira-transition.sh CALBE-55 "In Review"
```

## Integration with Git Workflow

### Example: Create and Start Work
```bash
# Create ticket
TICKET=$(./.ybotbot/jira-tools/jira-create.sh "Implement DST fix" Bug "Recurring events shift time" High)

# Move to In Progress
./.ybotbot/jira-tools/jira-transition.sh $TICKET "In Progress"

# Create feature branch
git checkout -b feature/$TICKET

# Add comment
./.ybotbot/jira-tools/jira-comment.sh $TICKET "Created branch feature/$TICKET"
```

### Example: Complete Work
```bash
# Add final comment
./.ybotbot/jira-tools/jira-comment.sh CALBE-55 "Implementation complete, ready for review"

# Transition to review
./.ybotbot/jira-tools/jira-transition.sh CALBE-55 "In Review"

# Create PR with JIRA link
gh pr create --title "[$TICKET] Fix DST for recurring events" \
  --body "Fixes: ${JIRA_BASE_URL}/browse/$TICKET"
```

## Advanced Usage

### Batch Operations
```bash
# Update multiple tickets
for ticket in CALBE-55 CALBE-56 CALBE-57; do
    ./.ybotbot/jira-tools/jira-update.sh $ticket labels "ready-for-qa"
done

# Comment on all in-progress tickets
./.ybotbot/jira-tools/jira-search.sh "status = 'In Progress'" --json | \
  jq -r '.issues[].key' | \
  while read ticket; do
    ./.ybotbot/jira-tools/jira-comment.sh $ticket "Daily update: Still in progress"
  done
```

### Custom JQL Queries
```bash
# Complex query
JQL="project = CALBE AND (
  (status = 'In Progress' AND assignee = currentUser()) OR
  (status = 'To Do' AND priority in (High, Highest))
) ORDER BY priority DESC, created ASC"

./.ybotbot/jira-tools/jira-search.sh "$JQL"
```

## Project Configuration

The scripts automatically detect project based on current directory:
- `calendar-be` → CALBE
- `calendar-fe` → TIEMPO
- Default → CALBE

Override with environment variable:
```bash
export JIRA_PROJECT=TIEMPO
./.ybotbot/jira-tools/jira-create.sh "Frontend task" Task
```

## Troubleshooting

### Authentication Issues
```bash
# Test authentication
curl -s -H "Authorization: Basic $(echo -n "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" \
  https://hdtsllc.atlassian.net/rest/api/3/myself | jq '.'
```

### Debug Mode
```bash
# Enable debug output
set -x
./.ybotbot/jira-tools/jira-get.sh CALBE-55
set +x
```

### Common Errors

1. **"JIRA authentication not configured"**
   - Set JIRA_EMAIL and JIRA_API_TOKEN environment variables
   - Or create .env file with credentials
   - Or add to macOS keychain

2. **"Field 'priority' cannot be set"**
   - Some fields are project-specific
   - Check project configuration in JIRA

3. **"Status not available from current status"**
   - Not all transitions are available from every status
   - Check available transitions with jira-transition.sh

## Architecture Notes

- **Modular Design**: Each script handles one specific operation
- **Configuration**: Centralized in jira-config.sh
- **Authentication**: Multiple methods supported (env, file, keychain)
- **Error Handling**: Consistent error messages and exit codes
- **JSON Processing**: Works with or without jq (degraded functionality)
- **Project Mapping**: Automatic project detection based on directory

## Migration from MCP

These scripts replace MCP JIRA functions:
- `mcp__atlassian__getJiraIssue` → `jira-get.sh`
- `mcp__atlassian__createJiraIssue` → `jira-create.sh`
- `mcp__atlassian__editJiraIssue` → `jira-update.sh`
- `mcp__atlassian__addCommentToJiraIssue` → `jira-comment.sh`
- `mcp__atlassian__searchJiraIssuesUsingJql` → `jira-search.sh`
- `mcp__atlassian__transitionJiraIssue` → `jira-transition.sh`