#!/bin/bash
# Get all issues in an Epic
# Usage: ./jira-get-epic-issues.sh EPIC-123

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
EPIC_KEY="$1"

if [ -z "$EPIC_KEY" ]; then
    echo "Usage: $0 EPIC-KEY"
    echo "Example: $0 CALBE-43"
    echo "This lists all stories and tasks in an epic"
    exit 1
fi

# ============================================
# MAIN EXECUTION
# ============================================
echo "Fetching issues in Epic $EPIC_KEY..." >&2

# JQL to find all issues in the epic
# Note: Epic link field is usually customfield_10014 but can vary
JQL="\"Epic Link\" = $EPIC_KEY OR parent = $EPIC_KEY"

# URL encode the JQL
URL_ENCODE_JQL() {
    echo "$1" | sed 's/ /%20/g' | sed 's/=/%3D/g' | sed "s/'/%27/g" | sed 's/"/%22/g' | sed 's/(/%28/g' | sed 's/)/%29/g'
}

ENCODED_JQL=$(URL_ENCODE_JQL "$JQL")

# Make API request (use /search/jql for API v3)
# Note: API v3 /search/jql requires explicit fields parameter (default is just id)
response=$(jira_request GET "/search/jql?jql=$ENCODED_JQL&maxResults=100&fields=key,summary,status,issuetype,assignee,priority,created,updated")

if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch epic issues" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Extract and display results
# Note: API v3 /search/jql doesn't return .total, only .issues array
TOTAL=$(echo "$response" | jq -r '.issues | length')
echo "Found $TOTAL issues in Epic $EPIC_KEY" >&2
echo "" >&2

# Display issues grouped by type
if command -v jq &> /dev/null; then
    echo "=== Stories ===" >&2
    echo "$response" | jq -r '.issues[] | select(.fields.issuetype.name == "Story") | "[\(.key)] \(.fields.status.name) - \(.fields.summary)"' >&2
    
    echo "" >&2
    echo "=== Tasks ===" >&2
    echo "$response" | jq -r '.issues[] | select(.fields.issuetype.name == "Task") | "[\(.key)] \(.fields.status.name) - \(.fields.summary)"' >&2
    
    echo "" >&2
    echo "=== Bugs ===" >&2
    echo "$response" | jq -r '.issues[] | select(.fields.issuetype.name == "Bug") | "[\(.key)] \(.fields.status.name) - \(.fields.summary)"' >&2
    
    echo "" >&2
    echo "=== Sub-tasks ===" >&2
    echo "$response" | jq -r '.issues[] | select(.fields.issuetype.name == "Sub-task") | "[\(.key)] \(.fields.status.name) - \(.fields.summary)"' >&2
    
    # Summary statistics
    echo "" >&2
    echo "=== Summary ===" >&2
    echo "$response" | jq -r '[.issues[].fields.status.name] | group_by(.) | map({status: .[0], count: length}) | .[] | "\(.status): \(.count)"' >&2
else
    # Fallback without jq
    echo "$response" | grep -o '"key":"[^"]*"' | cut -d'"' -f4 | while read key; do
        echo "[$key]" >&2
    done
fi