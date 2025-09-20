# JIRA Integration Instructions for AI Agent

## IMPORTANT: Use Shell Scripts for JIRA Operations

When working with JIRA tickets, you MUST use the shell scripts in `.ybotbot/jira-tools/` instead of MCP.

### Available JIRA Commands

#### Getting Ticket Information
```bash
./.ybotbot/jira-tools/jira-get.sh TICKET-123
```

#### Creating Tickets
```bash
# Create bug
./.ybotbot/jira-tools/jira-create.sh "Bug title" Bug "Description" High

# Create story
./.ybotbot/jira-tools/jira-create.sh "Story title" Story "As a user..." Medium

# Create subtask
./.ybotbot/jira-tools/jira-create-subtask.sh PARENT-123 "Subtask title"
```

#### Updating Tickets
```bash
# Add comment
./.ybotbot/jira-tools/jira-comment.sh TICKET-123 "Your comment here"

# Update status
./.ybotbot/jira-tools/jira-transition.sh TICKET-123 "In Progress"

# Update fields
./.ybotbot/jira-tools/jira-update.sh TICKET-123 summary "New title"
```

#### Searching Tickets
```bash
./.ybotbot/jira-tools/jira-search.sh "project = CALBE AND status = 'In Progress'"
```

### TRACKING Integration

When any playbook or role mentions "TRACKING" operations, use these scripts:
- Track in TRACKING → Use jira-comment.sh
- Update TRACKING → Use jira-update.sh or jira-transition.sh
- Create TRACKING ticket → Use jira-create.sh
- Search TRACKING → Use jira-search.sh

### Role-Specific JIRA Actions

#### Scout Role
```bash
# Document findings
./.ybotbot/jira-tools/jira-comment.sh TICKET-123 "Scout: Found root cause - timezone field missing"
```

#### Builder Role
```bash
# Update before building
./.ybotbot/jira-tools/jira-transition.sh TICKET-123 "In Progress"
./.ybotbot/jira-tools/jira-comment.sh TICKET-123 "Builder: Starting implementation"
```

#### Audit Role
```bash
# Document review findings
./.ybotbot/jira-tools/jira-comment.sh TICKET-123 "Audit: Code review complete - 3 issues found"
```

### Git Integration

Install git hooks for automatic JIRA updates:
```bash
./.ybotbot/jira-tools/jira-git-hooks.sh install
```

This will:
- Auto-add ticket numbers to commits
- Comment on tickets when pushing
- Transition tickets based on git flow

### Environment Setup

Ensure JIRA credentials are available:
```bash
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

### Project Detection

Scripts auto-detect project based on directory:
- `calendar-be` → Uses CALBE project
- `tangotiempo.com` → Uses TIEMPO project

### IMPORTANT RULES

1. **NEVER use MCP JIRA functions** - Always use shell scripts
2. **ALWAYS add comments** when changing ticket status
3. **DOCUMENT work in tickets** - Each role must add substantive comments
4. **USE ticket numbers in commits** - Branch names should include ticket

### Quick Reference

| Action | Command |
|--------|---------|
| Get ticket | `jira-get.sh TICKET-123` |
| Create bug | `jira-create.sh "Title" Bug` |
| Add comment | `jira-comment.sh TICKET-123 "Comment"` |
| Start work | `jira-transition.sh TICKET-123 "In Progress"` |
| Search | `jira-search.sh "JQL query"` |
| Add to epic | `jira-add-to-epic.sh STORY-123 EPIC-456` |

### Error Handling

If scripts fail:
1. Check credentials: `echo $JIRA_EMAIL`
2. Test auth: `curl -u $JIRA_EMAIL:$JIRA_API_TOKEN https://hdtsllc.atlassian.net/rest/api/3/myself`
3. Check script permissions: `ls -la .ybotbot/jira-tools/`