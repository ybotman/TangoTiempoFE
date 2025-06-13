# JIRA Tools for AI-Guild

Command-line tools for JIRA integration, designed for AI-Guild workflow management.

## Setup for New Users

### 1. Configure Your Settings
```bash
# Copy the example configuration to your app root
cp Claude/4.0\ with\ Code\ and\ Jira/AI-Guild/Scripts/jira-tools/.jira-config.example .jira-config

# Edit with your settings
nano .jira-config  # or use your preferred editor
```

Update these values in `.jira-config` (in your app root):
- `JIRA_URL`: Your Atlassian instance (e.g., `https://yourcompany.atlassian.net`)
- `JIRA_EMAIL`: Your JIRA login email
- `PROJECT`: Your default project key (e.g., `PROJ`)

### 2. Store Your API Token Securely
```bash
# Add your JIRA API token to macOS Keychain
security add-generic-password -a "$(whoami)" -s "jira-api-token" -w "your-api-token"
```

Get your API token from: https://id.atlassian.com/manage-profile/security/api-tokens

### 3. Make Scripts Executable
```bash
chmod +x *.sh
```

## Core Scripts

### jira-search.sh
Search for JIRA issues using JQL (JIRA Query Language).

**Purpose:** Find tickets based on various criteria like status, assignee, labels, or date ranges.

**Usage:**
```bash
./jira-search.sh "project=$PROJECT AND status='In Progress'"
./jira-search.sh "assignee=currentUser() AND status!='Done'"
./jira-search.sh "labels=frontend AND created >= -7d"
```

### jira-create-classified.sh
Create tickets with proper classification labels for work type and domain.

**Purpose:** Create well-structured tickets with consistent labeling for better organization.

**Usage:**
```bash
./jira-create-classified.sh "title" "work-type" "domain" "description" [issue-type]

# Examples:
./jira-create-classified.sh "Fix venue search" "broken" "venues" "Search returns no results"
./jira-create-classified.sh "Add event tags" "new-feature" "events" "Allow tagging events" "Story"
```

**Parameters:**
- **Work Types:** `broken`, `new-feature`, `enhancement`, `tech-debt`
- **Domains:** `events`, `venues`, `organizers`, `users`, `calendar`, `geo`, `auth`
- **Issue Types:** `Task` (default), `Bug`, `Story`

### jira-transition.sh
Move tickets between workflow states (To Do → In Progress → In Review → Done).

**Purpose:** Update ticket status as work progresses, with optional comments.

**Usage:**
```bash
# Show available transitions for a ticket
./jira-transition.sh TIEMPO-57

# Transition with ID and optional comment
./jira-transition.sh TIEMPO-57 21 "Starting development"
./jira-transition.sh TIEMPO-57 31 "Code complete, ready for review"
```

**Common Transition IDs:**
- `21`: To Do → In Progress
- `31`: In Progress → In Review
- `41`: In Review → Done

### jira-worklog.sh
Log time spent on tickets with work descriptions by AI-Guild role.

**Purpose:** Track time spent on tasks with brief work descriptions.

**Usage:**
```bash
./jira-worklog.sh add "TIEMPO-57" "Scout" "30m" "Investigated codebase and requirements"
./jira-worklog.sh add "TIEMPO-57" "Architect" "1h" "Designed component structure"
./jira-worklog.sh add "TIEMPO-57" "Builder" "2h 30m" "Implemented feature"
./jira-worklog.sh add "TIEMPO-57" "CRK" "45m" "Code review and testing"
```

**Time Formats:** `30m`, `1h`, `2h 30m`, `1d 4h`

### jira-comment.sh
Add findings, decisions, and role-based updates to tickets.

**Purpose:** Document important findings, architectural decisions, and status updates as ticket comments.

**Usage:**
```bash
./jira-comment.sh TIEMPO-57 Scout "Found existing date picker in SharedComponents folder"
./jira-comment.sh TIEMPO-57 Architect "Decision: Reuse DatePicker with custom validation"
./jira-comment.sh TIEMPO-57 Builder "Implemented validation, all tests passing"
./jira-comment.sh TIEMPO-57 CRK "Approved - follows patterns, good coverage"
```

**AI-Guild Roles:**
- **Scout** 🔍 - Investigation findings, discoveries, risks
- **Architect** 📐 - Design decisions, technical approach
- **Builder** 🔨 - Implementation updates, blockers
- **CRK** ✅ - Review findings, approval status
- **Kanban** 📋 - Status updates, coordination

### jira-ticket-summary.sh
Display comprehensive ticket information including history, status changes, and work logs.

**Purpose:** Get a complete view of ticket progress and time spent by each role.

**Usage:**
```bash
./jira-ticket-summary.sh TIEMPO-57
```

**Output includes:**
- Ticket summary, type, and current status
- Complete status transition history with timestamps
- Work logs organized by AI-Guild role
- Total time spent across all roles

## Typical Daily Workflow

### 1. Start of Day - Check Existing Work
```bash
# Search for your in-progress tickets
./jira-search.sh "assignee=currentUser() AND status='In Progress'"

# Check tickets in review
./jira-search.sh "project=$PROJECT AND status='In Review'"
```

### 2. Create New Ticket
```bash
./jira-create-classified.sh "Add date picker to event form" "new-feature" "events" \
  "Users need to select event dates when creating new events"
```

### 3. Start Working - Update Status
```bash
# Move from To Do → In Progress
./jira-transition.sh TIEMPO-58 21 "Starting implementation"
```

### 4. Log Work and Findings
```bash
# Log Scout time and findings
./jira-worklog.sh add TIEMPO-58 "Scout" "20m" "Investigated requirements"
./jira-comment.sh TIEMPO-58 Scout "Found existing DatePicker component can be reused"

# Log Architect decision
./jira-comment.sh TIEMPO-58 Architect "Decision: Extend DatePicker with range validation"

# Log Builder implementation
./jira-worklog.sh add TIEMPO-58 "Builder" "1h 30m" "Implemented date range picker"
./jira-comment.sh TIEMPO-58 Builder "Completed implementation, all tests passing"
```

### 5. Move to Review
```bash
# Transition to In Review when complete
./jira-transition.sh TIEMPO-58 31 "Code complete, ready for review"
```

### 6. Check Progress
```bash
# View complete ticket history
./jira-ticket-summary.sh TIEMPO-58
```

## Common JQL Queries

```bash
# My active work
./jira-search.sh "assignee=currentUser() AND status NOT IN ('Done', 'Closed')"

# Today's updates
./jira-search.sh "project=$PROJECT AND updated >= startOfDay()"

# High priority items
./jira-search.sh "priority IN (High, Highest) AND status='To Do'"

# Frontend broken issues
./jira-search.sh "labels IN (frontend, broken) AND status!='Done'"

# This week's completed
./jira-search.sh "status=Done AND resolved >= startOfWeek()"
```

## Best Practices

### Time Tracking
- Always specify the AI-Guild role when logging work
- Log time immediately after completing work
- Use realistic estimates (don't over/under report)
- Include brief description of work done

### Workflow Management
- Complete In Progress items before taking new work
- Add meaningful comments when transitioning tickets
- Use consistent labels (work-type + domain)
- Follow Scout → Architect → Builder → CRK flow for complex tasks

### Ticket Organization
- Use `broken` for bugs/fixes
- Use `new-feature` for new functionality
- Always include a domain label
- Write clear, actionable descriptions

## Troubleshooting

**"No .jira-config file found"**
- Copy `.jira-config.example` to `.jira-config`
- Update with your settings

**"No JIRA API token found in keychain"**
- Generate token at https://id.atlassian.com/manage-profile/security/api-tokens
- Add to keychain: `security add-generic-password -a "$(whoami)" -s "jira-api-token" -w "your-token"`

**"401 Unauthorized" errors**
- Check your email in `.jira-config` is correct
- Verify your API token is valid
- Ensure token has necessary permissions

## File Structure

```
app-root/
├── .jira-config           # Your personal config (git ignored)
└── Claude/4.0 with Code and Jira/AI-Guild/Scripts/jira-tools/
    ├── .jira-config.example    # Template configuration
    ├── .gitignore             # Excludes personal config
    ├── jira-howto-README.md   # This file
    ├── jira-common.sh         # Shared configuration loader
    ├── jira-search.sh         # Search for issues
    ├── jira-create-classified.sh  # Create labeled tickets
    ├── jira-transition.sh     # Change ticket status
    ├── jira-worklog.sh        # Log time by role
    ├── jira-comment.sh        # Add findings/decisions
    └── jira-ticket-summary.sh # View ticket details
```