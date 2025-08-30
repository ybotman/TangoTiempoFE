#!/bin/bash
# Transition JIRA ticket status
# Usage: ./jira-transition.sh TICKET-123 "status"

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
TICKET_KEY="$1"
TARGET_STATUS="$2"

if [ -z "$TICKET_KEY" ] || [ -z "$TARGET_STATUS" ]; then
    echo "Usage: $0 TICKET-KEY \"status\""
    echo "Common statuses: To Do, In Progress, In Review, Done, Blocked"
    echo "Example: $0 CALBE-55 \"In Progress\""
    echo "Example: $0 CALBE-55 Done"
    exit 1
fi

# ============================================
# GET AVAILABLE TRANSITIONS
# ============================================
echo "Getting available transitions for $TICKET_KEY..." >&2

transitions_response=$(jira_request GET "/issue/$TICKET_KEY/transitions")

if [ $? -ne 0 ]; then
    echo "Error: Failed to get transitions" >&2
    exit 1
fi

# Find the transition ID for the target status
if command -v jq &> /dev/null; then
    TRANSITION_ID=$(echo "$transitions_response" | jq -r ".transitions[] | select(.to.name == \"$TARGET_STATUS\") | .id")
    
    if [ -z "$TRANSITION_ID" ]; then
        echo "Error: Status '$TARGET_STATUS' is not available from current status" >&2
        echo "Available transitions:" >&2
        echo "$transitions_response" | jq -r '.transitions[] | "  - \(.to.name) (id: \(.id))"' >&2
        exit 1
    fi
else
    echo "Warning: jq not installed, trying basic grep method" >&2
    # Fallback method without jq (less reliable)
    TRANSITION_ID=$(echo "$transitions_response" | grep -B2 "\"name\":\"$TARGET_STATUS\"" | grep '"id"' | head -1 | grep -o '[0-9]*')
    
    if [ -z "$TRANSITION_ID" ]; then
        echo "Error: Could not find transition to '$TARGET_STATUS'" >&2
        echo "Install jq for better transition detection" >&2
        exit 1
    fi
fi

echo "Found transition ID: $TRANSITION_ID for status: $TARGET_STATUS" >&2

# ============================================
# BUILD REQUEST BODY
# ============================================
REQUEST_BODY=$(cat <<EOF
{
  "transition": {
    "id": "$TRANSITION_ID"
  }
}
EOF
)

# ============================================
# EXECUTE TRANSITION
# ============================================
echo "Transitioning $TICKET_KEY to $TARGET_STATUS..." >&2

response=$(jira_request POST "/issue/$TICKET_KEY/transitions" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to transition ticket" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

echo "Successfully transitioned $TICKET_KEY to $TARGET_STATUS" >&2
echo "URL: ${JIRA_BASE_URL}/browse/$TICKET_KEY" >&2

# Verify the transition by getting current status
echo "" >&2
echo "Verifying new status..." >&2
current_status=$(jira_request GET "/issue/$TICKET_KEY?fields=status" | extract_field '.fields.status.name')
echo "Current status: $current_status" >&2