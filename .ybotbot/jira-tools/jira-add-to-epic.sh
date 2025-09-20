#!/bin/bash
# Add story/task to an Epic
# Usage: ./jira-add-to-epic.sh STORY-123 EPIC-456

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
STORY_KEY="$1"
EPIC_KEY="$2"

if [ -z "$STORY_KEY" ] || [ -z "$EPIC_KEY" ]; then
    echo "Usage: $0 STORY-KEY EPIC-KEY"
    echo "Example: $0 CALBE-55 CALBE-43"
    echo "This adds a story/task to an epic"
    exit 1
fi

# ============================================
# BUILD REQUEST BODY
# ============================================
# Get the epic link field ID (usually customfield_10014 but can vary)
# First, try to get the field from the story to see what field name is used
EPIC_FIELD_ID="customfield_10014"  # Standard epic link field

REQUEST_BODY=$(cat <<EOF
{
  "fields": {
    "$EPIC_FIELD_ID": "$EPIC_KEY"
  }
}
EOF
)

# ============================================
# MAIN EXECUTION
# ============================================
echo "Adding $STORY_KEY to Epic $EPIC_KEY..." >&2

# Make API request
response=$(jira_request PUT "/issue/$STORY_KEY" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to add to epic" >&2
    echo "Note: Epic link field ID might be different for your JIRA instance" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    echo "" >&2
    echo "Note: If you see 'Field not found', the epic link field ID might be different." >&2
    echo "Check your JIRA instance's custom field configuration." >&2
    exit 1
fi

echo "Successfully added $STORY_KEY to Epic $EPIC_KEY" >&2
echo "View Epic: ${JIRA_BASE_URL}/browse/$EPIC_KEY" >&2
echo "View Story: ${JIRA_BASE_URL}/browse/$STORY_KEY" >&2