#!/bin/bash
# Update JIRA ticket fields
# Usage: ./jira-update.sh TICKET-123 field value

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
TICKET_KEY="$1"
FIELD="$2"
VALUE="$3"

if [ -z "$TICKET_KEY" ] || [ -z "$FIELD" ]; then
    echo "Usage: $0 TICKET-KEY field value"
    echo "Common fields: summary, description, assignee, priority, labels"
    echo "Example: $0 CALBE-55 summary \"Updated summary text\""
    echo "Example: $0 CALBE-55 assignee \"john.doe@example.com\""
    echo "Example: $0 CALBE-55 labels \"backend,timezone,DST\""
    exit 1
fi

# ============================================
# BUILD REQUEST BODY
# ============================================
case "$FIELD" in
    summary)
        REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "summary": "$VALUE"
  }
}
EOF
        )
        ;;
    
    description)
        ADF_DESC=$(text_to_adf "$VALUE")
        REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "description": $ADF_DESC
  }
}
EOF
        )
        ;;
    
    assignee)
        # Need to get account ID from email
        ACCOUNT_ID=$(jira_request GET "/user/search?query=$VALUE" | extract_field '.[0].accountId')
        if [ -z "$ACCOUNT_ID" ]; then
            echo "Error: Could not find user with email: $VALUE" >&2
            exit 1
        fi
        REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "assignee": {
      "accountId": "$ACCOUNT_ID"
    }
  }
}
EOF
        )
        ;;
    
    priority)
        REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "priority": {
      "name": "$VALUE"
    }
  }
}
EOF
        )
        ;;
    
    labels)
        # Convert comma-separated to JSON array
        IFS=',' read -ra LABELS_ARRAY <<< "$VALUE"
        LABELS_JSON=$(printf '"%s",' "${LABELS_ARRAY[@]}" | sed 's/,$//')
        REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "labels": [$LABELS_JSON]
  }
}
EOF
        )
        ;;
    
    *)
        # Generic field update
        REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "$FIELD": "$VALUE"
  }
}
EOF
        )
        ;;
esac

# ============================================
# MAIN EXECUTION
# ============================================
echo "Updating $FIELD for ticket: $TICKET_KEY" >&2

# Make API request
response=$(jira_request PUT "/issue/$TICKET_KEY" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to update ticket" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

echo "Successfully updated $FIELD for $TICKET_KEY" >&2
echo "URL: ${JIRA_BASE_URL}/browse/$TICKET_KEY" >&2