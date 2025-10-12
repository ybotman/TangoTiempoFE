# Application Playbook

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

## Application-Specific Documentation

No additional application-specific documentation has been added yet.

To add more documentation:
1. Add file paths to your `.ybotbot/user-config.ini`
2. Run `ybot setup` and select files to include
3. Run `ybot build` to generate this playbook