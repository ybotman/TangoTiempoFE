#!/bin/bash
# Create JIRA ticket
# Usage: ./jira-create.sh "Summary" "type" "description" [priority] [project]

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
SUMMARY="$1"
ISSUE_TYPE="${2:-Task}"
DESCRIPTION="${3:-}"
PRIORITY="${4:-Medium}"
PROJECT="${5:-$JIRA_PROJECT}"

if [ -z "$SUMMARY" ]; then
    echo "Usage: $0 \"Summary\" [type] [description] [priority] [project]"
    echo "Types: Bug, Story, Task, Epic"
    echo "Priorities: Highest, High, Medium, Low, Lowest"
    echo "Example: $0 \"Fix login bug\" Bug \"Users cannot login\" High CALBE"
    exit 1
fi

# Map common type aliases
case "${ISSUE_TYPE,,}" in
    bug) ISSUE_TYPE="Bug" ;;
    story) ISSUE_TYPE="Story" ;;
    task) ISSUE_TYPE="Task" ;;
    epic) ISSUE_TYPE="Epic" ;;
    subtask) ISSUE_TYPE="Sub-task" ;;
esac

# ============================================
# BUILD REQUEST BODY
# ============================================
if [ -n "$DESCRIPTION" ]; then
    # Convert description to ADF format
    ADF_DESC=$(text_to_adf "$DESCRIPTION")
    REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "$PROJECT"
    },
    "summary": "$SUMMARY",
    "description": $ADF_DESC,
    "issuetype": {
      "name": "$ISSUE_TYPE"
    }
  }
}
EOF
    )
else
    REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "$PROJECT"
    },
    "summary": "$SUMMARY",
    "issuetype": {
      "name": "$ISSUE_TYPE"
    }
  }
}
EOF
    )
fi

# ============================================
# MAIN EXECUTION
# ============================================
echo "Creating $ISSUE_TYPE in project $PROJECT..." >&2

# Make API request
response=$(jira_request POST "/issue" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to create ticket" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Extract and display the created ticket key
TICKET_KEY=$(echo "$response" | extract_field '.key')
TICKET_ID=$(echo "$response" | extract_field '.id')

if [ -n "$TICKET_KEY" ]; then
    echo "Successfully created ticket: $TICKET_KEY" >&2
    echo "URL: ${JIRA_BASE_URL}/browse/$TICKET_KEY" >&2
    echo "$TICKET_KEY"
else
    echo "Ticket created but could not extract key" >&2
    echo "$response" | format_json
fi