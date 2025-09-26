# Simple JIRA Integration Guide (Shell Scripts Method)

## Overview
Use shell scripts instead of MCP. They're simpler and more reliable.

---

## 1. Setup Requirements

### Check if credentials exist in macOS Keychain:
```bash
# Check for email
security find-generic-password -s "jira-email" -w

# Check for API token
security find-generic-password -s "jira-api-token" -w
```

### If not found, add them:
```bash
# Add email
security add-generic-password -s "jira-email" -a "jira" -w "your.email@example.com"

# Add API token (get from Atlassian account settings)
security add-generic-password -s "jira-api-token" -a "jira" -w "YOUR_API_TOKEN_HERE"
```

---

## 2. Find the JIRA Scripts

The scripts are in `.ybotbot/jira-tools/` directory:
```bash
ls -la ./.ybotbot/jira-tools/
```

Key scripts:
- `jira-search.sh` - Search for issues
- `jira-get.sh` - Get issue details
- `jira-comment.sh` - Add comments
- `jira-transition.sh` - Change status
- `jira-create.sh` - Create new issues

---

## 3. Simple Usage Examples

### Search for issues:
```bash
# Find recent CALBE issues
./.ybotbot/jira-tools/jira-search.sh "project = CALBE ORDER BY created DESC" 5

# Find issues in progress
./.ybotbot/jira-tools/jira-search.sh "project = CALBE AND status = 'In Progress'"
```

### Get issue details:
```bash
# Get specific issue
./.ybotbot/jira-tools/jira-get.sh CALBE-60
```

### Add a comment:
```bash
# Simple comment
./.ybotbot/jira-tools/jira-comment.sh "CALBE-60" "This is a test comment"

# Multi-line comment (use simple text, avoid special characters)
./.ybotbot/jira-tools/jira-comment.sh "CALBE-60" "Line 1. Line 2. Line 3."
```

### Change issue status:
```bash
# Move to Done
./.ybotbot/jira-tools/jira-transition.sh "CALBE-60" "Done"

# Move to In Progress
./.ybotbot/jira-tools/jira-transition.sh "CALBE-60" "In Progress"
```

### Create new issue:
```bash
# Create a bug (keep description simple)
./.ybotbot/jira-tools/jira-create.sh "Fix validation bug" "Bug" "Simple description here" "High" "CALBE"

# Create a task
./.ybotbot/jira-tools/jira-create.sh "Update documentation" "Task" "Need to update API docs" "Medium" "CALBE"
```

---

## 4. Common Problems & Solutions

### Problem: "Error parsing JSON"
**Solution:** Keep text simple. Avoid:
- Special characters like quotes, backticks
- Multi-line strings with complex formatting
- JSON-like content in descriptions

**Good:**
```bash
./.ybotbot/jira-tools/jira-comment.sh "CALBE-60" "Fixed validation bug. Tests passing."
```

**Bad:**
```bash
./.ybotbot/jira-tools/jira-comment.sh "CALBE-60" "Fixed `validation` bug with \"special\" chars"
```

### Problem: Authentication fails
**Solution:** Check credentials:
```bash
# Test if credentials work
JIRA_EMAIL=$(security find-generic-password -s "jira-email" -w)
JIRA_TOKEN=$(security find-generic-password -s "jira-api-token" -w)
curl -u "$JIRA_EMAIL:$JIRA_TOKEN" https://hdtsllc.atlassian.net/rest/api/3/myself
```

### Problem: Can't find project key
**Solution:** The scripts auto-detect based on directory name:
- `calendar-be` → CALBE
- `tangotiempo.com` → TIEMPO
- Default → CALBE

---

## 5. Why NOT MCP?

MCP (Model Context Protocol) requires:
- Special Claude desktop app configuration
- Complex setup with config files
- Additional dependencies
- Often doesn't work in CLI environments

Shell scripts are:
- ✅ Simple bash scripts
- ✅ Work everywhere
- ✅ Use macOS Keychain for security
- ✅ Direct API calls to JIRA
- ✅ No special configuration needed

---

## 6. Quick Test

Run this to verify everything works:
```bash
# 1. Check credentials exist
security find-generic-password -s "jira-email" -w && echo "Email found" || echo "Email missing"

# 2. Search for recent issues
./.ybotbot/jira-tools/jira-search.sh "project = CALBE" 2

# 3. Add a test comment
./.ybotbot/jira-tools/jira-comment.sh "CALBE-60" "Test from shell script"
```

---

## 7. Tips for LLMs

When using these scripts in your code:
1. **Use Bash tool** - Not MCP functions
2. **Keep text simple** - Avoid special characters
3. **Check first** - Run search before creating duplicates
4. **Use variables** - For complex text

Example in LLM:
```javascript
// Instead of MCP:
// ❌ mcp__atlassian__addCommentToJiraIssue({...})

// Use Bash tool:
// ✅ Bash: ./.ybotbot/jira-tools/jira-comment.sh "CALBE-60" "Simple comment text"
```

---

## That's it!

Forget MCP. Use the shell scripts. They just work.

If the other LLM is in a different directory, they need to:
1. Copy the `.ybotbot/jira-tools/` folder
2. Set up the macOS Keychain credentials (once)
3. Use the scripts with Bash tool

Questions? The scripts have `--help` options and there's a README in the jira-tools folder.