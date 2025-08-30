#!/bin/bash
# Link JIRA issues (Epic to Story, Story to Sub-task, blocks, relates, etc)
# Usage: ./jira-link-issues.sh SOURCE-123 TARGET-456 "link-type"

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# ARGUMENT PARSING
# ============================================
SOURCE_KEY="$1"
TARGET_KEY="$2"
LINK_TYPE="${3:-relates to}"

if [ -z "$SOURCE_KEY" ] || [ -z "$TARGET_KEY" ]; then
    echo "Usage: $0 SOURCE-KEY TARGET-KEY [link-type]"
    echo "Common link types:"
    echo "  Epic-Story: Use jira-add-to-epic.sh instead"
    echo "  blocks/is blocked by"
    echo "  relates to"
    echo "  duplicates/is duplicated by"
    echo "  clones/is cloned by"
    echo "Example: $0 CALBE-55 CALBE-56 \"blocks\""
    exit 1
fi

# ============================================
# BUILD REQUEST BODY
# ============================================
REQUEST_BODY=$(cat <<EOF
{
  "type": {
    "name": "$LINK_TYPE"
  },
  "inwardIssue": {
    "key": "$SOURCE_KEY"
  },
  "outwardIssue": {
    "key": "$TARGET_KEY"
  }
}
EOF
)

# ============================================
# MAIN EXECUTION
# ============================================
echo "Linking $SOURCE_KEY to $TARGET_KEY with relationship: $LINK_TYPE" >&2

# Make API request
response=$(jira_request POST "/issueLink" "$REQUEST_BODY")

if [ $? -ne 0 ]; then
    echo "Error: Failed to link issues" >&2
    exit 1
fi

# Check for error in response
if echo "$response" | grep -q '"errorMessages"'; then
    echo "Error from JIRA:" >&2
    echo "$response" | format_json >&2
    exit 1
fi

echo "Successfully linked $SOURCE_KEY to $TARGET_KEY" >&2
echo "Relationship: $SOURCE_KEY $LINK_TYPE $TARGET_KEY" >&2