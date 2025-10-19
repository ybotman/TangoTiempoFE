# Application Playbook

## Team & Environment

**User**: GotanMan (switches between laptop and desktop)

**FIRST CHECK - Git Sync** (CRITICAL):
- GotanMan works on both laptop and desktop
- **ALWAYS start by checking sync status**:
  ```bash
  git fetch origin
  git status  # Check if behind origin/DEVL or origin/TEST
  git log origin/DEVL..HEAD  # Check if local has unpushed commits
  git log HEAD..origin/DEVL  # Check if origin is ahead
  ```
- If origin is ahead: `git pull origin DEVL`
- Desktop and laptop can get out of sync - always fetch first!

**Team Structure**:

**Frontend (This App - tangotiempo.com)**:
- **Developer**: Sarah (me) - Frontend Developer, best practices expert
- **Architect**: Fred - System Architect, advice only, primary architect
- **Collaboration**: Sarah can ask GotanMan to collaborate with Fred on big questions

**Backend (Webserver APIs - calendar-be/CALBE)**:
- **Developer**: Ben
- **Architect**: Donna (same parallel relationship as Fred/Sarah)

**Azure Functions (Serverless APIs)**:
- **Developer**: Fulton (Douazle)
- **Architect**: Azule (same parallel relationship as Fred/Sarah)

## JIRA Integration - DO NOT USE MCP

**CRITICAL**: MCP JIRA functions are broken. See `.ybotbot/retrospectivePlaybook.md` for details.

**ALWAYS use**:
- Direct API with macOS keychain tokens
- `.ybotbot/jira-tools/` bash scripts
- Never use MCP for JIRA operations

## CRITICAL - Required Reading

**YOU MUST READ THIS FILE IMMEDIATELY**:
- `.ybotbot/JIRA-SIMPLE-GUIDE.md` - Contains essential JIRA integration patterns and commands

This file contains critical information about:
- How to use JIRA bash scripts for ticket operations
- Direct API patterns when MCP is not suitable
- Proper ticket commenting and transition procedures

## JIRA Integration Pattern (PROVEN METHOD)

### How to Create JIRA Tickets/Epics Successfully

**Context**: MCP JIRA functions are broken. Always use direct API with macOS keychain tokens.

**Working Pattern**:
```bash
#!/bin/bash
# Retrieve token from macOS keychain (not environment variables)
JIRA_API_TOKEN=$(security find-generic-password -a "toby.balsley@gmail.com" -s "jira-api-token" -w 2>/dev/null)
JIRA_EMAIL="toby.balsley@gmail.com"
JIRA_URL="https://hdtsllc.atlassian.net"  # NOT tobybalsley.atlassian.net

# Create epic/ticket using curl
curl -s -X POST \
  -H "Authorization: Basic $(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "TIEMPO"},
      "summary": "Your ticket summary",
      "description": "Your description",
      "issuetype": {"name": "Epic"}  # or "Task", "Bug", "Story"
    }
  }' \
  "${JIRA_URL}/rest/api/2/issue" | jq -r '.key'
```

**Key Points**:
1. Tokens are in keychain under account "toby.balsley@gmail.com"
2. Use hdtsllc.atlassian.net (production JIRA)
3. Parse responses with jq
4. Write to temp bash script to avoid shell escaping issues
5. Successfully created TIEMPO-296 using this method

## JIRA Tools Scripts (API v3 - UPDATED 2025-10-12)

### Using .ybotbot/jira-tools/ Scripts

**CRITICAL**: These scripts were fixed for JIRA API v3 on 2025-10-12 (TIEMPO-309)

**Authentication Setup**:
```bash
export JIRA_EMAIL="toby.balsley@gmail.com"
export JIRA_API_TOKEN=$(security find-generic-password -a "toby.balsley@gmail.com" -s "jira-api-token" -w 2>/dev/null)
export JIRA_BASE_URL="https://hdtsllc.atlassian.net"
```

**Available Scripts** (all working as of 2025-10-12):

1. **Search Tickets**:
   ```bash
   .ybotbot/jira-tools/jira-search.sh "project=TIEMPO AND statusCategory!=Done" 10
   ```

2. **Get Ticket Details**:
   ```bash
   .ybotbot/jira-tools/jira-get.sh TIEMPO-308 "key,summary,status"
   ```

3. **Create Ticket**:
   ```bash
   .ybotbot/jira-tools/jira-create.sh "Summary text" "Task" "Description text"
   ```

4. **Add Comment**:
   ```bash
   .ybotbot/jira-tools/jira-comment.sh TIEMPO-308 "Comment text"
   ```

   **⚠️ IMPORTANT - Comment Formatting Rules**:
   - Use **plain text only** - no special formatting
   - Avoid line breaks, bullets (•, -), markdown (**bold**), or emojis at start
   - Convert bullets to comma-separated lists or periods
   - Keep text simple and continuous
   - If error "There was an error parsing JSON" occurs, simplify text and retry

   **Example**:
   ```bash
   # ❌ WILL FAIL - Special formatting
   "**Scout Mode**
   - Found modal states
   • Ready for next step"

   # ✅ WILL WORK - Plain text
   "Scout Mode complete. Found modal states. Ready for next step."
   ```

5. **Transition Status**:
   ```bash
   .ybotbot/jira-tools/jira-transition.sh TIEMPO-308 "In Progress"
   ```

6. **Get Epic Issues**:
   ```bash
   .ybotbot/jira-tools/jira-get-epic-issues.sh TIEMPO-305
   ```

### API v3 Migration (Fixed 2025-10-12)

**What Changed**:
- JIRA deprecated `/rest/api/3/search` → use `/rest/api/3/search/jql`
- API v3 `/search/jql` requires explicit `fields` parameter (default is only `id`)
- Response structure changed: `.total` no longer exists, use `.issues.length`

**Files Fixed**:
- `.ybotbot/jira-tools/jira-search.sh`
- `.ybotbot/jira-tools/jira-get-epic-issues.sh`

**Migration Guide**: See `.ybotbot/jira-tools/MIGRATION_GUIDE_API_V3.md`

**For Other Projects**: Copy these two fixed scripts to other projects using same jira-tools (e.g., calendar-be/CALBE)

### JIRA API v3 Direct Usage

**Critical Requirements**:
1. Use `/rest/api/3/search/jql?jql=...` (NOT `/rest/api/3/search`)
2. MUST include `fields` parameter: `&fields=key,summary,status,assignee`
3. Authentication via macOS keychain with account `"toby.balsley@gmail.com"`

**Example Direct API Call**:
```bash
JIRA_API_TOKEN=$(security find-generic-password -a "toby.balsley@gmail.com" -s "jira-api-token" -w 2>/dev/null)
JIRA_EMAIL="toby.balsley@gmail.com"

curl -s -X GET \
  -H "Authorization: Basic $(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)" \
  -H "Content-Type: application/json" \
  "https://hdtsllc.atlassian.net/rest/api/3/search/jql?jql=project%3DTIEMPO%20AND%20statusCategory%21%3DDone&maxResults=10&fields=key,summary,status,assignee"
```

## Application-Specific Documentation

No additional application-specific documentation has been added yet.

To add more documentation:
1. Add file paths to your `.ybotbot/user-config.ini`
2. Run `ybot setup` and select files to include
3. Run `ybot build` to generate this playbook