#!/bin/bash
# Handler for JIRA status changes
# Called by webhook server when issue status changes

ISSUE_KEY="$1"
FROM_STATUS="$2"
TO_STATUS="$3"
PAYLOAD="$4"

# Source configuration for JIRA API access
SCRIPT_DIR="$(dirname "$(dirname "$0")")"
source "$SCRIPT_DIR/jira-config.sh"

# ============================================
# STATUS CHANGE AUTOMATIONS
# ============================================

# When moved to "In Progress", assign to current user if unassigned
if [ "$TO_STATUS" = "In Progress" ]; then
    ASSIGNEE=$(echo "$PAYLOAD" | extract_field '.issue.fields.assignee.accountId')
    
    if [ -z "$ASSIGNEE" ] || [ "$ASSIGNEE" = "null" ]; then
        echo "Auto-assigning $ISSUE_KEY to current user..."
        # Get current user
        CURRENT_USER=$(jira_request GET "/myself" | extract_field '.accountId')
        
        if [ -n "$CURRENT_USER" ]; then
            "$SCRIPT_DIR/jira-update.sh" "$ISSUE_KEY" "assignee" "$CURRENT_USER"
        fi
    fi
    
    # Start time tracking
    echo "$(date): Started work on $ISSUE_KEY" >> "$SCRIPT_DIR/time-tracking.log"
fi

# When moved to "Done", log completion
if [ "$TO_STATUS" = "Done" ]; then
    echo "$(date): Completed $ISSUE_KEY" >> "$SCRIPT_DIR/time-tracking.log"
    
    # Add completion comment
    "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "✅ Work completed via webhook automation"
    
    # Trigger CI/CD if this was a deployment ticket
    if echo "$PAYLOAD" | grep -q '"labels".*"deploy"'; then
        echo "Triggering deployment for $ISSUE_KEY..."
        # Add your deployment trigger here
    fi
fi

# When moved to "In Review", notify reviewers
if [ "$TO_STATUS" = "In Review" ]; then
    # Add review request comment
    "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "🔍 Ready for review - Status changed from $FROM_STATUS to $TO_STATUS"
    
    # Could trigger PR creation or review assignment here
fi

# When blocked, add explanation request
if [ "$TO_STATUS" = "Blocked" ]; then
    "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "⚠️ Issue blocked - Please add a comment explaining the blocker"
fi

# Log all status changes
echo "$(date): $ISSUE_KEY status changed from $FROM_STATUS to $TO_STATUS" >> "$SCRIPT_DIR/status-changes.log"