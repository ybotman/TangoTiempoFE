#!/bin/bash
# Handler for new JIRA issues
# Called by webhook server when issue is created

ISSUE_KEY="$1"
PAYLOAD="$2"

# Source configuration
SCRIPT_DIR="$(dirname "$(dirname "$0")")"
source "$SCRIPT_DIR/jira-config.sh"

# Extract issue details
ISSUE_TYPE=$(echo "$PAYLOAD" | extract_field '.issue.fields.issuetype.name')
PRIORITY=$(echo "$PAYLOAD" | extract_field '.issue.fields.priority.name')
SUMMARY=$(echo "$PAYLOAD" | extract_field '.issue.fields.summary')
CREATOR=$(echo "$PAYLOAD" | extract_field '.user.displayName')

# ============================================
# NEW ISSUE AUTOMATIONS
# ============================================

# Auto-label based on issue type
case "$ISSUE_TYPE" in
    "Bug")
        # Add bug triage label
        "$SCRIPT_DIR/jira-update.sh" "$ISSUE_KEY" "labels" "needs-triage,bug"
        
        # High priority bugs get immediate attention
        if [ "$PRIORITY" = "High" ] || [ "$PRIORITY" = "Highest" ]; then
            "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "🚨 High priority bug detected - Requires immediate attention"
            
            # Could send Slack notification here
            # slack-notify "#bugs" "High priority bug created: $ISSUE_KEY - $SUMMARY"
        fi
        ;;
        
    "Story")
        # Add story planning label
        "$SCRIPT_DIR/jira-update.sh" "$ISSUE_KEY" "labels" "needs-estimation"
        ;;
        
    "Epic")
        # Add epic tracking
        "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "📊 Epic created - Remember to add child stories"
        ;;
esac

# Check for missing fields and add reminder
DESCRIPTION=$(echo "$PAYLOAD" | extract_field '.issue.fields.description')
if [ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" = "null" ]; then
    "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "📝 Reminder: Please add a description to this issue"
fi

# Auto-assign based on component or label
if echo "$PAYLOAD" | grep -q '"labels".*"backend"'; then
    # Assign to backend team lead
    echo "Assigning backend issue $ISSUE_KEY"
    # "$SCRIPT_DIR/jira-update.sh" "$ISSUE_KEY" "assignee" "backend-lead@example.com"
fi

if echo "$PAYLOAD" | grep -q '"labels".*"frontend"'; then
    # Assign to frontend team lead
    echo "Assigning frontend issue $ISSUE_KEY"
    # "$SCRIPT_DIR/jira-update.sh" "$ISSUE_KEY" "assignee" "frontend-lead@example.com"
fi

# Link related issues based on text matching
if echo "$SUMMARY" | grep -qi "DST\|timezone\|recurring"; then
    # Link to main DST epic
    "$SCRIPT_DIR/jira-link-issues.sh" "$ISSUE_KEY" "CALBE-43" "relates to"
    "$SCRIPT_DIR/jira-comment.sh" "$ISSUE_KEY" "🔗 Auto-linked to timezone epic CALBE-43"
fi

# Log creation
echo "$(date): Created $ISSUE_TYPE $ISSUE_KEY: $SUMMARY (by $CREATOR)" >> "$SCRIPT_DIR/issues-created.log"

# Create git branch if it's a development task
if [ "$ISSUE_TYPE" != "Epic" ]; then
    echo "Ready to create branch: git checkout -b feature/$ISSUE_KEY"
    # Could auto-create branch here
fi