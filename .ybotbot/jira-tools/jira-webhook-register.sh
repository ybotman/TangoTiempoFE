#!/bin/bash
# Register JIRA webhook
# Usage: ./jira-webhook-register.sh "webhook-url" "events"

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
WEBHOOK_URL="$1"
EVENTS="${2:-jira:issue_created,jira:issue_updated,comment_created}"
NAME="${3:-YBOTBOT Webhook}"

if [ -z "$WEBHOOK_URL" ]; then
    echo "Usage: $0 webhook-url [events] [name]"
    echo "Example: $0 https://your-server.com:8088/webhook"
    echo ""
    echo "Available events:"
    echo "  jira:issue_created"
    echo "  jira:issue_updated"
    echo "  jira:issue_deleted"
    echo "  comment_created"
    echo "  comment_updated"
    echo "  issue_property_set"
    echo "  sprint_created"
    echo "  sprint_started"
    echo "  sprint_closed"
    exit 1
fi

# Convert comma-separated events to JSON array
IFS=',' read -ra EVENTS_ARRAY <<< "$EVENTS"
EVENTS_JSON=$(printf '"%s",' "${EVENTS_ARRAY[@]}" | sed 's/,$//')

# ============================================
# BUILD REQUEST BODY
# ============================================
REQUEST_BODY=$(cat <<EOF
{
  "name": "$NAME",
  "url": "$WEBHOOK_URL",
  "events": [$EVENTS_JSON],
  "filters": {
    "issue-related-events-section": {
      "project": {
        "key": "$JIRA_PROJECT"
      }
    }
  },
  "excludeBody": false,
  "enabled": true
}
EOF
)

# ============================================
# MAIN EXECUTION
# ============================================
echo "Registering webhook for project $JIRA_PROJECT..." >&2
echo "URL: $WEBHOOK_URL" >&2
echo "Events: $EVENTS" >&2

# Make API request
response=$(jira_request POST "/webhook" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to register webhook" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

# Extract webhook ID
WEBHOOK_ID=$(echo "$response" | extract_field '.id')

if [ -n "$WEBHOOK_ID" ]; then
    echo "Successfully registered webhook with ID: $WEBHOOK_ID" >&2
    echo "Webhook will receive events for project: $JIRA_PROJECT" >&2
    
    # Save webhook ID for later management
    echo "$WEBHOOK_ID" > "$SCRIPT_DIR/.webhook-id"
    echo "Webhook ID saved to $SCRIPT_DIR/.webhook-id" >&2
else
    echo "Webhook registered but could not extract ID" >&2
fi