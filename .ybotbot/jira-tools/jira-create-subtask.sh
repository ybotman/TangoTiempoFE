#!/bin/bash
# Create JIRA subtask under a parent issue
# Usage: ./jira-create-subtask.sh PARENT-123 "Summary" [description]

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
PARENT_KEY="$1"
SUMMARY="$2"
DESCRIPTION="${3:-}"

if [ -z "$PARENT_KEY" ] || [ -z "$SUMMARY" ]; then
    echo "Usage: $0 PARENT-KEY \"Summary\" [description]"
    echo "Example: $0 CALBE-55 \"Implement timezone storage\" \"Add venueTimezone field to events model\""
    exit 1
fi

# Get parent issue's project
PARENT_PROJECT=$(jira_request GET "/issue/$PARENT_KEY?fields=project" | extract_field '.fields.project.key')

if [ -z "$PARENT_PROJECT" ]; then
    echo "Error: Could not get parent issue project" >&2
    exit 1
fi

# ============================================
# BUILD REQUEST BODY
# ============================================
if [ -n "$DESCRIPTION" ]; then
    ADF_DESC=$(text_to_adf "$DESCRIPTION")
    REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "$PARENT_PROJECT"
    },
    "parent": {
      "key": "$PARENT_KEY"
    },
    "summary": "$SUMMARY",
    "description": $ADF_DESC,
    "issuetype": {
      "name": "Sub-task"
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
      "key": "$PARENT_PROJECT"
    },
    "parent": {
      "key": "$PARENT_KEY"
    },
    "summary": "$SUMMARY",
    "issuetype": {
      "name": "Sub-task"
    }
  }
}
EOF
    )
fi

# ============================================
# MAIN EXECUTION
# ============================================
echo "Creating Sub-task under $PARENT_KEY..." >&2

# Make API request
response=$(jira_request POST "/issue" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to create subtask" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Extract the created ticket key
TICKET_KEY=$(echo "$response" | extract_field '.key')

if [ -n "$TICKET_KEY" ]; then
    echo "Successfully created subtask: $TICKET_KEY under parent $PARENT_KEY" >&2
    echo "URL: ${JIRA_BASE_URL}/browse/$TICKET_KEY" >&2
    echo "$TICKET_KEY"
else
    echo "Subtask created but could not extract key" >&2
    echo "$response" | format_json
fi