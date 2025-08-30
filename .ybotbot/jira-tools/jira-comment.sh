#!/bin/bash
# Add comment to JIRA ticket
# Usage: ./jira-comment.sh TICKET-123 "Comment text"

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
TICKET_KEY="$1"
COMMENT_TEXT="$2"

if [ -z "$TICKET_KEY" ] || [ -z "$COMMENT_TEXT" ]; then
    echo "Usage: $0 TICKET-KEY \"Comment text\""
    echo "Example: $0 CALBE-55 \"Started working on DST implementation\""
    exit 1
fi

# ============================================
# BUILD REQUEST BODY
# ============================================
# Convert comment to ADF format
ADF_COMMENT=$(text_to_adf "$COMMENT_TEXT")

REQUEST_BODY=$(cat <<EOF
{
  "body": $ADF_COMMENT
}
EOF
)

# ============================================
# MAIN EXECUTION
# ============================================
echo "Adding comment to ticket: $TICKET_KEY" >&2

# Make API request
response=$(jira_request POST "/issue/$TICKET_KEY/comment" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to add comment" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Extract comment ID
COMMENT_ID=$(echo "$response" | extract_field '.id')

if [ -n "$COMMENT_ID" ]; then
    echo "Successfully added comment to $TICKET_KEY" >&2
    echo "Comment ID: $COMMENT_ID" >&2
    echo "URL: ${JIRA_BASE_URL}/browse/$TICKET_KEY" >&2
else
    echo "Comment added but could not extract ID" >&2
fi