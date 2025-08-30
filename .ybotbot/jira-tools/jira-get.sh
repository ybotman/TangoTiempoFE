#!/bin/bash
# Get JIRA ticket details
# Usage: ./jira-get.sh TICKET-123 [fields]

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
TICKET_KEY="$1"
FIELDS="${2:-summary,status,assignee,reporter,priority,description,comment}"

if [ -z "$TICKET_KEY" ]; then
    echo "Usage: $0 TICKET-KEY [fields]"
    echo "Example: $0 CALBE-55"
    echo "Example: $0 CALBE-55 'summary,status,description'"
    exit 1
fi

# ============================================
# MAIN EXECUTION
# ============================================
echo "Fetching ticket: $TICKET_KEY" >&2

# Make API request
response=$(jira_request GET "/issue/$TICKET_KEY?fields=$FIELDS")

if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch ticket" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Output formatted response
echo "$response" | format_json

# Optional: Extract specific fields for shell processing
if [ "$3" == "--extract" ]; then
    echo "" >&2
    echo "=== Extracted Fields ===" >&2
    echo "Key: $(echo "$response" | extract_field '.key')" >&2
    echo "Summary: $(echo "$response" | extract_field '.fields.summary')" >&2
    echo "Status: $(echo "$response" | extract_field '.fields.status.name')" >&2
    echo "Assignee: $(echo "$response" | extract_field '.fields.assignee.displayName')" >&2
fi