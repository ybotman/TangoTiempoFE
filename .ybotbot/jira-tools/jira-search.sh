#!/bin/bash
# Search JIRA tickets using JQL
# Usage: ./jira-search.sh "JQL query" [maxResults]

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
JQL_QUERY="$1"
MAX_RESULTS="${2:-50}"

if [ -z "$JQL_QUERY" ]; then
    echo "Usage: $0 \"JQL query\" [maxResults]"
    echo "Examples:"
    echo "  $0 \"project = CALBE AND status = 'In Progress'\""
    echo "  $0 \"assignee = currentUser() AND status != Done\" 10"
    echo "  $0 \"project = CALBE AND labels IN (timezone, DST)\""
    echo "  $0 \"text ~ 'recurring events' AND project = CALBE\""
    exit 1
fi

# URL encode the JQL query
URL_ENCODE_JQL() {
    echo "$1" | sed 's/ /%20/g' | sed 's/=/%3D/g' | sed "s/'/%27/g" | sed 's/"/%22/g' | sed 's/(/%28/g' | sed 's/)/%29/g'
}

ENCODED_JQL=$(URL_ENCODE_JQL "$JQL_QUERY")

# ============================================
# MAIN EXECUTION
# ============================================
echo "Searching: $JQL_QUERY" >&2
echo "Max results: $MAX_RESULTS" >&2
echo "" >&2

# Make API request (use /search/jql for API v3)
# Note: API v3 /search/jql requires explicit fields parameter (default is just id)
response=$(jira_request GET "/search/jql?jql=$ENCODED_JQL&maxResults=$MAX_RESULTS&fields=key,summary,status,assignee,reporter,priority,created,updated")

if [ $? -ne 0 ]; then
    echo "Error: Failed to search tickets" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Extract total and display summary
# Note: API v3 /search/jql doesn't return .total, only .issues array
TOTAL=$(echo "$response" | jq -r '.issues | length')
echo "Showing $TOTAL results (max: $MAX_RESULTS)" >&2
echo "" >&2

# Parse and display results in a readable format
if command -v jq &> /dev/null; then
    echo "$response" | jq -r '.issues[] | "[\(.key)] \(.fields.status.name) - \(.fields.summary)"'
    
    # Optional: Show more details with --verbose flag
    if [ "$3" == "--verbose" ]; then
        echo "" >&2
        echo "=== Detailed Results ===" >&2
        echo "$response" | jq '.issues[] | {
            key: .key,
            summary: .fields.summary,
            status: .fields.status.name,
            assignee: .fields.assignee.displayName,
            priority: .fields.priority.name,
            created: .fields.created,
            updated: .fields.updated
        }'
    fi
else
    # Fallback without jq
    echo "$response" | grep -o '"key":"[^"]*"' | cut -d'"' -f4 | while read key; do
        echo "[$key] (use jq for more details)"
    done
fi

# Output raw JSON for piping to other tools
if [ "$3" == "--json" ]; then
    echo "$response"
fi